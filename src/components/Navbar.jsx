import { useAuth } from "../context/AuthContext.jsx"; import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Home, Users, Calendar, Power, ClipboardList, Info, Clock } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dashboardPath = useMemo(() => {
    if (!user || !user.role) return "/login";
    const role = String(user.role).toUpperCase();
    if (role.includes("PACIENTE")) return "/dashboard-paciente";
    return "/dashboard-dentista";
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const isPaciente = () => {
    if (!user || !user.role) return false;
    const role = String(user.role).toUpperCase();
    return role === "ROLE_PACIENTE" || role === "PACIENTE";
  };

  const podeVisualizarRetornos = () => {
    if (!user || !user.role) return false;
    const role = String(user.role).toUpperCase();
    return ["ROLE_DENTISTA", "DENTISTA", "ROLE_RECEPCIONISTA", "RECEPCIONISTA"].includes(role);
  };

  return (
    <>
      <nav className="bg-blue-600 shadow-sm border-b border-blue-700">
        <div className="w-full px-2 xl:px-5 2xl:px-8">
          <div className="flex h-16 flex-nowrap items-center">
            {/* Logo */}
            <Link
              to={dashboardPath}
              className="mr-3 flex shrink-0 items-center gap-3 xl:mr-6 2xl:mr-8"
            >
              <img src="/sorrisus.png" alt="Sorrisus" className="w-10 h-10 rounded-lg object-contain" />
              <span className="text-xl font-bold text-white">Sorrisus</span>
            </Link>

            {/* Menu */}
            <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-center gap-4 xl:gap-5 2xl:gap-7">
              <Link
                to={dashboardPath}
                className="flex shrink-0 items-center gap-1 whitespace-nowrap text-white hover:text-blue-200 transition-colors xl:gap-1.5 2xl:gap-2"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>

              {!isPaciente() && (
                <Link
                  to="/pacientes"
                  className="flex shrink-0 items-center gap-1 whitespace-nowrap text-white hover:text-blue-200 transition-colors xl:gap-1.5 2xl:gap-2"
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Pacientes</span>
                </Link>
              )}

              {podeVisualizarRetornos() && (
                <Link
                  to="/retornos-pendentes"
                  className="flex shrink-0 items-center gap-1 whitespace-nowrap text-white hover:text-blue-200 transition-colors xl:gap-1.5 2xl:gap-2"
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Retornos</span>
                </Link>
              )}

              <Link
                to="/agendamentos"
                className="flex shrink-0 items-center gap-1 whitespace-nowrap text-white hover:text-blue-200 transition-colors xl:gap-1.5 2xl:gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Agendamentos</span>
              </Link>

              <Link
                to="/portfolio"
                className="flex shrink-0 items-center gap-1 whitespace-nowrap text-white hover:text-blue-200 transition-colors xl:gap-1.5 2xl:gap-2"
              >
                <ClipboardList className="w-5 h-5" />
                <span className="font-medium">Procedimentos</span>
              </Link>

              <Link
                to="/sobre-nos"
                className="flex shrink-0 items-center gap-1 whitespace-nowrap text-white hover:text-blue-200 transition-colors xl:gap-1.5 2xl:gap-2"
              >
                <Info className="w-5 h-5" />
                <span className="font-medium">Sobre Nós</span>
              </Link>
            </div>

            {/* User Info e Logout */}
            <div className="ml-3 flex shrink-0 items-center gap-2 xl:ml-4 2xl:gap-4">
              <div
                role="button"
                tabIndex={0}
                title="Ver perfil"
                onClick={() => {
                  if (!user?.role) return;
                  navigate("/perfil");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                    e.preventDefault();
                    if (!user?.role) return;
                    navigate("/perfil");
                  }
                }}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-white/90 px-2 py-2 cursor-pointer 2xl:px-3"
              >
                <User className="w-5 h-5 text-gray-700" />
                <div className="hidden max-w-32 flex-col items-start xl:flex 2xl:max-w-40">
                  <span className="max-w-32 truncate text-sm font-medium text-gray-700 2xl:max-w-40">
                    {user?.email || "Usuário"}
                  </span>
                  {user?.role && (
                    <span className="text-xs text-gray-500">
                      {String(user.role).replace('ROLE_', '')}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={confirmLogout}
                title="Sair"
                aria-label="Sair do sistema"
                className="group flex shrink-0 items-center justify-center gap-2 rounded-lg p-2 text-red-600 transition-all hover:bg-red-50 hover:shadow-md 2xl:px-3"
              >
                <Power className="w-5 h-5 group-hover:animate-pulse" />
                <span className="hidden font-medium 2xl:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de Confirmação de Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center justify-center mb-3">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <LogOut className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center">Sair do Sistema</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 text-center mb-6">
                Tem certeza que deseja sair do sistema Sorrisus?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;
