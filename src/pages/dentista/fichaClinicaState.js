export const criarPayloadFichaClinica = (fichaClinica, odontogramState) => ({
  alergiaResposta: fichaClinica.alergia.resposta,
  alergiaNotas: fichaClinica.alergia.notas,
  antibioticoResposta: fichaClinica.antibiotico.resposta,
  antibioticoNotas: fichaClinica.antibiotico.notas,
  anestesicoResposta: fichaClinica.anestesico.resposta,
  anestesicoNotas: fichaClinica.anestesico.notas,
  sensibilidadeResposta: fichaClinica.sensibilidade.resposta,
  sensibilidadeNotas: fichaClinica.sensibilidade.notas,
  pressaoResposta: fichaClinica.pressao.resposta,
  pressaoNotas: fichaClinica.pressao.notas,
  medicamentoResposta: fichaClinica.medicamento.resposta,
  medicamentoNotas: fichaClinica.medicamento.notas,
  problemaSaudeResposta: fichaClinica.problemaSaude.resposta,
  problemaSaudeNotas: fichaClinica.problemaSaude.notas,
  observacoes: fichaClinica.observacoes,
  planoTratamento: fichaClinica.planoTratamento,
  odontogramaJson: JSON.stringify(odontogramState),
});

export const criarSnapshotFichaClinica = (fichaClinica, odontogramState) =>
  JSON.stringify(criarPayloadFichaClinica(fichaClinica, odontogramState));

export const possuiAlteracoesNaoSalvas = (
  fichaClinica,
  odontogramState,
  ultimoSnapshotSalvo
) =>
  ultimoSnapshotSalvo !== null
  && criarSnapshotFichaClinica(fichaClinica, odontogramState) !== ultimoSnapshotSalvo;

export const podeFinalizarFichaClinica = ({
  hasUnsavedChanges,
  carregando,
  erroCarregamento,
  salvando,
  finalizando,
}) => !hasUnsavedChanges
  && !carregando
  && !erroCarregamento
  && !salvando
  && !finalizando;
