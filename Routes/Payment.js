import express from "express";
import { createOrder, verifyPayment } from "../Controller/PaymentController.js";
import checkuser from "../Middleware/checkuser.js";

const router = express.Router();

router.post("/createorder", checkuser, createOrder);
router.post("/verify", verifyPayment);

export default router;
