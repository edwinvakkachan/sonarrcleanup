import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const ip = process.env.IP;
const api = process.env.API;


import { publishMessage } from './queue/publishMessage.js';
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
console.log(`😡 Removed Total ${queueId.length} Episodes`);

        await publishMessage({
  message: `😡 Removed Total ${queueId.length} Episodes`
});
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
  console.log(`🥵 please remove unknown tvshow malayalam ${titleName}  manually `)
          await publishMessage({
  message: `🥵 please remove unknown tvshow malayalam ${titleName}  manually ` 
});
  continue;
}
if (/\bhindi\b/.test(titleName) || /\bhin\b/.test(titleName)) {
 console.log( `🥵 please remove unknown tvshow hindi ${titleName}  manually `)
           await publishMessage({
  message: `🥵 please remove unknown tvshow hindi ${titleName}  manually `
});
  continue;
}
if (/\btamil\b/.test(titleName) || /\btam\b/.test(titleName)) {
  console.log(`🥵 please remove unknown tvshow tamil ${titleName}  manually `)
            await publishMessage({
  message: `🥵 please remove unknown tvshow tamil ${titleName}  manually `
});
  continue;
}
            console.log(`🗑️ deleted  ${value.title}`) 
                    await publishMessage({
  message: `🗑️ deleted ${value.title}`
});
            queueId.push(value.id);
        }
    }

    if(queueId.length){
  console.log('👍 No  unknown tvshow episodes found')
 
          await publishMessage({
  message: '👍 No unknown tvshow episodes found'
});
    }

 await  fileDelete(queueId);

}


export async function deleteUnknownSeries (){
    console.log('🔍started to removing Unknown episodes')

          await publishMessage({
  message: '🔍started to removing Unknown episodes'
});
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
