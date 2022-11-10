const express=require("express");
const dotenv=require("dotenv");

const ConnectDb=require("./config/db");


const app=express();

app.use(express.json({}))
app.use(express.json({
    extended:true
}))

dotenv.config({
    path:"./config/config.env"
});

ConnectDb();


app.use("/api/authsocial/auth",require("./routes/user"));


const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
})

