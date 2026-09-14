const express= require('express');
const cors=require('cors');
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");

require("dotenv").config();
connectDB();

const app=express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);


app.get('/',(req,res)=>{
    res.json({
        mes:"Backend server is running "
    });
});

const PORT= process.env.PORT||5000;

app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})



