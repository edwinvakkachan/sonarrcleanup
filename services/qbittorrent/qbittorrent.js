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
