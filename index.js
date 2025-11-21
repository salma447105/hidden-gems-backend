import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import cors from "cors"; 
import { globalMiddleWare } from "./middleware/globalMiddleWare.js";
import authRouter from "./route/auth.route.js";
import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.router.js";
import activityRouter from "./route/activity.route.js";
import reviewRouter from "./route/review.routes.js";
import gemRouter from "./route/gem.route.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: (origin, callback) => callback(null, origin), 
  credentials: true,
}));

app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => res.send("Hello World!"));
app.use("/auth", authRouter);
app.use("/activity", activityRouter);
app.use("/review", reviewRouter);
app.use("/users", userRouter);
app.use("/categories", categoryRouter);
app.use("/gems", gemRouter);

app.use(globalMiddleWare);

mongoose.connect(process.env.DB_URL)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.error(" DB Connection Failed:", err));

app.listen(port, () => console.log(`Server running on port ${port}`));
