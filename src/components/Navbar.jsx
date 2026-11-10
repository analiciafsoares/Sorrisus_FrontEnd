import { useAuth } from "../context/AuthContext.jsx"; import { useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, User, Home, Users, Calendar, Power, ClipboardList, Info, Clock, Menu, X } from "lucide-react";
import { useState } from "react";

const ROLE_LABELS = {
  ROLE_DENTISTA: "Dentista",
  ROLE_RECEPCIONISTA: "Recepcionista",
  ROLE_PACIENTE: "Paciente",
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const role = String(user?.role || "").toUpperCase();
  const isPaciente = role === "ROLE_PACIENTE" || role === "PACIENTE";
  const podeVisualizarRetornos = ["ROLE_DENTISTA", "DENTISTA", "ROLE_RECEPCIONISTA", "RECEPCIONISTA"].includes(role);
  const roleLabel = ROLE_LABELS[role] || ROLE_LABELS[`ROLE_${role}`] || role.replace("ROLE_", "");

  const dashboardPath = useMemo(() => {
    if (!role) return "/login";
    if (role.includes("PACIENTE")) return "/dashboard-paciente";
    return "/dashboard-dentista";
  }, [role]);

  const itensMenu = [
    { to: dashboardPath, label: "Dashboard", Icone: Home },
    { to: "/pacientes", label: "Pacientes", Icone: Users, visivel: !isPaciente },
    { to: "/retornos-pendentes", label: "Retornos", Icone: Clock, visivel: podeVisualizarRetornos },
    { to: "/agendamentos", label: "Agendamentos", Icone: Calendar },
    { to: "/portfolio", label: "Procedimentos", Icone: ClipboardList },
    { to: "/sobre-nos", label: "Sobre Nós", Icone: Info },
  ].filter((item) => item.visivel !== false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const confirmLogout = () => {
    setMenuAberto(false);
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const irParaPerfil = () => {
    if (!user?.role) return;
    setMenuAberto(false);
    navigate("/perfil");
  };

  const classeItemDesktop = ({ isActive }) =>
    `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition-colors xl:gap-2 xl:px-3 xl:text-[15px] ${
      isActive ? "bg-white/15 text-white" : "text-blue-50 hover:bg-white/10 hover:text-white"
    }`;

  const classeItemMobile = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors ${
      isActive ? "bg-white/15 text-white" : "text-blue-50 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <>
      <nav className="relative bg-blue-600 shadow-sm border-b border-blue-700">
        <div className="w-full px-3 sm:px-4 xl:px-6">
          <div className="flex h-16 flex-nowrap items-center justify-between gap-3">
            {/* Logo */}
            <Link to={dashboardPath} className="flex shrink-0 items-center gap-2.5">
              <img
                src="/sorrisus-icone.png"
                alt=""
                className="h-10 w-10 rounded-xl object-cover shadow-sm ring-2 ring-white/70"
              />
              <span className="text-xl font-bold tracking-tight text-white">Sorrisus</span>
            </Link>

            {/* Menu (telas largas) */}
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex xl:gap-2">
              {itensMenu.map((item) => (
                <NavLink key={item.to} to={item.to} className={classeItemDesktop}>
                  <item.Icone className="h-4 w-4 xl:h-5 xl:w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* User Info e Logout */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                title="Ver perfil"
                onClick={irParaPerfil}
                className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-1 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white xl:pr-4"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <User className="h-5 w-5" />
                </span>
                <span className="hidden max-w-36 flex-col items-start leading-tight xl:flex">
                  <span className="max-w-36 truncate text-sm font-semibold text-gray-800">
                    {user?.email || "Usuário"}
                  </span>
                  {roleLabel && <span className="text-xs text-gray-500">{roleLabel}</span>}
                </span>
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                title="Sair"
                aria-label="Sair do sistema"
                className="flex h-10 items-center justify-center gap-2 rounded-lg px-2.5 text-white transition-colors hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Power className="h-5 w-5" />
                <span className="hidden text-sm font-medium 2xl:inline">Sair</span>
              </button>

              <button
                type="button"
                onClick={() => setMenuAberto((aberto) => !aberto)}
                aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
                aria-expanded={menuAberto}
                aria-controls="menu-mobile"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden"
              >
                {menuAberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu (telas estreitas) */}
        {menuAberto && (
          <div id="menu-mobile" className="border-t border-blue-500 bg-blue-600 px-3 pb-3 pt-2 shadow-lg lg:hidden">
            {roleLabel && (
              <p className="px-3 pb-2 text-xs text-blue-100">
                {user?.email} · {roleLabel}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {itensMenu.map((item) => (
                <NavLink key={item.to} to={item.to} className={classeItemMobile} onClick={() => setMenuAberto(false)}>
                  <item.Icone className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
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
