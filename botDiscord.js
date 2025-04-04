import fetch from "node-fetch";
import dotenv from "dotenv";
import readline from "readline";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

// IA responde
async function askGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

// Enviar a Discord
const sendToDiscord = async (content) => {
    const MAX_LENGTH = 2000;
  
    if (content.length <= MAX_LENGTH) {
      await postToWebhook(content);
      return;
    }
  
    const parts = [];
    for (let i = 0; i < content.length; i += MAX_LENGTH) {
      parts.push(content.slice(i, i + MAX_LENGTH));
    }
  
    for (const part of parts) {
      await postToWebhook(part);
    }
  };
  
  const postToWebhook = async (text) => {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! ${response.status} - ${errorText}`);
    }
  };
  

// Leer desde consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("💬 ¿Qué quieres preguntarle a la IA?\n> ", async (input) => {
  const aiResponse = await askGemini(input);
  console.log("📌 Respuesta de la IA:\n", aiResponse);
  await sendToDiscord(aiResponse);
  rl.close();
});

