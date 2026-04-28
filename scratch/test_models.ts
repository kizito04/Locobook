import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function list() {
  try {
    // The @google/genai library might have a different way to list models
    // Let's try a simple generation to see if it works with another model name
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: "test",
    });
    console.log("Success with gemini-1.5-flash-latest:", response.text);
  } catch (error: any) {
    console.error("Error with gemini-1.5-flash-latest:", error.message);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: "test",
      });
      console.log("Success with gemini-1.5-pro:", response.text);
    } catch (error2: any) {
      console.error("Error with gemini-1.5-pro:", error2.message);
    }
  }
}

list();
