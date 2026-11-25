import { generate } from "./llm.ts";

const task = "Write test cases for a login page.";

async function ask(label: string, systemInstruction?: string) {
  const { model, text } = await generate(task, { temperature: 0, systemInstruction });
  console.log(`\n===== ${label} [${model}] =====\n${text}`);
}

// await ask("A: no system prompt");
// await ask(
//   "B: with system prompt",
//   `You are a senior QA engineer.
// Rules:
// - Write exactly 5 test cases.
// - Include at least 2 negative cases and 1 security case.
// - Format each as: ID | Title | Steps | Expected result
// - No introduction or summary text.`
// );
await ask(
  "C: few-shot example",
  `You are a senior QA engineer. Write exactly 3 test cases in the same style as this example:

TC-EX | Login with empty password | Enter valid email, leave password blank, click Login | Error "Password is required" shown; user stays on login page

Rules: one line per test case, plain text only, no HTML, no intro text.`
);

