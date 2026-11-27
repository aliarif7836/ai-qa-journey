import { describe, test, expect } from "vitest";

// ---- Code under test (normally this would be in another file) ----
const add = (a: number, b: number) => a + b;
const getId = (line: string) => line.split("|")[0].trim();


describe("sum of two number ", () => {

    test("add(2, 3) should return 5", () => {
        expect(add(2, 3)).toBe(5);

    });
     });


describe("Strings", () => {
  const line = "TC1 | Valid login | Enter data | Dashboard";

  test("getId returns the ID", () => {
    expect(getId(line)).toBe("TC1");
  });

  test("line contains 'login'", () => {
    expect(line).toContain("login");
  });

  test("line matches a pattern", () => {
    expect(line).toMatch(/^TC\d/);
  });
});

describe("Arrays", () => {
  const ids = ["TC1", "TC2", "TC3"];

  test("has 3 items", () => {
    expect(ids).toHaveLength(3);
  });

  test("contains TC2", () => {
    expect(ids).toContain("TC2");
  });

  test("matches exactly", () => {
    expect(ids).toEqual(["TC1", "TC2", "TC3"]);
  });
});