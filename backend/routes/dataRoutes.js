const express = require("express");
const { checkAccess, transferPhotos } = require("../controllers/dataController");

const router = express.Router();

// ✅ Route to check USB access
router.get("/check-access", checkAccess);

// ✅ Route to transfer photos (only if access is granted)
// router.get("/transfer-photos", transferPhotos);

module.exports = router;
