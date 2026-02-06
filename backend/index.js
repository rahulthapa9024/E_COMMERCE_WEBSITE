const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/userRouter");
const cors = require("cors");
require("dotenv").config(); // so you can use .env file

const app = express();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);




mongoose
  .connect(process.env.DB_CONNECT_STRING)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

app.use("/auth", authRoutes);
const {productRouter}  = require('./routes/productRouter')
app.use("/product",productRouter)
const cartRouter = require("./routes/cartRouter");
app.use("/cart",cartRouter)

const paymentRouter = require("./routes/paymentRouter")
app.use("/payment",paymentRouter)

const couponRouter = require("./routes/couponRouter")
app.use("/coupon",couponRouter)



app.get("/get", (req, res) => {
  res.send("Hello from test server");
});
// Start server
app.listen(3000,"0.0.0.0", () => {
  console.log("🚀 Server running on http://localhost:3000");
});