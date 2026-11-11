export const buscarRecursoOpcional = async (buscar) => {
  try {
    const response = await buscar();
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

export const carregarFichaClinica = async ({
  consultaId,
  buscarConsultaPorId,
  buscarPacientePorId,
  buscarAnamnesePorPaciente,
  buscarProntuarioPorConsulta,
}) => {
  const resConsulta = await buscarConsultaPorId(consultaId);
  const consulta = Array.isArray(resConsulta.data)
    ? resConsulta.data[0]
    : resConsulta.data;

  if (!consulta?.pacienteId) {
    throw new Error("Consulta sem paciente associado.");
  }

  const resPaciente = await buscarPacientePorId(consulta.pacienteId);
  const [anamnese, prontuario] = await Promise.all([
    buscarRecursoOpcional(() =>
      buscarAnamnesePorPaciente(consulta.pacienteId)
    ),
    buscarRecursoOpcional(() =>
      buscarProntuarioPorConsulta(consultaId)
    ),
  ]);

  return {
    consulta,
    paciente: resPaciente.data,
    anamnese,
    prontuario,
  };
};
