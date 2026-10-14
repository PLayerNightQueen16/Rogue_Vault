import mongoose from "mongoose";
import Product from "../models/product.model.js";

const transformDummyProduct = (item) => {
    if (!item) return null;
    const pId = item.id !== undefined && item.id !== null ? item.id.toString() : (item._id || '');
    const numericId = typeof item.id === 'number' ? item.id : parseInt(pId, 10) || item._id;
    const priceVal = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const discountVal = typeof item.discountPercentage === 'number' ? item.discountPercentage : 0;
    const mainImage = item.thumbnail || (Array.isArray(item.images) && item.images[0]) || item.image || '';
    const imagesList = Array.isArray(item.images) && item.images.length > 0 ? item.images : (mainImage ? [mainImage] : []);

    return {
        _id: pId,
        id: numericId,
        name: item.title || item.name || 'Untitled Product',
        title: item.title || item.name || 'Untitled Product',
        description: item.description || '',
        price: priceVal,
        category: (item.category || 'general').toLowerCase(),
        image: mainImage,
        thumbnail: item.thumbnail || mainImage,
        images: imagesList,
        stock: typeof item.stock === 'number' ? item.stock : 45,
        rating: typeof item.rating === 'number' ? item.rating : 4.5,
        discountPercentage: discountVal,
        discount: discountVal > 0 ? `-${Math.round(discountVal)}%` : '-20%',
        brand: item.brand || 'Vault Exclusive',
        sku: item.sku || `VK-${numericId}`,
        warrantyInformation: item.warrantyInformation || '1 year official vault warranty',
        shippingInformation: item.shippingInformation || 'Ships in 2-4 business days',
        availabilityStatus: item.availabilityStatus || (item.stock > 0 ? 'In Stock' : 'Limited Vault Stock'),
        returnPolicy: item.returnPolicy || '30 days hassle-free return policy',
        reviews: Array.isArray(item.reviews) ? item.reviews : []
    };
};

export const registerProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || !price || !category || !image || !stock) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        if (price <= 0) {
            return res.status(400).json({ message: "Price must be greater than 0" });
        }

        if (stock < 0) {
            return res.status(400).json({ message: "Stock quantity must be atleast 0" });
        }

        const newProduct = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        });

        await newProduct.save();

        return res.status(201).json({ message: "New Product created Successfully!", newProduct: newProduct });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        const trimmedCat = category && category.trim().toLowerCase() !== 'all' ? category.trim().toLowerCase() : '';
        const trimmedSearch = search ? search.trim().toLowerCase() : '';

        // 1. Fetch live from DummyJSON
        try {
            let url = 'https://dummyjson.com/products?limit=0';
            if (trimmedCat) {
                url = `https://dummyjson.com/products/category/${encodeURIComponent(trimmedCat)}?limit=0`;
            } else if (trimmedSearch) {
                url = `https://dummyjson.com/products/search?q=${encodeURIComponent(trimmedSearch)}&limit=0`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                let products = (data.products || []).map(transformDummyProduct);

                // Refine if both category and search are active
                if (trimmedCat && trimmedSearch) {
                    products = products.filter(p =>
                        (p.name || '').toLowerCase().includes(trimmedSearch) ||
                        (p.description || '').toLowerCase().includes(trimmedSearch) ||
                        (p.brand || '').toLowerCase().includes(trimmedSearch)
                    );
                }

                return res.status(200).json({
                    success: true,
                    message: "Products found",
                    products,
                    count: products.length,
                    total: data.total || products.length
                });
            }
        } catch (dummyErr) {
            console.warn("Direct dummyjson.com fetch failed on backend, falling back to MongoDB:", dummyErr.message);
        }

        // 2. Fallback to MongoDB
        const query = {};
        if (trimmedSearch) {
            query.name = {
                $regex: trimmedSearch,
                $options: 'i'
            };
        }
        if (trimmedCat) {
            query.category = {
                $regex: `^${trimmedCat}$`,
                $options: 'i'
            };
        }

        const products = await Product
            .find(query)
            .select('name description price category image stock');

        return res.status(200).json({
            success: true,
            message: "Products found",
            products,
            count: products.length
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Try DummyJSON
        try {
            const response = await fetch(`https://dummyjson.com/products/${id}`);
            if (response.ok) {
                const data = await response.json();
                const product = transformDummyProduct(data);
                return res.status(200).json({ message: "Product Found!!", product });
            }
        } catch (dummyErr) {
            // Continue to MongoDB fallback
        }

        // 2. Fallback to MongoDB by ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            const product = await Product.findById(id);
            if (product) {
                return res.status(200).json({ message: "Product Found!!", product });
            }
        }

        return res.status(404).json({ message: "No Product Found!" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};