import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    // Stable DummyJSON numeric product ID (null for MongoDB-native products)
    dummyId: {
        type: Number,
        default: null,
        sparse: true  // allows multiple null values while enforcing uniqueness on non-null values
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0.01
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Product = mongoose.model("Product", productSchema)

export default Product