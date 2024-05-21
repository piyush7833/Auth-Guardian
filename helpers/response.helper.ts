export const ResponseHandler=(message:string, data:any, status:number, error:boolean, res:any)=>{
    return res.status(status).json({
        message,
        data,
        error
    })
}