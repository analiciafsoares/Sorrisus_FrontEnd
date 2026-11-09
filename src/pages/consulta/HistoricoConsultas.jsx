import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  cancelarConsulta,
  listarConsultasParaRecepcao,
  listarConsultasPorDentista,
  listarConsultasPorPaciente,
  registrarNaoComparecimento,
} from "../../services/consultaService";
import { jwtDecode } from "jwt-decode";
import Navbar from "../../components/Navbar";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";
import { formatarData } from "../../utils/formatters";
import { ArrowLeft, ClipboardList, History, UserX, XCircle } from "lucide-react";

const ACOES = {
  naoCompareceu: {
    titulo: "Registrar não comparecimento",
    descricao: "A consulta será marcada como \"Não compareceu\". Use esta opção quando o paciente faltar sem avisar.",
    executar: registrarNaoComparecimento,
    sucesso: "Não comparecimento registrado.",
  },
  cancelar: {
    titulo: "Cancelar consulta",
    descricao: "A consulta ficará registrada como cancelada e o horário será liberado.",
    executar: cancelarConsulta,
    sucesso: "Consulta cancelada.",
  },
};

const horarioJaPassou = (consulta) => new Date(consulta.dataHora) < new Date();

const HistoricoConsultas = () => {
  const navigate = useNavigate();
  const [consultas, setConsultas] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [acaoPendente, setAcaoPendente] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [toast, setToast] = useState({ type: null, message: null });

  const navegarParaAnamnese = (idConsulta) => {
    navigate(`/dentista/anamnese/${idConsulta}`);
  };

  const carregarConsultas = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const decoded = jwtDecode(token);
      let role = "";
      if (decoded.role) role = decoded.role;
      else if (decoded.roles) role = Array.isArray(decoded.roles) ? decoded.roles[0] : decoded.roles;
      else if (decoded.authorities) role = Array.isArray(decoded.authorities) ? decoded.authorities[0] : decoded.authorities;
      role = String(role || "").toUpperCase();
      setUserRole(role);

      const userId = decoded.userId || decoded.id || decoded.sub || Number(localStorage.getItem("userId")) || null;
      if (!userId) {
        setConsultas([]);
        setLoading(false);
        return;
      }

      let data = [];
      if (role.includes("PACIENTE")) {
        const res = await listarConsultasPorPaciente(localStorage.getItem("userId"));
        data = Array.isArray(res.data) ? res.data : (res.data?.content || res.data?.data || []);
      } else if (role.includes("DENTISTA")) {
        const res = await listarConsultasPorDentista(localStorage.getItem("userId"));
        data = Array.isArray(res.data) ? res.data : (res.data?.content || res.data?.data || []);
      } else if (role.includes("RECEPCIONISTA")) {
        const res = await listarConsultasParaRecepcao();
        data = Array.isArray(res.data) ? res.data : (res.data?.content || res.data?.data || []);
      } else {
        data = [];
      }

      setConsultas(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setConsultas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarConsultas();
  }, [carregarConsultas]);

  const executarAcao = async () => {
    if (!acaoPendente) return;
    const acao = ACOES[acaoPendente.tipo];
    setProcessando(true);
    try {
      await acao.executar(acaoPendente.consultaId);
      setToast({ type: "success", message: acao.sucesso });
      setAcaoPendente(null);
      carregarConsultas();
    } catch (err) {
      console.error("Erro ao atualizar consulta:", err);
      setToast({ type: "error", message: err?.response?.data?.message || "Não foi possível atualizar a consulta." });
    } finally {
      setProcessando(false);
    }
  };

  const isDentista = userRole && userRole.includes("DENTISTA");
  const isRecepcionista = userRole && userRole.includes("RECEPCIONISTA");
  const podeGerenciar = isDentista || isRecepcionista;
  const totalColunas = isRecepcionista ? 6 : isDentista ? 5 : 4;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">Histórico de Consultas</h1>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="self-start sm:self-auto flex items-center gap-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-[720px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {userRole && userRole.includes("PACIENTE") ? "Dentista" : "Paciente"}
                </th>

                {isRecepcionista && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dentista
                  </th>
                )}

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observação</th>
                {podeGerenciar && (
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={totalColunas} className="text-center py-8 text-gray-500">Carregando...</td>
                </tr>
              ) : consultas.length === 0 ? (
                <tr>
                  <td colSpan={totalColunas} className="px-6 py-8 text-center text-gray-500">Nenhuma consulta encontrada.</td>
                </tr>
              ) : (
                consultas.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatarData(c.dataHora)}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {userRole && userRole.includes("PACIENTE") ? (c.nomeDentista || c.dentistaNome || c.dentista?.nome) : (c.nomePaciente || c.pacienteNome || c.paciente?.nome)}
                    </td>

                    {isRecepcionista && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {c.nomeDentista || c.dentistaNome || c.dentista?.nome || "-"}
                      </td>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={c.observacao}>
                      {c.observacao || "-"}
                    </td>

                    {podeGerenciar && (
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex justify-center items-center gap-2">
                          {isDentista && (
                            <button
                              onClick={() => navegarParaAnamnese(c.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium transition-colors shadow-sm"
                            >
                              <ClipboardList size={14} />
                              Anamnese
                            </button>
                          )}
                          {c.status === "CONFIRMADA" && horarioJaPassou(c) && (
                            <button
                              onClick={() => setAcaoPendente({ tipo: "naoCompareceu", consultaId: c.id })}
                              title="Registrar não comparecimento"
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                              <UserX size={18} />
                            </button>
                          )}
                          {c.status === "CONFIRMADA" && !horarioJaPassou(c) && (
                            <button
                              onClick={() => setAcaoPendente({ tipo: "cancelar", consultaId: c.id })}
                              title="Cancelar consulta"
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          {!isDentista && c.status !== "CONFIRMADA" && <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <ConfirmModal
        open={Boolean(acaoPendente)}
        title={acaoPendente ? ACOES[acaoPendente.tipo].titulo : ""}
        description={acaoPendente ? ACOES[acaoPendente.tipo].descricao : ""}
        onCancel={() => setAcaoPendente(null)}
        onConfirm={executarAcao}
        loading={processando}
      />

      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: null, message: null })} />
    </div>
  );
};

export default HistoricoConsultas;
