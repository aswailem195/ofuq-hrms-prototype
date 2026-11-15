import type { Employee } from "./types";

// These are explicit identities in the fictional demo dataset, not inferred
// attributes of real people. Each portrait is reused consistently across views.
const femaleDemoIds = new Set(
  [
    1, 3, 5, 7, 9, 11, 13, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38,
    40, 42, 44, 46,
  ].map((index) => `EMP-${1001 + index}`),
);

export function employeePortrait(employee: Employee): string {
  const index = Number(employee.id.replace(/^EMP-/, "")) - 1001;
  const isDemoEmployee = Number.isInteger(index) && index >= 0 && index < 48;
  const slot = isDemoEmployee
    ? (Math.floor(index / 2) % 6) * 2 + (femaleDemoIds.has(employee.id) ? 2 : 1)
    : (((employee.avatar % 12) + 12) % 12) + 1;

  return `/assets/avatars/avatar-${slot}.webp`;
}
