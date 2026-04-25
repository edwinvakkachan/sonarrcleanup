import axios from "axios";
import config from "../config.js";
import { publishMessage } from "../services/publishMessage.js";


export async function fileDelete(queueId){
   await axios.delete(`${config.ip}/api/v3/queue/bulk`,{
    headers: {
        "X-Api-Key": config.api
      },
      params:{
        removeFromClient:true,
        blocklist:true,
        skipRedownload:false,
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