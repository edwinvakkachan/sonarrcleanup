import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const ip = process.env.IP;
const api = process.env.API;

import {sendTelegramMessage} from './sendTelegram.js'
import { delay } from './delay.js';

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
        if(value.seriesId == undefined){

const titleName = value.title.toLowerCase();

if (/\bmalayalam\b/.test(titleName) || /\bmal\b/.test(titleName)) {
  continue;
}
            console.log(`🗑️ ${value.title}`) 
            await sendTelegramMessage(`🗑️ ${value.title}`)
            queueId.push(value.id);
        }
    }

    if(queueId.length){
  console.log('👍 no Unknown episodes found')
  await sendTelegramMessage('👍 no Unknown episodes found')
    }

 await  fileDelete(queueId);

}


export async function deleteUnknownSeries (){
    console.log('🔍started to removing Unknown episodes')
  await sendTelegramMessage('🔍started to removing Unknown episodes')
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
