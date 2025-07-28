import {
  maxLength,
  minLength,
  pipe,
  regex,
  safeParse,
  string,
} from "@valibot/valibot";

const gameParamSchema = pipe(
  string(),
  minLength(6, "Too short"),
  maxLength(50, "Too long"),
  regex(/^[a-zA-Z0-9_-]+$/, "Invalid characters"),
);

export function validateGameParam(value: unknown): string | null {
  const result = safeParse(gameParamSchema, value);
  return result.success ? result.output : null;
}
