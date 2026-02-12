
import React, { useState, useMemo, useEffect, useRef } from 'react';
/* Added ChevronRight to the lucide-react import list */
import { ArrowLeft, ShieldCheck, Scale, X, Edit2, Check, Gavel, LayoutList, Users2, Lock, Zap, Clock, AlertCircle, Info, UserRound, MessageSquareWarning, Plus, Save, Search, Trash2, Sparkles, Loader2, BellRing, CheckCircle2, Fingerprint, Baby, ShieldAlert, ClipboardCheck, ShieldEllipsis, History, ChevronDown, ChevronUp, FolderTree, Building2, ChevronRight } from 'lucide-react';
import { Documento, DocumentFile, Log, User as UserType, DocumentStatus, MedidaAplicada, SipiaViolation, AgenteVioladorEntry, RequisicaoServico } from '../types';
import { STATUS_LABELS, INITIAL_USERS, MEDIDAS_ECA_DESCRICAO, SIPIA_HIERARCHY, AGENTES_VIOLADORES_ESTRUTURA, MEDIDAS_PROTECAO_ECA, ANNUAL_ESCALA, getEffectiveEscala, PASTAS_ART136_III_A } from '../constants';
import FamilyHistoryModal from './FamilyHistoryModal';

interface DocumentViewProps {
  document: Documento;
  allDocuments: Documento[]; // Necessário para cruzar histórico familiar
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
  
  // Estados para Art 136 III a
  const [showRequisicaoPastas, setShowRequisicaoPastas] = useState(false);
  const [reqSel, setReqSel] = useState<{ area: string, servico: string, prazo: number }>({ area: '', servico: '', prazo: 0 });

  const [showHistory, setShowHistory] = useState(false);
  const [showFamilyHistoryModal, setShowFamilyHistoryModal] = useState(false);
  
  const [editingMedidaId, setEditingMedidaId] = useState<string | null>(null);
  const [editMedidaText, setEditMedidaText] = useState('');
  const [showActions, setShowActions] = useState(false);
  
  const isConselheiro = currentUser.perfil === 'CONSELHEIRO' || (currentUser.perfil === 'SUPLENTE' && currentUser.substituicao_ativa);
  const isPlantonistaTitular = doc.conselheiro_providencia_id === currentUser.id;
  const isDirectActionMode = isPlantonistaTitular && isConselheiro;
  const isReferencia = doc.conselheiro_referencia_id === currentUser.id;
  
  const needsValidation = doc.status.includes('AGUARDANDO_VALIDACAO');
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

  // Lógica para busca inteligente no SIPIA
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

  const saveProvidencias = () => {
    if (!isDirectActionMode) return;
    if (tempViolacoes.length === 0 || tempAgentes.length === 0 || tempMedidas.length === 0) {
      alert("FUNDAMENTAÇÃO OBRIGATÓRIA: É necessário identificar a VIOLAÇÃO, o AGENTE VIOLADOR e aplicar ao menos uma MEDIDA DO ECA/ATRIBUIÇÃO.");
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

    // Sincronizar requisições do Art 136 III a com o objeto de monitoramento
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
    
    // Adicionar status MONITORAMENTO se houver requisições
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
    onAddLog(doc.id, `TRIAGEM TÉCNICA: Providências lançadas e registradas por ${currentUser.nome}. Requisições do Art. 136 III a integradas ao Monitoramento.`);
    alert("Dados técnicos salvos e auto-assinados com sucesso.");
  };

  const handleAddMedida = () => {
    if (!medidaSel.inciso) return;
    
    // REGRA: Se for Art. 136, III, a, abre o fluxo de pastas
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
    if (!reqSel.area || !reqSel.servico || !reqSel.prazo) {
      alert("ERRO: É obrigatório selecionar a área, o serviço de Hortolândia e definir o prazo legal.");
      return;
    }

    const dataFinal = new Date();
    dataFinal.setDate(dataFinal.getDate() + reqSel.prazo);
    
    const escalaDoDia = getEffectiveEscala(doc.data_recebimento);
    const desc = `REQUISITAR SERVIÇO PÚBLICO: ${reqSel.servico} (ÁREA: ${reqSel.area}) - PRAZO: ${reqSel.prazo} DIAS.`;

    const requisicaoInfo: RequisicaoServico = {
      id: `req-${Date.now()}`,
      area: reqSel.area,
      servico: reqSel.servico,
      prazoDias: reqSel.prazo,
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
    setShowRequisicaoPastas(false);
  };

  const handleUpdateMedidaText = (medidaId: string) => {
    setTempMedidas(prev => prev.map(m => m.id === medidaId ? { ...m, texto: editMedidaText.toUpperCase() } : m));
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
      { 
        principal: agenteSel.opcao, 
        categoria: agenteSel.categoria, 
        tipo: 'PRINCIPAL' as 'PRINCIPAL' | 'SECUNDARIO' 
      }
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
    onAddLog(doc.id, `ASSINATURA TÉCNICA (COLEGIADO): O Conselheiro ${currentUser.nome} confirmou a medida ${medidaId}.`);
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
                <div className="p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#4B5563] uppercase tracking-widest"><Users2 className="w-4 h-4" /> Informações Iniciais</div>
                  <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#1F2937] uppercase font-medium leading-relaxed">
                    {doc.informacoes_documento}
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                      <div className="flex items-center gap-2 text-[15px] font-bold text-[#111827] uppercase"><Scale className="w-5 h-5 text-[#2563EB]" /> Violações SIPIA (Obrigatório)</div>
                      {isDirectActionMode && (
                        <button onClick={() => setShowSipiaModal(true)} className="px-3 py-1.5 bg-blue-50 text-[#2563EB] rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition-all border border-blue-100">+ Adicionar</button>
                      )}
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                     {tempViolacoes.length > 0 ? tempViolacoes.map((v, i) => (
                       <div key={i} className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#2563EB] shadow-sm border border-[#E5E7EB]"><LayoutList className="w-5 h-5" /></div>
                           <div className="flex flex-col">
                             <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-widest">{v.fundamental}</span>
                             <span className="text-[14px] font-bold text-[#1F2937] uppercase">{v.especifico}</span>
                           </div>
                         </div>
                         {isDirectActionMode && (
                           <button onClick={() => setTempViolacoes(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                         )}
                       </div>
                     )) : (
                       <p className="text-[12px] text-red-500 font-bold uppercase italic text-center py-4 bg-red-50 rounded-xl border border-dashed border-red-200">Preenchimento obrigatório para salvar providência técnica.</p>
                     )}
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                      <div className="flex items-center gap-2 text-[15px] font-bold text-[#111827] uppercase"><Users2 className="w-5 h-5 text-[#2563EB]" /> Agentes Violadores (Obrigatório)</div>
                      {isDirectActionMode && (
                        <button onClick={() => setShowAgenteModal(true)} className="px-3 py-1.5 bg-blue-50 text-[#2563EB] rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition-all border border-blue-100">+ Vincular</button>
                      )}
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                     {tempAgentes.length > 0 ? tempAgentes.map((a, i) => (
                       <div key={i} className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#2563EB] shadow-sm border border-[#E5E7EB]"><ShieldCheck className="w-5 h-5" /></div>
                           <div className="flex flex-col">
                             <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-widest">{a.categoria}</span>
                             <span className="text-[14px] font-bold text-[#1F2937] uppercase">{a.principal}</span>
                           </div>
                         </div>
                         {isDirectActionMode && (
                           <button onClick={() => setTempAgentes(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                         )}
                       </div>
                     )) : (
                       <p className="text-[12px] text-red-500 font-bold uppercase italic text-center py-4 bg-red-50 rounded-xl border border-dashed border-red-200">Identificação do agente violador é mandatória.</p>
                     )}
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                      <div className="flex items-center gap-2 text-[15px] font-bold text-[#111827] uppercase"><Gavel className="w-5 h-5 text-[#2563EB]" /> Medidas e Atribuições (Obrigatório)</div>
                      {isDirectActionMode && (
                        <button onClick={() => setShowMedidaModal(true)} className="px-3 py-1.5 bg-blue-50 text-[#2563EB] rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition-all border border-blue-100">+ Aplicar Medida</button>
                      )}
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                     {tempMedidas.length > 0 ? tempMedidas.map((m, i) => {
                       const precisaAssinar = m.conselheiros_requeridos.includes(currentUser.nome.toUpperCase()) && !m.confirmacoes.some(c => c.usuario_id === currentUser.id);
                       const isEditing = editingMedidaId === m.id;
                       
                       return (
                       <div key={m.id} className={`p-5 bg-white border rounded-2xl shadow-sm space-y-4 group ${precisaAssinar ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-[#E5E7EB]'}`}>
                         <div className="flex items-center justify-between">
                           <span className="text-[11px] font-black text-[#2563EB] bg-blue-50 px-2 py-1 rounded uppercase tracking-widest">{m.artigo_inciso}</span>
                           {isDirectActionMode && (
                             <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => { setEditingMedidaId(m.id); setEditMedidaText(m.texto); }} 
                                 className="p-1.5 text-slate-400 hover:text-[#2563EB] opacity-0 group-hover:opacity-100 transition-all"
                               >
                                 <Edit2 className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={() => setTempMedidas(prev => prev.filter(item => item.id !== m.id))} 
                                 className="p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                           )}
                         </div>

                         {isEditing ? (
                           <div className="space-y-3">
                              <textarea 
                                className="w-full p-3 bg-slate-50 border border-[#2563EB] rounded-xl text-[13px] font-bold uppercase outline-none min-h-[80px]"
                                value={editMedidaText}
                                onChange={e => setEditMedidaText(e.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingMedidaId(null)} className="px-4 py-2 bg-slate-100 text-[#4B5563] rounded-lg text-[10px] font-black uppercase tracking-widest">Cancelar</button>
                                <button onClick={() => handleUpdateMedidaText(m.id)} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Check className="w-3.5 h-3.5" /> Salvar</button>
                              </div>
                           </div>
                         ) : (
                           <p className="text-[13px] font-medium text-[#1F2937] leading-relaxed uppercase">{m.texto}</p>
                         )}
                         
                         <div className="pt-4 border-t border-dashed border-slate-100 space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assinaturas Técnicas Requeridas (Escala do Dia):</span>
                            <div className="flex flex-wrap gap-2">
                               {m.conselheiros_requeridos.map(nome => {
                                  const confirmou = m.confirmacoes.find(c => c.usuario_nome.toUpperCase() === nome.toUpperCase());
                                  return (
                                    <div key={nome} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${confirmou ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                       {confirmou ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                       {nome} {confirmou && `(${formatSignatureDateTime(confirmou.data_hora)})`}
                                    </div>
                                  );
                               })}
                            </div>
                         </div>

                         {precisaAssinar && !isEditing && (
                           <button onClick={() => handleConfirmMedida(m.id)} className="w-full py-3 bg-amber-600 text-white rounded-xl font-black uppercase text-[11px] shadow-lg hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
                             <Fingerprint className="w-4 h-4" /> Assinar Medida Técnica
                           </button>
                         )}
                       </div>
                     )}) : (
                       <p className="text-[12px] text-red-500 font-bold uppercase italic text-center py-4 bg-red-50 rounded-xl border border-dashed border-red-200">Nenhuma medida aplicada ainda.</p>
                     )}
                   </div>
                   
                   {isDirectActionMode && hasChanges && (
                     <div className="pt-8 border-t border-[#E5E7EB] flex justify-end">
                       <button onClick={saveProvidencias} className="w-full md:w-auto px-10 py-4 bg-[#059669] text-white rounded-xl font-bold uppercase text-[13px] flex items-center justify-center gap-3 shadow-xl hover:bg-[#047857] transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                         <Save className="w-5 h-5" /> Salvar Providências e Auto-Assinar
                       </button>
                     </div>
                   )}
                </div>
             </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
           {isDirectActionMode && !isReadOnly && (
             <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col">
               <button 
                onClick={() => setShowActions(!showActions)}
                className="w-full p-8 flex items-center justify-between text-[#111827] hover:bg-slate-50 transition-all border-b border-[#E5E7EB]"
               >
                 <div className="flex items-center gap-3">
                   <ShieldEllipsis className="w-5 h-5 text-[#2563EB]" />
                   <h3 className="text-[14px] font-bold uppercase tracking-widest">Ações do Protocolo</h3>
                 </div>
                 {showActions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
               </button>

               {showActions && (
                 <div className="p-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
                   <div className="space-y-2">
                     {Object.entries(STATUS_LABELS).map(([k,v]) => { 
                       const sel = localStatus.includes(k as DocumentStatus); 
                       return (
                         <button 
                           key={k} 
                           onClick={() => setLocalStatus(prev => prev.includes(k as any) ? prev.filter(s => s !== k) : [...prev, k as any])} 
                           className={`w-full flex items-center justify-between p-3 rounded-xl text-[11px] font-bold uppercase transition-all ${sel ? 'bg-[#111827] text-white shadow-md' : 'bg-[#F9FAFB] border border-[#E5E7EB] text-[#4B5563] hover:bg-slate-100'}`}
                         >
                           {v} {sel && <Check className="w-3 h-3" />}
                         </button>
                       ); 
                     })}
                   </div>
                   <button 
                     onClick={() => {
                       const finalStatus = localStatus.filter(s => s !== 'NAO_LIDO');
                       onUpdateStatus(doc.id, finalStatus.length > 0 ? finalStatus : localStatus);
                       setShowActions(false);
                     }} 
                     className="w-full py-4 bg-[#2563EB] text-white rounded-xl font-bold uppercase text-[13px] shadow-lg hover:bg-[#1D4ED8] transition-all"
                   >
                     Atualizar Status
                   </button>
                 </div>
               )}
             </section>
           )}
        </div>
      </div>

      {/* HISTORICO */}
      <div className="pt-10 space-y-4">
        <div className="flex justify-center">
          <button onClick={() => setShowHistory(!showHistory)} className="px-8 py-3 border border-[#E5E7EB] bg-white rounded-2xl font-bold uppercase text-[13px] flex items-center gap-3 hover:bg-slate-50 transition-all shadow-md">
            <History className="w-5 h-5 text-slate-500" /> {showHistory ? 'Ocultar Histórico Administrativo' : 'Verificar Histórico Administrativo'}
          </button>
        </div>

        {showHistory && (
          <div className="p-8 bg-white border border-[#E5E7EB] rounded-3xl shadow-sm space-y-4 animate-in slide-in-from-bottom-4 duration-500">
             <h3 className="text-[14px] font-bold text-[#111827] uppercase tracking-widest border-b border-[#E5E7EB] pb-3 flex items-center gap-2">
               <History className="w-4 h-4 text-blue-600" /> Trilha de Auditoria do Prontuário
             </h3>
             <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto pr-2">
               {logs.map(log => (
                 <div key={log.id} className="py-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors px-2 rounded-xl">
                   <div className="shrink-0 p-2.5 bg-slate-100 rounded-xl"><UserRound className="w-4 h-4 text-slate-400" /></div>
                   <div className="flex-1">
                     <p className="text-[12px] font-bold text-[#111827] uppercase">{log.acao}</p>
                     <div className="flex items-center gap-4 mt-1.5">
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">{log.usuario_nome}</span>
                       <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                         <Clock className="w-3 h-3" /> {new Date(log.data_hora).toLocaleString('pt-BR')}
                       </span>
                     </div>
                   </div>
                 </div>
               ))}
               {logs.length === 0 && <p className="text-[12px] text-slate-400 py-8 italic uppercase text-center">Nenhum registro de ação encontrado para este documento.</p>}
             </div>
          </div>
        )}
      </div>
      
      {showFamilyHistoryModal && (
        <FamilyHistoryModal 
          history={familyHistory} 
          currentUser={currentUser} 
          onClose={() => setShowFamilyHistoryModal(false)} 
        />
      )}

      {/* MODAL SIPIA COM BUSCA INTELIGENTE */}
      {showSipiaModal && isDirectActionMode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-[#E5E7EB] animate-in zoom-in-95 space-y-6">
            <header className="flex justify-between items-center border-b pb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-[16px] font-bold text-[#111827] uppercase">Tipificar Violação SIPIA</h3>
              </div>
              <button onClick={() => setShowSipiaModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </header>

            {/* Campo de Busca Inteligente */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest ml-1">Busca Rápida de Violações</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="DIGITE PALAVRAS-CHAVE (EX: MEDICO, ESCOLA, AGRESSOR)..."
                  className="w-full p-4 pl-12 bg-blue-50/50 border border-blue-100 rounded-xl outline-none text-[13px] font-bold uppercase focus:border-[#2563EB] transition-all"
                  value={sipiaSearchTerm}
                  onChange={e => setSipiaSearchTerm(e.target.value)}
                />
              </div>

              {sipiaSearchTerm.trim() && (
                <div className="mt-2 bg-white border border-blue-100 rounded-xl shadow-xl max-h-[250px] overflow-y-auto animate-in slide-in-from-top-2">
                   {sipiaSearchResults.length > 0 ? sipiaSearchResults.map((res, idx) => (
                     <button 
                       key={idx}
                       onClick={() => {
                          setSipiaSel({ fundamental: res.fundamental, grupo: res.grupo, especifico: res.especifico });
                          setSipiaSearchTerm('');
                       }}
                       className="w-full text-left p-4 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                     >
                        <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{res.fundamental} | {res.grupo}</div>
                        <div className="text-[12px] font-bold text-slate-800 uppercase mt-1">{res.especifico}</div>
                     </button>
                   )) : (
                     <div className="p-8 text-center text-slate-400 text-[11px] font-bold uppercase italic">Nenhuma violação compatível encontrada.</div>
                   )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#4B5563] uppercase">Direito Fundamental</label>
                <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-[13px] font-bold uppercase" value={sipiaSel.fundamental} onChange={e => setSipiaSel({...sipiaSel, fundamental: e.target.value, grupo: '', especifico: ''})}>
                  <option value="">Selecione...</option>
                  {Object.keys(SIPIA_HIERARCHY).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              {sipiaSel.fundamental && (
                <div className="space-y-1 animate-in slide-in-from-top-1">
                  <label className="text-[11px] font-bold text-[#4B5563] uppercase">Grupo de Violação</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-[13px] font-bold uppercase" value={sipiaSel.grupo} onChange={e => setSipiaSel({...sipiaSel, grupo: e.target.value, especifico: ''})}>
                    <option value="">Selecione...</option>
                    {Object.keys(SIPIA_HIERARCHY[sipiaSel.fundamental]).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              )}
              {sipiaSel.grupo && (
                <div className="space-y-1 animate-in slide-in-from-top-1">
                  <label className="text-[11px] font-bold text-[#4B5563] uppercase">Violação Específica</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-[13px] font-bold uppercase" value={sipiaSel.especifico} onChange={e => setSipiaSel({...sipiaSel, especifico: e.target.value})}>
                    <option value="">Selecione...</option>
                    {SIPIA_HIERARCHY[sipiaSel.fundamental][sipiaSel.grupo].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              )}
            </div>
            <button onClick={handleAddSipia} disabled={!sipiaSel.especifico} className="w-full py-4 bg-[#111827] text-white rounded-xl font-bold uppercase text-[12px] shadow-lg hover:bg-blue-600 disabled:opacity-50 transition-all">Confirmar Violação</button>
          </div>
        </div>
      )}

      {/* MODAL AGENTE */}
      {showAgenteModal && isDirectActionMode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-[#E5E7EB] animate-in zoom-in-95 space-y-6">
            <header className="flex justify-between items-center border-b pb-4">
              <h3 className="text-[16px] font-bold text-[#111827] uppercase">Identificar Agente Violador</h3>
              <button onClick={() => setShowAgenteModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </header>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#4B5563] uppercase">Categoria</label>
                <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-[13px] font-bold uppercase" value={agenteSel.categoria} onChange={e => setAgenteSel({...agenteSel, categoria: e.target.value, opcao: ''})}>
                  <option value="">Selecione...</option>
                  {Object.keys(AGENTES_VIOLADORES_ESTRUTURA).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {agenteSel.categoria && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#4B5563] uppercase">Agente Específico</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-[13px] font-bold uppercase" value={agenteSel.opcao} onChange={e => setAgenteSel({...agenteSel, opcao: e.target.value})}>
                    <option value="">Selecione...</option>
                    {AGENTES_VIOLADORES_ESTRUTURA[agenteSel.categoria].options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}
            </div>
            <button onClick={handleAddAgente} disabled={!agenteSel.opcao} className="w-full py-4 bg-[#111827] text-white rounded-xl font-bold uppercase text-[12px] shadow-lg hover:bg-blue-600 disabled:opacity-50 transition-all">Vincular Agente</button>
          </div>
        </div>
      )}

      {/* MODAL MEDIDA ECA */}
      {showMedidaModal && isDirectActionMode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-[#E5E7EB] animate-in zoom-in-95 space-y-6">
            <header className="flex justify-between items-center border-b pb-4">
              <h3 className="text-[16px] font-bold text-[#111827] uppercase">Aplicar Medida / Atribuição (ECA)</h3>
              <button onClick={() => setShowMedidaModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </header>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#4B5563] uppercase">Grupo Legislativo</label>
                <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-[13px] font-bold uppercase" value={medidaSel.artigo} onChange={e => setMedidaSel({...medidaSel, artigo: e.target.value, inciso: ''})}>
                  <option value="">Selecione o Artigo...</option>
                  {MEDIDAS_PROTECAO_ECA.map(m => <option key={m.artigo} value={m.artigo}>{m.artigo}</option>)}
                </select>
              </div>
              {medidaSel.artigo && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#4B5563] uppercase">Dispositivo Legal (Inciso)</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-[13px] font-bold uppercase" value={medidaSel.inciso} onChange={e => setMedidaSel({...medidaSel, inciso: e.target.value})}>
                    <option value="">Selecione o Inciso...</option>
                    {MEDIDAS_PROTECAO_ECA.find(m => m.artigo === medidaSel.artigo)?.incisos.map(inc => (
                       <option key={inc} value={inc}>{inc}</option>
                    ))}
                  </select>
                </div>
              )}
              {medidaSel.inciso && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="text-[11px] font-black text-[#2563EB] uppercase mb-2">Teor do Dispositivo ECA:</h5>
                  <p className="text-[13px] font-bold text-[#1F2937] leading-relaxed uppercase">
                    {MEDIDAS_ECA_DESCRICAO[medidaSel.inciso]}
                  </p>
                </div>
              )}
            </div>
            <button onClick={handleAddMedida} disabled={!medidaSel.inciso} className="w-full py-4 bg-[#111827] text-white rounded-xl font-bold uppercase text-[12px] shadow-lg hover:bg-blue-600 disabled:opacity-50 transition-all">Aplicar Medida Técnica</button>
          </div>
        </div>
      )}

      {/* NOVO: MODAL DE PASTAS PARA REQUISIÇÃO (Art. 136, III, a) */}
      {showRequisicaoPastas && isDirectActionMode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-10 border border-[#E5E7EB] animate-in zoom-in-95 space-y-8 max-h-[90vh] overflow-y-auto">
            <header className="flex justify-between items-center border-b pb-6">
              <div className="flex items-center gap-3">
                <FolderTree className="w-6 h-6 text-[#2563EB]" />
                <h3 className="text-[18px] font-bold text-[#111827] uppercase tracking-tight">Expandir Art. 136, III, "a"</h3>
              </div>
              <button onClick={() => setShowRequisicaoPastas(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#4B5563] uppercase tracking-widest ml-1">Área de Política Pública</label>
                  <div className="grid grid-cols-1 gap-2">
                    {PASTAS_ART136_III_A.map(p => (
                      <button 
                        key={p.area}
                        type="button"
                        onClick={() => setReqSel({...reqSel, area: p.area, servico: ''})}
                        className={`flex items-center justify-between p-4 rounded-xl text-[12px] font-bold uppercase transition-all border ${reqSel.area === p.area ? 'bg-[#111827] text-white border-[#111827] shadow-md' : 'bg-slate-50 border-slate-200 text-[#4B5563] hover:bg-slate-100'}`}
                      >
                        {p.area} <ChevronRight className="w-4 h-4 opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {reqSel.area && (
                  <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                    <label className="text-[11px] font-black text-[#4B5563] uppercase tracking-widest ml-1">Serviços de Hortolândia</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-[13px] font-bold uppercase focus:border-[#2563EB]"
                      value={reqSel.servico}
                      onChange={e => setReqSel({...reqSel, servico: e.target.value})}
                    >
                      <option value="">Selecione o Serviço...</option>
                      {PASTAS_ART136_III_A.find(p => p.area === reqSel.area)?.servicos.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                {reqSel.servico && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#4B5563] uppercase tracking-widest ml-1">Atalhos de Prazo (Mandatório)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[5, 10, 15, 30].map(d => (
                          <button 
                            key={d}
                            type="button"
                            onClick={() => setReqSel({...reqSel, prazo: d})}
                            className={`p-3 rounded-xl text-[11px] font-black uppercase transition-all border ${reqSel.prazo === d ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white border-slate-200 text-slate-400 hover:border-[#2563EB]'}`}
                          >
                            {d} Dias
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#4B5563] uppercase tracking-widest ml-1">Ou digitar prazo personalizado (Dias)</label>
                      <input 
                        type="number" 
                        min="1"
                        placeholder="EX: 45"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-[13px] font-bold uppercase focus:border-[#2563EB]"
                        value={reqSel.prazo || ''}
                        onChange={e => setReqSel({...reqSel, prazo: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t flex flex-col gap-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#2563EB] font-bold uppercase leading-relaxed">
                  Ao salvar, esta requisição será enviada automaticamente ao Monitoramento do Conselheiro de Referência.
                </p>
              </div>
              <button 
                onClick={handleConfirmRequisicaoPastas} 
                disabled={!reqSel.prazo}
                className="w-full py-5 bg-[#111827] text-white rounded-2xl font-black uppercase text-[13px] shadow-xl hover:bg-[#2563EB] disabled:opacity-30 transition-all flex items-center justify-center gap-3"
              >
                <Save className="w-5 h-5" /> Confirmar Atribuição e Prazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentView;
