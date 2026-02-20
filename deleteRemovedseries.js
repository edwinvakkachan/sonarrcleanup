import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import {sendTelegramMessage} from './sendTelegram.js'

const ip = process.env.IP;
const api = process.env.API;

async function delay(ms,noLog) {
  if(noLog){
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  else{
console.log(`Waiting...${ms} sec`);
  return new Promise(resolve => setTimeout(resolve, ms));
  }
   
}


async function fileDelete(queueId){
   await axios.delete(`${ip}/api/v3/queue/bulk`,{
    headers: {
        "X-Api-Key": api
      },
      params:{
        removeFromClient:true,
        blocklist:false,
        skipRedownload:true,
        changeCategory:false
      },
      data:{
        ids:queueId,
      }
})
console.log(`😡 Removed ${queueId.length} Episodes`);
await sendTelegramMessage(`😡 Removed ${queueId.length} Episodes`)
}


async function getepisodeDetails(epsodeid){
    const responce =  await axios.get(`${ip}/api/v3/queue/details`,{
         headers: {
        "X-Api-Key": api
      },
      params: {
        episodeIds: epsodeid,
        includeEpisode:true
      }
    }) 
const queueId =[];
    for (const value of responce.data){
        if(value.trackedDownloadState=='importBlocked'){
            console.log(value.title)
            await sendTelegramMessage(value.title);
            queueId.push(value.id);
        }
    }

    if(queueId.length){
        console.log('👍 no Episodes need to manually remove ')
        await sendTelegramMessage('👍 no Episodes need to manually remove')
    }

await fileDelete(queueId);

}


 export async function deleteRemovedSeries (){
    console.log('🔍 started to removing the manually deleted Episodes')
  await sendTelegramMessage('🔍 started to removing the manually deleted Episodes')
 const responce =  await axios.get(`${ip}/api/v3/queue`,{
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


    const queueId=[]
    for (const value of responce.data.records){

     queueId.push(value.episodeId)
    }
   await delay(3000,true)

    await getepisodeDetails(queueId)
} 
