import Razorpay from "razorpay";
import User from "../Database/Models/UserModel.js";
import crypto from "crypto";
import Payment from "../Database/Models/PaymentModel.js";
import { CLIENT_URL } from "../config/config.js";

// process.env.RAZORPAY_SECRET_TEXT
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
export const createOrder = async (req, res) => {
  const { email, amount } = req.body;
  const user = await User.findOne({ email: email });

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "receipt#1",
    payment_capture: 1,
  };
  try {
    const order = await razorpayInstance.orders.create(options);
    console.log(order);
    return res.status(200).json({
      message: "Order created successfully!",
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      fullname: user.fullname,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid payment request" });
  }

  const paymentDetails = await razorpayInstance.payments.fetch(
    razorpay_payment_id
  );

  const newPaymentRecord = new Payment({
    email: paymentDetails.email,
    amount: paymentDetails.amount / 100,
    razorpay_payment_id: razorpay_payment_id,
    razorpay_order_id: razorpay_order_id,
    razorpay_signature: razorpay_signature,
  });

  await newPaymentRecord.save();

  return res.redirect(
    `${CLIENT_URL}/paymentsuccess?reference_id=${razorpay_payment_id}`
  );
};

export const capturePayment = async (req, res) => {};
