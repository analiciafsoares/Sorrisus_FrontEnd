import test from "node:test";
import assert from "node:assert/strict";

import { normalizarCpf, validarCpf } from "./cpf.js";

test("normaliza CPF formatado para somente dígitos", () => {
  assert.equal(normalizarCpf("529.982.247-25"), "52998224725");
});

test("aceita CPF válido com ou sem formatação", () => {
  assert.equal(validarCpf("52998224725"), true);
  assert.equal(validarCpf("529.982.247-25"), true);
});

test("rejeita CPF com dígitos verificadores inválidos", () => {
  assert.equal(validarCpf("12345678900"), false);
});

test("rejeita sequência repetida e quantidade incorreta de dígitos", () => {
  assert.equal(validarCpf("00000000000"), false);
  assert.equal(validarCpf("5299822472"), false);
});

test("rejeita valor ausente", () => {
  assert.equal(validarCpf(null), false);
  assert.equal(validarCpf(""), false);
});
