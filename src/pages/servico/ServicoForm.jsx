import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarServico, atualizarServico, buscarServicoPorId } from "../../services/servicoService";

export default function ServicoForm({ servicoId }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    ativo: true
  });
  const [loading, setLoading] = useState(Boolean(servicoId));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ type: null, message: null });

  useEffect(() => {
    if (!servicoId) return;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await buscarServicoPorId(servicoId);
        const s = resp.data || {};
        setForm({
          nome: s.nome || "",
          descricao: s.descricao || "",
          preco: s.preco != null ? String(s.preco) : "",
          ativo: s.ativo == null ? true : s.ativo
        });
      } catch (err) {
        console.error("Erro ao carregar serviço:", err);
        setToast({ type: "error", message: "Erro ao carregar serviço." });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [servicoId]);

  const validate = () => {
    const e = {};
    if (!form.nome || form.nome.trim().length < 2) e.nome = "Nome é obrigatório.";
    if (!form.preco || isNaN(Number(form.preco))) e.preco = "Preço inválido.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setToast({ type: null, message: null });

    if (!validate()) {
      setToast({ type: "error", message: "Corrija os erros do formulário." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nome: form.nome,
        descricao: form.descricao || null,
        preco: Number(form.preco),
        ativo: Boolean(form.ativo)
      };

      if (servicoId) {
        await atualizarServico(servicoId, payload);
        setToast({ type: "success", message: "Serviço atualizado com sucesso." });
      } else {
        await criarServico(payload);
        setToast({ type: "success", message: "Serviço criado com sucesso." });
      }

      setTimeout(() => navigate("/servicos"), 700);
    } catch (err) {
      console.error("Erro ao salvar serviço:", err);
      const msg = err?.response?.data?.message || "Erro ao salvar serviço.";
      setToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow border border-gray-200 p-6">
      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : (
        <form id="servico-form" onSubmit={handleSubmit} className="space-y-6">
          {toast.message && (
            <div className={`px-4 py-2 rounded ${toast.type === "error" ? "bg-red-50 border border-red-200 text-red-700" : "bg-green-50 border border-green-200 text-green-800"}`}>
              {toast.message}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Nome</span>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className={`mt-1 block w-full rounded-md border ${errors.nome ? "border-red-300" : "border-gray-200"} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              placeholder="Ex: Limpeza, Restauração"
              required
            />
            {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Descrição</span>
            <textarea
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Descrição breve do procedimento (opcional)"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Preço (R$)</span>
              <input
                type="number"
                step="0.01"
                value={form.preco}
                onChange={(e) => handleChange("preco", e.target.value)}
                className={`mt-1 block w-full rounded-md border ${errors.preco ? "border-red-300" : "border-gray-200"} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                placeholder="0.00"
                required
              />
              {errors.preco && <p className="text-xs text-red-600 mt-1">{errors.preco}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Ativo</span>
              <div className="mt-1">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(e) => handleChange("ativo", e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Disponível para agendamento</span>
                </label>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/servicos")}
              className="px-4 py-2 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              {saving ? "Salvando..." : (servicoId ? "Salvar alterações" : "Criar serviço")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
