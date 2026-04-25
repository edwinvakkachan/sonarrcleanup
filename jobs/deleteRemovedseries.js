import axios from 'axios';
import config from '../config.js';
import { publishMessage } from '../services/publishMessage.js';
import { delay } from '../utils/delay.js';





async function fileDelete(queueId){
   await axios.delete(`${config.ip}/api/v3/queue/bulk`,{
    headers: {
        "X-Api-Key": config.api
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
  message: `😡 Removed total ${queueId.length} Episodes`
});
}


async function getepisodeDetails(epsodeid){
    const responce =  await axios.get(`${config.ip}/api/v3/queue/details`,{
         headers: {
        "X-Api-Key": config.api
      },
      params: {
        episodeIds: epsodeid,
        includeEpisode:true
      }
    }) 
const queueId =[];
    for (const value of responce.data){
        if(value.trackedDownloadState=='importBlocked'){

const titleName = value.title.toLowerCase();

if (/\bmalayalam\b/.test(titleName) || /\bmal\b/.test(titleName)) {
  console.log(`🥵 please remove malayalam tvshows${titleName}  manually `)
  continue;
}
if (/\bhindi\b/.test(titleName) || /\bhin\b/.test(titleName)) {
 console.log( `🥵 please remove hindi tvshows ${titleName}  manually `)
  continue;
}
if (/\btamil\b/.test(titleName) || /\btam\b/.test(titleName)) {
  console.log( `🥵 please remove tamil tvshows ${titleName}  manually `)
  continue;
}


            console.log(value.title)
                    await publishMessage({
  message: value.title
});
            queueId.push(value.id);
        }
    }

    if(queueId.length){
        console.log('👍 No tvshows Episodes need to manually remove ')
                await publishMessage({
  message: '👍 No tvshows Episodes need to manually remove'
});
    }

await fileDelete(queueId);

}


 export async function deleteRemovedSeries (){
    console.log('🔍 started to removing the manually deleted Tv shows form sonarr ')
          await publishMessage({
  message: '🔍 started to removing the manually deleted Tv shows form sonarr '
});
 const responce =  await axios.get(`${config.ip}/api/v3/queue`,{
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


    const queueId=[]
    for (const value of responce.data.records){

     queueId.push(value.episodeId)
    }
   await delay(3000,true)

    await getepisodeDetails(queueId)
} 
