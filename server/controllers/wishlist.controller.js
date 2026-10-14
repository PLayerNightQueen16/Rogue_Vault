import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

/**
 * Resolve a productId that may be either a MongoDB ObjectId OR a DummyJSON
 * numeric string (e.g. "1", "42"). When it is numeric the controller fetches
 * from DummyJSON and upserts into the local Product collection, then returns
 * the local MongoDB document so that wishlist refs are always ObjectIds.
 */
const resolveProduct = async (productId) => {
    // 1. Try direct MongoDB ObjectId look-up (24-char hex)
    if (mongoose.Types.ObjectId.isValid(productId) && productId.length === 24) {
        const product = await Product.findById(productId);
        if (product) return product;
    }

    // 2. Fallback: treat productId as a DummyJSON numeric id
    const numericId = parseInt(productId, 10);
    const isDummyNumericId = !isNaN(numericId) && numericId > 0 && String(numericId) === String(productId);
    if (!isDummyNumericId) return null;

    try {
        const dummyRes = await fetch(`https://dummyjson.com/products/${numericId}`);
        if (!dummyRes.ok) return null;

        const dummyData = await dummyRes.json();
        if (!dummyData || !dummyData.id) return null;

        // Upsert by dummyId — stable identifier, never matched by name
        const product = await Product.findOneAndUpdate(
            { dummyId: dummyData.id },
            {
                $setOnInsert: {
                    dummyId: dummyData.id,
                    name: dummyData.title || `Product ${numericId}`,
                    description: dummyData.description || "Vault Exclusive Product",
                    price: typeof dummyData.price === "number" ? dummyData.price : 1999,
                    category: (dummyData.category || "general").toLowerCase(),
                    image:
                        dummyData.thumbnail ||
                        (Array.isArray(dummyData.images) && dummyData.images[0]) ||
                        "",
                    stock: typeof dummyData.stock === "number" ? dummyData.stock : 45
                }
            },
            { upsert: true, new: true }
        );
        return product;
    } catch (err) {
        console.warn("resolveProduct DummyJSON fallback failed:", err.message);
        return null;
    }
};

// POST /wishlist/:productId
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const product = await resolveProduct(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        if (!customer.wishlist) customer.wishlist = [];

        const isAlreadyInWishlist = customer.wishlist.some(
            (id) => id.toString() === product._id.toString()
        );

        if (isAlreadyInWishlist) {
            return res.status(409).json({ success: false, message: "Product already in wishlist" });
        }

        customer.wishlist.push(product._id);
        await customer.save();

        return res.status(200).json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// GET /wishlist
export const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id).populate({
            path: "wishlist",
            select: "name price category image stock"
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const validWishlist = (customer.wishlist || []).filter((item) => item !== null);

        return res.status(200).json({
            success: true,
            count: validWishlist.length,
            wishlist: validWishlist
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// DELETE /wishlist/:productId
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const product = await resolveProduct(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        if (!customer.wishlist) customer.wishlist = [];

        const exists = customer.wishlist.some(
            (id) => id.toString() === product._id.toString()
        );

        if (!exists) {
            return res.status(404).json({ success: false, message: "Product not in wishlist" });
        }

        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== product._id.toString()
        );
        await customer.save();

        return res.status(200).json({ success: true, message: "Product removed from wishlist" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// PATCH /wishlist/:productId/toggle
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const product = await resolveProduct(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        if (!customer.wishlist) customer.wishlist = [];

        const index = customer.wishlist.findIndex(
            (id) => id.toString() === product._id.toString()
        );

        if (index > -1) {
            // Already wishlisted → remove
            customer.wishlist.splice(index, 1);
            await customer.save();
            return res.status(200).json({
                success: true,
                message: "Product removed from wishlist",
                isWishlisted: false
            });
        } else {
            // Not wishlisted → add
            customer.wishlist.push(product._id);
            await customer.save();
            return res.status(200).json({
                success: true,
                message: "Product added to wishlist",
                isWishlisted: true
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
