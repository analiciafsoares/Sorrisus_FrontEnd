import api from "./api";

export const listarRecepcionistas = () => api.get("/recepcionistas");

export const buscarRecepcionistaPorId = (id) => {
  return api.get(`/recepcionistas/${id}`);
};

export const cadastrarRecepcionista = (dados) => api.post("/recepcionistas", dados);

export const atualizarRecepcionista = (id, dados) => {
  return api.put(`/recepcionistas/${id}`, dados);

};

export const deletarRecepcionista = (id) => api.delete(`/recepcionistas/${id}`);
