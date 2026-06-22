// gemini.js
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

console.log(process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

module.exports = ai;