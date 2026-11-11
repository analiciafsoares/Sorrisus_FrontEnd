import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  criarSnapshotFichaClinica,
  podeFinalizarFichaClinica,
  possuiAlteracoesNaoSalvas,
} from "./fichaClinicaState.js";

const criarFicha = () => ({
  pacienteId: 7,
  pacienteNome: "Maria",
  indicador: "",
  alergia: { resposta: "Não", notas: "" },
  antibiotico: { resposta: "Não", notas: "" },
  anestesico: { resposta: "Não", notas: "" },
  sensibilidade: { resposta: "Não", notas: "" },
  pressao: { resposta: "Não", notas: "" },
  medicamento: { resposta: "Não", notas: "" },
  problemaSaude: { resposta: "Não", notas: "" },
  observacoes: "",
  planoTratamento: "",
});

const criarOdontograma = () => ({ 11: "healthy", 12: "healthy" });

const possuiAlteracoes = (ficha, odontograma, snapshot) =>
  possuiAlteracoesNaoSalvas(ficha, odontograma, snapshot);

test("ficha carregada sem alterações pode ser finalizada", () => {
  const ficha = criarFicha();
  const odontograma = criarOdontograma();
  const snapshot = criarSnapshotFichaClinica(ficha, odontograma);

  assert.equal(possuiAlteracoes(ficha, odontograma, snapshot), false);
  assert.equal(podeFinalizarFichaClinica({
    hasUnsavedChanges: false,
    carregando: false,
    erroCarregamento: false,
    salvando: false,
    finalizando: false,
  }), true);
});

test("alteração de Anamnese marca a ficha como não salva", () => {
  const ficha = criarFicha();
  const odontograma = criarOdontograma();
  const snapshot = criarSnapshotFichaClinica(ficha, odontograma);
  const alterada = { ...ficha, alergia: { resposta: "Sim", notas: "Látex" } };

  assert.equal(possuiAlteracoes(alterada, odontograma, snapshot), true);
});

test("alteração de observações marca a ficha como não salva", () => {
  const ficha = criarFicha();
  const odontograma = criarOdontograma();
  const snapshot = criarSnapshotFichaClinica(ficha, odontograma);

  assert.equal(possuiAlteracoes({ ...ficha, observacoes: "Dor" }, odontograma, snapshot), true);
});

test("alteração do plano marca a ficha como não salva", () => {
  const ficha = criarFicha();
  const odontograma = criarOdontograma();
  const snapshot = criarSnapshotFichaClinica(ficha, odontograma);

  assert.equal(possuiAlteracoes({ ...ficha, planoTratamento: "Restauração" }, odontograma, snapshot), true);
});

test("alteração do odontograma marca a ficha como não salva", () => {
  const ficha = criarFicha();
  const odontograma = criarOdontograma();
  const snapshot = criarSnapshotFichaClinica(ficha, odontograma);

  assert.equal(possuiAlteracoes(ficha, { ...odontograma, 11: "decayed" }, snapshot), true);
});

test("snapshot atualizado após salvar remove a pendência", () => {
  const ficha = { ...criarFicha(), observacoes: "Salva" };
  const odontograma = criarOdontograma();
  const snapshotSalvo = criarSnapshotFichaClinica(ficha, odontograma);

  assert.equal(possuiAlteracoes(ficha, odontograma, snapshotSalvo), false);
});

test("edição feita durante o salvamento permanece pendente após a resposta", () => {
  const fichaEnviada = { ...criarFicha(), observacoes: "Versão enviada" };
  const odontograma = criarOdontograma();
  const snapshotEnviado = criarSnapshotFichaClinica(fichaEnviada, odontograma);
  const fichaEditadaDuranteARequisicao = {
    ...fichaEnviada,
    observacoes: "Versão editada durante o salvamento",
  };

  assert.equal(
    possuiAlteracoes(fichaEditadaDuranteARequisicao, odontograma, snapshotEnviado),
    true
  );
});

test("snapshot anterior preservado após falha mantém a pendência", () => {
  const ficha = criarFicha();
  const odontograma = criarOdontograma();
  const snapshotAnterior = criarSnapshotFichaClinica(ficha, odontograma);
  const alterada = { ...ficha, observacoes: "Ainda não salva" };

  assert.equal(possuiAlteracoes(alterada, odontograma, snapshotAnterior), true);
});

test("alteração em prontuário existente é detectada", () => {
  const ficha = { ...criarFicha(), observacoes: "Original" };
  const odontograma = criarOdontograma();
  const snapshot = criarSnapshotFichaClinica(ficha, odontograma);

  assert.equal(possuiAlteracoes({ ...ficha, observacoes: "Atualizada" }, odontograma, snapshot), true);
});

test("preenchimento de nova consulta sem prontuário é detectado", () => {
  const ficha = criarFicha();
  const odontograma = criarOdontograma();
  const snapshot = criarSnapshotFichaClinica(ficha, odontograma);

  assert.equal(possuiAlteracoes({ ...ficha, planoTratamento: "Novo plano" }, odontograma, snapshot), true);
});

test("campo Indicado por não participa do snapshot persistido", () => {
  const ficha = criarFicha();
  const odontograma = criarOdontograma();
  const snapshot = criarSnapshotFichaClinica(ficha, odontograma);

  assert.equal(possuiAlteracoes({ ...ficha, indicador: "Convênio" }, odontograma, snapshot), false);
});

test("salvamento ou finalização em andamento bloqueiam ação concorrente", () => {
  const base = {
    hasUnsavedChanges: false,
    carregando: false,
    erroCarregamento: false,
  };

  assert.equal(podeFinalizarFichaClinica({ ...base, salvando: true, finalizando: false }), false);
  assert.equal(podeFinalizarFichaClinica({ ...base, salvando: false, finalizando: true }), false);
});

test("alterações não salvas bloqueiam a finalização", () => {
  assert.equal(podeFinalizarFichaClinica({
    hasUnsavedChanges: true,
    carregando: false,
    erroCarregamento: false,
    salvando: false,
    finalizando: false,
  }), false);
});

test("salvamento bem-sucedido não redireciona para o Histórico", () => {
  const componentSource = readFileSync(
    new URL("./FichaClinica.jsx", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(
    componentSource,
    /navigate\s*\(\s*["']\/historico-consultas["']\s*\)/
  );
});
