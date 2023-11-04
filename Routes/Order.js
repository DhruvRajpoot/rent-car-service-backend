import express from "express";
import { createOrder, getOrders } from "../Controller/OrderController.js";

const router = express.Router();

router.get("/getorders", getOrders);
router.post("/createorder", createOrder);

export default router;
