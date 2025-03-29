const network = require("network");
const usbDetect = require("usb-detection"); // Use usb-detection for real-time USB monitoring
const allowedMacAddresses = require("../config/macWhitelisted");

let usbDeviceConnected = false;

// Start listening for USB device events
usbDetect.startMonitoring();

usbDetect.on("add", (device) => {
    console.log("⚠ USB device connected:", device);
    usbDeviceConnected = true;
});

usbDetect.on("remove", (device) => {
    console.log("✅ USB device removed:", device);
    usbDeviceConnected = false;
});

const getMacAddresses = (callback) => {
    network.get_interfaces_list((err, interfaces) => {
        if (err || !interfaces || interfaces.length === 0) {
            console.error("❌ Error retrieving network interfaces:", err);
            return callback(null);
        }

        const activeInterfaces = interfaces.filter(iface => iface.mac_address && iface.ip_address);
        if (activeInterfaces.length === 0) {
            console.log("⚠ No active network interfaces found.");
            return callback([]);
        }

        const macAddresses = activeInterfaces.map(iface => iface.mac_address.toLowerCase());
        console.log("✅ Detected Active MAC Addresses:", macAddresses);
        callback(macAddresses);
    });
};

// Function to check USB devices dynamically
const isUSBDeviceConnected = () => {
    return usbDeviceConnected;
};

const fetchData = (req, res) => {
    if (isUSBDeviceConnected()) {
        return res.status(403).json({ error: "Access denied due to USB device connection" });
    }

    getMacAddresses((macAddresses) => {
        if (!macAddresses || macAddresses.length === 0) {
            return res.status(500).json({ error: "No active MAC addresses found" });
        }

        const normalizeMac = (mac) => mac.toLowerCase().replace(/-/g, ":");
        const formattedAllowedMacs = allowedMacAddresses.map(normalizeMac);

        console.log("🛠 Checking MAC Addresses:", macAddresses);
        console.log("🎯 Allowed MACs:", formattedAllowedMacs);

        // Check if all active MACs are in the allowed list
        const unauthorizedMacs = macAddresses.filter(mac => !formattedAllowedMacs.includes(mac));

        if (unauthorizedMacs.length > 0) {
            console.log("❌ Unauthorized MAC addresses detected:", unauthorizedMacs);
            return res.status(403).json({ error: "Access denied due to unauthorized network connections", unauthorizedMacs });
        }

        res.json({
            message: "Ethernet data fetched successfully",
            timestamp: new Date().toISOString(),
        });
    });
};

module.exports = { fetchData };
