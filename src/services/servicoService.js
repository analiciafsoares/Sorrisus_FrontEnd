import api from "./api";

export const listarServicos = () => {
  return api.get("/servicos");
};

export const buscarServicoPorId = (id) => {
  return api.get(`/servicos/${id}`);
};

export const criarServico = (dados) => {
  return api.post("/servicos", dados);
};

export const atualizarServico = (id, dados) => {
  return api.put(`/servicos/${id}`, dados);
};

export const desativarServico = (id) => {
  return api.delete(`/servicos/${id}`);
};
