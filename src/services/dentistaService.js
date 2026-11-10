import api from "./api";

export const listarDentistas = () => api.get("/dentistas");

export const cadastrarDentista = (dados) => api.post("/dentistas/cadastro", dados);

export const atualizarDentista = (id, dados) => {
  return api.put(`/dentistas/${id}`, dados);
};

export const deletarDentista = (id) => api.delete(`/dentistas/${id}`);

export const buscarDentistaPorId = (id) => {
  return api.get(`/dentistas/${id}`);
};
