import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, KeyRound, Loader2, Pencil, Save, UserCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import { getUserId, getRole, alterarSenha } from "../../services/authService";
import {
  buscarPacientePorId,
  atualizarPaciente,
} from "../../services/pacienteService";
import {
  buscarDentistaPorId,
  atualizarDentista,
} from "../../services/dentistaService";
import {
  buscarRecepcionistaPorId,
  atualizarRecepcionista,
} from "../../services/recepcionistaService";

const ROLES = {
  ROLE_PACIENTE: { label: "Paciente", buscar: buscarPacientePorId, atualizar: atualizarPaciente },
  ROLE_DENTISTA: { label: "Dentista", buscar: buscarDentistaPorId, atualizar: atualizarDentista },
  ROLE_RECEPCIONISTA: { label: "Recepcionista", buscar: buscarRecepcionistaPorId, atualizar: atualizarRecepcionista },
};

const TURNOS = [
  { value: "MANHA", label: "Manhã" },
  { value: "TARDE", label: "Tarde" },
  { value: "NOITE", label: "Noite" },
];

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

const somenteDigitos = (value) => (value ? String(value).replace(/\D/g, "") : "");

const formatCpf = (value) => {
  const digits = somenteDigitos(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d+)/, "$1.$2");
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2}).*/, "$1.$2.$3-$4");
};

const formatPhone = (value) => {
  const digits = somenteDigitos(value);
  if (digits.length <= 2) return digits;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (digits.length === 11) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  return `(${ddd}) ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
};

// Recebe "AAAA-MM-DD" (ou ISO com horário) e devolve "DD/MM/AAAA".
const formatDate = (value) => {
  if (!value || typeof value !== "string") return "";
  const [ano, mes, dia] = value.split("T")[0].split("-");
  return dia ? `${dia}/${mes}/${ano}` : value;
};

const formatTurno = (value) => TURNOS.find((t) => t.value === value)?.label || value;

const montarForm = (role, data) => {
  const base = { nome: data.nome || "", email: data.email || "" };
  if (role === "ROLE_PACIENTE") {
    return {
      ...base,
      cpf: formatCpf(data.cpf),
      telefone: formatPhone(data.telefone),
      dataNascimento: data.dataNascimento || "",
    };
  }
  if (role === "ROLE_DENTISTA") {
    return { ...base, cro: data.cro || "", especialidade: data.especialidade || "" };
  }
  return { ...base, turno: data.turno || "" };
};

const iniciais = (nome) =>
  (nome || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");

function Campo({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{children || "-"}</dd>
    </div>
  );
}

function Rotulo({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

const SENHA_VAZIA = { senhaAtual: "", novaSenha: "", confirmacao: "" };

function AlterarSenha() {
  const [form, setForm] = useState(SENHA_VAZIA);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ type: null, text: "" });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.novaSenha.length < 6) {
      setMensagem({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }
    if (form.novaSenha !== form.confirmacao) {
      setMensagem({ type: "error", text: "A confirmação não confere com a nova senha." });
      return;
    }
    setSalvando(true);
    try {
      await alterarSenha(form.senhaAtual, form.novaSenha);
      setForm(SENHA_VAZIA);
      setMensagem({ type: "success", text: "Senha alterada com sucesso!" });
    } catch (error) {
      setMensagem({
        type: "error",
        text: error.response?.data?.message || "Não foi possível alterar a senha. Tente novamente.",
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-1">
        <KeyRound className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">Alterar senha</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Se a sua conta foi criada pela clínica, troque a senha inicial no primeiro acesso.
      </p>

      {mensagem.text && (
        <div
          role="status"
          className={`mb-4 px-4 py-2 rounded ${
            mensagem.type === "error"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-800"
          }`}
        >
          {mensagem.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Rotulo label="Senha atual">
            <input type="password" name="senhaAtual" value={form.senhaAtual} onChange={handleChange} autoComplete="current-password" className={inputClass} required />
          </Rotulo>
          <Rotulo label="Nova senha">
            <input type="password" name="novaSenha" value={form.novaSenha} onChange={handleChange} autoComplete="new-password" minLength={6} className={inputClass} required />
          </Rotulo>
          <Rotulo label="Confirmar nova senha">
            <input type="password" name="confirmacao" value={form.confirmacao} onChange={handleChange} autoComplete="new-password" minLength={6} className={inputClass} required />
          </Rotulo>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={salvando}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <KeyRound size={18} />
            {salvando ? "Salvando..." : "Alterar senha"}
          </button>
        </div>
      </form>
    </section>
  );
}

const GerenciarPerfil = () => {
  const userId = getUserId();
  const role = getRole();
  const config = ROLES[role];
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [form, setForm] = useState({});
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [mensagem, setMensagem] = useState({ type: null, text: "" });

  useEffect(() => {
    if (!userId || !config) {
      setLoading(false);
      return;
    }
    const carregar = async () => {
      try {
        const res = await config.buscar(userId);
        setData(res.data);
        setForm(montarForm(role, res.data));
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setErroCarregamento(
          err?.response?.data?.message || "Não foi possível carregar o seu perfil. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [userId, role, config]);

  useEffect(() => {
    if (!mensagem.text) return;
    const timer = setTimeout(() => setMensagem({ type: null, text: "" }), 4000);
    return () => clearTimeout(timer);
  }, [mensagem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cpf") {
      setForm((prev) => ({ ...prev, cpf: formatCpf(value) }));
    } else if (name === "telefone") {
      setForm((prev) => ({ ...prev, telefone: formatPhone(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCancel = () => {
    setForm(montarForm(role, data));
    setEditando(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload =
        role === "ROLE_PACIENTE"
          ? { ...form, cpf: somenteDigitos(form.cpf), telefone: somenteDigitos(form.telefone) }
          : form;
      const res = await config.atualizar(userId, payload);
      setData(res.data);
      setForm(montarForm(role, res.data));
      setEditando(false);
      setMensagem({ type: "success", text: "Perfil atualizado com sucesso!" });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error.response?.data || error);
      setMensagem({
        type: "error",
        text: error.response?.data?.message || "Erro ao atualizar perfil. Verifique os dados.",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderConteudo = () => {
    if (loading) {
      return (
        <div className="py-10 text-center text-gray-500">
          <div className="inline-flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Carregando perfil...
          </div>
        </div>
      );
    }

    if (!userId || !config || erroCarregamento || !data) {
      return (
        <div className="py-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Perfil indisponível</h2>
          <p className="text-sm text-gray-600">
            {erroCarregamento || "Não foi possível identificar o usuário. Faça login novamente."}
          </p>
        </div>
      );
    }

    if (editando) {
      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Rotulo label="Nome">
              <input name="nome" value={form.nome} onChange={handleChange} className={inputClass} required />
            </Rotulo>
            <Rotulo label="E-mail">
              <input
                type="email"
                name="email"
                value={form.email}
                readOnly
                className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
              />
              <span className="text-xs text-gray-500 mt-1 block">
                O e-mail é usado para login e não pode ser alterado aqui.
              </span>
            </Rotulo>

            {role === "ROLE_PACIENTE" && (
              <>
                <Rotulo label="CPF">
                  <input name="cpf" value={form.cpf} onChange={handleChange} inputMode="numeric" className={inputClass} required />
                </Rotulo>
                <Rotulo label="Telefone">
                  <input name="telefone" value={form.telefone} onChange={handleChange} inputMode="tel" className={inputClass} required />
                </Rotulo>
                <Rotulo label="Data de nascimento">
                  <input type="date" name="dataNascimento" value={form.dataNascimento} onChange={handleChange} className={inputClass} />
                </Rotulo>
              </>
            )}

            {role === "ROLE_DENTISTA" && (
              <>
                <Rotulo label="CRO">
                  <input name="cro" value={form.cro} onChange={handleChange} placeholder="Ex: 12345-PB" className={inputClass} required />
                </Rotulo>
                <Rotulo label="Especialidade">
                  <input name="especialidade" value={form.especialidade} onChange={handleChange} className={inputClass} required />
                </Rotulo>
              </>
            )}

            {role === "ROLE_RECEPCIONISTA" && (
              <Rotulo label="Turno">
                <select name="turno" value={form.turno} onChange={handleChange} className={inputClass} required>
                  <option value="" disabled>Selecione</option>
                  {TURNOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </Rotulo>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-semibold">
            {iniciais(data.nome)}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{data.nome}</p>
            <span className="inline-flex mt-1 px-3 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold">
              {config.label}
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <Campo label="Nome">{data.nome}</Campo>
          <Campo label="E-mail">{data.email}</Campo>
          {role === "ROLE_PACIENTE" && (
            <>
              <Campo label="CPF">{formatCpf(data.cpf)}</Campo>
              <Campo label="Telefone">{formatPhone(data.telefone)}</Campo>
              <Campo label="Data de nascimento">{formatDate(data.dataNascimento)}</Campo>
            </>
          )}
          {role === "ROLE_DENTISTA" && (
            <>
              <Campo label="CRO">{data.cro}</Campo>
              <Campo label="Especialidade">{data.especialidade}</Campo>
            </>
          )}
          {role === "ROLE_RECEPCIONISTA" && <Campo label="Turno">{formatTurno(data.turno)}</Campo>}
        </dl>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Pencil size={18} />
            Editar perfil
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Gerenciar Perfil</h1>
              <p className="text-sm text-gray-500">
                {editando ? "Atualize os seus dados cadastrais" : "Visualize os seus dados cadastrais"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="self-start sm:self-auto flex items-center gap-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        </div>

        {mensagem.text && (
          <div
            role="status"
            className={`mb-4 px-4 py-2 rounded ${
              mensagem.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-800"
            }`}
          >
            {mensagem.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">{renderConteudo()}</div>

        {!loading && data && <AlterarSenha />}
      </main>
    </div>
  );
};

export default GerenciarPerfil;
