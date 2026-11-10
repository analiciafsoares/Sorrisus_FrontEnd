import { useEffect, useMemo, useState } from "react";
import { listarPacientes, deletarPaciente } from "../../services/pacienteService";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";
import { ArrowLeft, Plus, Search, Users, X } from "lucide-react";

const normalizarTexto = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const somenteDigitos = (valor) => String(valor ?? "").replace(/\D/g, "");

const Paciente = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ type: null, message: null });
  const [busca, setBusca] = useState("");

  const navigate = useNavigate();

  const carregarPacientes = async () => {
    setLoading(true);
    try {
      const response = await listarPacientes();
      setPacientes(response.data || []);
    } catch (error) {
      console.error("Erro ao listar pacientes:", error);
      setToast({ type: "error", message: "Erro ao carregar pacientes. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPacientes();
  }, []);

  const pacientesFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca.trim());
    if (!termo) return pacientes;
    const digitos = somenteDigitos(termo);
    return pacientes.filter((p) =>
      normalizarTexto(p.nome).includes(termo) ||
      normalizarTexto(p.email).includes(termo) ||
      (digitos && (somenteDigitos(p.cpf).includes(digitos) || somenteDigitos(p.telefone).includes(digitos)))
    );
  }, [pacientes, busca]);

  const abrirModalExcluir = (paciente) => {
    setSelectedPaciente(paciente);
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setSelectedPaciente(null);
  };

  const confirmarExclusao = async () => {
    if (!selectedPaciente) return;
    setProcessing(true);
    try {
      await deletarPaciente(selectedPaciente.id);
      setToast({ type: "success", message: "Paciente excluído com sucesso." });
      fecharModal();
      carregarPacientes();
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      const msg = error?.response?.data?.message || "Erro ao excluir paciente. Verifique se há consultas vinculadas.";
      setToast({ type: "error", message: msg });
    } finally {
      setProcessing(false);
    }
  };

  const editar = (id) => {
    navigate(`/pacientes/editar/${id}`);
  };

  const criarAnamnese = (id) => {
    navigate(`/dentista/anamnese/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">Lista de Pacientes</h1>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
            <button
              onClick={() => navigate("/pacientes/cadastrar/interno")}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md font-medium"
            >
              <Plus size={18} />
              Cadastrar Paciente
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, e-mail, CPF ou telefone"
              aria-label="Buscar paciente"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&::-webkit-search-cancel-button]:hidden"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {!loading && busca.trim() && (
            <p className="text-sm text-gray-500">
              {pacientesFiltrados.length} de {pacientes.length} paciente(s)
            </p>
          )}
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4 text-gray-500">Carregando...</td></tr>
              ) : pacientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {busca.trim() ? `Nenhum paciente encontrado para "${busca.trim()}".` : "Nenhum paciente encontrado."}
                  </td>
                </tr>
              ) : (
                pacientesFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.cpf}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.telefone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => editar(p.id)}
                          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => abrirModalExcluir(p)}
                          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors shadow-sm"
                        >
                          Excluir
                        </button>

                        <button
                          onClick={() => criarAnamnese(p.id)}
                          className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors shadow-sm"
                        >
                          Anamnese
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <ConfirmModal
        open={modalOpen}
        title="Excluir paciente"
        description={
          selectedPaciente
            ? `Deseja realmente excluir o paciente "${selectedPaciente.nome}" (ID ${selectedPaciente.id})? Esta ação não pode ser desfeita.`
            : "Deseja realmente excluir este paciente? Esta ação não pode ser desfeita."
        }
        onCancel={fecharModal}
        onConfirm={confirmarExclusao}
        loading={processing}
      />

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: null, message: null })}
      />
    </div>
  );
};

export default Paciente;
