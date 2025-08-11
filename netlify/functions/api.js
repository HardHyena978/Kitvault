// netlify/functions/api.js
const serverless = require("serverless-http");
// This now safely imports your app without starting the server
const app = require("../../backend/server");

module.exports.handler = serverless(app);
