import { expect, test } from "@playwright/test";

const ONE_PIXEL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+lmOsAAAAASUVORK5CYII=";

test("full OCR invoice flow: upload and confirm", async ({ page }) => {
  test.setTimeout(120_000);

  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent-status", "accepted");
    localStorage.setItem("preferredLanguage", "en-US");
  });

  await page.route("**/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: 1,
          documento: "1234567890",
          nombres: "Test",
          apellidos: "User",
          correo: "test@example.com",
          foto: null,
          monedaBase: "COP",
        },
      }),
    });
  });

  await page.route("**/facturas/ocr", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        rawText: "mock raw text",
        usedFallbackParser: false,
        parsed: {
          empresa: {
            nombre: "Store XYZ",
            nit: "900000111",
          },
          fecha: "2026-02-18",
          monedaDetectada: "USD",
          tasaCambio: 4500,
          source: "ai",
          productos: [
            {
              nombreDetected: "Milk",
              cantidad: 2,
              unidad: "u",
              precioUnitario: 4500,
              precioTotal: 9000,
            },
            {
              nombreDetected: "Bread",
              cantidad: 1,
              unidad: "u",
              precioUnitario: 3500,
              precioTotal: 3500,
            },
          ],
        },
      }),
    });
  });

  await page.route(
    "https://api.exchangerate-api.com/v4/latest/COP",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          rates: {
            USD: 0.00025,
            COP: 1,
          },
        }),
      });
    },
  );

  await page.route("**/facturas/ocr/create", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          status: 201,
          message: "Factura registrada exitosamente",
          factura: { id: 123 },
        }),
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/facturas?period=*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        facturas: [],
        stats: {
          totalInvoices: 0,
          totalSpending: 0,
          currentPeriodInvoices: 0,
          spendingTrend: 0,
        },
      }),
    });
  });

  await page.route("**/productos", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ productos: [] }),
    });
  });

  await page.goto("/invoices", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: /New Invoice|Nueva Factura/i }),
  ).toBeVisible({ timeout: 30_000 });

  await page.locator("#invoice-upload").setInputFiles({
    name: "invoice.png",
    mimeType: "image/png",
    buffer: Buffer.from(ONE_PIXEL_PNG_BASE64, "base64"),
  });

  await expect(
    page.getByRole("heading", {
      name: /Invoice Review|Revision de Factura|Revision|Revision/i,
    }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: /Save Invoice|Guardar Factura/i })
    .click();
  await expect(
    page.getByRole("button", { name: /Confirm and Save|Confirmar y Guardar/i }),
  ).toBeVisible();

  await Promise.all([
    page.waitForRequest("**/facturas/ocr/create"),
    page
      .getByRole("button", { name: /Confirm and Save|Confirmar y Guardar/i })
      .click(),
  ]);

  await expect(
    page.getByText(/^(Invoice Saved|Factura Guardada)$/),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/\/dashboard$/);
});
