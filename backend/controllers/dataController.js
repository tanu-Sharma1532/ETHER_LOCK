const network = require("network"); // Install via npm if needed
const allowedMacAddresses = require("../config/macWhitelisted");

const getMacAddress = (callback) => {
    network.get_active_interface((err, netInfo) => {
        if (err || !netInfo) {
            console.error("❌ Error retrieving MAC address:", err);
            return callback(null);
        }
        console.log("✅ Detected MAC Address:", netInfo.mac_address);
        callback(netInfo.mac_address);
    });
};

const fetchData = (req, res) => {
    getMacAddress((macAddress) => {
        if (!macAddress) {
            return res.status(500).json({ error: "MAC address not found" });
        }

        const normalizeMac = (mac) => mac.toLowerCase().replace(/-/g, ":");
        const formattedMac = normalizeMac(macAddress);

        console.log("🛠 Checking MAC Address:", formattedMac);
        console.log("🎯 Allowed MACs:", allowedMacAddresses.map(normalizeMac));

        if (!allowedMacAddresses.map(normalizeMac).includes(formattedMac)) {
            return res.status(403).json({ error: "Access denied" });
        }

        res.json({
            message: "Ethernet data fetched successfully",
            timestamp: new Date().toISOString(),
        });
    });
};

module.exports = { fetchData };
