import Product from "../models/product.model.js"



export const registerProduct = async (req, res) => {
    try {

        const { name, description, price, category, image, stock } = req.body

        if (!name || !description || !price || !category || !image || !stock) {
            return res.status(400).json({ message: "All fields are required!" })
        }

        if (price <= 0) {
            return res.status(400).json({ message: "Price must be greater than 0" })
        }

        if (stock < 0) {
            return res.status(400).json({ message: "Stock quantity must be atleast 0" })
        }

        const newProduct = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        })

        await newProduct.save()

        return res.status(201).json({ message: "New Product created Successfully!", newProduct: newProduct })

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error })
    }

}

export const getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query;

        const query = {};

        // Search by product name
        if (search && search.trim() !== '') {
            query.name = {
                $regex: search.trim(),
                $options: 'i'
            };
        }

        // Filter by category (case-insensitive, ignore 'all')
        if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
            query.category = {
                $regex: `^${category.trim()}$`,
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
            error: error
        });
    }
};


export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({ message: "No Product Found!" })
        }

        return res.status(200).json({ message: "Product Found!!", product })

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error })
    }
}