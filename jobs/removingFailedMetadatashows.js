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
if(value.downloaded==0 && value.has_metadata==false && value.time_active >= 600 && value.availability==0){
 console.log(`✅ YES failed metadata movie ` )
        return {
          value:true,
        }
      }else return {
        value:false
      }
     }
}


export async function removingFailedMetadatashows(){
   console.log('🔍started to removing FailedMetadata Download Episodes')
  
       await publishMessage({
  message: '🔍started to removing  FailedMetadata Download Episodes'
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

for (const value of data.records){
  await delay(300,true);
  if(!value.downloadId){
    console.log('❗ Download id doesnot exsist for tvshow episode')
    continue;
  }
//skippping indian regional laguages
  if (/malayalam|mal|hindi|hin|tamil|tam/i.test(value.title.toLowerCase())){
  console.log(`☢️  Failed metada download tvshow episode, please remove manually ${value.title} `)
  continue;
 }
  

 
const result = await qbitorrentStalledFileInfo(value.downloadId)


  if(result.value==true){
    console.log('☢️ Failed metadata download tvshow episode, removing : ',value.title)
    
        await publishMessage({
  message: `☢️ Failed metadata download tvshow episode, removing :  ${value.title}`
});
    queueId.push(value.id)

  }
}



if(!queueId.length){
  console.log('👍 No  failed metadata Episodes')
      await publishMessage({
  message: '👍 No failed metadata Episodes'
});
  return
}

await fileDelete(queueId)

}