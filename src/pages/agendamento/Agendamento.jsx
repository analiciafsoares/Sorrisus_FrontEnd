import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarAgendamentosPorDentista,
  cancelarAgendamento,
  confirmarAgendamento,
  listarAgendamentosPorPaciente
} from "../../services/agendamentoService";
import { buscarPacientePorId } from "../../services/pacienteService";
import Navbar from "../../components/Navbar";
import ConfirmModal from "../../components/ConfirmModal";
import StatusBadge from "../../components/StatusBadge";
import Toast from "../../components/Toast";
import {
  ArrowLeft,
  Plus,
  Calendar,
  CheckCircle,
  Edit2,
  XCircle,
  Clock,
  User
} from "lucide-react";

const Agendamento = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ type: null, message: null });
  const navigate = useNavigate();

  const carregarAgendamentos = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("role");
      if (!userId) {
        setToast({ type: "error", message: "Usuário não identificado. Faça login novamente." });
        navigate("/login");
        return;
      }

      let resp;
      if (!userRole || !userRole.includes("DENTISTA")) {
        resp = await listarAgendamentosPorPaciente(userId);
      } else {
        resp = await listarAgendamentosPorDentista(userId);
      }

      const ags = Array.isArray(resp.data) ? resp.data : [];

      const pacienteIdsSet = new Set();
      ags.forEach((ag) => {
        const pid = ag.pacienteId ?? (ag.paciente && ag.paciente.id);
        if (pid !== undefined && pid !== null) pacienteIdsSet.add(Number(pid));
      });
      const pacienteIds = Array.from(pacienteIdsSet);

      const pacienteMap = {};
      if (pacienteIds.length > 0) {
        const promises = pacienteIds.map((id) =>
          buscarPacientePorId(id)
            .then((r) => {
              if (r && r.data) pacienteMap[id] = r.data;
            })
            .catch((err) => {
              console.warn(`Paciente ${id} não encontrado ou erro ao buscar:`, err);
            })
        );
        await Promise.all(promises);
      }

      const enriched = ags.map((ag) => {
        const pid = ag.pacienteId ?? (ag.paciente && ag.paciente.id);
        const pidNum = pid !== undefined && pid !== null ? Number(pid) : null;
        const pacienteObj = ag.paciente || (pidNum ? pacienteMap[pidNum] : null);
        return {
          ...ag,
          paciente: pacienteObj,
        };
      });

      setAgendamentos(enriched);
    } catch (error) {
      console.error("Erro ao listar agendamentos:", error);
      setToast({ type: "error", message: "Erro ao carregar agendamentos. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setModalAction("delete");
    setModalOpen(true);
  };

  const openConfirmModal = (id) => {
    setSelectedId(id);
    setModalAction("confirm");
    setModalOpen(true);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedId(null);
    setModalAction(null);
  };

  const handleModalConfirm = async () => {
    if (!selectedId || !modalAction) return;
    setProcessing(true);
    try {
      if (modalAction === "delete") {
        await cancelarAgendamento(selectedId);
        setToast({ type: "success", message: "Agendamento cancelado com sucesso." });
      } else {
        await confirmarAgendamento(selectedId);
        setToast({ type: "success", message: "Agendamento confirmado." });
      }
      setModalOpen(false);
      setSelectedId(null);
      setModalAction(null);
      carregarAgendamentos();
    } catch (err) {
      console.error("Erro na ação:", err);
      const msg = err?.response?.data?.message || "Erro ao processar a solicitação.";
      setToast({ type: "error", message: msg });
    } finally {
      setProcessing(false);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return "-";
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obterStatus = (ag) => {
    if (ag.status) return ag.status;
    return ag.confirmado ? "CONFIRMADA" : "PENDENTE";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600 w-8 h-8" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Meus Agendamentos</h2>
              <p className="text-sm text-gray-500">Gerencie sua agenda de consultas</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
            <button
              onClick={() => navigate("/agendamentos/novo")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md font-medium"
            >
              <Plus size={18} />
              Novo Agendamento
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data / Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observação</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>                
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Carregando sua agenda...</td></tr>
              ) : agendamentos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Nenhum agendamento encontrado.</td>
                </tr>
              ) : (
                agendamentos.map((ag) => {
                  const statusAtual = obterStatus(ag);
                  const podeConfirmar = statusAtual === "PENDENTE";
                  const podeEditarOuCancelar = statusAtual === "PENDENTE" || statusAtual === "CONFIRMADA";

                  return (
                    <tr key={ag.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center gap-2 font-medium">
                          <Clock size={16} className="text-blue-500" />
                          {formatarData(ag.dataHora)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            <User size={14} />
                          </div>
                          {ag.paciente?.nome || `Paciente #${ag.pacienteId}` || "Paciente não identificado"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{ag.observacao || "Sem observações"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <StatusBadge status={statusAtual} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex justify-center items-center space-x-2">
                          {podeConfirmar && (
                            <button
                              onClick={() => openConfirmModal(ag.id)}
                              title="Confirmar agendamento"
                              className="p-2 rounded-lg text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          {podeEditarOuCancelar && (
                            <>
                              <button
                                onClick={() => navigate(`/agendamentos/editar/${ag.id}`)}
                                title="Editar agendamento"
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(ag.id)}
                                title="Cancelar agendamento"
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {!podeConfirmar && !podeEditarOuCancelar && (
                            <span className="text-xs text-gray-400 italic">Sem ações</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        title={modalAction === "delete" ? "Cancelar agendamento" : "Confirmar agendamento"}
        description={modalAction === "delete" ? "Tem certeza que deseja cancelar este agendamento? O horário ficará livre novamente na agenda." : "Deseja confirmar este agendamento?"}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        loading={processing}
      />

      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: null, message: null })} />
    </div>
  );
};

export default Agendamento;