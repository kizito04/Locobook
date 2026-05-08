/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY is not defined. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey });

// Helper to list available models (check your browser console)
export async function listAvailableModels() {
  try {
    const models = await ai.models.list();
    console.log("Available Gemini Models:", models);
    return models;
  } catch (error) {
    console.error("Error listing models:", error);
    return [];
  }
}

export interface ParsedTransaction {
  amount: number;
  type: "income" | "expense";
  description: string;
  category?: string;
}

export const TRANSACTION_CATEGORIES = [
  'Salary',
  'Wages',
  'Bonus',
  'Commission',
  'Business Income',
  'Sales Revenue',
  'Client Payment',
  'Freelance Income',
  'Investment Income',
  'Interest Income',
  'Rental Income',
  'Refund',
  'Reimbursement',
  'Gift Income',
  'Loan Received',
  'Savings Withdrawal',
  'Food',
  'Groceries',
  'Restaurant',
  'Cafe',
  'Snacks',
  'Transport',
  'Fuel',
  'Boda',
  'Taxi',
  'Bus',
  'Ride Hailing',
  'Parking',
  'Vehicle Maintenance',
  'Rent',
  'Mortgage',
  'Utilities',
  'Electricity',
  'Water',
  'Gas',
  'Internet',
  'Mobile Data',
  'TV Subscription',
  'Phone Bill',
  'Home Maintenance',
  'Household Supplies',
  'Health',
  'Clinic',
  'Hospital',
  'Pharmacy',
  'Insurance',
  'Fitness',
  'Education',
  'School Fees',
  'Tuition',
  'Books',
  'Training',
  'Shopping',
  'Clothing',
  'Electronics',
  'Personal Care',
  'Beauty',
  'Entertainment',
  'Travel',
  'Accommodation',
  'Family Support',
  'Childcare',
  'Donations',
  'Gifts',
  'Loan Payment',
  'Debt Payment',
  'Savings',
  'Investment',
  'Bank Fees',
  'Mobile Money Fees',
  'Taxes',
  'Business Expense',
  'Office Supplies',
  'Inventory',
  'Repairs',
  'Security',
  'Legal',
  'Professional Services',
  'Uncategorized'
].sort((a, b) => a.localeCompare(b));

export async function parseTransaction(input: string): Promise<ParsedTransaction> {
  try {
    const categoryGuidance = `Available transaction categories:\n${TRANSACTION_CATEGORIES.map((category) => `- ${category}`).join('\n')}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Parse the following financial transaction input and return a structured JSON object: "${input}"\n\n${categoryGuidance}`,
      config: {
        systemInstruction: `You are a financial assistant. Extract the amount, type (income or expense), description, and category from the user's input.
        - Amount should be a positive number.
        - Type must be either "income" or "expense".
        - Description should be a short, clear summary.
        - Category must be the single best category from the provided category list.
        - Prefer the most specific fitting category over a broad one, for example Groceries instead of Food, or Clinic instead of Health.
        - Consider merchant names, local wording, synonyms, mobile money language, and transaction intent when matching a category.
        - Use Uncategorized only when no listed category reasonably fits.
        If the input is ambiguous, make your best guess.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "The transaction amount." },
            type: { type: Type.STRING, enum: ["income", "expense"], description: "The direction of the money flow." },
            description: { type: Type.STRING, description: "A brief description of the transaction." },
            category: { type: Type.STRING, enum: TRANSACTION_CATEGORIES, description: "The category of the transaction." },
          },
          required: ["amount", "type", "description", "category"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to parse transaction: No response.");
    }

    return JSON.parse(text) as ParsedTransaction;
  } catch (error: any) {
    if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('high demand')) {
      throw new Error("The service is currently busy due to high demand. Please wait a moment and try again.");
    }
    console.error("Error in parseTransaction:", error);
    throw new Error(error.message || "Failed to process transaction.");
  }
}

export interface SearchFilters {
  category?: string;
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  query?: string;
}

export async function askAssistant(
  query: string,
  context: string,
  onChunk?: (text: string) => void,
  tools?: { searchTransactions: (filters: SearchFilters) => Promise<any[]> }
): Promise<string> {
  try {
    const systemInstruction = `You are Locobook AI, a personalized financial coach. 
      
      KNOWLEDGE:
      - Locobook tracks income/expenses.
      - Features: Dashboard (Summary), History (List/Search), Analytics (Charts).
      
      PRECISION TOOLS:
      - You have a 'searchTransactions' tool. ALWAYS use it when the user asks for specific totals, lists, or comparisons (e.g., "How much did I spend on rent?").
      - Don't rely on the 'Recent Transactions' context for totals; use the tool for accuracy.
      
      STYLE:
      - Be concise and professional. Use Uganda-specific context (Boda, Mobile Money).
      - Avoid markdown symbols like ** or *. Use clean plain text structure.`;

    const toolDefinition = {
      functionDeclarations: [
        {
          name: "searchTransactions",
          description: "Search the user's transaction history with filters like category, type, and date range.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "Filter by category (e.g., Food, Rent)." },
              type: { type: Type.STRING, enum: ["income", "expense"], description: "Filter by income or expense." },
              startDate: { type: Type.STRING, description: "Start date (YYYY-MM-DD)." },
              endDate: { type: Type.STRING, description: "End date (YYYY-MM-DD)." },
              query: { type: Type.STRING, description: "Search term for description." },
            },
          },
        },
      ],
    };

    let response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `User query: "${query}"\n\nRecent Context: ${context}`,
      config: {
        systemInstruction,
        tools: [toolDefinition],
      },
    });

    // Handle function calls
    const call = response.functionCalls?.[0];
    if (call && tools && call.name === "searchTransactions") {
      const toolResults = await tools.searchTransactions(call.args as SearchFilters);
      
      // Send the tool results back to get the final answer
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: [
          { role: 'user', parts: [{ text: `User query: "${query}"\n\nRecent Context: ${context}` }] },
          { role: 'model', parts: [{ functionCall: call }] },
          { role: 'user', parts: [{ functionResponse: { name: "searchTransactions", response: { content: toolResults } } }] }
        ],
        config: { systemInstruction }
      });
    }

    const fullText = response.text || "";

    // Simulating streaming for the UI
    if (onChunk) {
      const words = fullText.split(' ');
      let currentText = "";
      for (const word of words) {
        currentText += word + " ";
        onChunk(currentText);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }

    return fullText;
  } catch (error: any) {
    console.error("Error in askAssistant:", error);
    return "I encountered an error while processing your request. Please try again.";
  }
}
