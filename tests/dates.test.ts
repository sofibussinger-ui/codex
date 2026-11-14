import { it, expect } from "vitest";
import { localDay, formatDate } from "../src/modules/activities/dates";
it("agenda usa el día de Buenos Aires aunque UTC ya esté en el día siguiente", () => {
  expect(
    localDay(
      new Date("2026-11-15T00:42:00Z"),
      "America/Argentina/Buenos_Aires",
    ),
  ).toBe("2026-11-14");
});
it("la hora se muestra sin ambigüedad de mañana y tarde", () => {
  expect(
    formatDate("2026-11-15T00:42:00Z", "America/Argentina/Buenos_Aires"),
  ).toContain("21:42");
});
