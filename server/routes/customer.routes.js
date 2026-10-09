import express from 'express'
import { changePass, getUser, loginCustomer, logoutCustomer, registerCustomer } from '../controllers/customer.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

//creates a router speciafically for customer-related routes..
// all routes for "/customer/..."
//basically we don't hv to write again and again "/customer.."
// eg. "/customer/login" can be written directly as "/login"..  
export const customerRoutes = express.Router()

customerRoutes.post('/register', registerCustomer)
customerRoutes.post('/login', loginCustomer)
customerRoutes.get('/me',isAuthenticated, getUser)
customerRoutes.post('/logout',logoutCustomer)
customerRoutes.patch('/change', isAuthenticated, changePass)
