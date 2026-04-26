import axios from "axios";
import config from "../config.js";
import { delay } from "../utils/delay.js";
import { publishMessage } from "../services/publishMessage.js";
import { qb } from "./login.js";
import { fileDelete } from "./fileDelete.js";

async function qbitorrentStalledFileInfo(downloadId){
  const {data} = await qb.get('/api/v2/torrents/info',{
    params: { hashes: downloadId.toLowerCase() }
  });
 
     for (const value of data){
        if(value.time_active>=config.qbitTime){
        console.log(`✅ YES stalled Movie time: ${Math.round(value.time_active/3600)}hrs` )
        return {
          value:true,
          time:value.time_active
        }
      } else return  {
        value:false,
        time: value.time_active
      }
      } 
     }



export async function removingStalledShows(){
   console.log('🔍started to removing Stalled shows')
  
       await publishMessage({
  message: '🔍started to removing Stalled shows'
});
 const {data} =  await axios.get(`${config.ip}/api/v3/queue`,{
         headers: {
        "X-Api-Key": config.api
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
 const resetQueue=[];

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
if(result.value==true){
    console.log('☢️ stalled tvshow episode, removing : ',value.title)
    
        await publishMessage({
  message: `☢️ stalled tvshow episode, removing :  ${value.title}`
});
    queueId.push(value.id)
}

if(result.value==false && result.time>3600){
resetQueue.push(value.downloadId)
}
}
 
}

if(resetQueue.length>0){
  console.log(`Moving stalled shows to bottom, count: ${resetQueue.length}`)
    await qb.post('/api/v2/torrents/bottomPrio', new URLSearchParams({
  hashes: resetQueue.join('|')
}))
}

if(!queueId.length){
  console.log('👍 No stalled  Episodes')
      await publishMessage({
  message: '👍 No stalled  Episodes'
});
  return
}

await fileDelete(queueId)

}