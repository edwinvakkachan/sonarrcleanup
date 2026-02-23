import { sendTelegramMessage } from "./sendTelegram.js";



export async function log(message='⌚') {
  const time = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false
  });

await sendTelegramMessage(`[${time}] ${message}`)
  console.log(`[${time}] ${message}`);
}
