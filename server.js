

// import {deleteRemovedSeries} from './jobs/deleteRemovedseries.js'
// import {deleteUnknownSeries} from './jobs/deleteUnknownSeries.js'
// import {delay} from './delay.js'
// import { triggerHomeAssistantWebhookWhenErrorOccurs } from './homeassistant/webhook.js';
// import { log } from './timelog.js';
// import { publishMessage } from './queue/publishMessage.js';
// import { retry } from './homeassistant/retrayWrapper.js';

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


async function qbitorrentStalledFileInfo(downloadId){
  const {data} = await qb.get('/api/v2/torrents/info',{
    params: { hashes: downloadId.toLowerCase() }
  });
 
     for (const value of data){
        if(value.time_active>=qbitTime){
        console.log(`✅ YES stalled Movie time: ${Math.round(value.time_active/3600)}hrs` )
        return {
          value:true,
          stalled:true,
          time:value.time_active,
          metadatafail:false
        }
      }
      else if(value.downloaded==0 && value.has_metadata==false && value.time_active >= 600 && value.availability==0){
 console.log(`✅ YES failed metadata movie ` )
        return {
          value:true,
          stalled:false,
          time:value.time_active,
          metadatafail:true
        }
      }
      else {
        return {
          value:false,
          stalled:false,
          time:value.time_active,
          metadatafail:false
        }
      } 
     }
}


async function removingStalledMoviesFailedMetadataDownload(){
   console.log('🔍started to removing Stalled and FailedMetadata Download Episodes')
  
       await publishMessage({
  message: '🔍started to removing Stalled and FailedMetadata Download Episodes'
});
 const {data} =  await axios.get(`${ip}/api/v3/queue`,{
         headers: {
        "X-Api-Key": api
      },
      params: {
        page: 1,
        pageSize: 500,
        sortDirection: "default",
        includeUnknownMovieItems: true,
        includeMovie: true,
        protocol: "torrent",
      }
    })


const queueId=[];

for (const value of data.records){
  await delay(300,true);
  if(!value.downloadId){
    console.log('❗ Download id doesnot exsist for tvshow episode')
    continue;
  }
//skippping indian regional laguages
  if (/malayalam|mal|hindi|hin|tamil|tam/i.test(value.title.toLowerCase())){
  console.log(`☢️  stalled tvshow episode, please remove manually ${value.title} `)
  continue;
 }
  
if(value.status=='warning' && value.errorMessage=='The download is stalled with no connections'){
const result = await qbitorrentStalledFileInfo(value.downloadId)
if(result.value==true && result.stalled==true){
  
}
}
 
const result = await qbitorrentStalledFileInfo(value.downloadId)
  if(result.value==true){
    console.log('☢️ stalled tvshow episode, removing : ',value.title)
    
        await publishMessage({
  message: `☢️ stalled tvshow episode, removing :  ${value.title}`
});
    queueId.push(value.id)

  }
}



if(!queueId.length){
  console.log('👍 No stalled and failed metadata Episodes')
      await publishMessage({
  message: '👍 No stalled and failed metadata Episodes'
});
  return
}

await fileDelete(queueId)

}





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

