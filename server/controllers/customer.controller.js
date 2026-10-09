import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import { genToken } from "../utils/generateToken.js";
import bcrypt from 'bcrypt';


const cookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}


// Register the customer....
export const registerCustomer = async (req, res) => {
    try {

        const { fullName, email, password, phone } = req.body;

        //validations....
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required!!" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password length must be atleast of 6 characters!" })
        }

        const emailExists = await Customer.findOne({ email })

        if (emailExists) {
            return res.status(409).json({ message: "Email already exists...!!" })
        }

        //hashing password...
        const salt = await bcrypt.genSalt(12)
        const hashedPass = await bcrypt.hash(password, salt)


        //Creating a customer...
        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPass,
            phone
        })

        await newCustomer.save()


        //Creating a JWT Access Token
        const token = genToken(newCustomer._id)
        res.cookie("token", token, cookiesOptions)

        return res.status(200).json({ success: true, message: "Customer Registered Successfully!!", customer: newCustomer })


    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error })
    }
}


//LogIn Customer....
export const loginCustomer = async (req, res) => {
    try {

        const { email, password } = req.body;

        const customer = await Customer.findOne({ email })

        if (!customer) {
            return res.status(404).json({ message: "Customer not found!!" })
        }

        const passwordCheck = await bcrypt.compare(password, customer.password)

        if (!passwordCheck) {
            return res.status(401).json({ message: "Invalid Credientials!" })
        }

        //generating a token....
        const token = genToken(customer._id)
        res.cookie("token", token, cookiesOptions)

        return res.status(200).json({ success: true, message: "Login Successful!" })


    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error })
    }
}


//Get the Customer...
export const getUser = async (req, res) => {
    const {_id, fullName, email, phone} = req.customer
    return res.status(200).json({ message: "User Authenticated", customerData: {_id, fullName, email, phone} })
}


//Logout the Customer...
export const logoutCustomer = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ success: true, message: "Logged out successfully!" })

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error })
    }
}


//Updating password....
export const changePass = async (req, res) => {
    try {

        const { oldPass, newPass } = req.body;

        const customer = req.customer
                                             //is there any need to compare password here as the customer is already loged in
        //check if old password is correct...
        const oldPassCheck = await bcrypt.compare(oldPass, customer.password)

        if (!oldPassCheck) {
            return res.status(401).json({ message: "Invalid Password!!" })
        }

        //hashing new password...
        const newSalt = await bcrypt.genSalt(12)
        const newHashPass = await bcrypt.hash(newPass, newSalt)

        customer.password = newHashPass
        await customer.save()

        return res.status(200).json({success: true, message: "Password Updated Successfully!!"})

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error })
    }

}


