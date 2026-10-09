import express from 'express';
import {
    getAllProducts,
    getProductById,
    registerProduct
} from '../controllers/product.controller.js';

export const productRoutes = express.Router();

productRoutes.post('/', registerProduct);
productRoutes.get('/', getAllProducts);
productRoutes.get('/:id', getProductById);