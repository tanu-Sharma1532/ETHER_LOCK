const express = require("express");
const { login, signup, changePassword } = require("../controllers/LoginController");
const auth = require("../middleware/authmiddleware")

const router = express.Router();

router.post("/signup",signup);
router.post("/login",login);
router.post("/change-password",changePassword);
// router.post("/logout", authMiddleware, logout); // Logout requires authentication

module.exports = router;
