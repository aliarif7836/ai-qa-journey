 # Day 1 – LLM non-determinism

We did a basic code run to get the output form a LLM (Gemini) where model 3.6 gave the output everytime all other models returned 500 or 429.

also the code is retrying for each model if any fails whatever we are giving as a model.

Thing I learned is that, all the results were straight as we asked for single line senctence so it didn't cover any edge case or invalid password case it gave results for positive case only vith valid id and valid password and user is on dashboard.
 
## What I did
Sent the same prompt ("one login test case in one sentence") to Gemini
5 times at temperature 0 and 5 times at temperature 1.

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
