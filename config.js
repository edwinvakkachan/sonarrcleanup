import dotenv from 'dotenv';
dotenv.config();

const config ={
     api : process.env.API,
 ip : process.env.IP,
 qbitTime : process.env.QBIT_TIME,
 qbitIp : process.env.QBITIP,
 qbitUserName: process.env.QBITUSER,
 qbitPassword : process.env.QBITPASS,
 HOMEASSISTANTWEBHOOK:process.env.HOMEASSISTANTWEBHOOK,
 DATABASE_URL:process.env.DATABASE_URL
}

export default config;