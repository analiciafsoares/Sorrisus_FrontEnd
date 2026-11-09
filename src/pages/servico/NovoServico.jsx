// src/pages/servico/NovoServico.jsx
import ServicoForm from "./ServicoForm";
import Navbar from "../../components/Navbar";
import { Plus, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NovoServico() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Plus className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Novo Serviço</h1>
                <p className="text-sm text-gray-500">Cadastre um novo procedimento para a clínica</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/servicos")}
                className="flex items-center gap-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
              >
                Voltar
              </button>

              <button
                type="submit"
                form="servico-form"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md font-medium"
              >
                <Save size={16} />
                Salvar
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <ServicoForm />
        </div>
      </div>
    </div>
  );
}
