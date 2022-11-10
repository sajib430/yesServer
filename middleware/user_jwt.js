// const jwt=require("jsonwebtoken");


// module.exports=async function(req,res,next){
//     const token=req.header("Authorization");

//     if(!token){
//         return res.status(401).json(({
//             msg:"No token authorization, access denied"       
//         }))
//     }

//     try{

//     }catch(err){
//         console.log("Something went worng with middleware "+err);
//         res.status(500).json({
//             msg:"Server Err"
//         })
//     }

// }




const jwt=require("jsonwebtoken")


module.exports=async function(req,res,next){
    const token=req.header('Authorization');

    if(!token){
       return res.status(401).json(({
            msg:'No token authorization denied'
        }))
    }



    try{
        await jwt.verify(token,process.env.jwtUserSecret,(err,decoded)=>{
            if(err){
                res.status(401).json({
                    msg:"Token not valid"
                })  
            }else{
                req.user=decoded.user;
                next();
            }
        })
    }catch(err){
        console.log("Somthing went wrong with middleware "+err);
        res.json(500).json({
            msg:"Server Err"
        })
    }

}


