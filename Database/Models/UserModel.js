import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        require: [true, "Please enter usertype"],
        default: "user",
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter valid email address"],
    },
    fullname: {
        type: String,
        required: [true, "Please enter your fullname"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
    },
    resetCode: {
        type: Number,
        default: null,
    }
}, {
    timestamps: true,
});

// Hash the password before saving the user model
userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password") || this.isNew) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(this.password, salt);
            this.password = hashedPassword;
        }
        return next();
    }
    catch (error) {
        return next(error)
    }
});

// Compare password entered by user with the password in the database
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

// Generate an auth token for the user
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const userobj = { _id: user._id.toString(), username: user.username, email: user.email };
    const accessToken = jwt.sign(userobj, process.env.JWT_SECRET, { expiresIn: "2hr" });
    const refreshToken = jwt.sign(userobj, process.env.REFRESHTOKEN_SECRET_KEY, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}

const User = mongoose.model("User", userSchema);

export default User;