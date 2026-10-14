import express from 'express';
import {
    getAllProducts,
    getProductById
} from '../controllers/product.controller.js';

export const productRoutes = express.Router();

// POST /products is intentionally disabled — product creation is admin-only
// and not exposed to the public API surface.
productRoutes.get('/', getAllProducts);
productRoutes.get('/:id', getProductById);