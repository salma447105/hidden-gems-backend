import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { globalMiddleWare } from "./middleware/globalMiddleWare.js";

const app = express();
const port = 3000;


app.use(express.json());
app.get("/", (req, res) => res.send("Hello World!"));

app.use(globalMiddleWare);
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log(`DB Connected`))
  .catch((err) => console.error("❌ DB Connection Failed:", err));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
