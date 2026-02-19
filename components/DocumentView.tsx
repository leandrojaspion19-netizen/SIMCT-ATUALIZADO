
// DIRETRIZ 80-93: Protocolo de Revalidação, Catalogação Art. 136, Simplificação de Relatos e Multi-requisição Dinâmica
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Scale, X, Check, Clock, AlertCircle, Info, 
  Save, ShieldAlert, History, ClipboardList, CheckSquare, Square, 
  SendHorizonal, ListChecks, Activity, Ban, Calendar, UserRound, 
  CheckCircle, CheckCircle2, ChevronDown, Play, RotateCcw, Users2, Edit2, Zap, Building2, Plus, Trash2, Gavel, Timer, LayoutGrid, ChevronRight, Search, FileText, LayoutList, MessageSquare
} from 'lucide-react';
import { 
  Documento, Log, User as UserType, DocumentStatus, 
  MedidaAplicada, SipiaViolation, AgenteVioladorEntry, LogType, SnapshotComparativo, RequisicaoServico
} from '../types';
import { 
  STATUS_LABELS, INITIAL_USERS, 
  SIPIA_HIERARCHY, AGENTES_VIOLADORES_ESTRUTURA, 
  getEffectiveEscala, MEDIDAS_101_ECA, MEDIDAS_129_ECA, ATRIBUICOES_136_ECA, REDE_HORTOLANDIA
} from '../constants';

interface DocumentViewProps {
  document: Documento;
  allDocuments: Documento[]; 
  currentUser: UserType;
  files: any[];
  logs: Log[];
  isReadOnly?: boolean;
  forceEdit?: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, s: DocumentStatus[]) => void;
  onUpdateDocument: (id: string, fields: Partial<Documento>) => void;
  onAddLog: (docId: string, acao: string, tipo?: LogType) => void;
  onScience: (id: string) => void;
}

const DocumentView: React.FC<DocumentViewProps> = ({ 
  document: doc, 
  currentUser, 
  onBack, 
  onUpdateDocument,
  onAddLog
}) => {
  const accordionRef = useRef<HTMLDivElement>(null);
  const subMenuRef = useRef<HTMLDivElement>(null); 
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isArt136Open, setIsArt136Open] = useState(false); 
  const [atribuicaoSearch, setAtribuicaoSearch] = useState(''); 
  
  const [tempViolacoes, setTempViolacoes] = useState<SipiaViolation[]>(doc.violacoesSipia || []);
  const [tempAgentes, setTempAgentes] = useState<AgenteVioladorEntry[]>(doc.agentesVioladores || []);
  const [selectedMedidas101, setSelectedMedidas101] = useState<string[]>((doc.medidas_detalhadas || []).filter(m => m.artigo_inciso.startsWith('Art. 101')).map(m => m.artigo_inciso.replace('Art. 101, ', '')));
  const [selectedMedidas129, setSelectedMedidas129] = useState<string[]>((doc.medidas_detalhadas || []).filter(m => m.artigo_inciso.startsWith('Art. 129')).map(m => m.artigo_inciso.replace('Art. 129, ', '')));
  const [selectedAtribuicoes136, setSelectedAtribuicoes136] = useState<string[]>(doc.atribuicoes_136 || []);
  
  const [relatoProvidencias, setRelatoProvidencias] = useState(doc.relato_providencias || '');

  const [tempRequisicoes, setTempRequisicoes] = useState<RequisicaoServico[]>(doc.monitoramento?.requisicoes || []);
  const [obsMonitoramento, setObsMonitoramento] = useState<string>(doc.observacao_monitoramento || '');
  const [isImprocedente, setIsImprocedente] = useState<boolean>(doc.is_improcedente || false);

  const isImediataResponsavel = doc.conselheiro_providencia_id === currentUser.id;
  const canEditTechnicalFields = isImediataResponsavel; 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accordionRef.current && !accordionRef.current.contains(event.target as Node)) {
        setActiveSection(null);
      }
      if (subMenuRef.current && !subMenuRef.current.contains(event.target as Node)) {
        setIsArt136Open(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validationTracker = useMemo(() => {
    const trio = doc.conselheiros_providencia_nomes || [];
    const confirmacoes = doc.medidas_detalhadas?.[0]?.confirmacoes || [];
    return trio.map(name => {
      const match = confirmacoes.find(c => c.usuario_nome.toUpperCase().includes(name.toUpperCase()));
      return { name, validated: !!match, timestamp: match?.usuario_nome.split(' - ')[1] || null };
    });
  }, [doc.conselheiros_providencia_nomes, doc.medidas_detalhadas]);

  const hasExpiredRequisicao = useMemo(() => {
    if (!tempRequisicoes || tempRequisicoes.length === 0) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    return tempRequisicoes.some(r => !r.excluidoDoMonitoramento && new Date(r.dataFinal) < today);
  }, [tempRequisicoes]);

  const diffs = useMemo(() => {
    if (!doc.snapshot_validado) return { direito: false, agente: false, medida: false, justificativa: false, requisicoes: false, atribuicoes: false };
    const prev = doc.snapshot_validado;
    const direitoChanged = JSON.stringify(prev.violacoesSipia) !== JSON.stringify(doc.violacoesSipia);
    const agenteChanged = JSON.stringify(prev.agentesVioladores) !== JSON.stringify(doc.agentesVioladores);
    const prevMedNames = prev.medidas_detalhadas.map(m => m.artigo_inciso).sort().join(',');
    const currentMedNames = (doc.medidas_detalhadas || []).map(m => m.artigo_inciso).sort().join(',');
    const medidaChanged = prevMedNames !== currentMedNames;
    const justificativaChanged = prev.observacao_monitoramento !== doc.observacao_monitoramento;
    const atribuicoesChanged = JSON.stringify(prev.atribuicoes_136) !== JSON.stringify(selectedAtribuicoes136);
    const requisicoesChanged = JSON.stringify(doc.monitoramento?.requisicoes || []) !== JSON.stringify(tempRequisicoes);
    return { 
      direito: direitoChanged, agente: agenteChanged, medida: medidaChanged, 
      justificativa: justificativaChanged, requisicoes: requisicoesChanged, atribuicoes: atribuicoesChanged,
      any: direitoChanged || agenteChanged || medidaChanged || justificativaChanged || requisicoesChanged || atribuicoesChanged
    };
  }, [doc.snapshot_validado, doc.violacoesSipia, doc.agentesVioladores, doc.medidas_detalhadas, doc.atribuicoes_136, selectedAtribuicoes136, doc.observacao_monitoramento, doc.monitoramento, tempRequisicoes]);

  const filteredAtribuicoes = useMemo(() => {
    const term = atribuicaoSearch.toUpperCase();
    return ATRIBUICOES_136_ECA.filter(a => a.label.toUpperCase().includes(term) || a.id.toUpperCase().includes(term));
  }, [atribuicaoSearch]);

  const toggleSipia = (fund: string, grp: string, item: string) => {
    if (!canEditTechnicalFields) return;
    if (item === '🚫 DIREITO NÃO VIOLADO / FATO NÃO COMPROVADO') {
      const isSelecting = !tempViolacoes.some(v => v.especifico === item);
      if (isSelecting) {
        setTempViolacoes([{ fundamental: fund, grupo: grp, especifico: item }]);
        setTempAgentes([{ categoria: 'INEXISTENTE', principal: 'Inexistente/Fato não Comprovado', tipo: 'PRINCIPAL' }]);
        setIsImprocedente(true);
        setActiveSection('atribuicoes'); 
      } else {
        setTempViolacoes([]); setTempAgentes([]); setIsImprocedente(false);
      }
      return;
    }
    const wasImprocedente = tempViolacoes.some(v => v.especifico === '🚫 DIREITO NÃO VIOLADO / FATO NÃO COMPROVADO');
    let base = wasImprocedente ? [] : [...tempViolacoes];
    if (wasImprocedente) { setTempAgentes([]); setIsImprocedente(false); }
    setTempViolacoes(base.some(v => v.especifico === item) ? base.filter(v => v.especifico !== item) : [...base, { fundamental: fund, grupo: grp, especifico: item }]);
  };

  const addRequisicao = (area: string, servico: string, prazoDias: number = 5) => {
    const dataFinal = new Date(Date.now() + prazoDias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nova: RequisicaoServico = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      area, servico, prazoDias, dataFinal, isForaDaRede: false, observacoes: ''
    };
    setTempRequisicoes(prev => [...prev, nova]);
  };

  const updateRequisicao = (id: string, updates: Partial<RequisicaoServico>) => {
    setTempRequisicoes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const toggleAtribuicao = (id: string) => {
    if (!canEditTechnicalFields) return;
    const isAdding = !selectedAtribuicoes136.includes(id);
    setSelectedAtribuicoes136(prev => isAdding ? [...prev, id] : prev.filter(x => x !== id));
    if (id === 'III-a' && isAdding) {
      setIsArt136Open(true);
    }
    const now = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
    onAddLog(doc.id, `[${now}] - [${currentUser.nome}] - ${isAdding ? 'Selecionou' : 'Removeu'} Atribuição Inciso ${id}`, 'VALIDAÇÃO');
  };

  const toggleAgente = (categoria: string, principal: string) => {
    if (!canEditTechnicalFields) return;
    setTempAgentes(prev => {
      const exists = prev.some(a => a.principal === principal);
      return exists ? prev.filter(a => a.principal !== principal) : [...prev, { categoria, principal, tipo: 'PRINCIPAL' }];
    });
  };

  const handleSave = (finalize: boolean) => {
    if (!canEditTechnicalFields) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
    const mySignature = { usuario_id: currentUser.id, usuario_nome: `${currentUser.nome} - ${formattedDate}`, data_hora: now.toISOString() };
    const hasExistingValidations = validationTracker.some(v => v.validated && v.name !== currentUser.nome.toUpperCase());
    
    const newSnapshot: SnapshotComparativo = {
      violacoesSipia: doc.violacoesSipia, agentesVioladores: doc.agentesVioladores,
      medidas_detalhadas: doc.medidas_detalhadas || [], atribuicoes_136: doc.atribuicoes_136 || [],
      observacao_monitoramento: doc.observacao_monitoramento || ''
    };
    
    const combinedMedidas: MedidaAplicada[] = [
      ...selectedMedidas101.map(id => ({ 
        id: `med-101-${id}-${Date.now()}`, artigo_inciso: `Art. 101, ${id}`, texto: MEDIDAS_101_ECA.find(m => m.id === id)?.label || '', 
        autor_id: currentUser.id, autor_nome: currentUser.nome, data_lancamento: now.toISOString(), 
        conselheiros_requeridos: doc.conselheiros_providencia_nomes, confirmacoes: [mySignature] 
      })),
      ...selectedMedidas129.map(id => ({ 
        id: `med-129-${id}-${Date.now()}`, artigo_inciso: `Art. 129, ${id}`, texto: MEDIDAS_129_ECA.find(m => m.id === id)?.label || '', 
        autor_id: currentUser.id, autor_nome: currentUser.nome, data_lancamento: now.toISOString(), 
        conselheiros_requeridos: doc.conselheiros_providencia_nomes, confirmacoes: [mySignature] 
      }))
    ];
    
    let nextStatus = [...doc.status];
    if (tempRequisicoes.length > 0 && !nextStatus.includes('MONITORAMENTO')) nextStatus.push('MONITORAMENTO');
    
    onUpdateDocument(doc.id, { 
      violacoesSipia: tempViolacoes, agentesVioladores: tempAgentes, medidas_detalhadas: combinedMedidas, atribuicoes_136: selectedAtribuicoes136,
      relato_providencias: relatoProvidencias,
      status: finalize ? ['AGUARDANDO_VALIDACAO', ...nextStatus.filter(s => s !== 'AGUARDANDO_VALIDACAO')] : ['EM_PREENCHIMENTO', ...nextStatus.filter(s => s !== 'EM_PREENCHIMENTO')],
      is_improcedente: isImprocedente, justificativa_improcedencia: isImprocedente ? obsMonitoramento : '',
      observacao_monitoramento: obsMonitoramento, snapshot_validado: hasExistingValidations ? newSnapshot : doc.snapshot_validado,
      monitoramento: {
        concluido: tempRequisicoes.length === 0,
        prazoEsperado: tempRequisicoes.length > 0 ? tempRequisicoes.sort((a,b) => new Date(a.dataFinal).getTime() - new Date(b.dataFinal).getTime())[0].dataFinal : '',
        requisicoes: tempRequisicoes
      }
    });
    
    if (hasExistingValidations && diffs.any) {
       onAddLog(doc.id, `${currentUser.nome} (Imediata) alterou Atribuições/Mérito. Revalidação Coletiva Solicitada.`, 'VALIDAÇÃO');
    } else {
       onAddLog(doc.id, `REGISTRO TÉCNICO: Salvamento realizado com sucesso por ${currentUser.nome}.`, 'DOCUMENTO');
    }
  };

  const handleValidate = () => {
    const now = new Date();
    const formatted = `${currentUser.nome} - ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;
    const updated = (doc.medidas_detalhadas || []).map(m => ({ ...m, confirmacoes: [...m.confirmacoes, { usuario_id: currentUser.id, usuario_nome: formatted, data_hora: now.toISOString() }] }));
    
    const validatedOthers = validationTracker.filter(v => v.validated && v.name !== currentUser.nome.toUpperCase()).length;
    const trioSize = doc.conselheiros_providencia_nomes?.length || 3;
    
    let nextStatus = [...doc.status];
    let fieldsToUpdate: Partial<Documento> = { medidas_detalhadas: updated };
    
    if (validatedOthers === (trioSize - 1)) { 
       nextStatus = nextStatus.filter(s => s !== 'AGUARDANDO_VALIDACAO');
       if (!nextStatus.includes('OFICIALIZADO')) nextStatus.push('OFICIALIZADO');
       fieldsToUpdate.snapshot_validado = undefined;
    }

    onUpdateDocument(doc.id, { ...fieldsToUpdate, status: nextStatus });
    onAddLog(doc.id, `VALIDAÇÃO: ${currentUser.nome} confirmou concordância com o mérito/atribuições.`, 'VALIDAÇÃO');
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <header className="p-8 bg-[#111827] text-white flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-blue-600/10 -skew-x-12 translate-x-32"></div>
            <button onClick={onBack} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all z-10"><ArrowLeft className="w-6 h-6" /></button>
            <div className="text-center z-10"><h2 className="text-[20px] font-black uppercase tracking-tight">{doc.crianca_nome}</h2><p className="text-[10px] opacity-60 uppercase font-bold tracking-widest mt-1">SIMCT #{doc.id}</p></div>
            <div className="w-12 h-12"></div>
          </header>

          <div className="p-10 space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                 <Scale className="w-6 h-6 text-blue-600" />
                 <div><h3 className="text-[15px] font-black uppercase text-slate-800 tracking-tight">Análise de Mérito Técnico</h3><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Soberania do Colegiado (Diretrizes 80-93)</p></div>
              </div>
            </div>

            <div className="space-y-4" ref={accordionRef}>
              <AccordionSection 
                id="direito" title="Direito Violado" color="bg-blue-600" active={activeSection} onToggle={setActiveSection}
                saved={tempViolacoes.length > 0} changed={diffs.direito} 
                summary={tempViolacoes.length > 0 ? `${tempViolacoes.length} Selecionados` : undefined}
                previousValue={doc.snapshot_validado?.violacoesSipia.map(v => v.especifico).join(', ')}>
                <div className="space-y-6">
                  <div onClick={() => toggleSipia("STATUS", "Geral", "🚫 DIREITO NÃO VIOLADO / FATO NÃO COMPROVADO")} className={`p-4 rounded-2xl border-4 cursor-pointer transition-all flex items-center gap-3 ${tempViolacoes.some(v => v.especifico === '🚫 DIREITO NÃO VIOLADO / FATO NÃO COMPROVADO') ? 'bg-red-50 border-red-500 text-red-700 shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-red-200'}`}>{tempViolacoes.some(v => v.especifico === '🚫 DIREITO NÃO VIOLADO / FATO NÃO COMPROVADO') ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}<span className="font-black text-[12px] uppercase tracking-wider">🚫 DIREITO NÃO VIOLADO / FATO NÃO COMPROVADO</span></div>
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2 scrollbar-thin transition-opacity ${isImprocedente ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                    {Object.entries(SIPIA_HIERARCHY).map(([fund, grps]) => (
                      <div key={fund} className="space-y-2 mb-6 last:mb-0">
                        <div className="text-[10px] font-black text-blue-800 uppercase border-b border-blue-100 pb-1">{fund}</div>
                        {Object.entries(grps).map(([grp, items]) => (
                          <div key={grp} className="pl-2 mb-2">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{grp}</div>
                            {items.map(item => (<div key={item} onClick={() => toggleSipia(fund, grp, item)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-[10px] uppercase font-bold transition-all ${tempViolacoes.some(v => v.especifico === item) ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}`}>{tempViolacoes.some(v => v.especifico === item) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-20" />} {item}</div>))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionSection>

              <AccordionSection 
                id="agente" title="Agente Violador" color="bg-orange-500" active={activeSection} onToggle={setActiveSection}
                saved={tempAgentes.length > 0} changed={diffs.agente} 
                summary={tempAgentes.length > 0 ? tempAgentes.map(a => a.principal).join(', ') : undefined}
                previousValue={doc.snapshot_validado?.agentesVioladores.map(a => a.principal).join(', ')} blocked={isImprocedente}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                  {isImprocedente ? (<div className="col-span-full p-4 bg-slate-100 border-2 border-slate-300 rounded-2xl flex items-center gap-3 text-slate-600 font-black text-[11px] uppercase animate-in zoom-in"><CheckSquare className="w-5 h-5 text-slate-400" /> Agente Violador: Inexistente / Fato não Comprovado</div>) : (
                    Object.entries(AGENTES_VIOLADORES_ESTRUTURA).map(([cat, info]) => (
                      <div key={cat} className="space-y-2">
                        <div className="text-[10px] font-black text-orange-800 uppercase border-b border-orange-100 pb-1">{cat}</div>
                        {info.options.map(opt => (
                          <div 
                            key={opt} 
                            onClick={() => toggleAgente(cat, opt)} 
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-[10px] uppercase font-bold transition-all ${tempAgentes.some(a => a.principal === opt) ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}`}
                          >
                            {tempAgentes.some(a => a.principal === opt) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-20" />} {opt}
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </AccordionSection>

              <AccordionSection 
                id="medidas" title="Medidas de Proteção" color="bg-emerald-600" active={activeSection} onToggle={setActiveSection}
                saved={(selectedMedidas101.length + selectedMedidas129.length) > 0} changed={diffs.medida}
                summary={(selectedMedidas101.length + selectedMedidas129.length) > 0 ? `${selectedMedidas101.length + selectedMedidas129.length} Medidas` : undefined}
                previousValue={doc.snapshot_validado?.medidas_detalhadas.map(m => m.artigo_inciso).join(', ')} blocked={isImprocedente}>
                <div className="space-y-6">
                  {isImprocedente ? (<div className="text-center py-6 text-slate-300 font-black uppercase text-[10px] border-2 border-dashed border-slate-200 rounded-2xl">Medidas de Proteção Desativadas: Caso Improcedente.</div>) : (
                    <>
                      <div className="space-y-2"><div className="text-[10px] font-black text-emerald-800 uppercase border-b border-emerald-100 pb-1">Art. 101 - Criança/Adolescente</div>{MEDIDAS_101_ECA.map(m => (<div key={m.id} onClick={() => canEditTechnicalFields && setSelectedMedidas101(p => p.includes(m.id) ? p.filter(x => x !== m.id) : [...p, m.id])} className={`flex gap-3 p-3 rounded-xl cursor-pointer hover:bg-emerald-50 text-[10px] uppercase font-bold transition-all ${selectedMedidas101.includes(m.id) ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600'}`}>{selectedMedidas101.includes(m.id) ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 opacity-20 shrink-0" />} {m.label}</div>))}</div>
                      <div className="space-y-2"><div className="text-[10px] font-black text-indigo-800 uppercase border-b border-indigo-100 pb-1">Art. 129 - Pais / Responsável</div>{MEDIDAS_129_ECA.map(m => (<div key={m.id} onClick={() => canEditTechnicalFields && setSelectedMedidas129(p => p.includes(m.id) ? p.filter(x => x !== m.id) : [...p, m.id])} className={`flex gap-3 p-3 rounded-xl cursor-pointer hover:bg-indigo-50 text-[10px] uppercase font-bold transition-all ${selectedMedidas129.includes(m.id) ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600'}`}>{selectedMedidas129.includes(m.id) ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 opacity-20 shrink-0" />} {m.label}</div>))}</div>
                    </>
                  )}
                </div>
              </AccordionSection>

              <AccordionSection 
                id="atribuicoes" title="Atribuições e Requisições" color={hasExpiredRequisicao ? "bg-red-600" : "bg-purple-800"} 
                active={activeSection} onToggle={(id) => { setActiveSection(id); if (id !== 'atribuicoes') setIsArt136Open(false); }} 
                saved={relatoProvidencias.trim().length > 0 || selectedAtribuicoes136.length > 0}
                summary={tempRequisicoes.length > 0 ? `${tempRequisicoes.length} Serviços Requisitados` : (selectedAtribuicoes136.length > 0 ? `${selectedAtribuicoes136.length} Atribuições Ativas` : undefined)}
                changed={diffs.justificativa || diffs.requisicoes || diffs.atribuicoes} previousValue={doc.snapshot_validado?.observacao_monitoramento}>
                <div className="space-y-10">
                  
                  <div className="bg-white border-4 border-purple-100 rounded-[2.5rem] p-8 space-y-6 shadow-inner ring-1 ring-purple-200/50">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-50 pb-6">
                        <div className="flex items-center gap-3">
                           <Gavel className="w-6 h-6 text-purple-600" />
                           <h4 className="text-[14px] font-black text-purple-900 uppercase tracking-tight">Atribuições do Conselho Tutelar (Art. 136)</h4>
                        </div>
                        <div className="relative w-full md:w-64">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                           <input 
                             type="text" 
                             placeholder="Filtrar Incisos..." 
                             className="w-full pl-10 pr-4 py-3 bg-purple-50 border border-purple-100 rounded-xl text-[11px] font-black uppercase outline-none focus:border-purple-500 shadow-sm"
                             value={atribuicaoSearch}
                             onChange={e => setAtribuicaoSearch(e.target.value)}
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                        {filteredAtribuicoes.map(a => (
                           <div 
                             key={a.id} 
                             onClick={() => toggleAtribuicao(a.id)}
                             className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 group ${selectedAtribuicoes136.includes(a.id) ? 'bg-purple-900 border-purple-400 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-purple-200'}`}
                           >
                              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${selectedAtribuicoes136.includes(a.id) ? 'bg-purple-800' : 'bg-white border border-slate-200'}`}>
                                 {selectedAtribuicoes136.includes(a.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-20" />}
                              </div>
                              <div className="space-y-1">
                                 <span className={`text-[11px] font-black uppercase tracking-tight leading-relaxed`}>{a.label}</span>
                                 {a.id === 'III-a' && selectedAtribuicoes136.includes(a.id) && (
                                   <div className="flex items-center gap-2 mt-2">
                                      <span className="px-2 py-0.5 bg-emerald-500 text-[8px] font-black text-white rounded-md animate-pulse">REQUISIÇÃO ATIVA</span>
                                      <button onClick={(e) => { e.stopPropagation(); setIsArt136Open(!isArt136Open); }} className="text-[9px] font-bold text-purple-300 underline hover:text-white uppercase tracking-widest">
                                        {isArt136Open ? '[Ocultar Sub-menu]' : '[Ver Serviços / Prazos]'}
                                      </button>
                                   </div>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* DIRETRIZ 93: Multi-requisição Dinâmica Sub-menu III-a */}
                  {selectedAtribuicoes136.includes('III-a') && isArt136Open && (
                    <div ref={subMenuRef} className="p-8 bg-purple-50 border-4 border-purple-200 rounded-[2.5rem] space-y-8 animate-in slide-in-from-top-4 duration-500 shadow-xl">
                       <div className="flex items-center justify-between border-b border-purple-200 pb-4">
                          <div className="flex items-center gap-3">
                             <Building2 className="w-5 h-5 text-purple-600" />
                             <h4 className="text-[12px] font-black text-purple-900 uppercase tracking-widest">Rede de Serviços Hortolândia (Sub-menu III-a)</h4>
                          </div>
                          <button onClick={() => setIsArt136Open(false)} className="p-2 text-purple-400 hover:bg-white rounded-lg transition-all"><X className="w-4 h-4" /></button>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {Object.entries(REDE_HORTOLANDIA).map(([area, categorias]) => (
                            <div key={area} className="space-y-3">
                               <div className="text-[10px] font-black text-purple-800 uppercase px-2 border-l-4 border-purple-400">{area}</div>
                               <div className="space-y-1">
                                  {Object.entries(categorias).map(([cat, servicos]) => (
                                    <div key={cat} className="space-y-1">
                                       {(servicos as string[]).map(servico => (
                                          <button key={servico} type="button" onClick={() => addRequisicao(area, servico)} className="w-full text-left p-3 bg-white border border-purple-100 rounded-xl text-[10px] font-bold uppercase hover:bg-purple-600 hover:text-white transition-all flex items-center justify-between group shadow-sm">{servico}<Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" /></button>
                                       ))}
                                    </div>
                                  ))}
                               </div>
                            </div>
                          ))}
                       </div>
                       
                       <div className="pt-6 border-t border-purple-200 space-y-4">
                          <div className="flex items-center justify-between px-2">
                             <h5 className="text-[11px] font-black text-purple-900 uppercase flex items-center gap-2"><Timer className="w-4 h-4" /> Gestão de Serviços Requisitados (Diretriz 93)</h5>
                             <button type="button" onClick={() => addRequisicao('OUTROS', 'NOVO SERVIÇO')} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg hover:bg-purple-700 transition-all active:scale-95 animate-in slide-in-from-right-4">
                                <Plus className="w-3 h-3" /> [➕ ADICIONAR NOVO SERVIÇO]
                             </button>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                             {tempRequisicoes.map((req, idx) => {
                               const isExpired = new Date(req.dataFinal) < new Date();
                               return (
                                 <div key={req.id} className={`flex flex-col p-8 bg-white border-2 rounded-[2.5rem] shadow-sm relative overflow-hidden transition-all hover:shadow-md ${isExpired ? 'border-red-400 bg-red-50' : 'border-purple-100'}`}>
                                    {isExpired && <div className="absolute top-0 right-0 px-4 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">PRAZO VENCIDO</div>}
                                    
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                       <div className="flex items-center gap-4">
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[14px] shadow-sm ${isExpired ? 'bg-red-600 text-white' : 'bg-purple-600 text-white'}`}>{idx + 1}</div>
                                          <div>
                                             <div className="text-[13px] font-black uppercase text-slate-800 tracking-tight">{req.servico}</div>
                                             <div className="text-[10px] font-bold uppercase text-purple-500 tracking-wider">{req.area}</div>
                                          </div>
                                       </div>
                                       <div className="flex flex-wrap items-center gap-2">
                                          {[{ d: 1, l: '24h' }, { d: 2, l: '48h' }, { d: 5, l: '05 Dias' }, { d: 10, l: '10 Dias' }].map(p => (
                                             <button key={p.d} type="button" onClick={() => updateRequisicao(req.id, { prazoDias: p.d, dataFinal: new Date(Date.now() + p.d * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${req.prazoDias === p.d ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-purple-200'}`}>{p.l}</button>
                                          ))}
                                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl"><Timer className="w-3.5 h-3.5 text-slate-400" /><input type="date" className="bg-transparent text-[11px] font-black outline-none uppercase" value={req.dataFinal} onChange={e => { const diff = Math.ceil((new Date(e.target.value).getTime() - Date.now()) / (1000 * 60 * 60 * 24)); updateRequisicao(req.id, {dataFinal: e.target.value, prazoDias: diff}); }} /></div>
                                          <button onClick={() => setTempRequisicoes(prev => prev.filter(r => r.id !== req.id))} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                       </div>
                                    </div>

                                    {/* DIRETRIZ 93.2: Campo de Observações Técnicas do Serviço */}
                                    <div className="space-y-2 pt-4 border-t border-slate-50">
                                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Observações Técnicas para este Encaminhamento</label>
                                       <textarea 
                                          className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[12px] font-medium uppercase outline-none focus:border-purple-500 transition-all min-h-[80px]"
                                          placeholder="EX: ENCAMINHAR HISTÓRICO ESCOLAR, PRIORIDADE DE VAGA, ETC..."
                                          value={req.observacoes || ''}
                                          onChange={e => updateRequisicao(req.id, { observacoes: e.target.value.toUpperCase() })}
                                       />
                                    </div>
                                 </div>
                               );
                             })}
                             {tempRequisicoes.length === 0 && <div className="text-center py-12 text-slate-300 font-black uppercase text-[11px] border-4 border-dashed border-purple-100 rounded-[2.5rem] tracking-widest">Selecione áreas acima para adicionar requisições dinâmicas.</div>}
                          </div>
                       </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-6 border-t border-purple-100">
                     <label className="text-[11px] font-black text-purple-900 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <LayoutList className="w-4 h-4" /> Relato de Providências Práticas (Opcional)
                     </label>
                     <textarea 
                        className={`w-full p-10 bg-purple-50/20 border-4 border-purple-100 rounded-[3rem] text-[13px] font-medium uppercase outline-none focus:border-purple-600 transition-all min-h-[180px] shadow-inner ${!canEditTechnicalFields ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        placeholder="DETALHE AÇÕES PRÁTICAS (CONTATOS, VISITAS, ORIENTAÇÕES VERBAIS)..."
                        value={relatoProvidencias} disabled={!canEditTechnicalFields} onChange={e => setRelatoProvidencias(e.target.value.toUpperCase())}
                     />
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4 italic">O preenchimento deste campo não impede o salvamento ou envio ao colegiado.</p>
                  </div>
                </div>
              </AccordionSection>
            </div>

            {canEditTechnicalFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <button onClick={() => handleSave(false)} className="py-6 bg-slate-600 text-white rounded-3xl font-black uppercase text-[12px] shadow-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-3 active:scale-95"><Save className="w-5 h-5" /> [Salvar Rascunho]</button>
                <button onClick={() => handleSave(true)} className="py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[12px] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95 animate-in zoom-in-95 group"><Edit2 className="w-5 h-5 group-hover:rotate-12 transition-transform" /> [Salvar e Enviar Colegiado]</button>
              </div>
            )}

            <div className="mt-12 pt-10 border-t bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400"><Users2 className="w-6 h-6" /></div>
                     <div><h4 className="text-[16px] font-black text-slate-800 uppercase tracking-tight text-left">Soberania do Colegiado de Plantão</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 text-left">Assinaturas e Revalidação Automática (Trava Trial Diretriz 92)</p></div>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {validationTracker.map((status, idx) => {
                    const isMe = currentUser.nome.toUpperCase().includes(status.name.toUpperCase());
                    const needsAction = isMe && !status.validated && (doc.status.includes('AGUARDANDO_VALIDACAO') || doc.status.includes('OFICIALIZADO'));
                    return (
                      <div key={idx} className={`p-8 rounded-[2rem] border-4 flex flex-col items-center gap-4 transition-all relative overflow-hidden ${status.validated ? 'bg-white border-emerald-500 shadow-xl' : 'bg-red-50 border-red-300 animate-in fade-in duration-700'} ${diffs.any && !status.validated && !isImediataResponsavel ? 'border-yellow-400 animate-pulse-yellow' : ''}`}>
                         {status.validated && <div className="absolute top-4 right-4 animate-in zoom-in"><CheckCircle2 className="w-7 h-7 text-emerald-500" /></div>}
                         <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-[18px] shadow-inner ${status.validated ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600 animate-pulse'}`}>{status.name.substring(0,2)}</div>
                         <div className="text-center space-y-2"><span className={`text-[13px] font-black uppercase ${status.validated ? 'text-slate-900' : 'text-red-700'}`}>{status.name}</span><div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border-2 ${status.validated ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm' : 'bg-white text-red-600 border-red-200'}`}>{status.validated ? `VALIDADO EM ${status.timestamp}` : <span className="flex items-center gap-1"><RotateCcw className="w-2.5 h-2.5" /> REVALIDAÇÃO NECESSÁRIA</span>}</div></div>
                         {needsAction && <button onClick={handleValidate} className="w-full mt-2 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-2xl hover:bg-emerald-700 transition-all active:scale-95 animate-bounce ring-4 ring-emerald-500/10 flex items-center justify-center gap-2">{diffs.any ? <><CheckCircle className="w-4 h-4" /> [✅ VI E CONCORDO COM A ALTERAÇÃO]</> : <><Scale className="w-4 h-4" /> [CONFIRMAR MINHA VALIDAÇÃO]</>}</button>}
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AccordionSectionProps {
  id: string; title: string; color: string; active: string | null; onToggle: (id: string) => void;
  saved: boolean; changed?: boolean; previousValue?: string; blocked?: boolean; summary?: string; children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ 
  id, title, color, active, onToggle, saved, changed, previousValue, blocked, summary, children 
}) => {
  const isOpen = active === id;
  return (
    <div className={`border-4 rounded-3xl overflow-hidden shadow-sm transition-all relative ${changed ? 'animate-pulse-yellow border-yellow-400' : 'border-slate-200'} ${blocked ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
      <button onClick={() => !blocked && onToggle(isOpen ? null : id)} className={`w-full flex items-center justify-between p-6 transition-all ${isOpen ? `${color} text-white shadow-inner` : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
        <div className="flex items-center gap-4">
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <Play className={`w-4 h-4 ${saved ? 'text-emerald-500' : 'opacity-40'}`} />}
          <div className="flex flex-col items-start text-left">
             <div className="flex items-center gap-2">
                <span className="text-[14px] font-black uppercase tracking-widest">{title}</span>
                {changed && (
                  <div className="tooltip-trigger relative">
                     <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-bounce" />
                     {previousValue && (
                       <div className="tooltip-content absolute left-full ml-4 top-1/2 -translate-y-1/2 w-64 p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase shadow-2xl z-[50] pointer-events-none border border-white/10">
                          <div className="text-yellow-400 mb-1 flex items-center gap-1"><History className="w-3 h-3" /> Valor Anterior:</div><p className="opacity-80 italic">"{previousValue}"</p>
                       </div>
                     )}
                  </div>
                )}
             </div>
             {!isOpen && summary && <span className="text-[10px] font-bold opacity-60 mt-1 uppercase truncate max-w-[200px]">{summary}</span>}
          </div>
        </div>
        {saved && <CheckCircle className={`w-6 h-6 ${isOpen ? 'text-white' : 'text-emerald-500'} animate-in zoom-in`} />}
      </button>
      {isOpen && <div className="p-8 bg-white animate-in slide-in-from-top-2 border-t border-slate-50">{children}</div>}
    </div>
  );
};

export default DocumentView;
