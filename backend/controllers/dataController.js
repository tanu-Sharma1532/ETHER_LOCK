const usbDetect = require("usb-detection");

// ✅ Allowed USB Devices List (Only One Device Allowed)
const ALLOWED_USB_DEVICES = [
    { vendorId: 10007, productId: 65352, serialNumber: "", deviceName: "Redmi Note 8 Pro" },
    { vendorId: 12919, productId: 52, serialNumber: "0X0001", deviceName: "USB Composite Device" }
];

let accessGranted = false;

// 🛠 Start USB Monitoring
usbDetect.startMonitoring();

// 📌 Function to Strictly Validate Only the Allowed Device
const isOnlyAllowedDeviceConnected = async () => {
    try {
        const devices = await usbDetect.find();
        console.log("🔍 All Detected USB Devices:", devices);

        // ✅ Filter: Keep only the allowed devices
        const EXCLUDED_DEVICES = [
            "Camera", "Bluetooth", "WebCam", "DFU", "MediaTek", "Generic USB Hub", "USB Root Hub","ADB Interface"
        ]; // Add more unwanted names if needed

        const filteredDevices = devices.filter((device) => {
            const isAllowedDevice = ALLOWED_USB_DEVICES.some((allowed) => {
                console.log(`Checking device: ${device.deviceName}`);
                console.log(`Allowed device: ${allowed.deviceName}, Vendor ID: ${allowed.vendorId}, Product ID: ${allowed.productId}`);
                
                // Check for Vendor ID, Product ID, and Device Name
                return allowed.vendorId === device.vendorId &&
                    allowed.productId === device.productId &&
                    (
                        allowed.deviceName === device.deviceName || 
                        device.deviceName.includes("Redmi Note 8 Pro") || 
                        device.deviceName.includes("ADB Interface")
                    ) &&
                    // Modify serial number condition: check if it's provided or blank
                    (allowed.serialNumber === "" || allowed.serialNumber === device.serialNumber);
            });

            const isExcludedDevice = EXCLUDED_DEVICES.some((keyword) => device.deviceName.includes(keyword));

            // Log the filter conditions and results
            console.log(`Device ${device.deviceName}: Allowed? ${isAllowedDevice}, Excluded? ${isExcludedDevice}`);

            return isAllowedDevice && !isExcludedDevice;
        });

        console.log("📌 Filtered USB Devices (Only Allowed One):", filteredDevices);

        // 🚨 If not exactly 2 allowed devices are found, deny access
        if (filteredDevices.length !== ALLOWED_USB_DEVICES.length) {
            console.log("❌ Unauthorized USB Device(s) Detected! Access Denied.");
            accessGranted = false;
            return { status: false, message: "Unauthorized device detected. Access denied." };
        }

        console.log("✅ Allowed Device Connected! Access Granted.");
        accessGranted = true;
        return { status: true, message: "USB device validated successfully. Access granted." };
    } catch (error) {
        console.error("❌ Error fetching USB devices:", error);
        return { status: false, message: "Error detecting USB devices. Please try again." };
    }
};

// ✅ Handle USB Connection Event
usbDetect.on("add", async () => {
    const result = await isOnlyAllowedDeviceConnected();
    console.log(result.message);
});

// ✅ Handle USB Removal Event
usbDetect.on("remove", async () => {
    const result = await isOnlyAllowedDeviceConnected();
    console.log(result.message);
});

// 📌 API to Check Access Permission
const checkAccess = async (req, res) => {
    const result = await isOnlyAllowedDeviceConnected();
    if (!result.status) {
        return res.status(403).json({ error: result.message });
    }
    res.json({ message: result.message });
};

module.exports = { checkAccess };
