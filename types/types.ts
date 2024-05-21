export type userStoreType={
    [key:string]:{
        id:number,
        email:string,
        password:string,
        passKey?:any
    }
}