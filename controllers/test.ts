import  { Request, Response } from 'express';
import { ResponseHandler } from '../helpers/response.helper';
import { userStoreType } from '../types/types';

export const userStore:userStoreType={}
export const test= async (req:Request, res: Response) => {
    try {
     const {email,password}=req.body;
     const id=new Date().getTime();
     const user={
            id,
            email,
            password
     }
     userStore[id]=user;
     return ResponseHandler("User registered successfully",user,200,false,res)
    } catch (error) {
        console.log(error)
        return ResponseHandler("Something went wrong",null,500,true,res)
    }
    }