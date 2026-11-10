import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { login, setAuthData } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const validateEmail = (email) => {
    if (!email) return "O e-mail é obrigatório";
    if (!/\S+@\S+\.\S+/.test(email)) return "Digite um e-mail válido (exemplo@email.com)";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "A senha é obrigatória";
    if (password.length < 6) return "A senha deve ter no mínimo 6 caracteres";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");

    if (touched[name]) {
      if (name === "email") {
        setFieldErrors(prev => ({ ...prev, email: validateEmail(value) }));
      } else if (name === "password") {
        setFieldErrors(prev => ({ ...prev, password: validatePassword(value) }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    if (name === "email") {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(value) }));
    } else if (name === "password") {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(formData.email, formData.password);

      setAuthData(response);
      setUser({
        email: response.email,
        role: response.role
      });

      if (response.role === "ROLE_PACIENTE" || response.role === "PACIENTE") {
        navigate("/dashboard-paciente");
        return;
      } else if (response.role === "ROLE_DENTISTA" || response.role === "DENTISTA") {
        navigate("/dashboard-dentista");
        return;
      } else if (response.role === "ROLE_RECEPCIONISTA" || response.role === "RECEPCIONISTA") {
        navigate("/dashboard-dentista");
        return;
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError(
        err.response?.data?.message ||
        "Erro ao fazer login. Verifique suas credenciais e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <img src="/teeth.png" alt="Sorrisus" className="w-10 h-10 object-contain" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center">Sorrisus</h1>
            <p className="text-blue-100 text-center mt-2">Sistema Odontológico</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Bem-vindo de volta</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.email && touched.email ? 'text-red-500' : 'text-gray-400'
                    }`} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all outline-none ${fieldErrors.email && touched.email
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="seu@email.com"
                    disabled={loading}
                  />
                  {fieldErrors.email && touched.email && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {fieldErrors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>•</span> {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.password && touched.password ? 'text-red-500' : 'text-gray-400'
                    }`} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg transition-all outline-none ${fieldErrors.password && touched.password
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>•</span> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Lembrar-me e Esqueci senha */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="text-gray-700">Lembrar-me</span>
                </label>
                <Link
                  to="/recuperar-senha"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Esqueci minha senha
                </Link>
              </div>

              {/* Botão Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Ainda não tem acesso? Procure a recepção da clínica para fazer seu cadastro.
              <br />
              No primeiro acesso, troque a senha inicial no seu perfil.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 Sorrisus. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
