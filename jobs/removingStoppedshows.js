import axios from "axios";
import config from "../config.js";
import { publishMessage } from "../services/publishMessage.js";
import { fileDelete } from "./fileDelete.js";


export async function removingStoppedshows(){
  console.log('🔍started to removing the stopped Episodes')

      await publishMessage({
  message: '🔍started to removing the stopped Episodes'
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
      if(value.status == 'paused'){
        queueId.push(value.id)
        console.log(value.title);
      }
    }

 if(!queueId.length){
console.log('👍 no Episodes are paused to remove')

    await publishMessage({
  message: '👍 no Episodes are paused to remove'
});
return;
 }

 await delay(1000,true)
 await fileDelete(queueId);    
}