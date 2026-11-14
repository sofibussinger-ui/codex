import { test, expect } from "@playwright/test";
test("Manuel registra inmobiliaria, oportunidad, llamada y seguimiento persistente", async ({
  page,
}, testInfo) => {
  const suffix = Date.now();
  const company = `Inmobiliaria FICTICIA ${suffix}`;
  const opportunity = `Sitio web FICTICIO ${suffix}`;
  const follow = `Llamar FICTICIO ${suffix}`;
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("manuel@kul.example");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Local-Ficticio-2026!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(
    page.getByRole("heading", { name: "Mi día", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Registrar empresa", exact: true })
    .click();
  await page.getByLabel("Nombre de la empresa", { exact: true }).fill(company);
  await page.getByLabel("Origen del prospecto").fill("Prueba automatizada");
  await page
    .getByRole("button", { name: "Guardar empresa y crear oportunidad" })
    .click();
  await page.getByLabel("Nombre de la oportunidad").fill(opportunity);
  await page
    .getByRole("button", { name: "Crear oportunidad", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: opportunity, exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Resultado de la llamada")
    .fill("Conversación ficticia de prueba");
  await page.getByLabel("Próximo seguimiento", { exact: true }).fill(follow);
  const next = new Date(Date.now() + 3600000);
  const local = new Date(next.getTime() - 3 * 3600000)
    .toISOString()
    .slice(0, 16);
  await page.getByLabel("Fecha y hora").fill(local);
  await page
    .getByRole("button", { name: "Guardar llamada y seguimiento" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Llamada y seguimiento guardados",
  );
  await page.getByRole("link", { name: "Mi día", exact: true }).click();
  let card = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: follow, exact: true }) });
  await expect(card).toBeVisible();
  await page.reload();
  await expect(card).toBeVisible();
  await page.screenshot({
    path: `test-results/mi-dia-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await card.getByText("Editar o reprogramar", { exact: true }).click();
  await card
    .getByLabel("Seguimiento", { exact: true })
    .fill(`${follow} actualizado`);
  await card.getByRole("button", { name: "Guardar cambios" }).click();
  card = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: `${follow} actualizado`,
      exact: true,
    }),
  });
  await expect(card).toBeVisible();
  await page.getByRole("button", { name: "Salir", exact: true }).click();
  await page.getByLabel("Email", { exact: true }).fill("manuel@kul.example");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Local-Ficticio-2026!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Completar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: `${follow} actualizado`, exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: `${follow} actualizado`, exact: true }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Oportunidades", exact: true }).click();
  await page.getByRole("link", { name: opportunity, exact: true }).click();
  await expect(
    page.getByText("Conversación ficticia de prueba", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: `${follow} actualizado`, exact: true }),
  ).toBeVisible();
});
test("acceso sin sesión vuelve al login", async ({ page }) => {
  await page.goto("/mi-dia");
  await expect(page).toHaveURL(/\/login/);
});
