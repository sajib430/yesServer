
const express=require("express");
const router=express.Router();
const User=require("../models/User")
const jwt=require("jsonwebtoken");
const bcryptjs=require("bcryptjs");
const user_jwt=require("../middleware/user_jwt");
const { findOne } = require("../models/User");


router.post("/register",async(req,res,next)=>{
    try{

        const user_exist=await User.findOne({email:req.body.email});
        if(user_exist){
            return res.status(400).json({
                success:false,
                msg:"user already exists"
            })
        }

        const user_name=await User.findOne({username:req.body.username});
        if(user_name){
            return res.status(400).json({
                success:false,
                msg:"username must be unique"
            })
        }

        let user =new User();

        user.username=req.body.username;
        user.email=req.body.email;


        if(req.body.password.length<6){
            return res.status(400).json({
                 success:false,
                 msg:"password must be at least 6 character"
             })
         }


        const salt=await bcryptjs.genSalt(10);
        user.password=await bcryptjs.hash(req.body.password,salt);

        await user.save();

        const payload={
            user:{
                id:user.id
            }
        }

        const {password, ...others}=user._doc;

        jwt.sign(payload,process.env.jwtUserSecret,{
            expiresIn:360000
        },(err,token)=>{
            if(err) throw err;
            res.status(200).json({
                success:true,
                token:token,
                user:others
            })
        })


    }catch(err){
        console.log(err)
    }
})




router.post("/login",async(req,res,next)=>{

    // const email=req.body.email;
    // const password=req.body.password;

    try{

        var user =await User.findOne({email:req.body.email});

        if(!user){

            return res.status(400).json({
                success:false,
                msg:"User not exits go and register a new account"
            })   
        }


        const isMatch=await bcryptjs.compare(req.body.password,user.password);

        if(!isMatch){
            return res.status(400).json({
                success:false,
                msg:"Invalid password"
            })
        }

        const payload={
            user:{
                id:user.id
            }
        }

        const {password, ...others}=user._doc;
        jwt.sign(
            payload,process.env.jwtUserSecret
            ,{
                expiresIn:360000
            },(err,token)=>{
                if (err) throw err;

                res.status(200).json({
                    success:true,
                    msg:"user loged in",
                    token:token,
                    user:others
                })
            }
        )



    }catch(error){
        console.log(error.message);
        res.status(500).json({
            success:false,
            msg:"Server Error"
        })
    }

})



router.get("/",async (req,res,next)=>{
    try{

        const user=await User.find(this.all);
        res.status(200).json({
            success:true,
            user:user
        })

    }catch(error){
        console.log(error.message);
        res.status(500).json({
            success:false,
            msg:"Server err"
        })
        next();
    }
})


router.get("/own",user_jwt,async (req,res,next)=>{
    try{

        const user=await User.findById(req.user.id).select('-password');
        res.status(200).json({
            success:true,
            user:user
        })

    }catch(error){
        console.log(error.message);
        res.status(500).json({
            success:false,
            msg:"Server err"
        })
        next();
    }
})


router.put('/',user_jwt, async (req, res, next) => {
    try {
        let user_valid = await User.findById(req.user.id);
        if(!user_valid) {
            return res.status(400).json({ success: false, msg: 'Author does not exits'});
        }

        const userr=await User.findOne({username:req.body.username});
        if(userr){
            return res.status(400).json({
                success:false,
                msg:"username must be unique"
            })
        }


        if(req.body.password.length<6){
           return res.status(400).json({
                success:false,
                msg:"password must be at least 6 character"
            })
        }


        if(req.body.password){
            try{
                const salt=await bcryptjs.genSalt(10);
                req.body.password=await bcryptjs.hash(req.body.password,salt);
            }catch(err){
                console.log("can not hash")
            }
            
        }

    
        user_valid=await User.findByIdAndUpdate(req.user.id,req.body,{
            new:true,
            runValidators:true
        })

        // toDo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true
        // });

        res.status(200).json({ success: true,User: user_valid, msg: 'Successfully updated' });
        
    } catch (error) {
        next(error);
    }

});


//delete a user
router.delete("/",user_jwt,async(req,res,next)=>{
    try{

        const userr=await User.findById(req.user.id);

        if(!userr){
            res.status(500).json({
                success:false,
                msg:"user does not exits for delete"
            })
        }

        const deleteUser=await User.findByIdAndDelete(req.user.id);
        res.status(200).json({
            success:true,
            msg:"successfully deleted account"
        })
        

    }catch(err){
        console.log(err);
        return res.status(403).json({
            success:false,
            msg:"you only can delete your account"
        })


    }
})



//follow or unfollow a user
router.put("/follow/:id",user_jwt,async(req,res,next)=>{

    if(req.user.id !== req.params.id){

        try{

            const userr=await User.findById(req.params.id);
            const currentuser=await User.findById(req.user.id);

            if(!userr.followers.includes(req.user.id)){
                await userr.updateOne({$push:{followers:req.user.id}})
                await currentuser.updateOne({$push:{followings:req.params.id}})

                const usert=await User.findById(req.params.id);
                const currentusert=await User.findById(req.user.id);
                res.status(200).json({
                    success:true,
                    user:usert,
                    currentuser:currentusert,
                    msg:"user has been followed"
                })
            }else{
                await userr.updateOne({$pull:{followers:req.user.id}})
                await currentuser.updateOne({$pull:{followings:req.params.id}})

                const usert=await User.findById(req.params.id);
                const currentusert=await User.findById(req.user.id);
                res.status(200).json({
                    success:true,
                    user:usert,
                    currentuser:currentusert,
                    msg:"user has been unfollowed"
                })
            }

        }catch(err){
            res.status(500).json({
                success:false,
                msg:err
            })
        }

    }else{
        res.status(403).json({
            success:false,
            msg:"you can not follow or unfollow yourself"
        })
    }

})



//make a friend
router.put("/friend/:id",user_jwt,async(req,res,next)=>{

    if(req.user.id !==req.params.id){

        try{

           const userr=await User.findById(req.params.id);
           const currentuser=await User.findById(req.user.id);

            if(userr.followers.includes(req.user.id) && userr.followings.includes(req.user.id)){
                await userr.updateOne({$push:{friends:req.user.id}})
                await currentuser.updateOne({$push:{friends:req.params.id}})
                res.status(200).json({
                    success:true,
                    msg:"now you are frinds"
                })
            }else{
                await userr.updateOne({$pull:{friends:req.user.id}})
                await currentuser.updateOne({$pull:{friends:req.params.id}})
                res.status(200).json({
                    success:true,
                    msg:"now you are unfrinds"
                })
            }

        }catch(err){
            res.status(500).json({
                success:false,
                msg:err
            })
        }

    }else{
        res.status(403).json({
            success:false,
            msg:"you can not  follow yourself"
        })
    }

});



//tttttttttt
router.put("/friendsrt/:id",user_jwt,async(req,res,next)=>{



    if(req.user.id !== req.params.id){

        try{

            const userr=await User.findById(req.params.id);
            const currentuser=await User.findById(req.user.id);

            if(!userr.followers.includes(req.user.id)){
                await userr.updateOne({$push:{followers:req.user.id}})
                await currentuser.updateOne({$push:{followings:req.params.id}})

                const usert=await User.findById(req.params.id);
                const currentusert=await User.findById(req.user.id);
                return res.status(200).json({
                    success:true,
                    user:usert,
                    currentuser:currentusert,
                    msg:"user has been followed"
                })
            }else{
                await userr.updateOne({$pull:{followers:req.user.id}})
                await currentuser.updateOne({$pull:{followings:req.params.id}})

                const usert=await User.findById(req.params.id);
                const currentusert=await User.findById(req.user.id);
                return res.status(200).json({
                    success:true,
                    user:usert,
                    currentuser:currentusert,
                    msg:"user has been unfollowed"
                })
            }





        }catch(err){
            res.status(500).json({
                success:false,
                msg:err
            })
        }

    }else{
        res.status(403).json({
            success:false,
            msg:"you can not follow or unfollow yourself"
        })
    }



    if(req.user.id !==req.params.id){

        try{

           const userr=await User.findById(req.params.id);
           const currentuser=await User.findById(req.user.id);

            if(userr.followers.includes(req.user.id) && userr.followings.includes(req.user.id)){
                await userr.updateOne({$push:{friends:req.user.id}})
                await currentuser.updateOne({$push:{friends:req.params.id}})
                return res.status(200).json({
                    success:true,
                    msg:"now you are frinds"
                })
            }else{
                await userr.updateOne({$pull:{friends:req.user.id}})
                await currentuser.updateOne({$pull:{friends:req.params.id}})
                return res.status(200).json({
                    success:true,
                    msg:"now you are unfrinds"
                })
            }

        }catch(err){
            res.status(500).json({
                success:false,
                msg:err
            })
        }

    }else{
        res.status(403).json({
            success:false,
            msg:"you can not  follow yourself"
        })
    }

})






module.exports=router;