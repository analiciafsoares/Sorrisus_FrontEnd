import test from "node:test";
import assert from "node:assert/strict";

import {
  buscarRecursoOpcional,
  carregarFichaClinica,
} from "./fichaClinicaLoader.js";

const erroHttp = (status) => ({ response: { status } });

const dependencias = ({ anamnese, prontuario }) => ({
  consultaId: "10",
  buscarConsultaPorId: async () => ({
    data: { id: 10, pacienteId: 7, status: "CONFIRMADA" },
  }),
  buscarPacientePorId: async (pacienteId) => ({
    data: { id: pacienteId, nome: "Maria" },
  }),
  buscarAnamnesePorPaciente: async () => {
    if (anamnese instanceof Error || anamnese?.response) throw anamnese;
    return { data: anamnese };
  },
  buscarProntuarioPorConsulta: async () => {
    if (prontuario instanceof Error || prontuario?.response) throw prontuario;
    return { data: prontuario };
  },
});

test("inicia Anamnese e Prontuário ausentes como recursos opcionais", async () => {
  const resultado = await carregarFichaClinica(
    dependencias({
      anamnese: erroHttp(404),
      prontuario: erroHttp(404),
    })
  );

  assert.equal(resultado.anamnese, null);
  assert.equal(resultado.prontuario, null);
  assert.equal(resultado.paciente.nome, "Maria");
});

test("preserva a Anamnese quando a nova Consulta ainda não tem Prontuário", async () => {
  const anamnese = { alergiaResposta: "Sim", alergiaNotas: "Penicilina" };
  const resultado = await carregarFichaClinica(
    dependencias({ anamnese, prontuario: erroHttp(404) })
  );

  assert.deepEqual(resultado.anamnese, anamnese);
  assert.equal(resultado.prontuario, null);
});

test("combina Anamnese do paciente e Prontuário específico da Consulta", async () => {
  const anamnese = { medicamentoResposta: "Sim" };
  const prontuario = {
    observacoes: "Consulta atual",
    odontogramaJson: '{"11":"treated"}',
  };
  const resultado = await carregarFichaClinica(
    dependencias({ anamnese, prontuario })
  );

  assert.deepEqual(resultado.anamnese, anamnese);
  assert.deepEqual(resultado.prontuario, prontuario);
});

test("mantém o Prontuário quando ainda não existe Anamnese", async () => {
  const prontuario = { observacoes: "Registro legado" };
  const resultado = await carregarFichaClinica(
    dependencias({ anamnese: erroHttp(404), prontuario })
  );

  assert.equal(resultado.anamnese, null);
  assert.deepEqual(resultado.prontuario, prontuario);
});

test("propaga erro real ocorrido ao buscar o Prontuário", async () => {
  const erro = erroHttp(500);

  await assert.rejects(
    carregarFichaClinica(
      dependencias({ anamnese: { alergiaResposta: "Sim" }, prontuario: erro })
    ),
    (recebido) => recebido === erro
  );
});

for (const status of [401, 403, 500]) {
  test(`não trata erro ${status} como ausência de recurso`, async () => {
    const erro = erroHttp(status);

    await assert.rejects(
      buscarRecursoOpcional(async () => {
        throw erro;
      }),
      (recebido) => recebido === erro
    );
  });
}
