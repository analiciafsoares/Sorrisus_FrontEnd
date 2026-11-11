const STATUS_CONSULTA_ATIVA = new Set(["PENDENTE", "CONFIRMADA"]);

const collator = new Intl.Collator("pt-BR", {
  sensitivity: "base",
  numeric: true,
});

const timestamp = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;

  const resultado = new Date(valor).getTime();
  return Number.isNaN(resultado) ? null : resultado;
};

const compararData = (dataA, dataB, direcao) => {
  if (dataA === null && dataB === null) return 0;
  if (dataA === null) return 1;
  if (dataB === null) return -1;
  return (dataA - dataB) * direcao;
};

const nomePaciente = (registro) =>
  registro.nomePaciente
  ?? registro.pacienteNome
  ?? registro.paciente?.nome
  ?? "";

const nomeDentista = (registro) =>
  registro.nomeDentista
  ?? registro.dentistaNome
  ?? registro.dentista?.nome
  ?? "";

const compararId = (idA, idB) => {
  const numeroA = Number(idA);
  const numeroB = Number(idB);

  if (Number.isFinite(numeroA) && Number.isFinite(numeroB)) {
    return numeroA - numeroB;
  }

  return collator.compare(String(idA ?? ""), String(idB ?? ""));
};

const desempatar = (a, b) =>
  collator.compare(nomePaciente(a), nomePaciente(b))
  || collator.compare(nomeDentista(a), nomeDentista(b))
  || compararId(a.id, b.id);

const statusAgendamento = (agendamento) =>
  agendamento.status || (agendamento.confirmado ? "CONFIRMADO" : "PENDENTE");

const grupoAgendamento = (agendamento, agora) => {
  const status = statusAgendamento(agendamento);
  if (status === "CANCELADO") return 4;

  const data = timestamp(agendamento.dataHora);
  const futuro = data !== null && data >= agora;

  if (!futuro) return 3;
  if (status === "PENDENTE") return 0;
  if (status === "CONFIRMADO") return 1;
  return 2;
};

export const ordenarAgendamentos = (lista, agora = new Date()) => {
  const agoraTimestamp = timestamp(agora) ?? Date.now();

  return [...lista].sort((a, b) => {
    const grupoA = grupoAgendamento(a, agoraTimestamp);
    const grupoB = grupoAgendamento(b, agoraTimestamp);

    if (grupoA !== grupoB) return grupoA - grupoB;

    const direcao = grupoA <= 2 ? 1 : -1;
    return compararData(timestamp(a.dataHora), timestamp(b.dataHora), direcao)
      || desempatar(a, b);
  });
};

const grupoConsulta = (consulta, agora) => {
  if (!STATUS_CONSULTA_ATIVA.has(consulta.status)) return 2;

  const data = timestamp(consulta.dataHora);
  return data !== null && data < agora ? 0 : 1;
};

export const ordenarConsultas = (
  lista,
  { priorizarAtivas = false, agora = new Date() } = {}
) => {
  const agoraTimestamp = timestamp(agora) ?? Date.now();

  return [...lista].sort((a, b) => {
    if (!priorizarAtivas) {
      return compararData(timestamp(a.dataHora), timestamp(b.dataHora), -1)
        || desempatar(a, b);
    }

    const grupoA = grupoConsulta(a, agoraTimestamp);
    const grupoB = grupoConsulta(b, agoraTimestamp);

    if (grupoA !== grupoB) return grupoA - grupoB;

    const direcao = grupoA === 1 ? 1 : -1;
    return compararData(timestamp(a.dataHora), timestamp(b.dataHora), direcao)
      || desempatar(a, b);
  });
};
