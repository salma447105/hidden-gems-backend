import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import cors from "cors"; 
import { globalMiddleWare } from "./middleware/globalMiddleWare.js";
import authRouter from "./route/auth.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: (origin, callback) => callback(null, origin), 
  credentials: true,
}));


app.get("/", (req, res) => res.send("Hello World!"));
app.use("/auth", authRouter);

app.use(globalMiddleWare);

mongoose.connect(process.env.DB_URL)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.error(" DB Connection Failed:", err));

app.listen(port, () => console.log(` Server running on port ${port}`));
