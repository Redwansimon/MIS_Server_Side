
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.jwt_secret;

const verifytoken = (req,res,next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({message: "No token Provided"});
    }

    const token = authHeader.split(" ")[1];

    try {
        const decode = jwt.verify(token, jwt_secret);
        req.user = decode;
        console.log(decode);
        next();
    }catch(err){
        return res.status(403).json({message: "invalid token"})
    }

}

module.exports = verifytoken;