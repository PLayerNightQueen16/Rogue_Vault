import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/',       //remember to put / here at the end..
    headers : {
        "Content-Type" : "application/json"
    },
    withCredentials: true
})