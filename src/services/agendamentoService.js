import api from "./api";

const ENDPOINT = "/agendamentos";

export const listarAgendamentos = () => {
  return api.get(ENDPOINT);
};

export const listarAgendamentosPorDentista = (dentistaId) => {
  return api.get(`${ENDPOINT}/dentista/${dentistaId}`);
};

export const buscarAgendamentoPorId = (id) => {
  return api.get(`${ENDPOINT}/${id}`);
};

export const criarAgendamento = (dados) => {
  return api.post(ENDPOINT, dados);
};

export const atualizarAgendamento = (id, dados) => {
  return api.put(`${ENDPOINT}/${id}`, dados);
};

export const deletarAgendamento = (id) => {
  return api.delete(`${ENDPOINT}/${id}`);
};

export const confirmarAgendamento = (id) => {
  return api.post(`${ENDPOINT}/${id}/confirmar`);
};

export const cancelarAgendamento = (id) => {
  return api.post(`${ENDPOINT}/${id}/cancelar`);
};

export const listarAgendamentosPorPaciente = (pacienteId) => {
  return api.get(`${ENDPOINT}/paciente/${pacienteId}`);
};