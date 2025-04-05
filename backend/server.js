const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// require("dotenv").config(); // Load environment variables

const dataRoutes = require("./routes/dataRoutes");
const authRoutes = require("./routes/authroutes");
const fileRoutes = require("./routes/fileroutes");

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// 🔹 MongoDB Connection
const MONGO_URI = "mongodb://localhost:27017/EtherLock";
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 🔹 Routes
app.use("/api", dataRoutes);
app.use("/api/auth", authRoutes);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/files", fileRoutes);

// 🔹 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
