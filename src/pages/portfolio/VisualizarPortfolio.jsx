import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Clock, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { listarServicos } from '../../services/servicoService';
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const VisualizarPortfolio = () => {
    const [servicos, setServicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchServicosAtivos();
    }, []);

    const fetchServicosAtivos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await listarServicos();
            const dados = response.data;
            
            if (Array.isArray(dados)) {
                const dadosAtivos = dados.filter(s => s.ativo);
                setServicos(dadosAtivos);
            } else {
                console.warn("A API não retornou um array de serviços:", dados);
                setServicos([]);
            }
        } catch (err) {
            console.error("Erro detalhado ao carregar portfólio:", err);
            setError(err.response?.data?.message || "Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8080.");
        } finally {
            setLoading(false);
        }
    };

    const servicosFiltrados = servicos.filter(s =>
        s.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Carregando serviços...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />
            {/* Header com Gradiente */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 pt-16 pb-24 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
                        Nosso Portfólio de Procedimentos
                    </h1>
                    <div className="max-w-6xl mx-auto px-4 -mt-16 mb-6">
                        <button 
                            onClick={() => navigate("/")} 
                            className="flex items-center gap-2 text-white bg-blue-700/80 hover:bg-blue-900 px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Voltar
                        </button>
                    </div>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                        Confira abaixo nossos procedimentos odontológicos disponíveis.
                    </p>
                </div>
            </div>

            {/* Barra de Pesquisa */}
            <div className="max-w-4xl mx-auto -mt-8 px-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Pesquisar serviço..."
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 text-lg transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-12 px-4">
                {/* Estado de Erro */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-8">
                        <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
                        <h3 className="text-red-800 font-bold">Ops! Algo deu errado</h3>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                        <button 
                            onClick={fetchServicosAtivos}
                            className="mt-4 flex items-center gap-2 mx-auto bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                        >
                            <RefreshCw size={16} /> Tentar novamente
                        </button>
                    </div>
                )}

                {/* Grid de Serviços */}
                {!error && servicosFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {servicosFiltrados.map((servico) => (
                            <div 
                                key={servico.id} 
                                className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group"
                            >
                                <div className="p-1 bg-blue-50 group-hover:bg-blue-600 transition-colors duration-300 h-2"></div>
                                <div className="p-8 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                            <Sparkles size={24} />
                                        </div>
                                        <span className="text-2xl font-black text-blue-700">
                                            R$ {Number(servico.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                                        {servico.nome}
                                    </h3>
                                    
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                        {servico.descricao || "Descrição não informada."}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                                        <CheckCircle2 size={14} />
                                        Disponível
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !error && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-600">Nenhum serviço disponível</h3>
                        <p className="text-gray-400">Não encontramos serviços ativos no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualizarPortfolio;