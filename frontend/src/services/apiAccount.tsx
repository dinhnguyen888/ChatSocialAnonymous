import axios from "axios";
import { appConfig } from "./config";

interface Account{
    _id?:string,
    email:string,
    password:string,
    name:string,
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

export const login = async (email: string, password: string) => {
    const response = await axios.post(loginURL, {
        email: email,
        password: password,
    });
    console.log(response.data)
    return response.data;
};


export const loginWithOTP = async (email:object) =>{
    const response = await axios.post(`${appConfig.apiBaseUrl}/loginOTP`,email)
    return response.data
}


export const validateOTP = async (validate:validateForm)=>{
    const response = await axios.post(`${appConfig.apiBaseUrl}/validateOTP`,validate)
    return response.data
}

export const changePasswordAccount = async (_id: string, password: string) => {
    // const token = localStorage.getItem('token');
    const response = await axios.put<Account>(`${accountURL}/change-password/${_id}`, { password });
    return response.data;
};


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