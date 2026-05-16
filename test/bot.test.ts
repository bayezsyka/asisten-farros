import { describe, it, expect } from "vitest";
import { normalizePhone, extractPhoneFromJid } from "../src/config/identity.js";
import { parseExpense } from "../src/modules/finance/expenseParser.js";
import { classifyExpense } from "../src/modules/finance/expenseClassifier.js";
import { getRoutes } from "../src/modules/whatsapp/routeRegistry.js";
import { registerRoute } from "../src/modules/whatsapp/routeRegistry.js";
import { MessageContext } from "../src/infra/whatsapp/whatsappTypes.js";

describe("Asisten Farros Tests", () => {
  describe("Identity Utils", () => {
    it("should normalize phone numbers correctly", () => {
      expect(normalizePhone("085161603362")).toBe("6285161603362");
      expect(normalizePhone("087721031021")).toBe("6287721031021");
      expect(normalizePhone("6287721031021")).toBe("6287721031021");
    });

    it("should extract phone from JID correctly", () => {
      expect(extractPhoneFromJid("6287721031021@s.whatsapp.net")).toBe("6287721031021");
      expect(extractPhoneFromJid("84306181542117@lid")).toBe("84306181542117");
    });
  });

  describe("Finance Expense Parser", () => {
    it("should parse expense amount and description", () => {
      expect(parseExpense("beli kopi 15k")).toMatchObject({ description: "beli kopi", amount: 15000 });
      expect(parseExpense("isi bensin 50rb")).toMatchObject({ amount: 50000 });
      expect(parseExpense("Rp20.000 beli galon")).toMatchObject({ amount: 20000, description: "beli galon" });
    });

    it("should ignore commands", () => {
      expect(parseExpense("tugas classroom")).toBeNull();
      expect(parseExpense("ping")).toBeNull();
      expect(parseExpense("/beli kopi 15k")).toBeNull(); // starts with slash
    });
  });

  describe("Finance Classifier", () => {
    it("should classify expenses correctly", () => {
      expect(classifyExpense({ description: "beli kopi", amount: 15000, rawText: "" }).category).toBe("jajan");
      expect(classifyExpense({ description: "makan penyetan", amount: 20000, rawText: "" }).category).toBe("makan");
      expect(classifyExpense({ description: "isi bensin", amount: 50000, rawText: "" }).category).toBe("transportasi");
      expect(classifyExpense({ description: "penyerap lembap", amount: 15000, rawText: "" }).category).toBe("kebutuhan_kos");
      expect(classifyExpense({ description: "bayar listrik", amount: 50000, rawText: "" }).category).toBe("tagihan");
      expect(classifyExpense({ description: "laundry", amount: 25000, rawText: "" }).category).toBe("laundry");
      expect(classifyExpense({ description: "bayar dimas", amount: 25000, rawText: "" }).category).toBe("sosial");
    });
  });

  describe("Router Registry", () => {
    it("should register and sort routes by priority", () => {
      registerRoute({
        name: "test-low",
        priority: 100,
        canHandle: () => true,
        handle: async () => ({ handled: true })
      });
      registerRoute({
        name: "test-high",
        priority: 10,
        canHandle: () => true,
        handle: async () => ({ handled: true })
      });

      const routes = getRoutes();
      const highIndex = routes.findIndex(r => r.name === "test-high");
      const lowIndex = routes.findIndex(r => r.name === "test-low");

      expect(highIndex).toBeLessThan(lowIndex);
    });
  });
});
