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
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // 2. Find Product by ObjectId or DummyJSON numeric ID
    let product = null;
    if (mongoose.Types.ObjectId.isValid(productId) && productId.length === 24) {
      product = await Product.findById(productId);
    }

    if (!product) {
      // Try to treat productId as a DummyJSON numeric id
      const numericId = parseInt(productId, 10);
      const isDummyNumericId = !isNaN(numericId) && numericId > 0 && String(numericId) === String(productId);

      if (isDummyNumericId) {
        try {
          const dummyRes = await fetch(`https://dummyjson.com/products/${numericId}`);
          if (dummyRes.ok) {
            const dummyData = await dummyRes.json();
            if (dummyData && dummyData.id) {
              // Upsert by dummyId — stable identifier, never matched by name
              product = await Product.findOneAndUpdate(
                { dummyId: dummyData.id },
                {
                  $setOnInsert: {
                    dummyId: dummyData.id,
                    name: dummyData.title || `Product ${numericId}`,
                    description: dummyData.description || 'Vault Exclusive Product',
                    price: typeof dummyData.price === 'number' ? dummyData.price : 1999,
                    category: (dummyData.category || 'general').toLowerCase(),
                    image: dummyData.thumbnail || (Array.isArray(dummyData.images) && dummyData.images[0]) || '',
                    stock: typeof dummyData.stock === 'number' ? dummyData.stock : 45
                  }
                },
                { upsert: true, new: true }
              );
            }
          }
        } catch (dummyErr) {
          console.warn("DummyJSON fetch in addToCart failed:", dummyErr.message);
        }
      }
    }

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
      (item) => item.product && item.product.toString() === product._id.toString()
    );

    const addedQty = typeof req.body?.quantity === "number" && Number.isInteger(req.body.quantity) && req.body.quantity > 0
      ? req.body.quantity
      : 1;

    let newQuantity = addedQty;
    if (existingItemIndex > -1) {
      newQuantity = customer.cart[existingItemIndex].quantity + addedQty;
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
        product: product._id,
        quantity: addedQty
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
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
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

    const itemIndex = customer.cart.findIndex(
      (item) => item.product && (item.product.toString() === productId || item._id.toString() === productId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your cart"
      });
    }

    const cartItem = customer.cart[itemIndex];
    const product = await Product.findById(cartItem.product);

    // 3. Validate stock if product exists
    if (product && quantity > product.stock) {
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
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
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
      (item) => item.product && (item.product.toString() === productId || item._id.toString() === productId)
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    customer.cart = customer.cart.filter(
      (item) => item.product && (item.product.toString() !== productId && item._id.toString() !== productId)
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
