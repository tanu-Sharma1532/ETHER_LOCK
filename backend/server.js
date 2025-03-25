const express = require("express");
const cors = require("cors");
const dataRoutes = require("./routes/dataRoutes");

const app = express();
app.use(cors());

app.use("/api", dataRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
