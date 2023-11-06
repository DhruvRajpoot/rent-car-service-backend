import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
} from "../Controller/OrderController.js";
import checkuser from "../Middleware/checkuser.js";

const router = express.Router();

router.get("/getallorders", checkuser, getAllOrders);
router.get("/getorder/:razorpay_order_id", checkuser, getOrder);
router.post("/createorder", checkuser, createOrder);
router.post(
  "/updateorderstatus/:razorpay_order_id",
  checkuser,
  updateOrderStatus
);

export default router;
