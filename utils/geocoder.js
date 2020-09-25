const NodeGeocoder = require("node-geocoder");
const dotenv = require("dotenv");
const path = require("path");
//load the env vars
dotenv.config({ path: path.resolve(__dirname, "../config/config.env") });

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

console.log("process", process.env.GEOCODER_API_KEY);

const geocoder = NodeGeocoder(options);
module.exports = geocoder;
