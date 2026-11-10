import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { listarDentistas } from "../../services/dentistaService";
import { listarConsultasPorPaciente } from "../../services/consultaService";
import { listarServicos } from "../../services/servicoService";
import { UserCog, Calendar, ClipboardList } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getUserId } from "../../services/authService";

export default function DashboardPaciente() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dentistasCount, setDentistasCount] = useState(null);
  const [consultasCount, setConsultasCount] = useState(null);
  const [servicosCount, setServicosCount] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUserId = () => {
    if (user?.id) return user.id;
    if (user?.userId) return user.userId;
    const fromStorage = getUserId();
    if (fromStorage) return Number(fromStorage);
    return null;
  };

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const userId = getCurrentUserId();

        const [dRes, sRes] = await Promise.all([listarDentistas(), listarServicos()]);
        if (!mounted) return;
        setDentistasCount(getCountFromResponse(dRes));
        setServicosCount(getCountFromResponse(sRes));

        if (userId) {
          try {
            const cRes = await listarConsultasPorPaciente(userId);
            if (!mounted) return;
            setConsultasCount(getCountFromResponse(cRes));
          } catch (err) {
            console.error("Erro ao buscar consultas do paciente:", err);
            if (!mounted) return;
            setConsultasCount(0);
          }
        } else {
          setConsultasCount(0);
        }
      } catch (err) {
        console.error("Erro ao carregar dashboard do paciente:", err);
        if (!mounted) return;
        setDentistasCount(0);
        setServicosCount(0);
        setConsultasCount(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema Sorrisus</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dentistas</p>
                <p className="text-2xl font-bold text-gray-800">{loading ? "..." : dentistasCount ?? "-"}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCog className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate("/sobre-nos#corpo-clinico")}
                className="text-sm text-blue-600 hover:underline"
              >
                Ver dentistas
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Minhas Consultas</p>
                <p className="text-2xl font-bold text-gray-800">{loading ? "..." : consultasCount ?? "-"}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate("/agendamentos")}
                className="text-sm text-green-600 hover:underline"
              >
                Ver minhas consultas
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Procedimentos</p>
                <p className="text-2xl font-bold text-gray-800">{loading ? "..." : servicosCount ?? "-"}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate("/portfolio")}
                className="text-sm text-blue-600 hover:underline"
              >
                Ver procedimentos
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              onClick={() => navigate("/historico-consultas")}
              className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl shadow-md flex flex-col items-start cursor-pointer transition-colors duration-200"
            >
              <Calendar className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-1">Consultas</h3>
              <p className="text-purple-100 text-sm">Visualizar seu histórico de consultas</p>
            </div>
            <div
              onClick={() => navigate("/portfolio")}
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl shadow-md flex flex-col items-start cursor-pointer transition-colors duration-200"
            >
              <ClipboardList className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-1">Procedimentos</h3>
              <p className="text-green-100 text-sm">Ver os procedimentos oferecidos pela clínica</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
