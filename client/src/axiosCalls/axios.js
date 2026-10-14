import axios from 'axios'

// In production, set VITE_API_URL to your deployed backend URL in the
// hosting provider's environment settings (e.g. https://api.rougevault.com/).
// Never put private credentials (JWT secrets, Razorpay secret) in VITE_ variables.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/'

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers : {
        "Content-Type" : "application/json"
    },
    withCredentials: true
})