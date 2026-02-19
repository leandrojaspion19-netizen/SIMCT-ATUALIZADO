
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Save, Clock, Calendar, Users2, ClipboardList, 
  AlertTriangle, ShieldCheck, UserRound, Baby, MapPin, 
  ChevronDown, Table, Hash, Search, UserCheck, Users, Edit3, Plus, Trash2, Sparkles, Heart, SearchCheck
} from 'lucide-react';
import { Documento, User, ChildData } from '../types';
import { 
  BAIRROS, INITIAL_USERS, classifyTurno, 
  ORIGENS_HIERARQUICAS, CANAIS_COMUNICADO_LIST, 
  getEffectiveEscala, UNIFIED_GENDER_OPTIONS
} from '../constants';

interface DocumentRegistrationProps {
  documents: Documento[];
  currentUser: User;
  onSubmit: (data: any, files: File[]) => void;
  onCancel: () => void;
  initialData?: Documento | null;
}

const mapCanalToEquityCategory = (canal: string) => {
  const c = canal.toUpperCase();
  if (c.includes('OFÍCIO') || c.includes('RELATÓRIO')) return 'OFICIO';
  if (c.includes('100')) return 'DISQUE100';
  if (c.includes('E-MAIL')) return 'EMAIL';
  return 'PRESENCIAL';
};

const calculateAgeInfo = (birthDate: string) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  const isPrimeiraInfancia = age >= 0 && age <= 6;
  const classification = age < 12 ? 'CRIANÇA' : 'ADOLESCENTE';
  return { age, classification, isPrimeiraInfancia };
};

const DocumentRegistration: React.FC<DocumentRegistrationProps> = ({ 
  documents, 
  currentUser, 
  onSubmit, 
  onCancel, 
  initialData 
}) => {
  const systemNow = new Date();
  const systemDateStr = systemNow.toISOString().split('T')[0];
  const systemTimeStr = systemNow.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const [formData, setFormData] = useState({
    origem_categoria: '',
    origem: initialData?.origem || '',
    canal_comunicado: initialData?.canal_comunicado || '',
    tipo_documento: initialData?.informacoes_documento?.split(' - REF: ')[0] || '',
    data_recebimento: initialData?.data_recebimento || systemDateStr,
    hora_rece_bimento: initialData?.hora_rece_bimento || systemTimeStr,
    genitora_nome: initialData?.genitora_nome || '',
    cpf_genitora: initialData?.cpf_genitora || '',
    criancas: initialData?.criancas || [{ nome: '', data_nascimento: '', genero_identidade: '', cpf: '' }] as ChildData[],
    bairro: initialData?.bairro || '',
    endereco: initialData?.endereco || '',
    telefone: initialData?.telefone || '',
    informacoes_documento_detalhe: initialData?.informacoes_documento?.split(' - REF: ')[1] || '',
    conselheiro_providencia_id: initialData?.conselheiro_providencia_id || '',
    conselheiro_referencia_id: initialData?.conselheiro_referencia_id || '',
    justificativa_distribuicao: initialData?.justificativa_distribuicao || '',
    justificativa_referencia: '',
    is_referencia_manual: false,
    is_reincidencia: false
  });

  const isFutureDate = formData.data_recebimento > systemDateStr;

  // DIRETRIZ 103: Motor de Reconhecimento de CPFs e Nomes para Reincidência
  useEffect(() => {
    if (initialData || formData.is_reincidencia) return;

    const cleanCpfGenitora = formData.cpf_genitora.replace(/\D/g, '');
    const searchNameGenitora = formData.genitora_nome.trim().toUpperCase();
    const childrenCpfs = formData.criancas.map(c => c.cpf?.replace(/\D/g, '')).filter(Boolean);

    if (cleanCpfGenitora.length === 11 || searchNameGenitora.length > 5 || childrenCpfs.length > 0) {
      // Busca correspondência
      const match = documents.find(d => {
        const docCpfGen = d.cpf_genitora?.replace(/\D/g, '');
        const docNameGen = d.genitora_nome?.toUpperCase();
        const docChildrenCpfs = d.criancas.map(c => c.cpf?.replace(/\D/g, '')).filter(Boolean);

        const matchGenCpf = cleanCpfGenitora && docCpfGen === cleanCpfGenitora;
        const matchGenName = searchNameGenitora && docNameGen === searchNameGenitora;
        const matchChildCpf = childrenCpfs.some(cpf => docChildrenCpfs.includes(cpf) || docCpfGen === cpf);

        return matchGenCpf || matchGenName || matchChildCpf;
      });

      if (match) {
        setFormData(prev => ({
          ...prev,
          genitora_nome: match.genitora_nome,
          cpf_genitora: match.cpf_genitora || prev.cpf_genitora,
          bairro: match.bairro,
          endereco: match.endereco || prev.endereco,
          telefone: match.telefone || prev.telefone,
          conselheiro_referencia_id: match.conselheiro_referencia_id,
          is_reincidencia: true,
          justificativa_referencia: `🚩 REINCIDÊNCIA: Vínculo técnico fixado em ${INITIAL_USERS.find(u => u.id === match.conselheiro_referencia_id)?.nome}.`,
          criancas: match.criancas.length > 0 ? match.criancas : prev.criancas
        }));
      }
    }
  }, [formData.cpf_genitora, formData.genitora_nome, formData.criancas, documents, initialData]);

  const filteredOrigemOptions = useMemo(() => {
    if (!formData.origem_categoria) return [];
    const category = ORIGENS_HIERARQUICAS.find(h => h.label === formData.origem_categoria);
    return category ? category.options : [];
  }, [formData.origem_categoria]);

  const refCouncilors = useMemo(() => 
    INITIAL_USERS.filter(u => ['LEANDRO', 'LUIZA', 'MILENA', 'MIRIAN', 'SANDRA'].includes(u.nome.toUpperCase())),
  []);

  const referenceLoadMatrix = useMemo(() => {
    return refCouncilors.map(user => {
      const count = documents.filter(d => d.conselheiro_referencia_id === user.id).length;
      return { id: user.id, nome: user.nome, count };
    }).sort((a, b) => a.count - b.count || a.nome.localeCompare(b.nome));
  }, [documents, refCouncilors]);

  const loadMatrix = useMemo(() => {
    const currentTrioNames = getEffectiveEscala(systemDateStr, systemTimeStr);
    const currentCycleDocs = documents.filter(d => {
      const dCreatedDate = new Date(d.criado_em).toISOString().split('T')[0];
      return dCreatedDate === systemDateStr;
    });

    const sortedDocs = [...documents].sort((a,b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
    const lastAssignedId = sortedDocs[0]?.conselheiro_providencia_id || '';

    return currentTrioNames.map(name => {
      const user = INITIAL_USERS.find(u => (u.nome || '').toUpperCase() === name.toUpperCase())!;
      const userDocs = currentCycleDocs.filter(d => d.conselheiro_providencia_id === user.id);
      
      return {
        id: user.id,
        nome: user.nome,
        OFICIO: userDocs.filter(d => mapCanalToEquityCategory(d.canal_comunicado) === 'OFICIO').length,
        DISQUE100: userDocs.filter(d => mapCanalToEquityCategory(d.canal_comunicado) === 'DISQUE100').length,
        EMAIL: userDocs.filter(d => mapCanalToEquityCategory(d.canal_comunicado) === 'EMAIL').length,
        PRESENCIAL: userDocs.filter(d => mapCanalToEquityCategory(d.canal_comunicado) === 'PRESENCIAL').length,
        TOTAL: userDocs.length,
        isLast: user.id === lastAssignedId
      };
    });
  }, [documents, systemDateStr, systemTimeStr]);

  const provDistributionResult = useMemo(() => {
    if (!formData.canal_comunicado || loadMatrix.length === 0) return null;
    const targetCategory = mapCanalToEquityCategory(formData.canal_comunicado) as 'OFICIO' | 'DISQUE100' | 'EMAIL' | 'PRESENCIAL';
    let candidates = loadMatrix.filter(m => !m.isLast);
    if (candidates.length === 0) candidates = loadMatrix;
    const minCategoryLoad = Math.min(...candidates.map(c => c[targetCategory]));
    candidates = candidates.filter(c => c[targetCategory] === minCategoryLoad);
    const minTotalLoad = Math.min(...candidates.map(c => c.TOTAL));
    candidates = candidates.filter(c => c.TOTAL === minTotalLoad);
    return { id: candidates[0].id, nome: candidates[0].nome, justificativa: `✅ Imediata: ${candidates[0].nome} para equalização: ${formData.canal_comunicado}.` };
  }, [formData.canal_comunicado, loadMatrix]);

  useEffect(() => {
    if (!initialData && provDistributionResult) {
      setFormData(prev => ({ 
        ...prev, 
        conselheiro_providencia_id: provDistributionResult.id,
        justificativa_distribuicao: provDistributionResult.justificativa
      }));
    }
  }, [provDistributionResult, initialData]);

  useEffect(() => {
    if (!initialData && !formData.is_referencia_manual && !formData.is_reincidencia) {
      const best = referenceLoadMatrix[0];
      setFormData(prev => ({ 
        ...prev, 
        conselheiro_referencia_id: best.id,
        justificativa_referencia: `✅ Sugestão Equidade: ${best.nome} (${best.count} casos).`
      }));
    }
  }, [referenceLoadMatrix, initialData, formData.is_referencia_manual, formData.is_reincidencia]);

  const addCrianca = () => {
    setFormData(prev => ({
      ...prev,
      criancas: [...prev.criancas, { nome: '', data_nascimento: '', genero_identidade: '', cpf: '' }]
    }));
  };

  const removeCrianca = (index: number) => {
    if (formData.criancas.length === 1) return;
    setFormData(prev => ({
      ...prev,
      criancas: prev.criancas.filter((_, i) => i !== index)
    }));
  };

  const updateCrianca = (index: number, field: keyof ChildData, value: string) => {
    setFormData(prev => {
      const newCriancas = [...prev.criancas];
      const formattedValue = field === 'genero_identidade' ? value : value.toUpperCase();
      newCriancas[index] = { ...newCriancas[index], [field]: formattedValue };
      return { ...prev, criancas: newCriancas };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFutureDate) return alert("⚠️ Erro: Data futura bloqueada.");
    const invalidCrianca = formData.criancas.some(c => !c.nome || !c.genero_identidade || !c.data_nascimento);
    if (!formData.genitora_nome.trim() || invalidCrianca || !formData.bairro) {
      return alert("⚠️ Erro: Preencha todos os campos obrigatórios.");
    }
    const finalData = {
      ...formData,
      crianca_nome: formData.criancas.map(c => c.nome).join(' / '),
      informacoes_documento: `${formData.tipo_documento} - REF: ${formData.informacoes_documento_detalhe || 'ATENDIMENTO INICIAL'}`,
      periodo_rece_bimento: classifyTurno(formData.data_recebimento, formData.hora_rece_bimento),
    };
    onSubmit(finalData, []);
  };

  const formatCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14);

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <header className="p-10 bg-[#111827] text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-blue-600/10 skew-x-12 translate-x-32"></div>
          <div className="relative z-10">
            <span className="px-3 py-1 bg-blue-600 text-[10px] font-black uppercase rounded-full mb-2 inline-block tracking-widest">SIMCT HORTOLÂNDIA - SICT</span>
            <h2 className="text-[24px] font-black uppercase tracking-tight">Registro de Novo Procedimento</h2>
          </div>
          <button type="button" onClick={onCancel} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all z-10"><X className="w-6 h-6" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          
          {/* SEÇÃO: DATA E HORA */}
          <section className={`p-10 rounded-[2.5rem] border-4 transition-all space-y-8 ${isFutureDate ? 'bg-red-50 border-red-500 shadow-lg' : 'bg-slate-50 border-slate-200'}`}>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Calendar className={`w-8 h-8 ${isFutureDate ? 'text-red-600' : 'text-blue-600'}`} />
                   <div>
                      <h3 className={`text-[16px] font-black uppercase tracking-tight ${isFutureDate ? 'text-red-700' : 'text-slate-800'}`}>[ NOVO DOCUMENTO ]</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isFutureDate ? 'text-red-400' : 'text-slate-400'}`}>Identificação Cronológica de Aporte</p>
                   </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${classifyTurno(formData.data_recebimento, formData.hora_rece_bimento) === 'COMERCIAL' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                   Classificação: {classifyTurno(formData.data_recebimento, formData.hora_rece_bimento)}
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input type="date" max={systemDateStr} className={`w-full p-5 bg-white border-2 rounded-[1.5rem] font-black text-[15px] outline-none transition-all ${isFutureDate ? 'border-red-500 text-red-700' : 'border-slate-100 focus:border-blue-500'}`} value={formData.data_recebimento} onChange={e => setFormData({ ...formData, data_recebimento: e.target.value })} />
                <input type="time" className="w-full p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] font-black text-[15px] outline-none focus:border-blue-500" value={formData.hora_rece_bimento} onChange={e => setFormData({ ...formData, hora_rece_bimento: e.target.value })} />
             </div>
          </section>

          {/* MATRIZ DE DISTRIBUIÇÃO */}
          <section className="space-y-8 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
             <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                   <Users2 className="w-6 h-6 text-blue-600" />
                   <h3 className="text-[14px] font-black uppercase text-slate-800 tracking-widest">Matriz de Distribuição e Carga</h3>
                </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Providência Imediata</h4>
                   <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
                      <table className="w-full text-left border-collapse">
                         <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase border-b">
                            <tr><th className="px-4 py-3">Conselheiro</th><th className="px-4 py-3 text-center">Tipo</th><th className="px-4 py-3 text-center">Total</th></tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {loadMatrix.map(m => (
                              <tr key={m.id} className={`text-[11px] ${formData.conselheiro_providencia_id === m.id ? 'bg-blue-50/50' : ''}`}>
                                 <td className="px-4 py-3 font-bold text-slate-700">{m.nome}</td>
                                 <td className="px-4 py-3 text-center text-slate-400">{mapCanalToEquityCategory(formData.canal_comunicado)}: {m[mapCanalToEquityCategory(formData.canal_comunicado) as keyof typeof m] || 0}</td>
                                 <td className="px-4 py-3 text-center font-black text-blue-600">{m.TOTAL}</td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><UserCheck className="w-3.5 h-3.5" /> Referência (Equidade Global)</h4>
                   <div className="space-y-4">
                      <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase border-b">
                              <tr><th className="px-4 py-3">Conselheiro</th><th className="px-4 py-3 text-center">Carga Acumulada</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {referenceLoadMatrix.map(r => (
                                <tr key={r.id} className={`text-[11px] ${formData.conselheiro_referencia_id === r.id ? 'bg-indigo-50/50' : ''}`}>
                                  <td className="px-4 py-3 font-bold text-slate-700">{r.nome}</td>
                                  <td className="px-4 py-3 text-center font-black text-indigo-600">{r.count} CASOS</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="relative">
                        <Edit3 className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${formData.is_reincidencia ? 'text-red-500' : 'text-indigo-500'}`} />
                        <select 
                          className={`w-full p-4 pl-12 border-2 rounded-xl font-bold uppercase text-[12px] outline-none transition-all ${formData.is_reincidencia ? 'bg-red-50 border-red-200 cursor-not-allowed text-red-700' : 'bg-white border-slate-100 focus:border-indigo-500'}`}
                          value={formData.conselheiro_referencia_id}
                          onChange={e => setFormData(prev => ({...prev, conselheiro_referencia_id: e.target.value, is_referencia_manual: true, justificativa_referencia: `⚠️ Referência atribuída MANUALMENTE.`}))}
                          disabled={formData.is_reincidencia}
                        >
                          {refCouncilors.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                        </select>
                        {formData.is_reincidencia && <span className="absolute -top-3 left-4 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded shadow-sm flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> REINCIDÊNCIA: REFERÊNCIA BLOQUEADA</span>}
                      </div>
                   </div>
                </div>
             </div>
             <div className="flex flex-col gap-3">
                {formData.justificativa_referencia && (
                  <div className={`p-4 border-2 rounded-2xl flex items-center gap-3 animate-in fade-in ${formData.is_reincidencia ? 'bg-red-50 border-red-100 text-red-800 shadow-sm' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
                     {formData.is_reincidencia ? <SearchCheck className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                     <span className="text-[11px] font-black uppercase tracking-tight">{formData.justificativa_referencia}</span>
                  </div>
                )}
                {formData.justificativa_distribuicao && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center gap-3 animate-in fade-in shadow-sm">
                     <ShieldCheck className="w-5 h-5 text-emerald-600" />
                     <span className="text-[11px] font-black text-emerald-800 uppercase tracking-tight">{formData.justificativa_distribuicao}</span>
                  </div>
                )}
             </div>
          </section>

          {/* ORIGEM E CANAL */}
          <section className="space-y-6 bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <ClipboardList className="w-6 h-6 text-indigo-600" />
                <h3 className="text-[14px] font-black uppercase text-slate-800 tracking-widest">Origem e Canal do Comunicado</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase outline-none focus:border-indigo-500 shadow-sm cursor-pointer" value={formData.origem_categoria} onChange={e => setFormData({...formData, origem_categoria: e.target.value, origem: ''})} required>
                  <option value="">Selecione Categoria...</option>
                  {ORIGENS_HIERARQUICAS.map(h => <option key={h.label} value={h.label}>{h.label}</option>)}
                </select>
                <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase outline-none focus:border-indigo-500 shadow-sm disabled:opacity-50 cursor-pointer" value={formData.origem} onChange={e => setFormData({...formData, origem: e.target.value})} disabled={!formData.origem_categoria} required>
                  <option value="">Selecione Instituição...</option>
                  {filteredOrigemOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase outline-none focus:border-indigo-500 shadow-sm cursor-pointer" value={formData.canal_comunicado} onChange={e => setFormData({...formData, canal_comunicado: e.target.value})} required>
                  <option value="">Selecione Canal...</option>
                  {CANAIS_COMUNICADO_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </section>

          {/* RESPONSÁVEL PRINCIPAL */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2"><UserRound className="w-5 h-5 text-indigo-600" /><h4 className="text-[12px] font-black uppercase text-slate-700">Responsável Principal (Genitora/Guardião) *</h4></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input type="text" placeholder="NOME COMPLETO DA GENITORA / RESPONSÁVEL *" className={`w-full p-5 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase outline-none focus:border-indigo-500 shadow-sm ${formData.is_reincidencia ? 'text-red-700 font-black' : ''}`} value={formData.genitora_nome} onChange={e => setFormData({ ...formData, genitora_nome: e.target.value.toUpperCase() })} required />
              </div>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input type="text" placeholder="CPF DO RESPONSÁVEL (RECONHECIMENTO AUTOMÁTICO)" className={`w-full p-5 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500 shadow-sm ${formData.is_reincidencia ? 'text-red-700 font-black' : ''}`} value={formData.cpf_genitora} onChange={e => setFormData({ ...formData, cpf_genitora: formatCPF(e.target.value) })} />
              </div>
            </div>
          </section>

          {/* IDENTIFICAÇÃO DAS VÍTIMAS (IRMÃOS E IDADE) */}
          <section className="space-y-6 pt-10 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Baby className="w-5 h-5 text-emerald-600" /><h4 className="text-[12px] font-black uppercase text-slate-700">Identificação da Vítima (Irmãos) *</h4></div>
              <button type="button" onClick={addCrianca} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-emerald-700 transition-all"><Plus className="w-4 h-4" /> ADICIONAR IRMÃO</button>
            </div>
            
            <div className="space-y-8">
              {formData.criancas.map((crianca, idx) => {
                const ageInfo = calculateAgeInfo(crianca.data_nascimento);
                return (
                  <div key={idx} className={`p-10 rounded-[2.5rem] border-4 transition-all relative group animate-in slide-in-from-left-2 ${ageInfo?.isPrimeiraInfancia ? 'bg-amber-50/50 border-amber-300 shadow-xl' : 'bg-slate-50 border-slate-100'}`}>
                     
                     {ageInfo?.isPrimeiraInfancia && (
                       <div className="absolute -top-4 left-10 px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 animate-bounce">
                          <Sparkles className="w-4 h-4 fill-white" /> Prioridade Absoluta: Primeira Infância
                       </div>
                     )}

                     {formData.criancas.length > 1 && (
                       <button type="button" onClick={() => removeCrianca(idx)} className="absolute top-6 right-6 p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                     )}

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4 space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo *</label>
                           <input type="text" placeholder="NOME DA CRIANÇA" className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold uppercase text-[12px] outline-none focus:border-emerald-500 shadow-sm" value={crianca.nome} onChange={e => updateCrianca(idx, 'nome', e.target.value)} required />
                        </div>
                        
                        <div className="lg:col-span-3 space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento *</label>
                           <input type="date" className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-[12px] outline-none focus:border-emerald-500 shadow-sm" value={crianca.data_nascimento} onChange={e => updateCrianca(idx, 'data_nascimento', e.target.value)} required />
                        </div>

                        <div className="lg:col-span-3 space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gênero / Identidade *</label>
                           <select 
                            className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold uppercase text-[11px] outline-none focus:border-emerald-500 shadow-sm cursor-pointer" 
                            value={crianca.genero_identidade} 
                            onChange={e => updateCrianca(idx, 'genero_identidade', e.target.value)} 
                            required
                           >
                              <option value="">SELECIONE GÊNERO *</option>
                              {UNIFIED_GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                           </select>
                        </div>

                        <div className="lg:col-span-2 space-y-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF (Reconhecimento)</label>
                           <input type="text" placeholder="CPF" className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold text-[12px] outline-none focus:border-emerald-500 shadow-sm" value={crianca.cpf || ''} onChange={e => updateCrianca(idx, 'cpf', formatCPF(e.target.value))} />
                        </div>
                     </div>

                     {ageInfo && (
                        <div className="mt-6 flex items-center gap-4 animate-in fade-in zoom-in">
                           <div className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${ageInfo.classification === 'CRIANÇA' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                              <Baby className="w-4 h-4" /> {ageInfo.classification}: {ageInfo.age} {ageInfo.age === 1 ? 'ANO' : 'ANOS'}
                           </div>
                           {ageInfo.isPrimeiraInfancia && (
                             <div className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                <Heart className="w-4 h-4 fill-white" /> Primeira Infância (Prioridade Absoluta)
                             </div>
                           )}
                        </div>
                     )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* LOCALIZAÇÃO E REFERÊNCIA */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><Search className="w-3 h-3" /> Referência do Documento *</label>
                <input type="text" placeholder="EX: OFÍCIO 456/2026 OU RELATÓRIO ESCOLAR" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase outline-none focus:border-blue-500 shadow-sm" value={formData.tipo_documento} onChange={e => setFormData({ ...formData, tipo_documento: e.target.value.toUpperCase() })} required />
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><MapPin className="w-3 h-3" /> Bairro de Residência *</label>
                <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase outline-none focus:border-blue-500 shadow-sm cursor-pointer" value={formData.bairro} onChange={e => setFormData({ ...formData, bairro: e.target.value })} required>
                   <option value="">SELECIONE O BAIRRO *</option>
                   {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
             </div>
          </section>

          <button type="submit" disabled={isFutureDate} className={`w-full py-10 rounded-[3rem] font-black uppercase text-[16px] tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-6 active:scale-95 group ${isFutureDate ? 'bg-slate-300 cursor-not-allowed opacity-50' : 'bg-[#111827] text-white hover:bg-blue-600'}`}>
             {isFutureDate ? <AlertTriangle className="w-8 h-8" /> : <Save className="w-8 h-8 group-hover:scale-110 transition-transform" />} 
             {isFutureDate ? '[BLOQUEADO: DATA FUTURA]' : '[Salvar Prontuário SICT]'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DocumentRegistration;
