import jwt from "jsonwebtoken";


export async function isAuth(req,res,next) {
    try{
       const token = req.headers.authorization.split(" ")[1];
       if(!token){
        return res.status(401).json({message:"unauthorized"});
       }
       const decoded = jwt.verify(token, process.env.JWT_KEY);
       req.user = decoded;
       next();
    }catch{
        res.status(500).json({message:"something went wrong"})
    }
    
}
