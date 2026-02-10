import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";




const api = process.env.API;
const ip = process.env.IP;
const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;
const qbitTime = process.env.QBIT_TIME;
const qbitIp = process.env.QBITIP;
const qbitUserName= process.env.QBITUSER;
const qbitPassword = process.env.QBITPASS;

const blockedRegex = /\.(exe|rar|iso|zip|bat)(\s|$)/i;



//qbit login
const jar = new CookieJar();
const qb = wrapper(axios.create({
  baseURL: qbitIp, // qBittorrent Web UI
  jar,
  withCredentials: true
}));

if (!api || !ip) {
  console.error("❌ Missing API or IP environment variables");
  process.exit(1);
}
//telgram bot message
async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHAT_ID,
    text: text
  });
}

//delay function 

async function delay(ms,noLog) {
  if(noLog){
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  else{
console.log(`Waiting...${ms} sec`);
  return new Promise(resolve => setTimeout(resolve, ms));
  }
   
}
// function to delete files
async function fileDelete(queueId){
   await axios.delete(`${ip}/api/v3/queue/bulk`,{
    headers: {
        "X-Api-Key": api
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
console.log(`✅ Removed ${queueId.length} movies`);
await sendTelegramMessage(`✅ Removed ${queueId.length} movies`)
}



//---------------------------------------------------

//removing stopped movies
async function removingStoppedMOvies(){
  console.log('🔍started to removing the stopped movies')
  await sendTelegramMessage('🔍started to removing the stopped movies')
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
      if(value.status == 'paused'){
        queueId.push(value.id)
        console.log(value.title);
      }
    }

 if(!queueId.length){
console.log('✅ no movies are paused to remove')
await sendTelegramMessage('✅ no movies are paused to remove')
return;
 }

 await delay(1000,true)
 await fileDelete(queueId);    
}

//removing the stalled movies ....................

async function login() {
  const res = await qb.post(
    "/api/v2/auth/login",
    new URLSearchParams({
      username: qbitUserName,
      password: qbitPassword
    })
  );

  if (res.data !== "Ok.") {
    throw new Error("Login failed");
  }

  console.log("✅ Logged into qBittorrent");
}

async function qbitorrentStalledFileInfo(downloadId){
  const {data} = await qb.get('/api/v2/torrents/info',{
    params: { hashes: downloadId.toLowerCase() }
  });
 
     for (const value of data){
        if(value.time_active>=qbitTime){
        console.log(`✅ YES stalled Movie time: ${Math.round(value.time_active/3600)}hrs` )
        return true
      }
      else if(value.downloaded==0 && value.has_metadata==false && value.time_active >= 1200 && value.availability==0){
 console.log(`✅ YES failed metadata movie ` )
        return true
      }
      else {
        return false
      } 
     }
}


async function removingStalledMoviesFailedMetadataDownload(){
   console.log('🔍started to removing Stalled and FailedMetadata Download movies')
   await sendTelegramMessage('🔍started to removing Stalled and FailedMetadata Download movies')
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
    console.log('Download id doesnot exsist')
    continue;
  }
  if(await qbitorrentStalledFileInfo(value.downloadId)){
    console.log('found: ',value.title)
    queueId.push(value.id)

  }
}

if(!queueId.length){
  console.log('No stalled and failed metadata movies')
  await sendTelegramMessage('No stalled and failed metadata movies')
  return
}

await fileDelete(queueId)

}

async function removeExeRarfiles(){
   console.log("🔍 Removing movies that has exe,rar or iso files");
   await sendTelegramMessage("🔍 Removing movies that has exe,rar or iso files")

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

if (blockedRegex.test(value.title)) {
  console.log('❌ Blocked file detected:', value.title);
  queueId.push(value.id)
}
}
await delay(300,true)
if(!queueId.length){
  console.log('no files contian exe rar..etc files')
  await sendTelegramMessage('no files contian exe rar..etc files')
  return;
}
await fileDelete(queueId);

}

async function main() {
  try {
    console.log("🚀 sonarr cleanup started");
    await sendTelegramMessage("🚀 sonarr cleanup started")

    await login();
    await delay(5000)
   await removeExeRarfiles();
    await delay(10000)
    await removingStoppedMOvies();
    await delay(10000)
    await removingStalledMoviesFailedMetadataDownload()

    console.log("🏁 Cleanup completed successfully");
   await sendTelegramMessage("🏁 Cleanup completed successfully")
    process.exit(0); // ✅ clean exit
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
   await sendTelegramMessage("❌ Cleanup failed:", err.message)
    process.exit(1); // ❌ failure exit
  }
}

main();

