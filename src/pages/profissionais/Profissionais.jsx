import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Toast from "../../components/Toast";
import { listarDentistas, cadastrarDentista } from "../../services/dentistaService";
import { listarRecepcionistas, cadastrarRecepcionista } from "../../services/recepcionistaService";
import { ArrowLeft, Info, Plus, Save, UserPlus, X } from "lucide-react";

const TURNOS = [
  { value: "MANHA", label: "Manhã" },
  { value: "TARDE", label: "Tarde" },
  { value: "NOITE", label: "Noite" },
];

const FORM_VAZIO = {
  tipo: "DENTISTA",
  nome: "",
  email: "",
  senha: "",
  cro: "",
  especialidade: "",
  turno: "",
};

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

const formatTurno = (value) => TURNOS.find((t) => t.value === value)?.label || value || "-";

const Profissionais = () => {
  const navigate = useNavigate();
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState({ type: null, message: null });

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, rRes] = await Promise.all([listarDentistas(), listarRecepcionistas()]);
      const dentistas = (Array.isArray(dRes.data) ? dRes.data : []).map((d) => ({
        id: `d-${d.id}`,
        nome: d.nome,
        email: d.email,
        perfil: "Dentista",
        detalhe: [d.cro, d.especialidade].filter(Boolean).join(" · "),
      }));
      const recepcionistas = (Array.isArray(rRes.data) ? rRes.data : []).map((r) => ({
        id: `r-${r.id}`,
        nome: r.nome,
        email: r.email,
        perfil: "Recepcionista",
        detalhe: `Turno: ${formatTurno(r.turno)}`,
      }));
      setProfissionais(
        [...dentistas, ...recepcionistas].sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
      );
    } catch (err) {
      console.error("Erro ao listar profissionais:", err);
      setToast({ type: "error", message: "Erro ao carregar os profissionais. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "cro" ? value.toUpperCase() : value }));
  };

  const fecharForm = () => {
    setFormAberto(false);
    setForm(FORM_VAZIO);
    setErroForm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroForm("");

    if (form.senha.length < 6) {
      setErroForm("A senha provisória deve ter pelo menos 6 caracteres.");
      return;
    }

    const base = { nome: form.nome.trim(), email: form.email.trim(), senha: form.senha };
    setSalvando(true);
    try {
      if (form.tipo === "DENTISTA") {
        await cadastrarDentista({ ...base, cro: form.cro.trim(), especialidade: form.especialidade.trim() });
      } else {
        await cadastrarRecepcionista({ ...base, turno: form.turno });
      }
      fecharForm();
      setToast({
        type: "success",
        message: "Profissional cadastrado. Informe a senha provisória e oriente a troca no primeiro acesso.",
      });
      carregar();
    } catch (err) {
      console.error("Erro ao cadastrar profissional:", err);
      setErroForm(err?.response?.data?.message || "Erro ao cadastrar o profissional. Verifique os dados.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Profissionais</h1>
              <p className="text-sm text-gray-500">Dentistas e recepcionistas com acesso ao sistema</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
            {!formAberto && (
              <button
                onClick={() => setFormAberto(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md font-medium"
              >
                <Plus size={18} />
                Cadastrar Profissional
              </button>
            )}
          </div>
        </div>

        {formAberto && (
          <section className="mb-6 bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Novo profissional</h2>
              <button
                type="button"
                onClick={fecharForm}
                aria-label="Fechar formulário"
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {erroForm && (
                <div className="px-4 py-2 rounded bg-red-50 border border-red-200 text-red-700">{erroForm}</div>
              )}

              <fieldset>
                <legend className="text-sm font-medium text-gray-700">Perfil</legend>
                <div className="mt-2 flex gap-6">
                  {[
                    { value: "DENTISTA", label: "Dentista" },
                    { value: "RECEPCIONISTA", label: "Recepcionista" },
                  ].map((opcao) => (
                    <label key={opcao.value} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="tipo"
                        value={opcao.value}
                        checked={form.tipo === opcao.value}
                        onChange={handleChange}
                      />
                      {opcao.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Nome</span>
                  <input name="nome" value={form.nome} onChange={handleChange} className={inputClass} required />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">E-mail</span>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} required />
                </label>

                {form.tipo === "DENTISTA" ? (
                  <>
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">CRO</span>
                      <input
                        name="cro"
                        value={form.cro}
                        onChange={handleChange}
                        placeholder="Ex: 12345-PB"
                        pattern="\d{4,6}-[A-Z]{2}"
                        title="Informe o CRO no formato 12345-PB"
                        className={inputClass}
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-gray-700">Especialidade</span>
                      <input name="especialidade" value={form.especialidade} onChange={handleChange} className={inputClass} required />
                    </label>
                  </>
                ) : (
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Turno</span>
                    <select name="turno" value={form.turno} onChange={handleChange} className={inputClass} required>
                      <option value="" disabled>Selecione</option>
                      {TURNOS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Senha provisória</span>
                  <input
                    type="password"
                    name="senha"
                    value={form.senha}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={6}
                    className={inputClass}
                    required
                  />
                </label>
              </div>

              <div className="flex items-start gap-2 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Informe a senha provisória ao profissional e oriente-o a trocá-la no perfil no primeiro acesso.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={fecharForm}
                  className="px-4 py-2 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {salvando ? "Salvando..." : "Cadastrar"}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO / Turno</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-4 text-gray-500">Carregando...</td></tr>
              ) : profissionais.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Nenhum profissional cadastrado.</td></tr>
              ) : (
                profissionais.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex px-3 py-0.5 rounded-full text-xs font-semibold border ${p.perfil === "Dentista"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                      >
                        {p.perfil}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.detalhe || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: null, message: null })} />
    </div>
  );
};

export default Profissionais;
