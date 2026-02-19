
// DIRETRIZ 80/81: Protocolo de Revalidação e Indicadores Visuais de Alteração
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Scale, X, Check, Clock, AlertCircle, Info, 
  Save, ShieldAlert, History, ClipboardList, CheckSquare, Square, 
  SendHorizonal, ListChecks, Activity, Ban, Calendar, UserRound, 
  CheckCircle, CheckCircle2, ChevronDown, Play, RotateCcw, Users2, Edit2, Zap
} from 'lucide-react';
import { 
  Documento, Log, User as UserType, DocumentStatus, 
  MedidaAplicada, SipiaViolation, AgenteVioladorEntry, LogType, SnapshotComparativo
} from '../types';
import { 
  STATUS_LABELS, INITIAL_USERS, 
  SIPIA_HIERARCHY, AGENTES_VIOLADORES_ESTRUTURA, 
  getEffectiveEscala, MEDIDAS_101_ECA, MEDIDAS_129_ECA, ATRIBUICOES_136_ECA
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [tempViolacoes, setTempViolacoes] = useState<SipiaViolation[]>(doc.violacoesSipia || []);
  const [tempAgentes, setTempAgentes] = useState<AgenteVioladorEntry[]>(doc.agentesVioladores || []);
  const [selectedMedidas101, setSelectedMedidas101] = useState<string[]>((doc.medidas_detalhadas || []).filter(m => m.artigo_inciso.startsWith('Art. 101')).map(m => m.artigo_inciso.replace('Art. 101, ', '')));
  const [selectedMedidas129, setSelectedMedidas129] = useState<string[]>((doc.medidas_detalhadas || []).filter(m => m.artigo_inciso.startsWith('Art. 129')).map(m => m.artigo_inciso.replace('Art. 129, ', '')));
  const [selectedAtribuicoes136, setSelectedAtribuicoes136] = useState<string[]>(doc.atribuicoes_136 || []);
  const [obsMonitoramento, setObsMonitoramento] = useState<string>(doc.observacao_monitoramento || '');
  const [isImprocedente, setIsImprocedente] = useState<boolean>(doc.is_improcedente || false);
  const [justificativaImprocedencia, setJustificativaImprocedencia] = useState<string>(doc.justificativa_improcedencia || '');

  // DIRETRIZ 78/80: SOBERANIA TÉCNICA
  const isImediataResponsavel = doc.conselheiro_providencia_id === currentUser.id;
  const canEditTechnicalFields = isImediataResponsavel; 

  const validationTracker = useMemo(() => {
    const trio = doc.conselheiros_providencia_nomes || [];
    const confirmacoes = doc.medidas_detalhadas?.[0]?.confirmacoes || [];
    return trio.map(name => {
      const match = confirmacoes.find(c => c.usuario_nome.toUpperCase().includes(name.toUpperCase()));
      return { name, validated: !!match, timestamp: match?.usuario_nome.split(' - ')[1] || null };
    });
  }, [doc.conselheiros_providencia_nomes, doc.medidas_detalhadas]);

  // DIRETRIZ 81: Lógica de Identificação de Mudanças
  const diffs = useMemo(() => {
    if (!doc.snapshot_validado) return { direito: false, agente: false, medida: false, justificativa: false };
    
    const prev = doc.snapshot_validado;
    
    const direitoChanged = JSON.stringify(prev.violacoesSipia) !== JSON.stringify(doc.violacoesSipia);
    const agenteChanged = JSON.stringify(prev.agentesVioladores) !== JSON.stringify(doc.agentesVioladores);
    
    // Comparação de medidas (Art 101/129)
    const prevMedNames = prev.medidas_detalhadas.map(m => m.artigo_inciso).sort().join(',');
    const currentMedNames = (doc.medidas_detalhadas || []).map(m => m.artigo_inciso).sort().join(',');
    const medidaChanged = prevMedNames !== currentMedNames;

    const justificativaChanged = prev.observacao_monitoramento !== doc.observacao_monitoramento || 
                           JSON.stringify(prev.atribuicoes_136) !== JSON.stringify(doc.atribuicoes_136);

    return { 
      direito: direitoChanged, 
      agente: agenteChanged, 
      medida: medidaChanged, 
      justificativa: justificativaChanged,
      any: direitoChanged || agenteChanged || medidaChanged || justificativaChanged
    };
  }, [doc.snapshot_validado, doc.violacoesSipia, doc.agentesVioladores, doc.medidas_detalhadas, doc.atribuicoes_136, doc.observacao_monitoramento]);

  const toggleSipia = (fund: string, grp: string, item: string) => {
    if (!canEditTechnicalFields) return;
    setTempViolacoes(prev => prev.some(v => v.especifico === item) ? prev.filter(v => v.especifico !== item) : [...prev, { fundamental: fund, grupo: grp, especifico: item }]);
  };

  const handleSave = (finalize: boolean) => {
    if (!canEditTechnicalFields) return;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
    
    const mySignature = { usuario_id: currentUser.id, usuario_nome: `${currentUser.nome} - ${formattedDate}`, data_hora: now.toISOString() };
    
    // DIRETRIZ 80.2: Reset de Status das assinaturas
    const hasExistingValidations = validationTracker.some(v => v.validated && v.name !== currentUser.nome.toUpperCase());
    const resetNames = validationTracker.filter(v => v.validated && v.name !== currentUser.nome.toUpperCase()).map(v => v.name).join(' e ');

    // DIRETRIZ 81: Criar Snapshot antes de salvar a nova versão se ainda não houver um snapshot ou se for uma nova alteração pós-validação
    const newSnapshot: SnapshotComparativo = {
      violacoesSipia: doc.violacoesSipia,
      agentesVioladores: doc.agentesVioladores,
      medidas_detalhadas: doc.medidas_detalhadas || [],
      atribuicoes_136: doc.atribuicoes_136 || [],
      observacao_monitoramento: doc.observacao_monitoramento || ''
    };

    const combinedMedidas: MedidaAplicada[] = [
      ...selectedMedidas101.map(id => ({ 
        id: `med-101-${id}-${Date.now()}`, 
        artigo_inciso: `Art. 101, ${id}`, 
        texto: MEDIDAS_101_ECA.find(m => m.id === id)?.label || '', 
        autor_id: currentUser.id, autor_nome: currentUser.nome, 
        data_lancamento: now.toISOString(), 
        conselheiros_requeridos: doc.conselheiros_providencia_nomes, 
        confirmacoes: [mySignature] 
      })),
      ...selectedMedidas129.map(id => ({ 
        id: `med-129-${id}-${Date.now()}`, 
        artigo_inciso: `Art. 129, ${id}`, 
        texto: MEDIDAS_129_ECA.find(m => m.id === id)?.label || '', 
        autor_id: currentUser.id, autor_nome: currentUser.nome, 
        data_lancamento: now.toISOString(), 
        conselheiros_requeridos: doc.conselheiros_providencia_nomes, 
        confirmacoes: [mySignature] 
      }))
    ];

    onUpdateDocument(doc.id, { 
      violacoesSipia: tempViolacoes, 
      agentesVioladores: tempAgentes, 
      medidas_detalhadas: combinedMedidas,
      atribuicoes_136: selectedAtribuicoes136,
      status: finalize ? ['AGUARDANDO_VALIDACAO'] : ['EM_PREENCHIMENTO'],
      is_improcedente: isImprocedente,
      justificativa_improcedencia: justificativaImprocedencia,
      observacao_monitoramento: obsMonitoramento,
      snapshot_validado: hasExistingValidations ? newSnapshot : doc.snapshot_validado
    });
    
    if (hasExistingValidations) {
      onAddLog(doc.id, `${currentUser.nome} (Imediata) alterou o mérito. Assinaturas de ${resetNames} resetadas.`, 'VALIDAÇÃO');
      alert(`🔄 REVALIDAÇÃO NECESSÁRIA: Alterações salvas. As validações dos colegas foram resetadas para revisão.`);
    } else {
      onAddLog(doc.id, `${currentUser.nome} (Imediata) atualizou prontuário técnico.`, 'VALIDAÇÃO');
    }
  };

  const handleValidate = () => {
    const now = new Date();
    const formatted = `${currentUser.nome} - ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;
    const updated = (doc.medidas_detalhadas || []).map(m => ({
      ...m,
      confirmacoes: [...m.confirmacoes, { usuario_id: currentUser.id, usuario_nome: formatted, data_hora: now.toISOString() }]
    }));
    
    const validatedOthers = validationTracker.filter(v => v.validated && v.name !== currentUser.nome.toUpperCase()).length;
    let nextStatus = [...doc.status];
    let fieldsToUpdate: Partial<Documento> = { medidas_detalhadas: updated };

    // Se todos validaram, removemos os indicadores de mudança
    if (validatedOthers === 1) { // Sou o 2º a validar (considerando que a Imediata já assinou ao salvar)
       nextStatus = nextStatus.filter(s => s !== 'AGUARDANDO_VALIDACAO');
       if (!nextStatus.includes('OFICIALIZADO')) nextStatus.push('OFICIALIZADO');
       fieldsToUpdate.snapshot_validado = undefined; // Limpa os indicadores visuais
    }

    onUpdateDocument(doc.id, { ...fieldsToUpdate, status: nextStatus });
    onAddLog(doc.id, `VALIDAÇÃO: ${currentUser.nome} confirmou concordância com o mérito atualizado.`, 'VALIDAÇÃO');
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
                 <div>
                    <h3 className="text-[15px] font-black uppercase text-slate-800 tracking-tight">Análise de Mérito Técnico</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Soberania do Colegiado (Diretrizes 80/81)</p>
                 </div>
              </div>
              {canEditTechnicalFields && (
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                   <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-full border border-emerald-200 shadow-sm">Edição Liberada</span>
                </div>
              )}
            </div>

            {diffs.any && !isImediataResponsavel && (
              <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top duration-500">
                 <div className="p-3 bg-yellow-500 rounded-2xl shadow-lg"><Zap className="w-6 h-6 text-white animate-bounce" /></div>
                 <div className="space-y-1">
                    <h4 className="text-[14px] font-black text-yellow-900 uppercase">Atenção: Mérito Alterado</h4>
                    <p className="text-[11px] text-yellow-800 font-bold uppercase leading-tight">O Conselheiro de Imediata realizou modificações técnicas. Revise os campos destacados com a borda pulsante e o ícone ⚡ antes de revalidar.</p>
                 </div>
              </div>
            )}

            <div className="space-y-4">
              <AccordionSection 
                id="direito" title="Direito Violado" color="bg-blue-600" active={activeSection} onToggle={setActiveSection}
                saved={tempViolacoes.length > 0} 
                changed={diffs.direito}
                previousValue={doc.snapshot_validado?.violacoesSipia.map(v => v.especifico).join(', ')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
                  {Object.entries(SIPIA_HIERARCHY).map(([fund, grps]) => (
                    <div key={fund} className="space-y-2 mb-6 last:mb-0">
                      <div className="text-[10px] font-black text-blue-800 uppercase border-b border-blue-100 pb-1">{fund}</div>
                      {Object.entries(grps).map(([grp, items]) => (
                        <div key={grp} className="pl-2 mb-2">
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{grp}</div>
                          {items.map(item => (
                            <div key={item} onClick={() => toggleSipia(fund, grp, item)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-[10px] uppercase font-bold transition-all ${tempViolacoes.some(v => v.especifico === item) ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}`}>
                              {tempViolacoes.some(v => v.especifico === item) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-20" />} {item}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </AccordionSection>

              <AccordionSection 
                id="agente" title="Agente Violador" color="bg-orange-500" active={activeSection} onToggle={setActiveSection}
                saved={tempAgentes.length > 0}
                changed={diffs.agente}
                previousValue={doc.snapshot_validado?.agentesVioladores.map(a => a.principal).join(', ')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                  {Object.entries(AGENTES_VIOLADORES_ESTRUTURA).map(([cat, info]) => (
                    <div key={cat} className="space-y-2">
                      <div className="text-[10px] font-black text-orange-800 uppercase border-b border-orange-100 pb-1">{cat}</div>
                      {info.options.map(opt => (
                        <div key={opt} onClick={() => canEditTechnicalFields && setTempAgentes(prev => prev.some(a => a.principal === opt) ? prev.filter(a => a.principal !== opt) : [...prev, {categoria: cat, principal: opt, tipo: 'PRINCIPAL'}])} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-[10px] uppercase font-bold transition-all ${tempAgentes.some(a => a.principal === opt) ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}`}>
                          {tempAgentes.some(a => a.principal === opt) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-20" />} {opt}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </AccordionSection>

              <AccordionSection 
                id="medidas" title="Medidas de Proteção" color="bg-emerald-600" active={activeSection} onToggle={setActiveSection}
                saved={(selectedMedidas101.length + selectedMedidas129.length) > 0}
                changed={diffs.medida}
                previousValue={doc.snapshot_validado?.medidas_detalhadas.map(m => m.artigo_inciso).join(', ')}>
                <div className="space-y-6">
                  <div className="space-y-2">
                     <div className="text-[10px] font-black text-emerald-800 uppercase border-b border-emerald-100 pb-1">Art. 101 - Criança/Adolescente</div>
                     {MEDIDAS_101_ECA.map(m => (
                       <div key={m.id} onClick={() => canEditTechnicalFields && setSelectedMedidas101(p => p.includes(m.id) ? p.filter(x => x !== m.id) : [...p, m.id])} className={`flex gap-3 p-3 rounded-xl cursor-pointer hover:bg-emerald-50 text-[10px] uppercase font-bold transition-all ${selectedMedidas101.includes(m.id) ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600'}`}>
                          {selectedMedidas101.includes(m.id) ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 opacity-20 shrink-0" />} {m.label}
                       </div>
                     ))}
                  </div>
                  <div className="space-y-2">
                     <div className="text-[10px] font-black text-indigo-800 uppercase border-b border-indigo-100 pb-1">Art. 129 - Pais / Responsável</div>
                     {MEDIDAS_129_ECA.map(m => (
                       <div key={m.id} onClick={() => canEditTechnicalFields && setSelectedMedidas129(p => p.includes(m.id) ? p.filter(x => x !== m.id) : [...p, m.id])} className={`flex gap-3 p-3 rounded-xl cursor-pointer hover:bg-indigo-50 text-[10px] uppercase font-bold transition-all ${selectedMedidas129.includes(m.id) ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600'}`}>
                          {selectedMedidas129.includes(m.id) ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 opacity-20 shrink-0" />} {m.label}
                       </div>
                     ))}
                  </div>
                </div>
              </AccordionSection>

              <AccordionSection 
                id="atribuicoes" title="Justificativa Técnica" color="bg-slate-700" active={activeSection} onToggle={setActiveSection}
                saved={obsMonitoramento.trim().length > 0}
                changed={diffs.justificativa}
                previousValue={doc.snapshot_validado?.observacao_monitoramento}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {ATRIBUICOES_136_ECA.map(a => (
                       <div key={a.id} onClick={() => canEditTechnicalFields && setSelectedAtribuicoes136(p => p.includes(a.id) ? p.filter(x => x !== a.id) : [...p, a.id])} className={`flex gap-2 p-2 rounded-lg cursor-pointer text-[9px] uppercase font-bold transition-all ${selectedAtribuicoes136.includes(a.id) ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>
                          {selectedAtribuicoes136.includes(a.id) ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 opacity-20" />} {a.label}
                       </div>
                     ))}
                  </div>
                  <textarea 
                    className={`w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-[13px] font-medium uppercase outline-none focus:border-blue-600 transition-all min-h-[150px] ${!canEditTechnicalFields ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    placeholder="FUNDAMENTAÇÃO TÉCNICA DO CASO..."
                    value={obsMonitoramento}
                    disabled={!canEditTechnicalFields}
                    onChange={e => setObsMonitoramento(e.target.value.toUpperCase())}
                  />
                </div>
              </AccordionSection>
            </div>

            {canEditTechnicalFields && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <button onClick={() => handleSave(false)} className="py-6 bg-slate-600 text-white rounded-3xl font-black uppercase text-[12px] shadow-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-3 active:scale-95"><Save className="w-5 h-5" /> [Salvar Rascunho]</button>
                <button onClick={() => handleSave(true)} className="py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[12px] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95 animate-in zoom-in-95 group">
                  <Edit2 className="w-5 h-5 group-hover:rotate-12 transition-transform" /> [Salvar Alterações de Mérito]
                </button>
              </div>
            )}

            {/* RASTREAMENTO DE VALIDAÇÃO NO RODAPÉ */}
            <div className="mt-12 pt-10 border-t bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400"><Users2 className="w-6 h-6" /></div>
                     <div>
                        <h4 className="text-[16px] font-black text-slate-800 uppercase tracking-tight">Soberania do Colegiado de Plantão</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Assinaturas e Revalidação Automática</p>
                     </div>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {validationTracker.map((status, idx) => {
                    const isMe = currentUser.nome.toUpperCase().includes(status.name.toUpperCase());
                    const needsAction = isMe && !status.validated && (doc.status.includes('AGUARDANDO_VALIDACAO') || doc.status.includes('OFICIALIZADO'));

                    return (
                      <div key={idx} className={`p-8 rounded-[2rem] border-4 flex flex-col items-center gap-4 transition-all relative overflow-hidden ${status.validated ? 'bg-white border-emerald-500 shadow-xl' : 'bg-red-50 border-red-300 animate-in fade-in duration-700'}`}>
                         {status.validated && <div className="absolute top-4 right-4 animate-in zoom-in"><CheckCircle2 className="w-7 h-7 text-emerald-500" /></div>}
                         <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-[18px] shadow-inner ${status.validated ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                            {status.name.substring(0,2)}
                         </div>
                         <div className="text-center space-y-2">
                            <span className={`text-[13px] font-black uppercase ${status.validated ? 'text-slate-900' : 'text-red-700'}`}>{status.name}</span>
                            <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border-2 ${status.validated ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm' : 'bg-white text-red-600 border-red-200'}`}>
                               {status.validated ? `VALIDADO EM ${status.timestamp}` : (
                                  <span className="flex items-center gap-1"><RotateCcw className="w-2.5 h-2.5" /> REVALIDAÇÃO NECESSÁRIA</span>
                               )}
                            </div>
                         </div>
                         {needsAction && (
                           <button 
                             onClick={handleValidate} 
                             className="w-full mt-2 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-2xl hover:bg-emerald-700 transition-all active:scale-95 animate-bounce ring-4 ring-emerald-500/10 flex items-center justify-center gap-2"
                           >
                             {diffs.any ? <><CheckCircle className="w-4 h-4" /> [✅ VI E CONCORDO COM A ALTERAÇÃO]</> : <><Scale className="w-4 h-4" /> [CONFIRMAR MINHA VALIDAÇÃO]</>}
                           </button>
                         )}
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
  id: string;
  title: string;
  color: string;
  active: string | null;
  onToggle: (id: string) => void;
  saved: boolean;
  changed?: boolean;
  previousValue?: string;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ 
  id, title, color, active, onToggle, saved, changed, previousValue, children 
}) => {
  const isOpen = active === id;
  return (
    <div className={`border-4 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all relative ${changed ? 'animate-pulse-yellow border-yellow-400' : 'border-slate-200'}`}>
      <button onClick={() => onToggle(id)} className={`w-full flex items-center justify-between p-6 transition-all ${isOpen ? `${color} text-white shadow-inner` : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
        <div className="flex items-center gap-4">
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <Play className={`w-4 h-4 ${saved ? 'text-emerald-500' : 'opacity-40'}`} />}
          <div className="flex items-center gap-2">
             <span className="text-[14px] font-black uppercase tracking-widest">{title}</span>
             {changed && (
               <div className="tooltip-trigger relative">
                  <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-bounce" />
                  {previousValue && (
                    <div className="tooltip-content absolute left-full ml-4 top-1/2 -translate-y-1/2 w-64 p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase shadow-2xl z-[50] pointer-events-none border border-white/10">
                       <div className="text-yellow-400 mb-1 flex items-center gap-1"><History className="w-3 h-3" /> Valor Anterior:</div>
                       <p className="opacity-80 italic">"{previousValue}"</p>
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>
        {saved && <CheckCircle className={`w-6 h-6 ${isOpen ? 'text-white' : 'text-emerald-500'} animate-in zoom-in`} />}
      </button>
      {isOpen && <div className="p-8 bg-white animate-in slide-in-from-top-2 border-t border-slate-50">{children}</div>}
    </div>
  );
};

export default DocumentView;