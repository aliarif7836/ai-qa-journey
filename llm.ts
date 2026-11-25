import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function withTimeout<T>(p: Promise<T>, ms = 30000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject({ status: "TIMEOUT" }), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

export async function generate(
  contents: string,
  config: { temperature?: number; systemInstruction?: string } = {}
) {
  for (const model of MODELS) {
    for (let i = 1; i <= 2; i++) {
      try {
        const res = await withTimeout(ai.models.generateContent({ model, contents, config }));
        return { model, text: res.text?.trim() ?? "" };
      } catch (err: any) {
        if (![503, 429, 404, "TIMEOUT"].includes(err?.status)) throw err;
        console.log(`  ${model}: ${err.status}, ${i < 2 ? "retrying" : "next model"}...`);
        await sleep(3000);
      }
    }
  }
  throw new Error("All models unavailable – try again later");
}