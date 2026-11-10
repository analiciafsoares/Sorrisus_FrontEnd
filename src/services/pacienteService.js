import api from "./api";

export const listarPacientes = () => api.get("/pacientes");

export const cadastrarPaciente = (dados) => api.post("/pacientes/cadastro", dados);

export const atualizarPaciente = (id, dados) => {
    return api.put(`/pacientes/${id}`, dados);
};

export const buscarPacientePorId = (id) => {
    return api.get(`/pacientes/${id}`);
}

export const deletarPaciente = (id) => api.delete(`/pacientes/${id}`);
