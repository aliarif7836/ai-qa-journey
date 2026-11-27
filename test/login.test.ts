import { describe, test, expect, beforeAll } from "vitest";
import { generate } from "../llm.ts";

const SYSTEM = `You are a senior QA engineer. Write exactly 5 test cases for the feature
in the same style as this example:

TC-EX | Login with empty password | Enter valid email, leave password blank, click Login | Error "Password is required" shown; user stays on login page

Rules: include at least 2 negative cases. One line per test case, plain text only, no HTML, no intro text.`;

const NEGATIVE_WORDS = /invalid|incorrect|wrong|empty|blank|lock|unregistered|missing|expired/i;

let text = "";
let lines: string[] = [];

describe("Login test-case generator", () => {
  beforeAll(async () => {
    const res = await generate("Feature: login page", {
      temperature: 0,
      systemInstruction: SYSTEM,
    });
    text = res.text;
    lines = text.split("\n").filter((l) => l.trim() !== "");
    console.log(`[${res.model}]\n${text}`);
  }, 120_000);

  test("returns exactly 5 test cases", () => {
    expect(lines).toHaveLength(5);
  });

  test("every line has 4 parts (ID | Title | Steps | Expected)", () => {
    for (const l of lines) {
      expect(l.split("|")).toHaveLength(4);
    }
  });

  test("contains no HTML tags", () => {
    expect(text).not.toMatch(/<[^>]+>/);
  });

  test("has no intro text", () => {
    expect(lines[0]).toMatch(/^TC/);
  });

  test("has at least 2 negative cases", () => {
    const negatives = lines.filter((l) => NEGATIVE_WORDS.test(l.split("|")[1] ?? ""));
    expect(negatives.length).toBeGreaterThanOrEqual(2);
  });
});