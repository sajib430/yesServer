const mongoose=require("mongoose");

const ConnectDb=async()=>{
    const connect=await mongoose.connect(process.env.MONGO_URL);

    console.log(`connect to mongodb ${connect.connection.host}`)
}

module.exports=ConnectDb
