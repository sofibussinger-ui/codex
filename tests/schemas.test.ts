import { describe, it, expect } from "vitest";
import { companySchema, callSchema } from "../src/modules/crm/schemas";
describe("validación comercial", () => {
  it("rechaza empresas vacías y normaliza espacios", () => {
    expect(companySchema.safeParse({ name: "   ", source: "" }).success).toBe(
      false,
    );
    expect(
      companySchema.parse({ name: " Inmobiliaria ficticia ", source: "" }).name,
    ).toBe("Inmobiliaria ficticia");
  });
  it("exige seguimiento con instante inequívoco y solicitud identificable", () => {
    const data = {
      opportunity: "10000000-0000-4000-8000-000000000001",
      note: "Llamada de prueba",
      followup_title: "Volver a llamar",
      followup_at: "2026-11-15T09:00:00-03:00",
      request: "10000000-0000-4000-8000-000000000002",
    };
    expect(callSchema.safeParse(data).success).toBe(true);
    expect(
      callSchema.safeParse({ ...data, followup_at: "2026-11-15T09:00" })
        .success,
    ).toBe(false);
    expect(callSchema.safeParse({ ...data, followup_title: "" }).success).toBe(
      false,
    );
  });
});
