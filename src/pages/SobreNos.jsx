import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Heart, Eye, Star, Stethoscope, Award, Calendar, Image as ImageIcon } from 'lucide-react';
import Navbar from '../components/Navbar';

const SobreNos = () => {
    const { hash } = useLocation();

    useEffect(() => {
        if (!hash) return;
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [hash]);

    const especialistas = [
        {
            nome: 'Dr(a). Luiza Bianca',
            especialidade: 'Ortodontista',
            cro: 'CRO/UF 00000',
            foto: "src/assets/dentista-feminina.jpg"
        },
        {
            nome: 'Dr. Canuto Barreto',
            especialidade: 'Ortodontista',
            cro: 'CRO/UF 00000',
            foto: "src/assets/dentista-masculino.jpg"
        }
    ]

    const muralImagens = [
        "src/assets/consultorio-fachada.jpg",
        "src/assets/foto1.jpg",
        "src/assets/foto-destaque.jpg",
        "src/assets/foto2.jpg",
        "src/assets/foto3.jpg",
        "src/assets/foto4.jpg",
    ]

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
            <Navbar />
            {/* Seção Principal */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-1/2 space-y-6">
                            <span className="inline-block py-1 px-4 bg-blue-50 text-blue-600 rounded-full text-sm font-bold tracking-wide uppercase">Nossa História</span>
                            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
                                Transformando vidas através do seu <span className="text-blue-600">sorriso</span>.
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                                Fundada com o propósito de oferecer tratamentos odontológicos de alta performance, a Sorrisus combina conforto e humanização. Nossa jornada é marcada pela busca incessante da excelência técnica e do bem-estar de cada paciente.
                            </p>
                        </div>
                        <div className="lg:w-1/2 w-full">
                            <div className="relative">
                                <div className="w-full h-[400px] rounded-[2rem] shadow-2xl overflow-hidden">
                                    <img src={muralImagens[0]} alt="Fachada" className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-blue-100 hidden md:flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">Referência Regional</p>
                                        <p className="text-xs text-gray-500">Tecnologia de Ponta</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Valores */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-4 text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                                <Heart size={32} />
                            </div>
                            <h3 className="text-2xl font-bold">Missão</h3>
                            <p className="text-blue-100 opacity-80">Proporcionar saúde bucal com tecnologia e um atendimento acolhedor que gera alegria.</p>
                        </div>
                        <div className="space-y-4 text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                                <Eye size={32} />
                            </div>
                            <h3 className="text-2xl font-bold">Visão</h3>
                            <p className="text-blue-100 opacity-80">Ser a clínica de referência em tratamentos estéticos e reabilitação oral na região.</p>
                        </div>
                        <div className="space-y-4 text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                                <Star size={32} />
                            </div>
                            <h3 className="text-2xl font-bold">Valores</h3>
                            <p className="text-blue-100 opacity-80">Ética, inovação contínua, transparência absoluta e respeito integral ao paciente.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Equipe */}
            <section id="corpo-clinico" className="py-24 px-4 max-w-7xl mx-auto scroll-mt-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-extrabold text-gray-900">Corpo Clínico</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Especialistas prontos para cuidar de você.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl mx-auto">
                    {especialistas.map((dentista, index) => (
                        <div key={index} className="group text-center">
                            <div className="w-full aspect-[4/5] rounded-3xl mb-6 overflow-hidden shadow-lg border-2 border-transparent group-hover:border-blue-400 transition-all duration-300">
                                <img
                                    src={dentista.foto}
                                    alt={dentista.nome}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/400x500?text=Foto+Indisponível";
                                    }}
                                />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-800">{dentista.nome}</h4>
                            <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">{dentista.especialidade}</p>
                            <p className="text-gray-400 text-xs mt-1">{dentista.cro}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mural */}
            <section className="py-24 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">Nosso Mural</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Foto 1 */}
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
                            <img src={muralImagens[1]} alt="Procedimento" className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
                        </div>
                        {/* Foto Destaque */}
                        <div className="aspect-square rounded-2xl md:col-span-2 md:row-span-2 overflow-hidden shadow-md">
                            <img src={muralImagens[2]} alt="Fachada da Clínica" className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
                        </div>
                        {/* Foto 2 */}
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
                            <img src={muralImagens[3]} alt="Procedimento" className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
                        </div>
                        {/* Foto 3 */}
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
                            <img src={muralImagens[4]} alt="Procedimento" className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
                        </div>
                        {/* Foto 4 */}
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
                            <img src={muralImagens[5]} alt="Procedimento" className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Rodapé */}
            <p className="text-center text-sm text-gray-500 mt-6 mb-4">
                © 2025 Sorrisus. Todos os direitos reservados.
            </p>

        </div>
    );
};

export default SobreNos;
