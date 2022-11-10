const mongoose=require("mongoose");


const UserShema=new mongoose.Schema({

    name:{
        type:String
       
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        min:6
    },
    profilePicture:{
        type:String,
        default:""
    },
    followers:{
        type:Array,
        default:[]
    },
    followings:{
        type:Array,
        default:[]
    },
    friends:{
        type:Array,
        default:[]
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    profession:{
        type:String,
        max:50
    }



},{timestamps:true});



// const UserShema=new mongoose.Schema({
//     username:{
//         type:String,
//         required:true
//     },

//     avatar:{
//         type:String
//     },
//     email:{
//         type:String,
//         required:true
//     },
//     password:{
//         type:String,
//         required:true
//     }
    
// })


module.exports=mongoose.model("User",UserShema);

