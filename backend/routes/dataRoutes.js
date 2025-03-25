const express = require("express");
const router = express.Router();
const { fetchData } = require("../controllers/dataController");

router.get("/fetch-data", fetchData);

module.exports = router;
