import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import PrivateRoute from "../components/PrivateRoute";
import Login from "../pages/auth/Login.jsx";
import ListarPaciente from "../pages/paciente/ListarPaciente.jsx";
import EditarPaciente from "../pages/paciente/EditarPaciente.jsx";
import Agendamento from "../pages/agendamento/Agendamento.jsx";
import CadastrarPaciente from "../pages/paciente/CadastrarPaciente.jsx";
import GerenciarPerfil from "../pages/perfil/GerenciarPerfil.jsx";
import Dashboard from "../pages/dashboard/DashboardDentista.jsx";
import AnamneseOdontograma from "../pages/dentista/AnamneseOdontograma.jsx";
import HistoricoConsultas from "../pages/consulta/HistoricoConsultas.jsx";
import RetornosPendentes from "../pages/consulta/RetornosPendentes.jsx";
import VisualizarPortfolio from "../pages/portfolio/VisualizarPortfolio.jsx";
import NovoAgendamento from "../pages/agendamento/NovoAgendamento.jsx"; import EditarAgendamento from "../pages/agendamento/EditarAgendamento.jsx";
import ServicoList from "../pages/servico/ServicoList.jsx";
import NovoServico from "../pages/servico/NovoServico.jsx";
import EditarServico from "../pages/servico/EditarServico.jsx";

import SobreNos from "../pages/SobreNos.jsx";
import NovoPaciente from "../pages/paciente/NovoPaciente.jsx";
import DashboardPaciente from "../pages/dashboard/DashboardPaciente.jsx";
import DashboardRedirect from "./DashboardRedirect.jsx";

const ROLES_GESTAO_SERVICOS = [
  "ROLE_DENTISTA",
  "DENTISTA",
  "ROLE_RECEPCIONISTA",
  "RECEPCIONISTA",
];

const ROLES_GESTAO_AGENDAMENTOS = ROLES_GESTAO_SERVICOS;

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/pacientes/cadastrar" element={<CadastrarPaciente />} />

          {/* Rotas Privadas */}
          <Route
            path="/dashboard-dentista"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard-paciente"
            element={
              <PrivateRoute>
                <DashboardPaciente />
              </PrivateRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <PrivateRoute>
                <VisualizarPortfolio />
              </PrivateRoute>
            }
          />
          <Route
            path="/pacientes"
            element={
              <PrivateRoute>
                <ListarPaciente />
              </PrivateRoute>
            }
          />
          <Route
            path="/pacientes/cadastrar/interno"
            element={
              <PrivateRoute>
                <NovoPaciente />
              </PrivateRoute>
            }
          />
          <Route
            path="/pacientes/editar/:id"
            element={
              <PrivateRoute>
                <EditarPaciente />
              </PrivateRoute>
            }
          />
          <Route
            path="/historico-consultas"
            element={
              <PrivateRoute>
                <HistoricoConsultas />
              </PrivateRoute>
            }
          />
          <Route
            path="/retornos-pendentes"
            element={
              <PrivateRoute>
                <RetornosPendentes />
              </PrivateRoute>
            }
          />
          <Route
            path="/dentista/anamnese/:consultaId"
            element={
              <PrivateRoute>
                <AnamneseOdontograma />
              </PrivateRoute>
            }
          />

          <Route
            path="/agendamentos"
            element={
              <PrivateRoute>
                <Agendamento />
              </PrivateRoute>
            }
          />
          <Route
            path="/agendamentos/novo"
            element={
              <PrivateRoute allowedRoles={ROLES_GESTAO_AGENDAMENTOS}>
                <NovoAgendamento />
              </PrivateRoute>
            }
          />
          <Route
            path="/agendamentos/editar/:id"
            element={
              <PrivateRoute allowedRoles={ROLES_GESTAO_AGENDAMENTOS}>
                <EditarAgendamento />
              </PrivateRoute>
            }
          />

          <Route
            path="/sobre-nos"
            element={
              <PrivateRoute>
                <SobreNos />
              </PrivateRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <GerenciarPerfil />
              </PrivateRoute>
            }
          />

          <Route
            path="/servicos"
            element={
              <PrivateRoute allowedRoles={ROLES_GESTAO_SERVICOS}>
                <ServicoList />
              </PrivateRoute>
            }
          />
          <Route
            path="/servicos/novo"
            element={
              <PrivateRoute allowedRoles={ROLES_GESTAO_SERVICOS}>
                <NovoServico />
              </PrivateRoute>
            }
          />
          <Route
            path="/servicos/editar/:id"
            element={
              <PrivateRoute allowedRoles={ROLES_GESTAO_SERVICOS}>
                <EditarServico />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<DashboardRedirect />} />
          <Route path="*" element={<DashboardRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
