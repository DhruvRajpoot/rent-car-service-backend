import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import User from "../Database/Models/UserModel.js";
import crypto from "crypto";
import { CLIENT_URL } from "../config/config.js";
import Order from "../Database/Models/OrderModel.js";
import carData from "../assets/CarData.js";

// process.env.RAZORPAY_SECRET_TEXT
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
export const createOrder = async (req, res) => {
  const { carDetails } = req.body;
  const user = await User.findOne({ email: req.user.email });

  const options = {
    amount: carDetails.price * 100,
    currency: "INR",
    receipt: "receipt#1",
    payment_capture: 1,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    return res.status(200).json({
      message: "Order created successfully!",
      id: order.id,
      carDetails: carDetails,
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
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment request" });
    }

    // update order status
    const order = await Order.findOne({ razorpay_order_id: razorpay_order_id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "Paid";
    await order.save();

    // send email function
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const carDetails = carData.filter(
      (car) => car.id === Number(order.carId)
    )[0];

    let emailMessage = `
            <div>
              <h2>Dear ${order.fullname},</h2>
              <h3>Your order is successfully placed</h3>
              <p>Order ID : ${razorpay_order_id}</p>
              <p>Amount Paid : Rs. ${order.amount}</p>

              <h3>Car Details:</h3>
              <p>Name : ${carDetails.carName}</p>
              <p>Model : ${carDetails.model}</p>

              <h3>Journey Details:</h3>
              <p>Rentee Name : ${
                order.journeyDetails.firstname + order.journeyDetails.lastname
              }</p>
              <p>Rentee Email : ${order.journeyDetails.email}</p>
              <p>Phone Number : ${order.journeyDetails.mobilenumber}</p>
              <p>Pickup Location : ${order.journeyDetails.address}</p>
              <p>Pickup Date : ${order.journeyDetails.pickup_date}</p>

              <h4>We will deliver your car on time.</h4>
              <h4>Thank you for choosing us.</h4>
            </div>
              `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: order.email,
      subject: `Rent Car Service : Confirmation of your order #${razorpay_order_id}`,
      html: emailMessage,
    };
    await transporter.sendMail(mailOptions, (error, response) => {
      if (error) {
        console.log("error", error);
      } else {
        console.log("Email Sent Successfully");
      }
    });

    return res.redirect(
      `${CLIENT_URL}/paymentsuccess?payment_id=${razorpay_payment_id}&order_id=${razorpay_order_id}`
    );
  } catch (error) {
    return res.status(500).json(error);
  }
};
