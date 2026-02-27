
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();


const HA_WEBHOOKError_URL = process.env.HOMEASSISTANTWEBHOOK;


export async function triggerHomeAssistantWebhookWhenErrorOccurs(payload = {}) {
 
  if (!HA_WEBHOOKError_URL) {
    throw new Error("HA_WEBHOOKError_URL not set");
  }

  try {
    const response = await axios.post(
      HA_WEBHOOKError_URL,
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
