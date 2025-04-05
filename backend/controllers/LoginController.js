const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const User = require("../model/authModel");
const mailSender = require('../utils/MailSender');

const JWT_SECRET = "123456"; // Replace with a strong secret key

// 🔹 User Signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 🔍 Check if user already exists
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // 🔒 Secure password hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create new user
        const user = await User.create({ name, email, password: hashedPassword });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: { _id: user._id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({
            success: false,
            message: "Error registering user. Please try again later.",
        });
    }
};

// 🔹 User Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔍 Fetch user by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User does not exist",
            });
        }

        // 🔒 Validate password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            // ❌ Send security alert email
            const subject = "⚠️ Security Alert: Unauthorized Login Attempt";
            const message = `
                <h3>Hello ${user.name},</h3>
                <p>Someone attempted to log into your account.</p>
                <p>If this was not you, please secure your account immediately.</p>
                <br>
                <p>Best Regards,<br>CartVit Support Team</p>
            `;
            await mailSender(email, subject, message);

            return res.status(403).json({
                success: false,
                message: "Incorrect password",
            });
        }

        // ✅ Generate JWT token
        const payload = { email: user.email, id: user._id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

        // ✅ Store session token in DB
        await User.findByIdAndUpdate(user._id, { activeSession: token });

        // ✅ Return user details (excluding password)
        user = await User.findById(user._id).select("-password");

        return res.status(200).json({
            success: true,
            token,
            user,
            message: "User logged in successfully",
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again.",
        });
    }
};

// 🔹 Change Password
exports.changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide email, old password, and new password.",
            });
        }

        // 🔍 Fetch user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // 🔒 Validate old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect.",
            });
        }

        // 🔑 Prevent reusing the same password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from the old password.",
            });
        }

        // 🔒 Securely hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // ✅ Update password in DB
        await User.findByIdAndUpdate(user._id, { password: hashedNewPassword });

        // 📧 Notify user about password change
        const subject = "🔑 Password Changed Successfully!";
        const message = `
            <h3>Dear ${user.name},</h3>
            <p>Your password has been successfully changed.</p>
            <p>If this was not you, please reset your password immediately.</p>
            <br>
            <p>Best Regards,<br>CartVit Support Team</p>
        `;
        await mailSender(user.email, subject, message);

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });

    } catch (err) {
        console.error("Error changing password:", err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again.",
        });
    }
};
