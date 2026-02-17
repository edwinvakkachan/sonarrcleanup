
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const homeassistantWebHook = process.env.HOMEASSISTANTWEBHOOK;

import {sendTelegramMessage} from './sendTelegram.js'



export async function triggerHAWebhook(errorMessage) {
  try {
    await axios.post(
      `${homeassistantWebHook}`,
      {
        status: "error",
        message: errorMessage,
        time: new Date().toISOString()
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 5000
      }
    );

    console.log("🏠 Home Assistant sonarr webhook triggered");
    await sendTelegramMessage("🏠 Home Assistant sonarr webhook triggered")
  } catch (err) {
    console.error("⚠️ Failed to trigger HA webhook:", err.message);
    await sendTelegramMessage("⚠️ Failed to trigger HA sonarr webhook")
  }
}