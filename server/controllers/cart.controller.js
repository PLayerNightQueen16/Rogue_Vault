import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Helper to sanitize and populate cart
const getPopulatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: "name price description image stock category"
  });

  if (!customer) return null;

  // Filter out any entries where the product might have been deleted from DB
  const validCart = (customer.cart || []).filter((item) => item.product !== null);
  
  if (validCart.length !== (customer.cart || []).length) {
    customer.cart = validCart;
    await customer.save();
  }

  return validCart;
};

// POST /cart/:productId
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    // 2. Find Product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 3. Find Customer
    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    const existingItemIndex = customer.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    let newQuantity = 1;
    if (existingItemIndex > -1) {
      newQuantity = customer.cart[existingItemIndex].quantity + 1;
    }

    // 4. Validate stock limit
    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${newQuantity}) exceeds available stock (${product.stock})`
      });
    }

    if (existingItemIndex > -1) {
      customer.cart[existingItemIndex].quantity = newQuantity;
    } else {
      customer.cart.push({
        product: productId,
        quantity: 1
      });
    }

    await customer.save();

    const populatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: populatedCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// GET /cart
export const getCart = async (req, res) => {
  try {
    const populatedCart = await getPopulatedCart(req.customer._id);

    if (populatedCart === null) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    return res.status(200).json({
      success: true,
      cart: populatedCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// PATCH /cart/:productId
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate input
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be an integer greater than or equal to 1"
      });
    }

    // 2. Find Product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 3. Find Customer
    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    const itemIndex = customer.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your cart"
      });
    }

    // 4. Validate stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock (${product.stock})`
      });
    }

    customer.cart[itemIndex].quantity = quantity;
    await customer.save();

    const populatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: populatedCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// DELETE /cart/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    // 2. Find Customer
    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    const itemExists = customer.cart.some(
      (item) => item.product && item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    customer.cart = customer.cart.filter(
      (item) => item.product && item.product.toString() !== productId
    );

    await customer.save();

    const populatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: populatedCart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
