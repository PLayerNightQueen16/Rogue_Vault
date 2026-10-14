import mongoose from "mongoose";
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Helper to get Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.razorpay_id;
  const key_secret = process.env.razorpay_secret;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials not configured in environment");
  }

  return new Razorpay({
    key_id,
    key_secret
  });
};

// POST /orders/create-payment-order
export const createPaymentOrder = async (req, res) => {
  let createdOrderId = null;
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address fields
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required"
      });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (
      !fullName || !fullName.trim() ||
      !phone || !phone.trim() ||
      !addressLine1 || !addressLine1.trim() ||
      !city || !city.trim() ||
      !state || !state.trim() ||
      !pincode || !pincode.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required and cannot be empty"
      });
    }

    // Validate phone (10-14 digits)
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = phone.trim().replace(/[\s\-()]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number"
      });
    }

    // Validate pincode (exactly 6 digits)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be exactly 6 digits"
      });
    }

    // 2. Load authenticated Customer and Cart
    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty"
      });
    }

    // 3. Load latest product documents and revalidate stock & existence
    const orderItems = [];
    let totalAmount = 0;

    for (const item of customer.cart) {
      if (!item.product) continue;
      
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart are no longer available"
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available stock: ${product.stock}, requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart contains no valid items"
      });
    }

    // 4. Save ShopKart Order in PENDING status
    const newOrder = new Order({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: cleanPhone,
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim()
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT"
    });

    await newOrder.save();
    createdOrderId = newOrder._id;

    // 5. Create Razorpay order
    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_rcpt_${newOrder._id.toString()}`
    });

    // 6. Save razorpayOrderId to the Order
    newOrder.razorpayOrderId = razorpayOrder.id;
    await newOrder.save();

    const publicRazorpayKey =
      process.env.RAZORPAY_KEY_ID || process.env.razorpay_id;

    return res.status(200).json({
      success: true,
      shopKartOrderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      key: publicRazorpayKey
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    // Clean up pending order if Razorpay failed to avoid orphaned records
    if (createdOrderId) {
      try {
        await Order.findByIdAndDelete(createdOrderId);
      } catch (cleanErr) {
        console.error("Failed to clean up order:", cleanErr);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order"
    });
  }
};

// POST /orders/verify-payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // 1. Validate inputs
    if (
      !shopKartOrderId ||
      !mongoose.Types.ObjectId.isValid(shopKartOrderId) ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "All payment verification details are required"
      });
    }

    // 2. Load the ShopKart order from MongoDB
    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // 3. Verify order ownership
    if (order.user.toString() !== req.customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this order"
      });
    }

    // 4. Verify Razorpay Order ID matches database record
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID mismatch"
      });
    }

    // Check if already paid (prevent duplicate processing)
    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order
      });
    }

    // 5. Verify HMAC SHA-256 signature using Razorpay Key Secret
    const key_secret =
      process.env.RAZORPAY_KEY_SECRET || process.env.razorpay_secret;

    if (!key_secret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret key not configured"
      });
    }

    const payload = `${order.razorpayOrderId}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(payload)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // 6. Update order status
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 7. Clear user's cart
    const customer = await Customer.findById(req.customer._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    });
  }
};

// GET /orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.customer._id }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.customer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this order"
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
