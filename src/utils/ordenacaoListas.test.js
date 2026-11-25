import test from "node:test";
import assert from "node:assert/strict";

import {
  ordenarAgendamentos,
  ordenarConsultas,
  ordenarPacientes,
} from "./ordenacaoListas.js";

const AGORA = new Date("2026-11-11T12:00:00");
const ids = (lista) => lista.map((item) => item.id);
const nomes = (lista) => lista.map((item) => item.nome);

test("ordena pacientes alfabeticamente pelo nome", () => {
  const lista = [
    { id: 1, nome: "Carlos" },
    { id: 2, nome: "Ana" },
    { id: 3, nome: "Maria" },
    { id: 4, nome: "Beatriz" },
  ];

  assert.deepEqual(nomes(ordenarPacientes(lista)), ["Ana", "Beatriz", "Carlos", "Maria"]);
});

test("ordena pacientes ignorando diferenças entre maiúsculas e minúsculas", () => {
  const lista = [
    { id: 1, nome: "Carlos" },
    { id: 2, nome: "ana" },
    { id: 3, nome: "beatriz" },
  ];

  assert.deepEqual(nomes(ordenarPacientes(lista)), ["ana", "beatriz", "Carlos"]);
});

test("ordena nomes acentuados naturalmente em português", () => {
  const lista = [
    { id: 1, nome: "João" },
    { id: 2, nome: "Érica" },
    { id: 3, nome: "Ana" },
    { id: 4, nome: "Álvaro" },
  ];

  assert.deepEqual(nomes(ordenarPacientes(lista)), ["Álvaro", "Ana", "Érica", "João"]);
});

test("desempata pacientes com o mesmo nome pelo id e preserva o array original", () => {
  const lista = [
    { id: 3, nome: "Maria Silva" },
    { id: 1, nome: "Maria Silva" },
    { id: 2, nome: "Maria Silva" },
  ];
  const copiaOriginal = [...lista];

  assert.deepEqual(ids(ordenarPacientes(lista)), [1, 2, 3]);
  assert.deepEqual(lista, copiaOriginal);
});

test("mantém resultados filtrados em ordem alfabética", () => {
  const lista = [
    { id: 1, nome: "Maria José" },
    { id: 2, nome: "Carlos" },
    { id: 3, nome: "Maria Alves" },
    { id: 4, nome: "Maria Clara" },
  ];
  const filtrados = lista.filter((paciente) => paciente.nome.includes("Maria"));

  assert.deepEqual(
    nomes(ordenarPacientes(filtrados)),
    ["Maria Alves", "Maria Clara", "Maria José"]
  );
});

test("posiciona novo paciente conforme o nome, independentemente do id", () => {
  const lista = [
    { id: 1, nome: "Ana" },
    { id: 2, nome: "Carlos" },
    { id: 3, nome: "João" },
    { id: 4, nome: "Maria" },
    { id: 99, nome: "Beatriz" },
  ];

  assert.deepEqual(
    nomes(ordenarPacientes(lista)),
    ["Ana", "Beatriz", "Carlos", "João", "Maria"]
  );
});

test("prioriza agendamentos futuros por status e proximidade", () => {
  const lista = [
    { id: 1, status: "PENDENTE", dataHora: "2026-11-12T10:00:00" },
    { id: 2, status: "CONFIRMADO", dataHora: "2026-11-11T15:00:00" },
    { id: 3, status: "PENDENTE", dataHora: "2026-11-11T14:00:00" },
    { id: 4, status: "CONFIRMADO", dataHora: "2026-11-18T09:00:00" },
    { id: 5, status: "PENDENTE", dataHora: "2026-11-13T16:00:00" },
  ];

  assert.deepEqual(ids(ordenarAgendamentos(lista, AGORA)), [3, 1, 5, 2, 4]);
});

test("ordena agendamentos passados do mais recente para o mais antigo", () => {
  const lista = [
    { id: 1, status: "CONFIRMADO", dataHora: "2026-11-01T10:00:00" },
    { id: 2, status: "PENDENTE", dataHora: "2026-11-10T10:00:00" },
    { id: 3, status: "CONFIRMADO", dataHora: "2026-11-09T10:00:00" },
  ];

  assert.deepEqual(ids(ordenarAgendamentos(lista, AGORA)), [2, 3, 1]);
});

test("mantém cancelados depois de todos os agendamentos ativos", () => {
  const lista = [
    { id: 1, status: "CANCELADO", dataHora: "2026-12-01T10:00:00" },
    { id: 2, status: "PENDENTE", dataHora: "2026-11-12T10:00:00" },
    { id: 3, status: "CONFIRMADO", dataHora: "2026-11-10T10:00:00" },
    { id: 4, status: "CANCELADO", dataHora: "2026-11-11T10:00:00" },
  ];

  assert.deepEqual(ids(ordenarAgendamentos(lista, AGORA)), [2, 3, 1, 4]);
});

test("insere novo agendamento na posição cronológica dos pendentes", () => {
  const lista = [
    { id: 1, status: "PENDENTE", dataHora: "2026-11-12T12:00:00" },
    { id: 2, status: "PENDENTE", dataHora: "2026-11-14T08:00:00" },
    { id: 3, status: "PENDENTE", dataHora: "2026-11-12T08:00:00" },
  ];

  assert.deepEqual(ids(ordenarAgendamentos(lista, AGORA)), [3, 1, 2]);
});

test("usa nome do paciente e id como desempate determinístico", () => {
  const lista = [
    { id: 3, status: "PENDENTE", dataHora: "2026-11-12T10:00:00", paciente: { nome: "Maria" } },
    { id: 2, status: "PENDENTE", dataHora: "2026-11-12T10:00:00", paciente: { nome: "Ana" } },
    { id: 1, status: "PENDENTE", dataHora: "2026-11-12T10:00:00", paciente: { nome: "Ana" } },
  ];

  assert.deepEqual(ids(ordenarAgendamentos(lista, AGORA)), [1, 2, 3]);
});

test("preserva compatibilidade com status legado e não altera o array original", () => {
  const lista = [
    { id: 1, confirmado: true, dataHora: "2026-11-12T10:00:00" },
    { id: 2, confirmado: false, dataHora: "2026-11-13T10:00:00" },
  ];
  const copiaOriginal = [...lista];

  assert.deepEqual(ids(ordenarAgendamentos(lista, AGORA)), [2, 1]);
  assert.deepEqual(lista, copiaOriginal);
});

test("prioriza consultas ativas vencidas recentes e depois futuras próximas", () => {
  const lista = [
    { id: 1, status: "CONFIRMADA", dataHora: "2026-11-10T10:00:00" },
    { id: 2, status: "CONFIRMADA", dataHora: "2026-11-11T11:00:00" },
    { id: 3, status: "PENDENTE", dataHora: "2026-11-12T09:00:00" },
    { id: 4, status: "CONFIRMADA", dataHora: "2026-11-11T14:00:00" },
  ];

  assert.deepEqual(
    ids(ordenarConsultas(lista, { priorizarAtivas: true, agora: AGORA })),
    [2, 1, 4, 3]
  );
});

test("mantém o histórico encerrado em data decrescente após as consultas ativas", () => {
  const lista = [
    { id: 1, status: "REALIZADA", dataHora: "2026-11-01T10:00:00" },
    { id: 2, status: "CANCELADA", dataHora: "2026-11-10T10:00:00" },
    { id: 3, status: "NAO_COMPARECEU", dataHora: "2026-11-09T10:00:00" },
    { id: 4, status: "CONFIRMADA", dataHora: "2026-11-12T10:00:00" },
  ];

  assert.deepEqual(
    ids(ordenarConsultas(lista, { priorizarAtivas: true, agora: AGORA })),
    [4, 2, 3, 1]
  );
});

test("ordena o histórico do paciente somente por data decrescente", () => {
  const lista = [
    { id: 1, status: "CONFIRMADA", dataHora: "2026-11-12T10:00:00" },
    { id: 2, status: "REALIZADA", dataHora: "2026-11-11T10:00:00" },
    { id: 3, status: "CANCELADA", dataHora: "2026-11-13T10:00:00" },
  ];

  assert.deepEqual(
    ids(ordenarConsultas(lista, { priorizarAtivas: false, agora: AGORA })),
    [3, 1, 2]
  );
});

test("desempata consultas por paciente, dentista e id sem alterar o original", () => {
  const lista = [
    { id: 3, status: "REALIZADA", dataHora: "2026-11-10T10:00:00", nomePaciente: "Maria", nomeDentista: "Bia" },
    { id: 2, status: "REALIZADA", dataHora: "2026-11-10T10:00:00", nomePaciente: "Ana", nomeDentista: "Carlos" },
    { id: 1, status: "REALIZADA", dataHora: "2026-11-10T10:00:00", nomePaciente: "Ana", nomeDentista: "Carlos" },
  ];
  const copiaOriginal = [...lista];

  assert.deepEqual(ids(ordenarConsultas(lista)), [1, 2, 3]);
  assert.deepEqual(lista, copiaOriginal);
});
