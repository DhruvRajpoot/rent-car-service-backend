import Order from "../Database/Models/OrderModel.js";
import { razorpayInstance } from "./PaymentController.js";

// get all orders placed by a user
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user.email });

    // Temporary Fix: To delete all pending orders
    const orderToBeDeleted = await Order.find({
      status: "Pending",
    });

    if (orderToBeDeleted) {
      orderToBeDeleted.forEach(async (order) => {
        await Order.findByIdAndDelete(order._id);
      });
    }

    if (!orders) {
      return res.status(404).json({
        message: "Orders not found!",
      });
    }

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json(error);
  }
};

// get order details by razorpay_order_id
export const getOrder = async (req, res) => {
  try {
    const { razorpay_order_id } = req.params;

    const order = await Order.findOne({
      razorpay_order_id: razorpay_order_id,
      email: req.user.email,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found!",
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json(error);
  }
};

// create a new order
export const createOrder = async (req, res) => {
  try {
    const { razorpay_order_id, carId, journeyDetails } = req.body;

    const razorpayOrder = await razorpayInstance.orders.fetch(
      razorpay_order_id
    );

    const newOrder = new Order({
      email: req.user.email,
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
      email: req.user.email,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

// update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { razorpay_order_id } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({
      razorpay_order_id: razorpay_order_id,
      email: req.user.email,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found!",
      });
    }

    const razorpayOrder = await razorpayInstance.orders.fetch(
      razorpay_order_id
    );

    // update order status only if the payment is successful
    if (razorpayOrder.status === "Paid") {
      order.status = status;
      await order.save();
    }

    return res.status(200).json({
      message: "Order status updated successfully!",
      id: order._id,
      status: order.status,
      email: order.email,
      razorpayOrderId: order.razorpay_order_id,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

//TODO: order cancellation
