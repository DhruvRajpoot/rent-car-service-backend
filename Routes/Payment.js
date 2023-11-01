import express from "express";
import { createOrder, verifyPayment } from "../Controller/PaymentController.js";

const router = express.Router();

router.post("/createorder", createOrder);
router.post("/verify", verifyPayment);

export default router;
