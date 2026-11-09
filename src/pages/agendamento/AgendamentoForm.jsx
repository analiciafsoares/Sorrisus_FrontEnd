import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  criarAgendamento,
  atualizarAgendamento,
  buscarAgendamentoPorId
} from "../../services/agendamentoService";
import { listarPacientes } from "../../services/pacienteService";
import { listarDentistas } from "../../services/dentistaService";
import { listarServicos } from "../../services/servicoService";
import { ArrowLeft, Save, Calendar } from "lucide-react";

const toInputDateTime = (isoString) => {
  if (!isoString) return "";
  const s = isoString.split(".")[0];

  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(isoString)) {
    const d = new Date(isoString);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  const parts = s.split("T");
  if (parts.length < 2) return "";
  const date = parts[0];
  const time = parts[1].split(":");
  const hh = time[0].padStart(2, "0");
  const min = (time[1] || "00").padStart(2, "0");
  return `${date}T${hh}:${min}`;
};

const fromInputDateTimeToBackend = (value) => {
  if (!value) return null;
  return `${value}:00`;
};

export default function AgendamentoForm({ agendamentoId }) {
  const navigate = useNavigate();
  const [dataHora, setDataHora] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [dentistaId, setDentistaId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [dentistas, setDentistas] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, dRes, sRes] = await Promise.all([
          listarPacientes(),
          listarDentistas(),
          listarServicos()
        ]);
        setPacientes(pRes.data || []);
        setDentistas(dRes.data || []);
        const todosServicos = Array.isArray(sRes.data) ? sRes.data : [];
        if (agendamentoId) {
          const resp = await buscarAgendamentoPorId(agendamentoId);
          const ag = resp.data;
          setDataHora(toInputDateTime(ag.dataHora));
          setPacienteId(ag.pacienteId ?? "");
          setDentistaId(ag.dentistaId ?? "");
          setServicoId(ag.servicoId ?? "");
          setObservacao(ag.observacao ?? "");
          setServicos(
            todosServicos.filter(
              (servico) => servico.ativo || Number(servico.id) === Number(ag.servicoId)
            )
          );
        } else {
          setServicos(todosServicos.filter((servico) => servico.ativo));
        }
      } catch (err) {
        console.error("Erro ao carregar dados do formulário", err);
        setError("Erro ao carregar dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [agendamentoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!dataHora || !pacienteId || !dentistaId) {
      setError("Preencha data/hora, paciente e dentista.");
      return;
    }

    const payload = {
      dataHora: fromInputDateTimeToBackend(dataHora),
      pacienteId: Number(pacienteId),
      dentistaId: Number(dentistaId),
      servicoId: servicoId ? Number(servicoId) : null,
      observacao: observacao || ""
    };

    try {
      setSaving(true);
      if (agendamentoId) {
        await atualizarAgendamento(agendamentoId, payload);
      } else {
        await criarAgendamento(payload);
      }
      navigate("/agendamentos");
    } catch (err) {
      console.error("Erro ao salvar agendamento", err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Erro ao salvar. Verifique os dados.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
     <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600 w-8 h-8" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{agendamentoId ? "Editar Agendamento" : "Novo Agendamento"}</h2>
              <p className="text-sm text-gray-500">Preencha os dados para agendar a consulta</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/agendamentos")}
              className="flex items-center gap-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Data e hora</span>
                  <input
                    type="datetime-local"
                    value={dataHora}
                    onChange={(e) => setDataHora(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Paciente</span>
                  <select
                    value={pacienteId}
                    onChange={(e) => setPacienteId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione um paciente</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome || p.email}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Dentista</span>
                  <select
                    value={dentistaId}
                    onChange={(e) => setDentistaId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione um dentista</option>
                    {dentistas.map((d) => (
                      <option key={d.id} value={d.id}>{d.nome || d.email} {d.especialidade ? `- ${d.especialidade}` : ""}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Serviço (opcional)</span>
                  <select
                    value={servicoId}
                    onChange={(e) => setServicoId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Selecione (opcional)</option>
                    {servicos.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome || s.descricao}{s.ativo ? "" : " (inativo)"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Observação</span>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </label>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/agendamentos")}
                  className="px-4 py-2 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  <div className="flex items-center gap-2">
                    <Save size={16} />
                    {saving ? "Salvando..." : "Salvar agendamento"}
                  </div>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
