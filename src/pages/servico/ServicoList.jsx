import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { desativarServico, listarServicos } from "../../services/servicoService";
import Navbar from "../../components/Navbar";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";
import { ArrowLeft, Edit2, Plus, PowerOff, Stethoscope } from "lucide-react";

export default function ServicoList() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedServico, setSelectedServico] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ type: null, message: null });
  const navigate = useNavigate();

  const carregar = async () => {
    setLoading(true);
    try {
      const resp = await listarServicos();
      setServicos(resp.data || []);
    } catch (err) {
      console.error("Erro ao listar serviços:", err);
      setToast({ type: "error", message: "Erro ao carregar serviços." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const abrirModalDesativar = (servico) => {
    setSelectedServico(servico);
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setSelectedServico(null);
  };

  const confirmarDesativacao = async () => {
    if (!selectedServico) return;
    setProcessing(true);
    try {
      await desativarServico(selectedServico.id);
      setToast({ type: "success", message: "Serviço desativado com sucesso." });
      fecharModal();
      carregar();
    } catch (err) {
      console.error("Erro ao desativar serviço:", err);
      const msg = err?.response?.data?.message || "Erro ao desativar serviço.";
      setToast({ type: "error", message: msg });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Serviços</h1>
              <p className="text-sm text-gray-500">Gerencie os procedimentos da clínica</p>
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

            <button
              onClick={() => navigate("/servicos/novo")}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md font-medium"
            >
              <Plus size={18} />
              Novo Serviço
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="w-full min-w-[760px] table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="w-[12%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ativo</th>
                <th className="w-[13%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Carregando serviços...</td></tr>
              ) : servicos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Nenhum serviço cadastrado.</td>
                </tr>
              ) : (
                servicos.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{s.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate" title={s.descricao || undefined}>{s.descricao || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">R$ {Number(s.preco).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {s.ativo ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs">Ativo</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">Inativo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => navigate(`/servicos/editar/${s.id}`)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        {s.ativo && (
                          <button
                            onClick={() => abrirModalDesativar(s)}
                            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-all"
                            title="Desativar"
                          >
                            <PowerOff size={18} />
                          </button>
                        )}
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
        title="Desativar serviço"
        description={selectedServico ? `Deseja desativar o serviço "${selectedServico.nome}"? Ele deixará de estar disponível para novos usos e poderá ser reativado pela edição.` : "Deseja desativar este serviço?"}
        onCancel={fecharModal}
        onConfirm={confirmarDesativacao}
        loading={processing}
      />

      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: null, message: null })} />
    </div>
  );
}
