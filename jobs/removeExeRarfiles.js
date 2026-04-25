import axios from "axios";
import config from "../config.js";
import { publishMessage } from "../services/publishMessage.js";
import { delay } from "../utils/delay.js";

async function fileDelete(queueId){
   await axios.delete(`${config.ip}/api/v3/queue/bulk`,{
    headers: {
        "X-Api-Key": config.api
      },
      params:{
        removeFromClient:true,
        blocklist:true,
        skipRedownload:true,
        changeCategory:false
      },
      data:{
        ids:queueId,
      }
})
console.log(`✅ Removed ${queueId.length} Episodes`);
    await publishMessage({
  message: `✅ Removed ${queueId.length} Episodes`
});
}

export async function removeExeRarfiles(){

const blockedRegex = /\.(exe|rar|iso|zip|bat|scr)(\s|$)/i;

   console.log("🔍 Removing Episodes that has exe,rar or iso files");

       await publishMessage({
  message:"🔍 Removing Episodes that has exe,rar or iso files" 
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

if (blockedRegex.test(value.outputPath)) {
  console.log('❌ Blocked file detected:', value.title);
      await publishMessage({
  message: `❌ Blocked file detected:${value.title}`
});
  queueId.push(value.id)
}
}
await delay(300,true)
if(!queueId.length){
  console.log('👍 no files contian exe rar..etc files')
      await publishMessage({
  message: '👍 no files contian exe rar..etc files'
});
  return;
}
await fileDelete(queueId);

}