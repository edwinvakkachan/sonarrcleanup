

import { login } from "./jobs/login.js";
import { delay } from "./utils/delay.js";
import { log } from "./utils/timelog.js";
import { triggerHomeAssistantWebhookWhenErrorOccurs} from "./services/homeassistant/webhook.js";
import { retry } from "./services/homeassistant/retrayWrapper.js";
import { publishMessage } from "./services/publishMessage.js";
import { removingStoppedshows } from "./jobs/removingStoppedshows.js";
import { removeExeRarfiles } from "./jobs/removeExeRarfiles.js";
import { deleteUnknownSeries } from "./jobs/deleteUnknownSeries.js";
import { deleteRemovedSeries } from "./jobs/deleteRemovedseries.js";
import { removingStalledShows } from "./jobs/removingStalledshows.js";
import { removingFailedMetadatashows } from "./jobs/removingFailedMetadatashows.js";




async function main() {
  try {
 await log();
    console.log("🚀 sonarr cleanup started");
        await publishMessage({
  message: "🚀 sonarr cleanup started"
});
    
   

    await login();
    await delay(3000)
    await removingStoppedshows();
    await delay(3000)
    await removeExeRarfiles();
    await delay(3000)
    await deleteUnknownSeries ()
    await delay(3000)
    await deleteRemovedSeries ();
    await delay(3000)
    await removingStalledShows();
    await delay(3000)
    await removingFailedMetadatashows();


    console.log("🏇  sonarr Cleanup completed successfully");

       await publishMessage({
  message: "🏇  sonarr Cleanup completed successfully"
});

await log()
   process.exit(0); // ✅ clean exit
  } catch (err) {
    console.error("❌ Cleanup failed: triggering HA webhook", err.message);
      
    await retry(
  triggerHomeAssistantWebhookWhenErrorOccurs,
  { status: "error" },
  "homeassistant-error",
  5
);
    process.exit(1); // ❌ failure exit
  }
}

main();

