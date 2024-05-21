import { ResponseHandler } from "../helpers/response.helper"
import  { Request, Response } from 'express';

export const facebookAuth= async (req: Request, res: Response) => {
    try {
     return ResponseHandler("Google Authenticated successfully",null,200,false,res)
    } catch (error) {
        return ResponseHandler("Something went wrong",null,500,true,res)
    }
    }