import axios from "axios";
import { appConfig } from "./config";

interface Account{
    _id?:string,
    email:string,
    password:string,
    name:string,
    role?: 'Guest' | 'User'
}

interface validateForm{
    email:string
    otp:string
}



const accountURL = `${appConfig.apiBaseUrl}/accounts`;
const loginURL = `${appConfig.apiBaseUrl}/login`;

export const getUserByID = async (_id:string) =>{
    const response = await axios.get<Account>(`${accountURL}/${_id}`)
    return response.data
}

export const getAccounts = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get<Account[]>(`${accountURL}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

export const deleteAccount = async (_id:string) =>{
    const token = localStorage.getItem('token')
    const response = await axios.delete<Account>(`${accountURL}/${_id}`,{
        headers:{
             'Authorization': `Bearer ${token}`
        }
    })
    return response.data
}

export const createAccount = async (Account:Account) =>{
    const response = await axios.post<Account>(accountURL,Account)
    return response.data
}

export const guestQuickStart = async (name?: string) => {
    const response = await axios.post(loginURL, { name });
    return response.data as { token: string; id: string };
};


export const loginWithOTP = async (payload: { email: string; name: string }) =>{
    const response = await axios.post(`${appConfig.apiBaseUrl}/loginOTP`, payload)
    return response.data
}


export const validateOTP = async (validate:validateForm)=>{
    const response = await axios.post(`${appConfig.apiBaseUrl}/validateOTP`,validate)
    return response.data
}

// Removed change password functionality

export const deleteGuestAccount = async (id: string) => {
    const response = await axios.delete(`${appConfig.apiBaseUrl}/guest/${id}`);
    return response.data as { ok: boolean };
}

export const linkEmailToGuest = async (guestId: string, email: string) => {
    const response = await axios.post(`${appConfig.apiBaseUrl}/link-email`, { guestId, email });
    return response.data as { message: string };
}

export const verifyEmailLink = async (guestId: string, email: string, otp: string) => {
    const response = await axios.post(`${appConfig.apiBaseUrl}/verify-email-link`, { guestId, email, otp });
    return response.data as { message: string; token: string; id: string };
}


// export const changePassword = async (id:string, password:string) => {
//     const response = await axios.put(`${accountURL}/change-password/${id}`, { password });
//     return response.data;
//   };
  
//   export const changeName = async (id:string, name:string) => {
//     const response = await axios.put(`${accountURL}/change-name/${id}/`, { name });
//     return response.data;
//   };
  
//   export const deleteAccount = async (id) => {
//     const response = await axios.delete(`${accountURL}`,);
//     return response.data;
//   };