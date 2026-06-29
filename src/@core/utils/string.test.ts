import { describe, it, expect } from "vitest";
import { truncate, slugify, maskCpf, maskCnpj } from "./string";

describe("truncate", () => {
  it("returns string unchanged when shorter than limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and adds ellipsis", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });
});

describe("slugify", () => {
  it("converts text to slug", () => {
    expect(slugify("Minha Empresa Ltda")).toBe("minha-empresa-ltda");
  });

  it("removes special characters", () => {
    expect(slugify("Olá Mundo!")).toBe("ola-mundo");
  });
});

describe("maskCpf", () => {
  it("masks CPF", () => {
    expect(maskCpf("12345678901")).toBe("123.456.789-01");
  });
});

describe("maskCnpj", () => {
  it("masks CNPJ", () => {
    expect(maskCnpj("12345678000199")).toBe("12.345.678/0001-99");
  });
});
