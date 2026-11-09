import api from "./api";

export const criarConsulta = (dados) => {
  return api.post("/consultas", dados);
};

export const atualizarConsulta = (id, dados) => {
 
  return api.put(`/consultas/${id}`, dados);
};

export const alterarStatusConsulta = (id, status) => {
  
  return api.patch(`/consultas/${id}/status`, null, {
    params: { status }
  });
};

export const cancelarConsulta = (id) => {

  return api.delete(`/consultas/${id}`);
};

export const listarConsultasPorPaciente = (pacienteId) => {
 
  return api.get(`/consultas/paciente/${pacienteId}`);
};

export const listarConsultasPorDentista = (dentistaId) => {
  
  return api.get(`/consultas/dentista/${dentistaId}`);
};

export const listarConsultasParaRecepcao = () => {
  return api.get("/consultas/historico/recepcao");
};

export const buscarConsultaPorId = (id) => {
 
  return api.get(`/consultas/${id}`);
};

export const listarRetornosPendentes = () => {
  return api.get("/consultas/retornos-pendentes");
};
