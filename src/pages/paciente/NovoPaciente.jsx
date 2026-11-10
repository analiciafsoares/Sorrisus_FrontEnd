import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Toast from "../../components/Toast";
import { cadastrarPaciente } from "../../services/pacienteService";
import { ArrowLeft, Info, Save, User } from "lucide-react";

export default function NovoPaciente() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    dataNascimento: ""
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ type: null, message: null });

  useEffect(() => {
    const handler = () => {
      const formEl = document.getElementById("paciente-form");
      if (formEl) formEl.requestSubmit();
    };
    window.addEventListener("paciente:submit", handler);
    return () => window.removeEventListener("paciente:submit", handler);
  }, []);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.nome || form.nome.trim().length < 2) e.nome = "Nome é obrigatório (mínimo 2 caracteres).";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "E-mail inválido.";
    if (!form.cpf || form.cpf.replace(/\D/g, "").length < 11) e.cpf = "CPF inválido.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onlyDigits = (s) => (s || "").toString().replace(/\D/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ type: null, message: null });

    if (!validate()) {
      setToast({ type: "error", message: "Corrija os erros do formulário." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        cpf: onlyDigits(form.cpf),
        telefone: onlyDigits(form.telefone) || null,
        dataNascimento: form.dataNascimento || null
      };

      await cadastrarPaciente(payload);
      setToast({ type: "success", message: "Paciente cadastrado com sucesso." });

      setTimeout(() => navigate("/pacientes"), 700);
    } catch (err) {
      console.error("Erro ao cadastrar paciente:", err);
      const msg = err?.response?.data?.message || "Erro ao cadastrar paciente.";
      setToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <User className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Cadastrar Paciente</h1>
                <p className="text-sm text-gray-500">Preencha os dados do paciente</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/pacientes")}
                className="flex items-center gap-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
              >
                <ArrowLeft size={18} />
                Voltar
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow border border-gray-200 p-6">
          <form id="paciente-form" onSubmit={handleSubmit} className="space-y-6">
            {toast.message && (
              <div className={`px-4 py-2 rounded ${toast.type === "error" ? "bg-red-50 border border-red-200 text-red-700" : "bg-green-50 border border-green-200 text-green-800"}`}>
                {toast.message}
              </div>
            )}

            <div className="flex items-start gap-2 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                A senha inicial do paciente será o <strong>CPF (somente números)</strong>. Informe o paciente e
                oriente-o a trocá-la no perfil no primeiro acesso.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Nome</span>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${errors.nome ? "border-red-300" : "border-gray-200"} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="Nome completo"
                  required
                />
                {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">E-mail</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${errors.email ? "border-red-300" : "border-gray-200"} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="exemplo@dominio.com"
                  required
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">CPF</span>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => handleChange("cpf", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${errors.cpf ? "border-red-300" : "border-gray-200"} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="Somente números"
                  required
                />
                {errors.cpf && <p className="text-xs text-red-600 mt-1">{errors.cpf}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Telefone</span>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="(83) 99999-9999"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Data de nascimento</span>
              <input
                type="date"
                value={form.dataNascimento}
                onChange={(e) => handleChange("dataNascimento", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/pacientes")}
                className="px-4 py-2 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                {saving ? "Salvando..." : "Criar paciente"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: null, message: null })}
      />
    </div>
  );
}
