import Order from "../Database/Models/OrderModel.js";
import { razorpayInstance } from "./PaymentController.js";

export const getOrders = async (req, res) => {};

export const createOrder = async (req, res) => {
  try {
    const { email, razorpay_order_id, carId, journeyDetails } = req.body;

    const razorpayOrder = await razorpayInstance.orders.fetch(
      razorpay_order_id
    );

    const newOrder = new Order({
      email: email,
      amount: razorpayOrder.amount / 100,
      razorpay_order_id: razorpay_order_id,
      carId: carId,
      journeyDetails: journeyDetails,
    });

    await newOrder.save();

    return res.status(200).json({
      message: "Order created successfully!",
      id: newOrder._id,
      carId: carId,
      email: email,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
