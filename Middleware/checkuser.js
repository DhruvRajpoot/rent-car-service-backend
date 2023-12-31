import User from "../Database/Models/UserModel.js";
import jwt from "jsonwebtoken";

const checkuser = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "You must be logged in" });
  }
  const token = authorization.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id, email, exp } = decoded;
    if (Date.now() >= exp * 1000) {
      return res.status(401).json({ error: "Access Token is expired" });
    }
    const user = await User.findOne({ _id, email });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "You must be logged in" });
  }
};

export default checkuser;
