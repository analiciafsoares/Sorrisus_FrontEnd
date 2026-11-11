import api from "./api";

export const buscarAnamnesePorPaciente = (pacienteId) => {
  return api.get(`/anamneses/paciente/${pacienteId}`);
};
