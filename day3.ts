import { generate } from "./llm.ts";

const SYSTEM = `You are a senior QA engineer. Write exactly 5 test cases for the feature
in the same style as this example:

TC-EX | Login with empty password | Enter valid email, leave password blank, click Login | Error "Password is required" shown; user stays on login page

Rules: include at least 2 negative cases. One line per test case, plain text only, no HTML, no intro text.`;

const { model, text } = await generate("Feature: login page", {
  temperature: 0,
  systemInstruction: SYSTEM,
});
console.log(`[${model}]\n${text}\n`);

// ---- Checks ----
const lines = text.split("\n").filter((l) => l.trim() !== "");
const NEGATIVE_WORDS = /invalid|lockout|incorrect|wrong|empty|blank|locked|unregistered|missing|expired/i;

const checks = [
  { name: "Exactly 5 test cases", pass: lines.length === 5 },
  { name: "Every line has 4 parts (ID | Title | Steps | Expected)",
    pass: lines.every((l) => l.split("|").length === 4) },
  { name: "No HTML tags", pass: !/<[^>]+>/.test(text) },
  { name: "No intro text (first line starts with an ID)", pass: /^TC/.test(lines[0] ?? "") },
  { name: "At least 2 negative cases",
    pass: lines.filter((l) => NEGATIVE_WORDS.test(l.split("|")[1] ?? "")).length >= 2 },
];

// ---- Report ----
for (const c of checks) console.log(`${c.pass ? "✅ YAYYY" : "❌ FAIL"}  ${c.name}`);
const passed = checks.filter((c) => c.pass).length;
console.log(`\n${passed}/${checks.length} checks passed`);

