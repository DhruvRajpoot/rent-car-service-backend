import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
} from "../Controller/OrderController.js";

const router = express.Router();

router.get("/getallorders", getAllOrders);
router.get("/getorder/:razorpay_order_id", getOrder);
router.post("/createorder", createOrder);
router.post("/updateorderstatus/:razorpay_order_id", updateOrderStatus);

export default router;
