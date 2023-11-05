import User from "../Database/Models/UserModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

// Add user (register user)
export const signup = async (req, res) => {
  const user = new User(req.body);
  const existingUser = await User.findOne({ email: req.body.email });
  try {
    if (!existingUser) {
      const response = await user.save();
      const token = await response.generateAuthToken();
      const filterUser = {
        _id: response._id.toString(),
        email: response.email,
        fullname: response.fullname,
      };
      res.status(201).json({
        message: "User added successfully",
        token: token,
        user: filterUser,
      });
    } else {
      res.status(400).json({ error: "User already exists" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ error: "Please provide email" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      return res.status(404).json({ error: "Invalid Credentials" });
    }
    const token = await user.generateAuthToken();
    const filterUser = {
      _id: user._id.toString(),
      email: user.email,
      fullname: user.fullname,
    };
    res.status(200).json({
      message: "User logged in successfully",
      user: filterUser,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get access token from refresh token
export const getAccessToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ error: "Please provide refresh token" });
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESHTOKEN_SECRET_KEY,
      (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: err.message });
        } else {
          const user = decoded;
          const userobj = {
            _id: user._id.toString(),
            email: user.email,
            fullname: user.fullname,
          };
          const accessToken = jwt.sign(userobj, process.env.JWT_SECRET, {
            expiresIn: "2hr",
          });
          res.status(200).json({
            message: "Access token generated successfully",
            accessToken: accessToken,
          });
        }
      }
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// send reset code to email
export const sendresetcode = async (req, res) => {
  const purpose = req.params.purpose;
  const email = req.body.email;
  if (!email || !purpose) {
    return res.status(400).json({ error: "Please provide email and purpose" });
  }
  try {
    const resetCode = Math.floor(100000 + Math.random() * 900000);
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    await User.updateOne(
      { email: req.body.email },
      { $set: { resetCode: resetCode } }
    );
    // subject of email
    let emailSubject;
    if (purpose == "forgotpassword") {
      emailSubject = "Reset Password";
    }

    // message to be sent to email
    let emailMessage;
    if (purpose == "forgotpassword") {
      emailMessage = `
            <div>
              <p>Hello ${existingUser.fullname},</p>
              <p>Please use this code to reset your rent-car-service account password:</p>
              <h1 style="background:#ddd;width:fit-content;padding:3px 12px;letter-spacing:1px">${resetCode}</h1>     
              <h4>Note: This code will expire in 10 minutes</h4>
            </div>
            `;
    }

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
    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: emailSubject,
      html: emailMessage,
    };
    await transporter.sendMail(mailOptions, (error, response) => {
      if (error) {
        res.status(400).json({
          error: error.message,
          message: "Error while sending reset code",
        });
      } else {
        // expire the reset code after 10 minutes
        setTimeout(() => {
          existingUser.resetCode = null;
          existingUser.save();
        }, 600000);
        return res
          .status(200)
          .json({ message: "Reset code sent successfully" });
      }
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: "Error while sending reset code",
    });
  }
};

// forgot password
export const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Please provide email" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.resetCode || user.resetCode != req.body.resetCode) {
      return res.status(400).json({ error: "Invalid reset code" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    await User.updateOne(
      { email: req.body.email },
      { $set: { password: hashedPassword, resetCode: null } }
    );
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
