import { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Stethoscope, FileText, Pill, Heart, AlertTriangle, MessageSquare,
    ClipboardList, ArrowLeft, CheckCircle
} from 'lucide-react';
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import ConfirmModal from '../../components/ConfirmModal';
import { buscarConsultaPorId, finalizarConsulta } from '../../services/consultaService';
import { salvarProntuario, buscarProntuarioPorConsulta } from '../../services/prontuarioService';
import { buscarPacientePorId } from '../../services/pacienteService';
import { buscarAnamnesePorPaciente } from '../../services/anamneseService';
import { carregarFichaClinica } from './fichaClinicaLoader';
import {
    criarPayloadFichaClinica,
    criarSnapshotFichaClinica,
    podeFinalizarFichaClinica,
    possuiAlteracoesNaoSalvas,
} from './fichaClinicaState';

// --- HELPER COMPONENTS ---

const InputIcon = ({ icon: Icon, placeholder, type, name, value, onChange, error, label, ...props }) => {
    const iconClasses = "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400";
    const inputClasses = `w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ${
        error ? "border-red-500" : "border-gray-300"
    }`;

    return (
        <div className="relative">
            <div className={iconClasses}>
                <Icon className="w-5 h-5" />
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={inputClasses}
                {...props}
            />
        </div>
    );
};

const RadioQuestion = ({ name, question, value, onChange, Icon, notesPlaceholder }) => (
    <div className="flex flex-col space-y-2 border-b border-gray-200 py-3">
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <label className="text-gray-700 font-medium flex-grow">
                {question}
            </label>
            <div className="flex space-x-4 flex-shrink-0">
                <label className="flex items-center text-sm text-gray-600">
                    <input
                        type="radio"
                        name={`${name}.resposta`}
                        value="Sim"
                        checked={value.resposta === "Sim"}
                        onChange={onChange}
                        className="mr-1 text-blue-600 focus:ring-blue-500"
                    />
                    Sim
                </label>
                <label className="flex items-center text-sm text-gray-600">
                    <input
                        type="radio"
                        name={`${name}.resposta`}
                        value="Não"
                        checked={value.resposta === "Não"}
                        onChange={onChange}
                        className="mr-1 text-blue-600 focus:ring-blue-500"
                    />
                    Não
                </label>
            </div>
        </div>
        {value.resposta === "Sim" && (
            <textarea
                name={`${name}.notas`}
                value={value.notas}
                onChange={onChange}
                placeholder={notesPlaceholder || "Detalhe a informação aqui (Qual? Qual(is)?...)"}
                rows="2"
                className="w-full p-2 mt-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
        )}
    </div>
);


// --- ODONTOGRAMA LOGIC & COMPONENT ---

const permanentTeeth = [
    ...[8, 7, 6, 5, 4, 3, 2, 1].map(n => ({ id: `1${n}`, quadrant: 'SUP DIR' })),
    ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ id: `2${n}`, quadrant: 'SUP ESQ' })),
    ...[8, 7, 6, 5, 4, 3, 2, 1].map(n => ({ id: `4${n}`, quadrant: 'INF DIR' })),
    ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ id: `3${n}`, quadrant: 'INF ESQ' })),
];

const conditionColors = {
    healthy: 'fill-white stroke-gray-400',
    decayed: 'fill-red-500 stroke-red-700',
    missing: 'fill-gray-500 stroke-gray-700', 
    treated: 'fill-green-500 stroke-green-700', 
};

const Tooth = React.memo(({ id, condition, onConditionChange }) => {
    const colors = conditionColors[condition] || conditionColors.healthy;
    const isMissing = condition === 'missing';

    const handleClick = () => {
        const states = ['healthy', 'decayed', 'treated', 'missing'];
        const currentIndex = states.indexOf(condition);
        const nextIndex = (currentIndex + 1) % states.length;
        onConditionChange(id, states[nextIndex]);
    };

    return (
        <div 
            className={`flex flex-col items-center cursor-pointer transition-transform duration-150 hover:scale-105 mx-1 ${isMissing ? 'opacity-50' : ''}`}
            onClick={handleClick}
            title={`Dente ${id} - Clique para mudar o status: ${condition}`}
        >
            <svg width="30" height="30" viewBox="0 0 30 30" className="flex-shrink-0">
                <rect x="5" y="5" width="20" height="20" rx="4" className={`${colors} stroke-2`} />
                {isMissing && (
                    <>
                        <line x1="5" y1="5" x2="25" y2="25" className="stroke-white stroke-2" />
                        <line x1="25" y1="5" x2="5" y2="25" className="stroke-white stroke-2" />
                    </>
                )}
            </svg>
            <span className="text-sm font-semibold text-gray-700 mt-1">{id}</span>
        </div>
    );
});

const Odontogram = ({ odontogramState, onConditionChange }) => {
    const renderTeeth = useCallback((quadrants, isTop) => (
        <div className={`flex justify-center w-full ${isTop ? 'flex-col' : 'flex-col-reverse'}`}>
            <div className="flex justify-center">
                {permanentTeeth
                    .filter(t => t.quadrant === quadrants[0])
                    .reverse() 
                    .map(t => (
                        <Tooth key={t.id} id={t.id} condition={odontogramState[t.id]} onConditionChange={onConditionChange} />
                    ))}
                {permanentTeeth
                    .filter(t => t.quadrant === quadrants[1])
                    .map(t => (
                        <Tooth key={t.id} id={t.id} condition={odontogramState[t.id]} onConditionChange={onConditionChange} />
                    ))}
            </div>
        </div>
    ), [odontogramState, onConditionChange]);

    return (
        <div className="w-full">
            <div className="flex justify-between text-sm font-bold text-gray-700 mb-2 mt-4 px-2">
                <span>MAXILAR SUPERIOR</span>
            </div>
            {renderTeeth(['SUP DIR', 'SUP ESQ'], true)}

            <div className="h-0.5 bg-gray-300 my-2 w-full"></div>

            <div className="flex justify-between text-sm font-bold text-gray-700 mb-2 mt-4 px-2">
                <span>MAXILAR INFERIOR</span>
            </div>
            {renderTeeth(['INF DIR', 'INF ESQ'], false)}

            <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Legenda Odontograma</h4>
                <div className="flex flex-wrap gap-4 text-sm font-medium">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-gray-400 rounded-sm"></div> Saudável</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-sm"></div> Cárie / Patologia</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-sm"></div> Restaurado / Tratado</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-500 rounded-sm flex items-center justify-center"><div className="h-0.5 w-3 bg-white rotate-45"></div><div className="h-0.5 w-3 bg-white -rotate-45 absolute"></div></div> Ausente</div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

const FichaClinica = () => {
    const { consultaId } = useParams();
    const navigate = useNavigate();

    // Estados para mensagem de feedback
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");

    // Estado da consulta, usado para habilitar a finalização do atendimento
    const [statusConsulta, setStatusConsulta] = useState(null);
    const [dataHoraConsulta, setDataHoraConsulta] = useState(null);
    const [confirmarFinalizacao, setConfirmarFinalizacao] = useState(false);
    const [finalizando, setFinalizando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState(false);
    const [ultimoSnapshotSalvo, setUltimoSnapshotSalvo] = useState(null);

    const [fichaClinica, setFichaClinica] = useState({
        pacienteId: "",
        pacienteNome: "Carregando...",
        indicador: "",
        alergia: { resposta: "Não", notas: "" },
        antibiotico: { resposta: "Não", notas: "" },
        anestesico: { resposta: "Não", notas: "" },
        sensibilidade: { resposta: "Não", notas: "" },
        pressao: { resposta: "Não", notas: "" },
        medicamento: { resposta: "Não", notas: "" },
        problemaSaude: { resposta: "Não", notas: "" },
        observacoes: "",
        planoTratamento: "",
    });

    const initialOdontogramState = useMemo(() => {
        return permanentTeeth.reduce((acc, tooth) => {
            acc[tooth.id] = 'healthy';
            return acc;
        }, {});
    }, []);

    const [odontogramState, setOdontogramState] = useState(initialOdontogramState);

    const hasUnsavedChanges = useMemo(
        () => possuiAlteracoesNaoSalvas(
            fichaClinica,
            odontogramState,
            ultimoSnapshotSalvo
        ),
        [fichaClinica, odontogramState, ultimoSnapshotSalvo]
    );

    useEffect(() => {
        if (!consultaId) {
            setCarregando(false);
            setErroCarregamento(true);
            setMensagem("Erro: ID da consulta não encontrado.");
            setTipoMensagem("danger");
            return;
        }

        let ativo = true;

        async function carregarDadosCompletos() {
            setCarregando(true);
            setErroCarregamento(false);
            setMensagem("");
            setTipoMensagem("");
            setStatusConsulta(null);
            setDataHoraConsulta(null);
            setOdontogramState(initialOdontogramState);
            setUltimoSnapshotSalvo(null);

            try {
                const dados = await carregarFichaClinica({
                    consultaId,
                    buscarConsultaPorId,
                    buscarPacientePorId,
                    buscarAnamnesePorPaciente,
                    buscarProntuarioPorConsulta,
                });

                if (!ativo) return;

                const dadosAnamnese = dados.anamnese;
                const dadosProntuario = dados.prontuario;

                setStatusConsulta(dados.consulta.status);
                setDataHoraConsulta(dados.consulta.dataHora);
                const fichaCarregada = {
                    pacienteId: dados.consulta.pacienteId,
                    pacienteNome: dados.paciente?.nome ?? "Paciente não identificado",
                    indicador: "",
                    alergia: {
                        resposta: dadosAnamnese?.alergiaResposta ?? "Não",
                        notas: dadosAnamnese?.alergiaNotas ?? "",
                    },
                    antibiotico: {
                        resposta: dadosAnamnese?.antibioticoResposta ?? "Não",
                        notas: dadosAnamnese?.antibioticoNotas ?? "",
                    },
                    anestesico: {
                        resposta: dadosAnamnese?.anestesicoResposta ?? "Não",
                        notas: dadosAnamnese?.anestesicoNotas ?? "",
                    },
                    sensibilidade: {
                        resposta: dadosAnamnese?.sensibilidadeResposta ?? "Não",
                        notas: dadosAnamnese?.sensibilidadeNotas ?? "",
                    },
                    pressao: {
                        resposta: dadosAnamnese?.pressaoResposta ?? "Não",
                        notas: dadosAnamnese?.pressaoNotas ?? "",
                    },
                    medicamento: {
                        resposta: dadosAnamnese?.medicamentoResposta ?? "Não",
                        notas: dadosAnamnese?.medicamentoNotas ?? "",
                    },
                    problemaSaude: {
                        resposta: dadosAnamnese?.problemaSaudeResposta ?? "Não",
                        notas: dadosAnamnese?.problemaSaudeNotas ?? "",
                    },
                    observacoes: dadosProntuario?.observacoes ?? "",
                    planoTratamento: dadosProntuario?.planoTratamento ?? "",
                };

                let odontogramaCarregado = { ...initialOdontogramState };

                if (dadosProntuario?.odontogramaJson) {
                    try {
                        odontogramaCarregado = {
                            ...initialOdontogramState,
                            ...JSON.parse(dadosProntuario.odontogramaJson),
                        };
                    } catch (error) {
                        console.error("Erro ao ler JSON do odontograma", error);
                    }
                }

                setFichaClinica(fichaCarregada);
                setOdontogramState(odontogramaCarregado);
                setUltimoSnapshotSalvo(
                    criarSnapshotFichaClinica(fichaCarregada, odontogramaCarregado)
                );
            } catch (error) {
                if (!ativo) return;

                console.error("Erro crítico ao carregar tela:", error);
                setErroCarregamento(true);
                setMensagem(
                    error?.response?.data?.message
                    ?? error?.response?.data?.erro
                    ?? "Erro ao carregar dados clínicos. Tente novamente."
                );
                setTipoMensagem("danger");
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarDadosCompletos();

        return () => {
            ativo = false;
        };
    }, [consultaId, initialOdontogramState]);

    const handleFichaClinicaChange = (e) => {
        const { name, value } = e.target;
        const parts = name.split('.');

        if (parts.length === 2) {
            setFichaClinica(prev => ({
                ...prev,
                [parts[0]]: {
                    ...prev[parts[0]],
                    [parts[1]]: value,
                },
            }));
        } else {
            setFichaClinica(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleOdontogramChange = useCallback((toothId, newCondition) => {
        setOdontogramState(prev => ({
            ...prev,
            [toothId]: newCondition,
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Limpa mensagens anteriores
        setMensagem("");
        setTipoMensagem("");

        if (!consultaId) {
            setMensagem("Erro: ID da consulta não encontrado.");
            setTipoMensagem("danger");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (carregando || erroCarregamento) {
            setMensagem("A ficha clínica não pode ser salva porque os dados não foram carregados corretamente.");
            setTipoMensagem("danger");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (salvando || finalizando) return;

        const payload = criarPayloadFichaClinica(fichaClinica, odontogramState);
        const snapshotEnviado = JSON.stringify(payload);

        setSalvando(true);
        try {
            await salvarProntuario(payload, consultaId);

            setUltimoSnapshotSalvo(snapshotEnviado);
            setMensagem("Ficha clínica salva com sucesso!");
            setTipoMensagem("success");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error(error);
            setMensagem("Erro ao salvar a ficha clínica. Tente novamente.");
            setTipoMensagem("danger");
            window.scrollTo({ top: 0, behavior: 'smooth' });

            setTimeout(() => {
                setMensagem("");
                setTipoMensagem("");
            }, 10000);
        } finally {
            setSalvando(false);
        }
    };

    const horarioChegou = dataHoraConsulta && new Date(dataHoraConsulta) <= new Date();

    const exibirAvisoAlteracoesNaoSalvas = () => {
        setMensagem("Existem alterações não salvas na ficha clínica. Salve a ficha antes de finalizar o atendimento.");
        setTipoMensagem("danger");
        setConfirmarFinalizacao(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const solicitarFinalizacao = () => {
        if (hasUnsavedChanges) {
            exibirAvisoAlteracoesNaoSalvas();
            return;
        }

        if (!podeFinalizarFichaClinica({
            hasUnsavedChanges,
            carregando,
            erroCarregamento,
            salvando,
            finalizando,
        })) return;

        setConfirmarFinalizacao(true);
    };

    const handleFinalizar = async () => {
        if (hasUnsavedChanges) {
            exibirAvisoAlteracoesNaoSalvas();
            return;
        }

        if (salvando || finalizando) {
            setMensagem("Aguarde a conclusão da operação atual antes de finalizar o atendimento.");
            setTipoMensagem("danger");
            setConfirmarFinalizacao(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (carregando || erroCarregamento) {
            setMensagem("O atendimento não pode ser finalizado porque os dados clínicos não foram carregados corretamente.");
            setTipoMensagem("danger");
            setConfirmarFinalizacao(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setFinalizando(true);
        try {
            const res = await finalizarConsulta(consultaId);
            setStatusConsulta(res.data?.status || "REALIZADA");
            setMensagem("Atendimento finalizado. A consulta foi registrada como realizada.");
            setTipoMensagem("success");
        } catch (error) {
            console.error(error);
            setMensagem(error?.response?.data?.message || "Erro ao finalizar o atendimento.");
            setTipoMensagem("danger");
        } finally {
            setFinalizando(false);
            setConfirmarFinalizacao(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4 font-sans">
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-xl p-6 sm:p-10 relative">
                
                {/* BOTÃO VOLTAR */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar
                </button>

                <header className="text-center mb-8 pb-4 border-b-2 border-blue-500">
                    <ClipboardList className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                    <h1 className="text-3xl font-extrabold text-gray-800">Ficha Clínica</h1>
                    <p className="text-gray-600 mt-2">Paciente: <span className="font-semibold">{fichaClinica.pacienteNome}</span></p>
                </header>

                {/* EXIBIÇÃO DE MENSAGENS (ERRO/SUCESSO) */}
                {mensagem && (
                    <div
                        className={`mb-6 text-center py-3 rounded-lg text-white font-medium shadow-sm ${
                            tipoMensagem === "success" ? "bg-green-600" : "bg-red-500"
                        }`}
                    >
                        {mensagem}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* 1. INFORMAÇÕES BÁSICAS DO ATENDIMENTO */}
                    <section className="p-6 border border-gray-200 rounded-xl shadow-sm bg-blue-50/50 space-y-4">
                        <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                            <FileText className="w-6 h-6" /> Dados do Atendimento
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                                <InputIcon 
                                    icon={() => null} 
                                    type="text" 
                                    name="pacienteNome" 
                                    value={fichaClinica.pacienteNome} 
                                    disabled 
                                    placeholder="Busque pelo paciente..." 
                                    className="!pl-3 !pr-3 bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Indicado por</label>
                                <InputIcon 
                                    icon={() => null} 
                                    type="text" 
                                    name="indicador" 
                                    value={fichaClinica.indicador} 
                                    onChange={handleFichaClinicaChange} 
                                    placeholder="Nome ou convênio" 
                                    className="!pl-3 !pr-3"
                                />
                            </div>
                        </div>
                    </section>


                    {/* 2. ANAMNESE DO PACIENTE */}
                    <section className="p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                            <Stethoscope className="w-6 h-6 text-red-500" /> Anamnese do Paciente
                        </h2>
                        <p className="text-sm text-gray-500">
                            Informações clínicas gerais do paciente. Revise e atualize quando necessário.
                        </p>
                        
                        <RadioQuestion 
                            name="alergia" 
                            question="Tem alergia a algum medicamento?" 
                            value={fichaClinica.alergia} 
                            onChange={handleFichaClinicaChange} 
                            Icon={AlertTriangle}
                            notesPlaceholder="Qual/Quais? (Ex: Penicilina, Látex)"
                        />
                        <RadioQuestion 
                            name="antibiotico" 
                            question="Tem alergia a Antibiótico?" 
                            value={fichaClinica.antibiotico} 
                            onChange={handleFichaClinicaChange} 
                            Icon={Pill}
                        />
                        <RadioQuestion 
                            name="anestesico" 
                            question="Tem alergia a Anestésico? Qual(is)?" 
                            value={fichaClinica.anestesico} 
                            onChange={handleFichaClinicaChange} 
                            Icon={Pill}
                        />
                        <RadioQuestion 
                            name="sensibilidade" 
                            question="Sensibilidade a algum medicamento?" 
                            value={fichaClinica.sensibilidade} 
                            onChange={handleFichaClinicaChange} 
                            Icon={Pill}
                        />
                        <RadioQuestion 
                            name="pressao" 
                            question="Sua pressão sanguínea é alta?" 
                            value={fichaClinica.pressao} 
                            onChange={handleFichaClinicaChange} 
                            Icon={Heart}
                        />
                        <RadioQuestion 
                            name="medicamento" 
                            question="Está tomando algum medicamento?" 
                            value={fichaClinica.medicamento} 
                            onChange={handleFichaClinicaChange} 
                            Icon={Pill}
                            notesPlaceholder="Qual/Quais?"
                        />
                        <RadioQuestion 
                            name="problemaSaude" 
                            question="Tem algum problema de saúde? Qual?" 
                            value={fichaClinica.problemaSaude} 
                            onChange={handleFichaClinicaChange} 
                            Icon={Heart}
                        />
                    </section>
                    
                    {/* 3. ODONTOGRAMA DA CONSULTA */}
                    <section className="p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tooth text-blue-500"><path d="M22 4s-2 10-6 16c-1.5 1-3 1-4 0-4-6-6-16-6-16-1.5 5.5-2.5 9.5-1 11.5 1.5 2 7 2.5 7 2.5 0 0 5.5-.5 7-2.5 1.5-2 0.5-6 1-11.5z"/></svg> 
                            Odontograma da Consulta
                        </h2>
                        <p className="text-sm text-gray-500">
                            Registro odontológico específico desta consulta.
                        </p>
                        
                        <Odontogram 
                            odontogramState={odontogramState}
                            onConditionChange={handleOdontogramChange} 
                        />
                    </section>

                    {/* 4. PRONTUÁRIO DO ATENDIMENTO */}
                    <section className="p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-orange-500" /> Prontuário do Atendimento
                        </h2>
                        <p className="text-sm text-gray-500">
                            Observações e plano de tratamento específicos da consulta atual.
                        </p>
                        
                        <div>
                            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">Observações Clínicas</label>
                            <textarea
                                id="observacoes"
                                name="observacoes"
                                value={fichaClinica.observacoes}
                                onChange={handleFichaClinicaChange}
                                placeholder="Registre os achados clínicos, queixas e informações relevantes deste atendimento."
                                rows="4"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="planoTratamento" className="block text-sm font-medium text-gray-700 mb-1">Plano de Tratamento</label>
                            <textarea
                                id="planoTratamento"
                                name="planoTratamento"
                                value={fichaClinica.planoTratamento}
                                onChange={handleFichaClinicaChange}
                                placeholder="Descreva o plano de tratamento detalhado, incluindo procedimentos, etapas e custos."
                                rows="6"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </section>


                    {/* BOTÃO SALVAR (AZUL) */}
                    <div className="pt-4 space-y-3">
                        <button
                            type="submit"
                            disabled={carregando || erroCarregamento || salvando || finalizando}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition duration-200 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {carregando
                                ? "Carregando ficha..."
                                : salvando
                                    ? "Salvando..."
                                    : "Salvar ficha clínica"}
                        </button>

                        {/* FINALIZAR ATENDIMENTO: só para consultas confirmadas cujo horário já chegou */}
                        {statusConsulta === "CONFIRMADA" && (
                            <>
                                <button
                                    type="button"
                                    onClick={solicitarFinalizacao}
                                    disabled={!horarioChegou || finalizando || salvando || carregando || erroCarregamento}
                                    className="w-full py-3 inline-flex items-center justify-center gap-2 bg-white border border-green-600 text-green-700 hover:bg-green-50 transition duration-200 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle size={18} />
                                    Finalizar atendimento
                                </button>
                                {!horarioChegou && (
                                    <p className="text-sm text-gray-500 text-center">
                                        O atendimento poderá ser finalizado a partir do horário da consulta.
                                    </p>
                                )}
                            </>
                        )}
                        {statusConsulta === "REALIZADA" && (
                            <p className="text-sm text-green-700 text-center font-medium">
                                Atendimento finalizado: esta consulta está registrada como realizada.
                            </p>
                        )}
                    </div>

                </form>
            </div>

            <ConfirmModal
                open={confirmarFinalizacao}
                title="Finalizar atendimento"
                description="A consulta será registrada como realizada e passará a contar para o controle de retornos."
                onCancel={() => setConfirmarFinalizacao(false)}
                onConfirm={handleFinalizar}
                loading={finalizando}
            />
        </div>
    );
};

export default FichaClinica;
