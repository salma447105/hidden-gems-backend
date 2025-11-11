import express from "express";
import { AppError } from "./utils/AppError.js";
import { globalMiddleWare } from "./middleware/globalMiddleWare.js";
const app = express();
const port = 3000;

// app.all("*", (req, res, next) => {
//   next(new AppError(`can't find this route: ${req.originalUrl}`, 404));
// });

app.use(globalMiddleWare);
app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
