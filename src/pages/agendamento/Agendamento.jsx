import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  listarAgendamentosPorDentista,
  cancelarAgendamento,
  confirmarAgendamento,
  listarAgendamentosPorPaciente
} from "../../services/agendamentoService";
import { buscarPacientePorId } from "../../services/pacienteService";
import { listarDentistas } from "../../services/dentistaService";
import { getRole, getUserId } from "../../services/authService";
import Navbar from "../../components/Navbar";
import ConfirmModal from "../../components/ConfirmModal";
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

const STATUS_AGENDAMENTO = {
  PENDENTE: { label: "Pendente", Icone: Clock, className: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  CONFIRMADO: { label: "Confirmado", Icone: CheckCircle, className: "bg-green-100 text-green-800 border border-green-200" },
  CANCELADO: { label: "Cancelado", Icone: XCircle, className: "bg-red-50 text-red-700 border border-red-200" },
};

const statusDoAgendamento = (ag) => ag.status || (ag.confirmado ? "CONFIRMADO" : "PENDENTE");

const Agendamento = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ type: null, message: null });
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole() || "";
  const isDentista = role.includes("DENTISTA");
  const isRecepcionista = role.includes("RECEPCIONISTA");
  const podeGerenciar = isDentista || isRecepcionista;
  const [dentistas, setDentistas] = useState([]);
  const [dentistaSelecionado, setDentistaSelecionado] = useState("");

  useEffect(() => {
    const toastRecebido = location.state?.toast;
    if (!toastRecebido) return;

    setToast(toastRecebido);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const carregarAgendamentos = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setToast({ type: "error", message: "Usuário não identificado. Faça login novamente." });
      navigate("/login");
      return;
    }
    if (isRecepcionista && !dentistaSelecionado) return;

    setLoading(true);
    try {
      let resp;
      if (isRecepcionista) {
        resp = await listarAgendamentosPorDentista(dentistaSelecionado);
      } else if (isDentista) {
        resp = await listarAgendamentosPorDentista(userId);
      } else {
        resp = await listarAgendamentosPorPaciente(userId);
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
  }, [isDentista, isRecepcionista, dentistaSelecionado, navigate]);

  useEffect(() => {
    if (!isRecepcionista) return;
    listarDentistas()
      .then((resp) => {
        const lista = Array.isArray(resp.data) ? resp.data : [];
        setDentistas(lista);
        if (lista.length > 0) {
          setDentistaSelecionado(String(lista[0].id));
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Erro ao listar dentistas:", err);
        setToast({ type: "error", message: "Erro ao carregar a lista de dentistas." });
        setLoading(false);
      });
  }, [isRecepcionista]);

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

  const openCancelModal = (id) => {
    setSelectedId(id);
    setModalAction("cancel");
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
      if (modalAction === "cancel") {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {isRecepcionista ? "Agenda da Clínica" : "Meus Agendamentos"}
              </h1>
              <p className="text-sm text-gray-500">
                {isRecepcionista ? "Selecione o dentista para ver e gerenciar a agenda" : "Gerencie sua agenda de consultas"}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
            {podeGerenciar && (
              <button
                onClick={() => navigate("/agendamentos/novo")}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md font-medium"
              >
                <Plus size={18} />
                Novo Agendamento
              </button>
            )}
          </div>
        </div>

        {isRecepcionista && (
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label htmlFor="filtro-dentista" className="text-sm font-medium text-gray-700">
              Dentista
            </label>
            <select
              id="filtro-dentista"
              value={dentistaSelecionado}
              onChange={(e) => setDentistaSelecionado(e.target.value)}
              disabled={dentistas.length === 0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-72"
            >
              {dentistas.length === 0 && <option value="">Nenhum dentista cadastrado</option>}
              {dentistas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome || d.email}{d.especialidade ? ` - ${d.especialidade}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

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
                  const status = statusDoAgendamento(ag);
                  const { label, Icone, className } = STATUS_AGENDAMENTO[status] || STATUS_AGENDAMENTO.PENDENTE;
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
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
                          <Icone size={14} /> {label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex justify-center items-center space-x-2">
                          {podeGerenciar && status === "PENDENTE" && (
                            <>
                              <button onClick={() => openConfirmModal(ag.id)} title="Confirmar" className="p-2 rounded-lg text-green-600 hover:bg-green-50">
                                <CheckCircle size={18} />
                              </button>
                              <button onClick={() => navigate(`/agendamentos/editar/${ag.id}`)} title="Editar" className="p-2 rounded-lg text-blue-600 hover:bg-blue-50">
                                <Edit2 size={18} />
                              </button>
                            </>
                          )}
                          {podeGerenciar && status !== "CANCELADO" && (
                            <button onClick={() => openCancelModal(ag.id)} title="Cancelar" className="p-2 rounded-lg text-red-600 hover:bg-red-50">
                              <XCircle size={18} />
                            </button>
                          )}
                          {(!podeGerenciar || status === "CANCELADO") && <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      <ConfirmModal
        open={modalOpen}
        title={modalAction === "cancel" ? "Cancelar agendamento" : "Confirmar agendamento"}
        description={
          modalAction === "cancel"
            ? "O agendamento ficará registrado como cancelado e o horário será liberado. Se ele já estiver confirmado, a consulta também será cancelada."
            : "Deseja confirmar este agendamento?"
        }
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        loading={processing}
      />

      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: null, message: null })} />
    </div>
  );
};

export default Agendamento;
