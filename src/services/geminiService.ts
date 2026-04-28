import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey });

export interface ParsedTransaction {
  amount: number;
  type: "income" | "expense";
  description: string;
  category?: string;
}

export async function parseTransaction(input: string): Promise<ParsedTransaction> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Parse the following financial transaction input and return a structured JSON object: "${input}"`,
      config: {
        systemInstruction: `You are a financial assistant. Extract the amount, type (income or expense), description, and category from the user's input. 
        - Amount should be a positive number.
        - Type must be either "income" or "expense".
        - Description should be a short, clear summary.
        - Category should be a single word (e.g., Food, Salary, Transport, Health, Entertainment).
        If the input is ambiguous, make your best guess.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "The transaction amount." },
            type: { type: Type.STRING, enum: ["income", "expense"], description: "The direction of the money flow." },
            description: { type: Type.STRING, description: "A brief description of the transaction." },
            category: { type: Type.STRING, description: "The category of the transaction." },
          },
          required: ["amount", "type", "description"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to parse transaction: No response from AI.");
    }

    return JSON.parse(text) as ParsedTransaction;
  } catch (error: any) {
    if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('high demand')) {
      throw new Error("The AI service is currently busy due to high demand. Please wait a moment and try again.");
    }
    console.error("Error in parseTransaction:", error);
    throw new Error(error.message || "Failed to process transaction.");
  }
}

export async function askAssistant(query: string, context?: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `User query: "${query}"\n\nContext (User's recent transactions or app state): ${context || "No context provided."}`,
      config: {
        systemInstruction: `You are Locobook AI, a helpful financial assistant. 
        - Answer questions about the user's finances if context is provided.
        - Provide general financial advice or help with using the app.
        - Keep responses concise and friendly.
        - If the user asks to perform an action (like adding a transaction), explain that they can use the "Quick Add" feature or voice input.`,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error: any) {
    if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('high demand')) {
      return "The AI assistant is currently experiencing high demand. Please try again in a few seconds.";
    }
    console.error("Error in askAssistant:", error);
    return "I encountered an error while processing your request. Please try again.";
  }
}

