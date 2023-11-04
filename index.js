import express from "express";
import connectdatabase from "./Database/db.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import Auth from "./Routes/Auth.js";
import Payment from "./Routes/Payment.js";
import Order from "./Routes/Order.js"

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
connectdatabase();

// Routes
app.get("/logo.png", (req, res) => {
  res.sendFile(path.join(__dirname, "logo.png"));
});
app.use("/auth", Auth);
app.use("/payment", Payment);
app.use("/order", Order)

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
