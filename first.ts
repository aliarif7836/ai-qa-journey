import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODELS = ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
const prompt = "Describe one test case for a login page in one sentence.";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function withTimeout<T>(p: Promise<T>, ms = 30000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject({ status: "TIMEOUT" }), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

async function callWithRetry(temperature: number) {
  for (const model of MODELS) {
    for (let i = 1; i <= 2; i++) {
      try {
        const res = await withTimeout(
          ai.models.generateContent({ model, contents: prompt, config: { temperature } })
        );
        return `[${model}] ${res.text?.trim()}`;
      } catch (err: any) {
        if (![503, 429, 404, "TIMEOUT"].includes(err?.status)) throw err;
        console.log(`  ${model}: ${err.status}, ${i < 2 ? "retrying" : "trying next model"}...`);
        await sleep(3000);
      }
    }
  }
  throw new Error("All models unavailable – try again later");
}

for (const temperature of [0, 1]) {
  console.log(`\n=== temperature ${temperature} ===`);
  for (let run = 1; run <= 5; run++) {
    console.log(`Run ${run}: ${await callWithRetry(temperature)}`);
    await sleep(4000);
  }
}