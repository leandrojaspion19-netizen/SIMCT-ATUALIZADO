
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, ShieldCheck, Scale, X, Edit2, Check, Gavel, LayoutList, Users2, Lock, Zap, Clock, AlertCircle, Info, UserRound, MessageSquareWarning, Plus, Save, Search, Trash2, Sparkles, Loader2, BellRing, CheckCircle2, Fingerprint, Baby, ShieldAlert, ClipboardCheck, ShieldEllipsis, History, ChevronDown, ChevronUp, FolderTree, Building2, ChevronRight, Share2, FileText } from 'lucide-react';
import { Documento, DocumentFile, Log, User as UserType, DocumentStatus, MedidaAplicada, SipiaViolation, AgenteVioladorEntry, RequisicaoServico } from '../types';
import { STATUS_LABELS, INITIAL_USERS, MEDIDAS_ECA_DESCRICAO, SIPIA_HIERARCHY, AGENTES_VIOLADORES_ESTRUTURA, MEDIDAS_PROTECAO_ECA, ANNUAL_ESCALA, getEffectiveEscala, PASTAS_ART136_III_A } from '../constants';
import FamilyHistoryModal from './FamilyHistoryModal';

interface DocumentViewProps {
  document: Documento;
  allDocuments: Documento[]; 
  files: DocumentFile[];
  logs: Log[];
  currentUser: UserType;
  isReadOnly?: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: DocumentStatus[]) => void;
  onUpdateDocument: (id: string, fields: Partial<Documento>) => void;
  onAddLog: (docId: string, acao: string) => void;
  onScience: (id: string) => void;
}

const DocumentView: React.FC<DocumentViewProps> = ({ 
  document: doc, 
  allDocuments,
  logs,
  currentUser, 
  isReadOnly,
  onBack, 
  onEdit,
  onUpdateStatus,
  onUpdateDocument,
  onAddLog
}) => {
  const [localStatus, setLocalStatus] = useState<DocumentStatus[]>(doc.status || []);
  const [showSipiaModal, setShowSipiaModal] = useState(false);
  const [sipiaSel, setSipiaSel] = useState({ fundamental: '', grupo: '', especifico: '' });
  const [sipiaSearchTerm, setSipiaSearchTerm] = useState('');
  const [showAgenteModal, setShowAgenteModal] = useState(false);
  const [agenteSel, setAgenteSel] = useState({ categoria: '', opcao: '', tipo: 'PRINCIPAL' as 'PRINCIPAL' | 'SECUNDARIO' });
  const [showMedidaModal, setShowMedidaModal] = useState(false);
  const [medidaSel, setMedidaSel] = useState({ artigo: '', inciso: '' });
  const [showRequisicaoPastas, setShowRequisicaoPastas] = useState(false);
  const [reqSel, setReqSel] = useState<{ area: string, servico: string, prazo: number }>({ area: '', servico: '', prazo: 0 });
  const [isCustomPrazo, setIsCustomPrazo] = useState(false);
  const [customPrazoVal, setCustomPrazoVal] = useState('');
  const [showFamilyHistoryModal, setShowFamilyHistoryModal] = useState(false);
  const [editingMedidaId, setEditingMedidaId] = useState<string | null>(null);
  const [editMedidaText, setEditMedidaText] = useState('');

  const isConselheiro = currentUser.perfil === 'CONSELHEIRO' || (currentUser.perfil === 'SUPLENTE' && currentUser.substituicao_ativa);
  const isPlantonistaTitular = doc.conselheiro_providencia_id === currentUser.id;
  const isDirectActionMode = isPlantonistaTitular && isConselheiro;
  const isReferencia = doc.conselheiro_referencia_id === currentUser.id;
  
  const refCouncilor = INITIAL_USERS.find(u => u.id === doc.conselheiro_referencia_id);
  const provCouncilor = INITIAL_USERS.find(u => u.id === doc.conselheiro_providencia_id);
  
  const [tempViolacoes, setTempViolacoes] = useState<SipiaViolation[]>(doc.violacoesSipia || []);
  const [tempAgentes, setTempAgentes] = useState<AgenteVioladorEntry[]>(doc.agentesVioladores || []);
  const [tempMedidas, setTempMedidas] = useState<MedidaAplicada[]>(doc.medidas_detalhadas || []);

  const familyHistory = useMemo(() => {
    return allDocuments.filter(d => {
       if (d.id === doc.id) return false;
       const matchCpf = doc.cpf_genitora && d.cpf_genitora && doc.cpf_genitora.replace(/\D/g, '') === d.cpf_genitora.replace(/\D/g, '');
       const matchNome = doc.genitora_nome && d.genitora_nome && doc.genitora_nome.trim().toUpperCase() === d.genitora_nome.trim().toUpperCase();
       return matchCpf || matchNome;
    });
  }, [allDocuments, doc]);

  const sipiaFlattenedOptions = useMemo(() => {
    const options: { fundamental: string, grupo: string, especifico: string }[] = [];
    Object.entries(SIPIA_HIERARCHY).forEach(([fundamental, grupos]) => {
      Object.entries(grupos).forEach(([grupo, especificos]) => {
        especificos.forEach(especifico => {
          options.push({ fundamental, grupo, especifico });
        });
      });
    });
    return options;
  }, []);

  const sipiaSearchResults = useMemo(() => {
    if (!sipiaSearchTerm.trim()) return [];
    const term = sipiaSearchTerm.toUpperCase();
    return sipiaFlattenedOptions.filter(opt => 
      opt.fundamental.toUpperCase().includes(term) ||
      opt.grupo.toUpperCase().includes(term) ||
      opt.especifico.toUpperCase().includes(term)
    ).slice(0, 10);
  }, [sipiaSearchTerm, sipiaFlattenedOptions]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(tempViolacoes) !== JSON.stringify(doc.violacoesSipia) ||
           JSON.stringify(tempAgentes) !== JSON.stringify(doc.agentesVioladores) ||
           JSON.stringify(tempMedidas) !== JSON.stringify(doc.medidas_detalhadas);
  }, [tempViolacoes, tempAgentes, tempMedidas, doc]);

  const saveRascunhoTecnico = () => {
    if (!isDirectActionMode) return;
    onUpdateDocument(doc.id, {
      violacoesSipia: tempViolacoes,
      agentesVioladores: tempAgentes,
      medidas_detalhadas: tempMedidas
    });
    onAddLog(doc.id, `RASCUNHO TÉCNICO: Violações e agentes salvos para continuidade posterior por ${currentUser.nome}.`);
    alert("Rascunho técnico salvo com sucesso.");
  };

  const saveProvidencias = () => {
    if (!isDirectActionMode) return;
    
    // REGRA DE OBRIGATORIEDADE: Violação e Agente são campos obrigatórios
    if (tempViolacoes.length === 0) {
      alert("BLOQUEIO TÉCNICO: É obrigatório identificar ao menos um DIREITO VIOLADO (SIPIA) antes de registrar as providências.");
      return;
    }
    if (tempAgentes.length === 0) {
      alert("BLOQUEIO TÉCNICO: É obrigatório identificar o AGENTE VIOLADOR antes de registrar as providências.");
      return;
    }
    if (tempMedidas.length === 0) {
      alert("BLOQUEIO TÉCNICO: É obrigatório aplicar ao menos uma MEDIDA ou ATRIBUIÇÃO do ECA.");
      return;
    }

    const medidasComAutoAssinatura = tempMedidas.map(m => {
      const jaAssinou = m.confirmacoes.some(c => c.usuario_id === currentUser.id);
      if (jaAssinou) return m;
      return {
        ...m,
        confirmacoes: [
          ...m.confirmacoes,
          { usuario_id: currentUser.id, usuario_nome: currentUser.nome, data_hora: new Date().toISOString() }
        ]
      };
    });
    const novasRequisicoes: RequisicaoServico[] = [];
    medidasComAutoAssinatura.forEach(m => {
      if (m.artigo_inciso === 'Art. 136, III, a' && m.requisicao_detalhes) {
        novasRequisicoes.push(m.requisicao_detalhes);
      }
    });
    const statusAtualizado = [...doc.status];
    if (!statusAtualizado.includes('AGUARDANDO_VALIDACAO')) {
      statusAtualizado.push('AGUARDANDO_VALIDACAO');
    }
    if (novasRequisicoes.length > 0 && !statusAtualizado.includes('MONITORAMENTO')) {
      statusAtualizado.push('MONITORAMENTO');
    }
    const monitoramentoAtualizado = {
      ...(doc.monitoramento || { servicos: [], prazoEsperado: '', concluido: false }),
      requisicoes: novasRequisicoes
    };
    onUpdateDocument(doc.id, {
      violacoesSipia: tempViolacoes,
      agentesVioladores: tempAgentes,
      medidas_detalhadas: medidasComAutoAssinatura,
      monitoramento: monitoramentoAtualizado,
      status: Array.from(new Set(statusAtualizado))
    });
    setTempMedidas(medidasComAutoAssinatura);
    onAddLog(doc.id, `TRIAGEM TÉCNICA: Providências lançadas e registradas por ${currentUser.nome}.`);
    alert("Dados técnicos salvos e auto-assinados com sucesso.");
  };

  const handleAddMedida = () => {
    if (!medidaSel.inciso) return;
    if (medidaSel.inciso === 'Art. 136, III, a') {
      setShowMedidaModal(false);
      setShowRequisicaoPastas(true);
      return;
    }
    const desc = MEDIDAS_ECA_DESCRICAO[medidaSel.inciso] || "";
    const escalaDoDia = getEffectiveEscala(doc.data_recebimento);
    const nova: MedidaAplicada = {
      id: `med-${Date.now()}`,
      artigo_inciso: medidaSel.inciso,
      texto: desc,
      autor_id: currentUser.id,
      autor_nome: currentUser.nome,
      data_lancamento: new Date().toISOString(),
      conselheiros_requeridos: escalaDoDia,
      confirmacoes: []
    };
    setTempMedidas(prev => [...prev, nova]);
    setMedidaSel({ artigo: '', inciso: '' });
    setShowMedidaModal(false);
  };

  const handleConfirmRequisicaoPastas = () => {
    const finalPrazo = isCustomPrazo ? parseInt(customPrazoVal) : reqSel.prazo;
    if (!reqSel.area || !reqSel.servico || !finalPrazo) {
      alert("ERRO: É obrigatório selecionar a área, o serviço e definir o prazo legal.");
      return;
    }
    const dataFinal = new Date();
    dataFinal.setDate(dataFinal.getDate() + finalPrazo);
    const escalaDoDia = getEffectiveEscala(doc.data_recebimento);
    const desc = `REQUISITAR SERVIÇO PÚBLICO: ${reqSel.servico} (ÁREA: ${reqSel.area}) - PRAZO: ${finalPrazo} DIAS.`;
    const requisicaoInfo: RequisicaoServico = {
      id: `req-${Date.now()}`,
      area: reqSel.area,
      servico: reqSel.servico,
      prazoDias: finalPrazo,
      dataFinal: dataFinal.toISOString().split('T')[0]
    };
    const nova: MedidaAplicada = {
      id: `med-${Date.now()}`,
      artigo_inciso: 'Art. 136, III, a',
      texto: desc,
      autor_id: currentUser.id,
      autor_nome: currentUser.nome,
      data_lancamento: new Date().toISOString(),
      conselheiros_requeridos: escalaDoDia,
      confirmacoes: [],
      requisicao_detalhes: requisicaoInfo
    };
    setTempMedidas(prev => [...prev, nova]);
    setReqSel({ area: '', servico: '', prazo: 0 });
    setIsCustomPrazo(false);
    setCustomPrazoVal('');
    setShowRequisicaoPastas(false);
  };

  const handleUpdateMedidaText = (medidaId: string) => {
    if (!isDirectActionMode) return;
    
    setTempMedidas(prev => prev.map(m => {
      if (m.id === medidaId) {
        // REGRA: Ao editar a medida, resetar as assinaturas dos OUTROS conselheiros. 
        // A medida deve ser assinada novamente pelo colegiado de providência.
        return { 
          ...m, 
          texto: editMedidaText.toUpperCase(),
          confirmacoes: [] // Reset integral de assinaturas para nova validação obrigatória
        };
      }
      return m;
    }));
    
    onAddLog(doc.id, `EDIÇÃO TÉCNICA: Uma medida aplicada foi alterada por ${currentUser.nome}. Assinaturas anteriores foram invalidadas.`);
    setEditingMedidaId(null);
    setEditMedidaText('');
  };

  const handleAddSipia = () => {
    if (!sipiaSel.especifico) return;
    setTempViolacoes(prev => [...prev, { ...sipiaSel }]);
    setSipiaSel({ fundamental: '', grupo: '', especifico: '' });
    setSipiaSearchTerm('');
    setShowSipiaModal(false);
  };

  const handleAddAgente = () => {
    if (!agenteSel.opcao) return;
    setTempAgentes(prev => [
      ...prev, 
      { principal: agenteSel.opcao, categoria: agenteSel.categoria, tipo: 'PRINCIPAL' }
    ]);
    setAgenteSel({ categoria: '', opcao: '', tipo: 'PRINCIPAL' });
    setShowAgenteModal(false);
  };

  const handleConfirmMedida = (medidaId: string) => {
    const novasMedidas = tempMedidas.map(m => {
      if (m.id === medidaId) {
        const jaConfirmou = m.confirmacoes.some(c => c.usuario_id === currentUser.id);
        if (jaConfirmou) return m;
        return {
          ...m,
          confirmacoes: [
            ...m.confirmacoes,
            { usuario_id: currentUser.id, usuario_nome: currentUser.nome, data_hora: new Date().toISOString() }
          ]
        };
      }
      return m;
    });
    setTempMedidas(novasMedidas);
    onUpdateDocument(doc.id, { medidas_detalhadas: novasMedidas });
    onAddLog(doc.id, `ASSINATURA TÉCNICA: O Conselheiro ${currentUser.nome} assinou a medida.`);
  };

  const formatSignatureDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[14px] font-bold text-[#4B5563] uppercase hover:text-[#111827] transition-colors"><ArrowLeft className="w-4 h-4" /> Voltar</button>
        <div className="flex gap-3">
          {familyHistory.length > 0 && (
            <button 
              onClick={() => setShowFamilyHistoryModal(true)}
              className="px-6 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold uppercase text-[12px] flex items-center gap-2 hover:bg-amber-100 transition-all shadow-sm"
            >
              <History className="w-4 h-4" /> Histórico Familiar ({familyHistory.length})
            </button>
          )}
          {!isReadOnly && <button onClick={onEdit} className="px-6 py-2 border border-[#E5E7EB] rounded-xl font-bold uppercase text-[12px] flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"><Edit2 className="w-4 h-4" /> Editar Prontuário</button>}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
             <div className="p-8 border-b border-[#E5E7EB] bg-[#F9FAFB] flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <h1 className="text-[20px] font-bold text-[#111827] uppercase leading-tight tracking-tight">{doc.crianca_nome}</h1>
                  <p className="text-[13px] font-medium text-[#4B5563] uppercase mt-1">Protocolo: {doc.id} | Data: {new Date(doc.data_recebimento).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-2">
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest">Conselheiro Referência</span>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[13px] font-bold text-[#2563EB] uppercase">
                         <UserRound className="w-3.5 h-3.5" /> {refCouncilor?.nome || 'N/A'}
                      </div>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Conselheiro Providência Imediata</span>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-[13px] font-bold text-amber-600 uppercase">
                         <Zap className="w-3.5 h-3.5" /> {provCouncilor?.nome || 'Pendente'}
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Origem / Comunicante</span>
                    <span className="text-[12px] font-bold text-slate-800 uppercase flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-blue-500" /> {doc.origem}</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Canal de Comunicação</span>
                    <span className="text-[12px] font-bold text-slate-800 uppercase flex items-center gap-2"><Share2 className="w-3.5 h-3.5 text-blue-500" /> {doc.canal_comunicado || 'Não Informado'}</span>
                  </div>
                </div>

                <div className="p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#4B5563] uppercase tracking-widest"><Users2 className="w-4 h-4" /> Informações Iniciais</div>
                  <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#1F2937] uppercase font-medium leading-relaxed">
                    {doc.informacoes_documento}
                  </div>
                </div>

                {/* SEÇÃO: VIOLAÇÕES SIPIA */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                      <div className="flex items-center gap-2 text-[15px] font-bold text-[#111827] uppercase"><Scale className="w-5 h-5 text-[#2563EB]" /> Direitos Violados (SIPIA) *</div>
                      {isDirectActionMode && (
                        <button onClick={() => setShowSipiaModal(true)} className="px-3 py-1.5 bg-blue-50 text-[#2563EB] rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition-all border border-blue-100">+ Adicionar</button>
                      )}
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                     {tempViolacoes.length > 0 ? tempViolacoes.map((v, i) => (
                       <div key={i} className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#2563EB] shadow-sm border border-[#E5E7EB]"><LayoutList className="w-5 h-5" /></div>
                           <div className="flex flex-col">
                             <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-widest">{v.fundamental}</span>
                             <span className="text-[14px] font-bold text-[#1F2937] uppercase">{v.especifico}</span>
                           </div>
                         </div>
                         {isDirectActionMode && (
                           <button onClick={() => setTempViolacoes(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                         )}
                       </div>
                     )) : (
                       <div className="p-6 bg-red-50 border border-dashed border-red-200 rounded-xl text-center space-y-2">
                          <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
                          <p className="text-[12px] text-red-700 font-black uppercase tracking-widest">Identificação Obrigatória de Violação Pendente</p>
                          <p className="text-[10px] text-red-500 font-bold uppercase">Somente o Conselheiro de Providência pode definir a violação técnica.</p>
                       </div>
                     )}
                   </div>
                </div>

                {/* SEÇÃO: AGENTES VIOLADORES */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                      <div className="flex items-center gap-2 text-[15px] font-bold text-[#111827] uppercase"><Users2 className="w-5 h-5 text-[#D97706]" /> Agente Violador *</div>
                      {isDirectActionMode && (
                        <button onClick={() => setShowAgenteModal(true)} className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase hover:bg-amber-100 transition-all border border-amber-100">+ Adicionar</button>
                      )}
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                     {tempAgentes.length > 0 ? tempAgentes.map((a, i) => (
                       <div key={i} className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-600 shadow-sm border border-[#E5E7EB]"><UserRound className="w-5 h-5" /></div>
                           <div className="flex flex-col">
                             <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-widest">{a.categoria}</span>
                             <span className="text-[14px] font-bold text-[#1F2937] uppercase">{a.principal}</span>
                           </div>
                         </div>
                         {isDirectActionMode && (
                           <button onClick={() => setTempAgentes(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                         )}
                       </div>
                     )) : (
                        <div className="p-6 bg-amber-50 border border-dashed border-amber-200 rounded-xl text-center space-y-2">
                           <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                           <p className="text-[12px] text-amber-700 font-black uppercase tracking-widest">Definição Obrigatória de Agente Violador Pendente</p>
                           <p className="text-[10px] text-amber-500 font-bold uppercase">Campo obrigatório para salvamento do prontuário.</p>
                        </div>
                     )}
                   </div>
                </div>

                {/* SEÇÃO: MEDIDAS E ATRIBUIÇÕES */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                      <div className="flex items-center gap-2 text-[15px] font-bold text-[#111827] uppercase"><Gavel className="w-5 h-5 text-emerald-600" /> Medidas e Atribuições Aplicadas</div>
                      {isDirectActionMode && (
                        <button onClick={() => setShowMedidaModal(true)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-100 transition-all border border-emerald-100">+ Aplicar Medida</button>
                      )}
                   </div>
                   <div className="space-y-4">
                     {tempMedidas.length > 0 ? tempMedidas.map((m, i) => {
                        const jaAssinou = m.confirmacoes.some(c => c.usuario_id === currentUser.id);
                        const precisaAssinar = m.conselheiros_requeridos.includes(currentUser.nome.toUpperCase()) && !jaAssinou;
                        
                        return (
                          <div key={m.id} className="p-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded uppercase border border-emerald-100">{m.artigo_inciso}</span>
                                  <span className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-widest">Lançado por {m.autor_nome} em {new Date(m.data_lancamento).toLocaleDateString('pt-BR')}</span>
                                </div>
                                {editingMedidaId === m.id ? (
                                  <div className="flex gap-2">
                                    <textarea className="flex-1 p-3 bg-slate-50 border rounded-xl text-[13px] uppercase font-bold" value={editMedidaText} onChange={e => setEditMedidaText(e.target.value)} />
                                    <button onClick={() => handleUpdateMedidaText(m.id)} className="p-2 bg-emerald-600 text-white rounded-lg"><Check className="w-4 h-4"/></button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 group">
                                     <p className="text-[14px] text-[#1F2937] font-bold uppercase leading-relaxed">{m.texto}</p>
                                     {isDirectActionMode && (
                                       <button 
                                          onClick={() => { setEditingMedidaId(m.id); setEditMedidaText(m.texto); }}
                                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                          title="Somente Conselheiro de Providência pode editar"
                                       >
                                          <Edit2 className="w-3.5 h-3.5" />
                                       </button>
                                     )}
                                  </div>
                                )}
                              </div>
                              {isDirectActionMode && !jaAssinou && (
                                <button onClick={() => setTempMedidas(prev => prev.filter(item => item.id !== m.id))} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5"/></button>
                              )}
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex flex-col gap-3">
                               <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Assinaturas Digitais Registradas:</span>
                               </div>
                               <div className="flex flex-wrap gap-2">
                                  {m.confirmacoes.map((conf, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                                       <Fingerprint className="w-3 h-3 text-emerald-600" />
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-black text-emerald-700 uppercase">{conf.usuario_nome}</span>
                                          <span className="text-[8px] font-bold text-emerald-500 uppercase">{formatSignatureDateTime(conf.data_hora)}</span>
                                       </div>
                                    </div>
                                  ))}
                                  {precisaAssinar && (
                                    <div className="w-full flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                                      {/* RESUMO DE FUNDAMENTAÇÃO PARA ASSINATURA */}
                                      <div className="p-4 bg-amber-50/50 border border-dashed border-amber-200 rounded-xl space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                          <Info className="w-3.5 h-3.5" /> Justificativa da Intervenção
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex flex-wrap gap-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase mr-1">Violações:</span>
                                            {tempViolacoes.map((v, idx) => (
                                              <span key={idx} className="px-1.5 py-0.5 bg-white text-blue-700 text-[8px] font-bold rounded border border-blue-100 uppercase">
                                                {v.especifico}
                                              </span>
                                            ))}
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase mr-1">Agentes:</span>
                                            {tempAgentes.map((a, idx) => (
                                              <span key={idx} className="px-1.5 py-0.5 bg-white text-amber-700 text-[8px] font-bold rounded border border-amber-100 uppercase">
                                                {a.principal}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                      <button onClick={() => handleConfirmMedida(m.id)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-black text-[11px] uppercase hover:bg-amber-100 transition-all animate-pulse shadow-sm">
                                         <ClipboardCheck className="w-4 h-4" /> Validar e Assinar Digitalmente
                                      </button>
                                    </div>
                                  )}
                               </div>
                            </div>
                          </div>
                        );
                     }) : (
                       <p className="text-[12px] text-red-500 font-bold uppercase italic text-center py-4 bg-red-50 rounded-xl">Nenhuma medida de proteção aplicada ao caso.</p>
                     )}
                   </div>
                </div>

                {isDirectActionMode && hasChanges && (
                     <div className="pt-8 border-t border-[#E5E7EB] flex flex-col md:flex-row justify-end gap-4">
                       <button onClick={saveRascunhoTecnico} className="w-full md:w-auto px-8 py-4 border border-[#2563EB] text-[#2563EB] rounded-xl font-bold uppercase text-[13px] flex items-center justify-center gap-3 hover:bg-blue-50 transition-all">
                         <ClipboardCheck className="w-5 h-5" /> Salvar Rascunho
                       </button>
                       <button onClick={saveProvidencias} className="w-full md:w-auto px-10 py-4 bg-[#059669] text-white rounded-xl font-bold uppercase text-[13px] flex items-center justify-center gap-3 shadow-xl hover:bg-[#047857] transition-all transform hover:scale-[1.02]">
                         <Save className="w-5 h-5" /> Registrar Triagem Técnica
                       </button>
                     </div>
                   )}
             </div>
          </section>
        </div>
      </div>

      {/* MODAL: SIPIA (DIREITO VIOLADO) */}
      {showSipiaModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
           <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 space-y-6">
              <header className="flex justify-between items-center border-b pb-4">
                 <h3 className="text-lg font-black uppercase tracking-tight">Identificar Violação (SIPIA)</h3>
                 <button onClick={() => setShowSipiaModal(false)}><X className="w-6 h-6 text-slate-400"/></button>
              </header>
              <div className="space-y-4">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold uppercase" placeholder="BUSCAR VIOLAÇÃO..." value={sipiaSearchTerm} onChange={e => setSipiaSearchTerm(e.target.value)} />
                 </div>
                 {sipiaSearchTerm ? (
                   <div className="max-h-[300px] overflow-y-auto space-y-2">
                     {sipiaSearchResults.map((opt, i) => (
                       <button key={i} onClick={() => { setSipiaSel(opt); handleAddSipia(); }} className="w-full text-left p-4 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 group">
                          <div className="text-[10px] font-black text-blue-500 uppercase">{opt.fundamental}</div>
                          <div className="text-sm font-bold uppercase text-slate-800">{opt.especifico}</div>
                       </button>
                     ))}
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-4">
                      {Object.keys(SIPIA_HIERARCHY).map(fund => (
                        <button key={fund} onClick={() => setSipiaSel({ ...sipiaSel, fundamental: fund })} className={`p-4 rounded-xl border text-left font-bold uppercase text-xs ${sipiaSel.fundamental === fund ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 hover:bg-slate-100 border-slate-100'}`}>{fund}</button>
                      ))}
                      {sipiaSel.fundamental && (
                        <div className="pt-4 space-y-2 border-t mt-4">
                           <span className="text-[10px] font-black text-slate-400 uppercase">Selecione o Agrupamento:</span>
                           {Object.keys(SIPIA_HIERARCHY[sipiaSel.fundamental]).map(grp => (
                             <button key={grp} onClick={() => setSipiaSel({ ...sipiaSel, grupo: grp })} className={`w-full p-3 rounded-lg border text-left font-bold uppercase text-[11px] ${sipiaSel.grupo === grp ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-50 border-slate-200'}`}>{grp}</button>
                           ))}
                        </div>
                      )}
                      {sipiaSel.grupo && (
                        <div className="pt-4 space-y-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase">Selecione a Violação Específica:</span>
                           {SIPIA_HIERARCHY[sipiaSel.fundamental][sipiaSel.grupo].map(esp => (
                             <button key={esp} onClick={() => { setSipiaSel({ ...sipiaSel, especifico: esp }); handleAddSipia(); }} className="w-full p-3 rounded-lg border border-slate-200 text-left font-bold uppercase text-[11px] hover:bg-emerald-50 hover:border-emerald-200">{esp}</button>
                           ))}
                        </div>
                      )}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* MODAL: AGENTE VIOLADOR */}
      {showAgenteModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
           <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 space-y-6">
              <header className="flex justify-between items-center border-b pb-4">
                 <h3 className="text-lg font-black uppercase tracking-tight">Definir Agente Violador</h3>
                 <button onClick={() => setShowAgenteModal(false)}><X className="w-6 h-6 text-slate-400"/></button>
              </header>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    {Object.keys(AGENTES_VIOLADORES_ESTRUTURA).map(cat => (
                       <button key={cat} onClick={() => setAgenteSel({ ...agenteSel, categoria: cat, opcao: '' })} className={`p-4 rounded-xl border font-bold uppercase text-[11px] ${agenteSel.categoria === cat ? 'bg-amber-600 text-white border-amber-600 shadow-lg' : 'bg-slate-50 hover:bg-slate-100'}`}>
                          {cat}
                       </button>
                    ))}
                 </div>
                 {agenteSel.categoria && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                       <p className="text-[11px] text-slate-500 italic font-bold uppercase tracking-wider">{AGENTES_VIOLADORES_ESTRUTURA[agenteSel.categoria].desc}</p>
                       <div className="grid grid-cols-2 gap-2">
                          {AGENTES_VIOLADORES_ESTRUTURA[agenteSel.categoria].options.map(opt => (
                             <button key={opt} onClick={() => { setAgenteSel({ ...agenteSel, opcao: opt }); handleAddAgente(); }} className="p-3 bg-white border border-slate-200 rounded-lg text-left text-[11px] font-bold uppercase hover:bg-amber-50 hover:border-amber-200 transition-all">{opt}</button>
                          ))}
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* MODAL: MEDIDA ECA */}
      {showMedidaModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
           <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 space-y-6">
              <header className="flex justify-between items-center border-b pb-4">
                 <h3 className="text-lg font-black uppercase tracking-tight">Aplicar Medida / Atribuição</h3>
                 <button onClick={() => setShowMedidaModal(false)}><X className="w-6 h-6 text-slate-400"/></button>
              </header>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Legal:</label>
                    <div className="grid grid-cols-3 gap-2">
                       {MEDIDAS_PROTECAO_ECA.map(m => (
                         <button key={m.artigo} onClick={() => setMedidaSel({ ...medidaSel, artigo: m.artigo, inciso: '' })} className={`p-3 rounded-xl border font-bold uppercase text-[10px] ${medidaSel.artigo === m.artigo ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 hover:bg-slate-100 border-slate-100'}`}>{m.artigo}</button>
                       ))}
                    </div>
                 </div>
                 {medidaSel.artigo && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecione o Inciso:</span>
                      <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                         {MEDIDAS_PROTECAO_ECA.find(a => a.artigo === medidaSel.artigo)?.incisos.map(inc => (
                           <button key={inc} onClick={() => { setMedidaSel({ ...medidaSel, inciso: inc }); }} className={`w-full p-4 rounded-xl border text-left transition-all ${medidaSel.inciso === inc ? 'bg-emerald-50 border-emerald-600' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                              <div className="font-black text-emerald-700 text-[11px] mb-1">{inc}</div>
                              <div className="text-[12px] font-bold uppercase text-slate-700 leading-tight">{MEDIDAS_ECA_DESCRICAO[inc]}</div>
                           </button>
                         ))}
                      </div>
                      <button onClick={handleAddMedida} disabled={!medidaSel.inciso} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[13px] shadow-lg disabled:opacity-50">Confirmar Seleção</button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* MODAL: REQUISIÇÃO DE SERVIÇOS (ART. 136 III a) */}
      {showRequisicaoPastas && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 border border-slate-200 space-y-8 animate-in zoom-in-95 relative">
             <button onClick={() => { setShowRequisicaoPastas(false); setIsCustomPrazo(false); }} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                <X className="w-6 h-6" />
             </button>
             <header className="space-y-2">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><Building2 className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900">Requisitar Serviço Público</h3>
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Base Legal: Art. 136, inciso III, alínea "a" do ECA</p>
             </header>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Área Administrativa</label>
                   <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold uppercase outline-none focus:border-blue-500" value={reqSel.area} onChange={e => setReqSel({ ...reqSel, area: e.target.value, servico: '' })}>
                      <option value="">Selecione a Área...</option>
                      {PASTAS_ART136_III_A.map(p => <option key={p.area} value={p.area}>{p.area}</option>)}
                   </select>
                </div>
                {reqSel.area && (
                  <div className="space-y-2 animate-in slide-in-from-top-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Equipamento / Serviço</label>
                     <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] font-bold uppercase outline-none focus:border-blue-500" value={reqSel.servico} onChange={e => setReqSel({ ...reqSel, servico: e.target.value })}>
                        <option value="">Selecione o Serviço...</option>
                        {PASTAS_ART136_III_A.find(p => p.area === reqSel.area)?.servicos.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                )}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prazo Legal de Resposta</label>
                   <div className="grid grid-cols-4 gap-4">
                      {[10, 15, 30].map(d => (
                        <button key={d} onClick={() => { setReqSel({...reqSel, prazo: d}); setIsCustomPrazo(false); }} className={`py-4 rounded-2xl border font-black text-[14px] uppercase transition-all ${reqSel.prazo === d && !isCustomPrazo ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}>{d} Dias</button>
                      ))}
                      <button onClick={() => { setIsCustomPrazo(true); setReqSel({...reqSel, prazo: 0}); }} className={`py-4 rounded-2xl border font-black text-[10px] uppercase transition-all ${isCustomPrazo ? 'bg-amber-600 text-white border-amber-600 shadow-xl' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}>Personalizar</button>
                   </div>
                </div>
                {isCustomPrazo && (
                  <div className="space-y-2 animate-in slide-in-from-bottom-1">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Definir Prazo Específico (em dias)</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[14px] font-bold outline-none focus:border-amber-500" 
                      placeholder="EX: 5, 20, 45..."
                      value={customPrazoVal}
                      onChange={e => setCustomPrazoVal(e.target.value)}
                    />
                  </div>
                )}
             </div>
             <button onClick={handleConfirmRequisicaoPastas} disabled={!reqSel.servico || (!isCustomPrazo && !reqSel.prazo) || (isCustomPrazo && !customPrazoVal)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[14px] tracking-widest shadow-2xl hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-3"><CheckCircle2 className="w-5 h-5" /> Aplicar Requisição Técnica</button>
          </div>
        </div>
      )}

      {showFamilyHistoryModal && (
        <FamilyHistoryModal history={familyHistory} currentUser={currentUser} onClose={() => setShowFamilyHistoryModal(false)} />
      )}
    </div>
  );
};

export default DocumentView;
