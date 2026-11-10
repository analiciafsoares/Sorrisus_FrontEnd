// src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import { listarPacientes } from "../../services/pacienteService.js";
import { listarDentistas } from "../../services/dentistaService.js";
import { listarConsultasPorDentista } from "../../services/consultaService.js";
import { Users, Calendar, UserCog, TrendingUp, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pacientesCount, setPacientesCount] = useState(null);
  const [dentistasCount, setDentistasCount] = useState(null);
  const [consultasCount, setConsultasCount] = useState(null);
  const [error, setError] = useState(null);
  const role = String(user?.role || "").toUpperCase();
  const podeVisualizarRetornos = [
    "ROLE_DENTISTA",
    "DENTISTA",
    "ROLE_RECEPCIONISTA",
    "RECEPCIONISTA",
  ].includes(role);

  const getCurrentUserId = () => {
    if (user?.id) return user.id;
    if (user?.userId) return user.userId;
    const fromStorage = localStorage.getItem("userId") || localStorage.getItem("id");
    if (fromStorage) return Number(fromStorage);
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.id) return parsed.id;
        if (parsed?.userId) return parsed.userId;
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    const getCountFromResponse = (res) => {
      if (!res || typeof res !== "object") return 0;
      const body = res.data;
      if (Array.isArray(body)) return body.length;
      if (body?.content && Array.isArray(body.content)) return body.content.length;
      if (Array.isArray(body?.data)) return body.data.length;
      if (typeof body?.totalElements === "number") return body.totalElements;
      if (typeof body?.total === "number") return body.total;
      if (typeof body?.length === "number") return body.length;
      return 0;
    };

    const fetchCounts = async () => {
      try {
        const [pRes, dRes] = await Promise.all([listarPacientes(), listarDentistas()]);
        if (!mounted) return;
        setPacientesCount(getCountFromResponse(pRes));
        setDentistasCount(getCountFromResponse(dRes));
      } catch (err) {
        console.error("Erro ao buscar contagens:", err);
        if (!mounted) return;
        setError("Erro ao carregar dados");
      }
    };

    const fetchConsultas = async () => {
      const userId = getCurrentUserId();
      if (!userId) {
        setConsultasCount(0);
        return;
      }
      try {
        const res = await listarConsultasPorDentista(userId);
        if (!mounted) return;
        const count = getCountFromResponse(res);
        setConsultasCount(count);
      } catch (err) {
        console.error("Erro ao buscar consultas do dentista:", err);
        if (!mounted) return;
        setConsultasCount(0);
      }
    };

    fetchCounts();
    fetchConsultas();

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema Sorrisus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pacientes</p>
                <p className="text-2xl font-bold text-gray-800">{pacientesCount ?? "-"}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Consultas</p>
                <p className="text-2xl font-bold text-gray-800">{consultasCount ?? "-"}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dentistas</p>
                <p className="text-2xl font-bold text-gray-800">{dentistasCount ?? "-"}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCog className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Taxa Ocupação</p>
                <p className="text-2xl font-bold text-gray-800">87%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => navigate("/pacientes")}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl shadow-md flex flex-col items-start text-left cursor-pointer transition-colors duration-200"
          >
            <Users className="w-8 h-8 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-1">Pacientes</h3>
            <p className="text-blue-100 text-sm">Gerenciar cadastro de pacientes</p>
          </div>

          <div
            onClick={() => navigate("/servicos")}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow-md flex flex-col items-start text-left cursor-pointer transition-colors duration-200"
          >
            <UserCog className="w-8 h-8 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-1">Serviços</h3>
            <p className="text-green-100 text-sm">Gerenciar serviços disponíveis</p>
          </div>

          <div
            onClick={() => navigate("/historico-consultas")}
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl shadow-md flex flex-col items-start text-left cursor-pointer transition-colors duration-200"
          >
            <Calendar className="w-8 h-8 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-1">Consultas</h3>
            <p className="text-purple-100 text-sm">Visualizar histórico de consultas</p>
          </div>
          {podeVisualizarRetornos && (
            <div
              onClick={() => navigate("/retornos-pendentes")}
              className="bg-amber-500 hover:bg-amber-600 text-white p-6 rounded-xl shadow-md flex flex-col items-start text-left cursor-pointer transition-colors duration-200"
            >
              <Clock className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-1">Retornos Pendentes</h3>
              <p className="text-amber-50 text-sm">Acompanhar pacientes com retorno pendente</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
