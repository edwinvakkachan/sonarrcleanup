import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { delay } from './delay.js';


const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;







export async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHAT_ID,
    text: text
  });
  await delay(2000,true)
}