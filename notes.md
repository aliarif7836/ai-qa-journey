 # Day 1 – LLM non-determinism

We did a basic code run to get the output form a LLM (Gemini) where model 3.6 gave the output everytime all other models returned 500 or 429.

also the code is retrying for each model if any fails whatever we are giving as a model.

Thing I learned is that, all the results were straight as we asked for single line senctence so it didn't cover any edge case or invalid password case it gave results for positive case only vith valid id and valid password and user is on dashboard.
 
## What I did
Sent the same prompt ("one login test case in one sentence") to Gemini
5 times at temperature 0 and 5 times at temperature 1.
## Results (all from gemini-3.6-flash)

### Temperature 0
1. Verify that a user is successfully logged in and redirected to their account dashboard upon entering a valid username and password and clicking the "Log In" button.
2. Verify that a user is successfully logged in and redirected to the dashboard after entering a valid username and password and clicking the "Login" button.
3. Verify that a user is successfully logged in and redirected to the dashboard upon entering a valid username and password and clicking the login button.
4. Verify that a user is successfully logged in and redirected to the dashboard upon entering a valid username and password.
5. Verify that a user is successfully redirected to their dashboard after entering a valid username and password and clicking the "Login" button.

### Temperature 1
1. Verify that a user is successfully logged in and redirected to the dashboard after entering a valid username and password.
2. Verify that a user can successfully log in and access their account dashboard after entering a valid username and password.
3. Verify that a user is successfully authenticated and redirected to the dashboard after entering a valid username and password and clicking the login button.
4. Verify that a user is successfully redirected to the dashboard after entering a valid username and password and clicking the login button.
5. Verify that a user is successfully redirected to the dashboard after entering a valid username and password and clicking the login button.

## What I learned
- Same prompt, different wording every time, even at temperature 0.
  The meaning stayed the same (valid login → dashboard).
- Exact-match assertions won't work for LLM output; I need to check
  meaning, not text.
- Temperature 1 wasn't much more varied – for a narrow prompt it matters less.
- The model followed "one sentence" 10/10 times.
- It only gave the positive (happy-path) case – no invalid password,
  locked account, etc. LLMs default to the most common answer.

## Infra lessons
- 503 = server overloaded, 429 = rate limited, plus timeouts.
- Added retry + model fallback; only gemini-3.6-flash answered.
- Always log which model produced each result.

## Questions for later
- How do I test "meaning" automatically?


---------------------------------------------------------------------------------------

# Day 2 – System prompts and few-shot

Same request each time: "Write test cases for a login page." (temperature 0)

| Run | Setup | Model | Result |
|---|---|---|---|
| A | No system prompt | gemini-3.5-flash-lite | 24 cases in 6 groups, intro + assumptions, own format |
| B | System prompt: role + rules | gemini-3.5-flash-lite | Followed all rules, but added `<br>` tags in steps |
| C | Few-shot: one example + rules | gemini-3.6-flash | 3 cases, copied the example's style exactly, plain text |

## What I learned
- A system prompt sets the role and rules; it controlled count, format and coverage.
- Without rules the output was thorough but unpredictable, so it can't be checked automatically.
- Rules can be followed and still cause side effects (`<br>`) that would break a parser.
- Showing one example (few-shot) worked better than describing the format.
- B and C ran on different models, so the comparison isn't fully fair.

## Code lessons
- Moved retry, timeout and fallback into `llm.ts` → import `generate()` (DRY).
- TS: optional params (`?`), async/await, destructuring, template literals, `?.`, `??`.
- One function with an optional parameter, not overloading.
- `config` = optional settings; include only what you need.

## Next
Day 3: code that checks these rules automatically.

------------------------------------------------------------------------------------------

# Day 3 – Automated LLM checks + TS array methods

## What I built
`day3.ts`: the AI writes 5 test cases for a login page, then code checks the
output against 5 rules and prints PASS/FAIL with a score.

| Check | How |
|---|---|
| Exactly 5 test cases | `lines.length === 5` |
| 4 parts per line | `every` line splits into 4 on `\|` |
| No HTML | regex `/<[^>]+>/` must NOT match |
| No intro | first line matches `/^TC/` |
| 2+ negative cases | `filter` titles with words like invalid/empty, count >= 2 |

## Results
- Run 1: `<br>` tags appeared (HTML check would fail).
- Run 2: no HTML, but "2+ negative cases" FAILED → 4/5 passed.

## AI QA lessons
- Output changes between runs → one run proves nothing; run evals multiple times.
- When a check fails, ask: is the MODEL wrong or the TEST wrong?
  A false failure is a bug in my test, not the model.
- Keyword checks are fast but rough (miss "lockout", "3-char password").
  → LLM-as-judge later.
- Keep checking (compute pass) separate from reporting (print it).

## TypeScript lessons
- Destructuring: `const { model, text } = obj` (names must match).
- Arrow function: `(l) => l.trim()` – one-expression body returns automatically.
- Array methods:
  - `map` → new array, same length (transform)
  - `filter` → shorter array (keep matches)
  - `some` → true if ANY pass
  - `every` → true if ALL pass
  - `find` → first match
- `map` = shortcut for `for...of` + `push`.
- Chaining: `l.split("|")[0].trim()`.
- Regex `.test(text)` → true/false. `^` = starts with, `|` = OR, `i` = ignore case.
- `"text".includes("x")` (string) vs `arr.includes(item)` (array).
- Ternary: `cond ? A : B` picks a value; works inside `${ }`.
- `??` = fallback if null/undefined.
- Type inference: `const x = undefined` can't be called later → red lines.
  `any` silences it (temporary only).

## To do
- Practice exercises 5–8.
- Check the failed run: model bug or checker bug?
- Next: move checks into Vitest.