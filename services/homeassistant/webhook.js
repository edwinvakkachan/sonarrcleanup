
import config from "../../config.js";
import axios from "axios";

export async function triggerHomeAssistantWebhookWhenErrorOccurs(payload = {}) {
 
  if (!config.HOMEASSISTANTWEBHOOK) {
    throw new Error("HA_WEBHOOKError_URL not set");
  }

  try {
    const response = await axios.post(
      config.HOMEASSISTANTWEBHOOK,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      }
    );

    console.log("✅ Home Assistant webhook Error URL triggered:", response.status);
    return response.data;

  } catch (error) {
    console.error("❌ Failed to trigger Home Assistant webhook Error URL :", error.message);
    throw error;   // REQUIRED
  }
}
