import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Scale, X, Check, Clock, AlertCircle, Info, 
  Save, ShieldAlert, History, ClipboardList, CheckSquare, Square, 
  SendHorizonal, Activity, Ban, Calendar, UserRound, 
  CheckCircle, CheckCircle2, ChevronDown, Play, Users2, Tag, FileCheck2,
  Database, Fingerprint, MapPin, Building2, UserCog, Search, LayoutList,
  ChevronRight, Timer, ArrowUpRight, ShieldCheck, Box, FileText, Baby
} from 'lucide-react';
import { 
  Documento, Log, User as UserType, DocumentStatus, 
  MedidaAplicada, SipiaViolation, AgenteVioladorEntry, LogType
} from '../types';
import { 
  STATUS_LABELS, INITIAL_USERS, 
  SIPIA_HIERARCHY, AGENTES_VIOLADORES_ESTRUTURA, 
  MEDIDAS_101_ECA, MEDIDAS_129_ECA
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
  onUpdateStatus: (id: string, status: DocumentStatus[]) => void;
  onUpdateDocument: (id: string, fields: Partial<Documento>) => void;
  onAddLog: (docId: string, acao: string, tipo?: LogType) => void;
  onScience: (id: string) => void;
}

const DocumentView: React.FC<DocumentViewProps> = ({ 
  document: doc, 
  allDocuments,
  currentUser, 
  logs,
  onBack, 
  onUpdateDocument,
  onAddLog
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [tempViolacoes, setTempViolacoes] = useState<SipiaViolation[]>(doc.violacoesSipia || []);
  const [tempAgentes, setTempAgentes] = useState<AgenteVioladorEntry[]>(doc.agentesVioladores || []);
  const [selectedMedidas101, setSelectedMedidas101] = useState<string[]>((doc.medidas_detalhadas || []).filter(m => m.artigo_inciso.startsWith('Art. 101')).map(m => m.artigo_inciso.replace('Art. 101, ', '')));
  const [selectedMedidas129, setSelectedMedidas129] = useState<string[]>((doc.medidas_detalhadas || []).filter(m => m.artigo_inciso.startsWith('Art. 129')).map(m => m.artigo_inciso.replace('Art. 129, ', '')));
  const [relatoProvidencias, setRelatoProvidencias] = useState(doc.relato_providencias || '');
  const [showIntelligence, setShowIntelligence] = useState(false);

  const isResponsible = doc.conselheiro_providencia_id === currentUser.id || doc.conselheiro_referencia_id === currentUser.id;
  const canEditTechnicalFields = isResponsible && !doc.status.includes('OFICIALIZADO');

  // INTELIGÊNCIA SIMCT: Dossiê Familiar Cruzado
  const familyDossier = useMemo(() => {
    const history = allDocuments.filter(d => 
      d.id !== doc.id && (
        (doc.cpf_genitora && d.cpf_genitora === doc.cpf_genitora) || 
        (d.genitora_nome.toUpperCase() === doc.genitora_nome.toUpperCase())
      )
    );

    const childrenNames = new Set<string>();
    const agencies = new Set<string>();
    
    // Inclui dados do prontuário atual
    doc.criancas?.forEach(c => childrenNames.add(c.nome.toUpperCase()));
    agencies.add(doc.origem.toUpperCase());

    // Agrega dados históricos
    history.forEach(h => {
      h.criancas?.forEach(c => childrenNames.add(c.nome.toUpperCase()));
      agencies.add(h.origem.toUpperCase());
    });

    return {
      history,
      totalChildren: childrenNames.size,
      allAgencies: Array.from(agencies).sort(),
      isRecurrent: history.length > 0
    };
  }, [allDocuments, doc]);

  const informativeStatusOptions = useMemo(() => {
    const informativeKeys: DocumentStatus[] = [
      'AGENDAR_REUNIAO_REDE', 'AGUARDAR_RESPOSTA_EMAIL', 'EMAIL_RESPONDIDO',
      'ENCAMINHAR_NOTICIA_FATO', 'NOTIFICAR', 'OFICIO_RESPONDIDO',
      'RESPONDER_EMAIL', 'SOLICITAR_REUNIAO_REDE', 'ARQUIVADO', 'CONCLUIDO'
    ];
    return informativeKeys.sort((a, b) => STATUS_LABELS[a].localeCompare(STATUS_LABELS[b]));
  }, []);

  const handleQuickStatusChange = (newStatus: DocumentStatus) => {
    if (!canEditTechnicalFields) return;
    onUpdateDocument(doc.id, { 
      status: [newStatus],
      medidas_detalhadas: (newStatus === 'ARQUIVADO' || newStatus === 'CONCLUIDO') ? [] : doc.medidas_detalhadas
    });
    onAddLog(doc.id, `MOVIMENTAÇÃO ADMINISTRATIVA: Situação alterada para [${STATUS_LABELS[newStatus]}].`, 'DOCUMENTO');
  };

  const validationTracker = useMemo(() => {
    const trio = doc.conselheiros_providencia_nomes || [];
    const confirmacoes = doc.medidas_detalhadas?.[0]?.confirmacoes || [];
    return trio.map(name => {
      const match = confirmacoes.find(c => c.usuario_nome.toUpperCase().includes(name.toUpperCase()));
      return { name, validated: !!match, timestamp: match?.usuario_nome.split(' - ')[1] || null };
    });
  }, [doc.conselheiros_providencia_nomes, doc.medidas_detalhadas]);

  const handleSave = (finalize: boolean) => {
    if (!canEditTechnicalFields) return;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
    const mySignature = { usuario_id: currentUser.id, usuario_nome: `${currentUser.nome} - ${formattedDate}`, data_hora: now.toISOString() };
    
    const combinedMedidas: MedidaAplicada[] = [
      ...selectedMedidas101.map(id => ({ id: `med-101-${id}-${Date.now()}`, artigo_inciso: `Art. 101, ${id}`, texto: MEDIDAS_101_ECA.find(m => m.id === id)?.label || '', autor_id: currentUser.id, autor_nome: currentUser.nome, data_lancamento: now.toISOString(), conselheiros_requeridos: doc.conselheiros_providencia_nomes, confirmacoes: [mySignature] })),
      ...selectedMedidas129.map(id => ({ id: `med-129-${id}-${Date.now()}`, artigo_inciso: `Art. 129, ${id}`, texto: MEDIDAS_129_ECA.find(m => m.id === id)?.label || '', autor_id: currentUser.id, autor_nome: currentUser.nome, data_lancamento: now.toISOString(), conselheiros_requeridos: doc.conselheiros_providencia_nomes, confirmacoes: [mySignature] }))
    ];

    const statusFinal = (finalize && combinedMedidas.length > 0) ? ['AGUARDANDO_VALIDACAO'] : (finalize ? ['CONCLUIDO'] : ['EM_PREENCHIMENTO']);

    onUpdateDocument(doc.id, { 
      violacoesSipia: tempViolacoes, 
      agentesVioladores: tempAgentes, 
      medidas_detalhadas: combinedMedidas, 
      status: statusFinal,
      relato_providencias: relatoProvidencias
    });
    
    onAddLog(doc.id, finalize ? `REGISTRO FINALIZADO: Enviado para arquivamento ou validação.` : `RASCUNHO TÉCNICO: Prontuário atualizado.`, 'DOCUMENTO');
  };

  const handleValidate = () => {
    const now = new Date();
    const formatted = `${currentUser.nome} - ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;
    const updated = (doc.medidas_detalhadas || []).map(m => ({ ...m, confirmacoes: [...m.confirmacoes, { usuario_id: currentUser.id, usuario_nome: formatted, data_hora: now.toISOString() }] }));
    const validatedCount = validationTracker.filter(v => v.validated).length + 1;
    const trioSize = doc.conselheiros_providencia_nomes?.length || 3;
    let nextStatus = [...doc.status];
    if (validatedCount >= trioSize) { 
      nextStatus = nextStatus.filter(s => s !== 'AGUARDANDO_VALIDACAO'); 
      nextStatus.push('OFICIALIZADO'); 
    }
    onUpdateDocument(doc.id, { medidas_detalhadas: updated, status: nextStatus });
    onAddLog(doc.id, `VALIDAÇÃO TÉCNICA: Assinatura confirmada pelo trio.`, 'VALIDAÇÃO');
  };

  return (
    <div className="max-w-6xl mx-auto pb-40 animate-in fade-in flex flex-col gap-10">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <header className="p-8 bg-[#111827] text-white flex items-center justify-between">
          <button onClick={onBack} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><ArrowLeft className="w-6 h-6" /></button>
          <div className="text-center"><h2 className="text-[20px] font-black uppercase">{doc.crianca_nome}</h2><p className="text-[10px] opacity-60 uppercase">SIMCT #{doc.id}</p></div>
          <div className="w-12 h-12"></div>
        </header>

        <div className="p-10 space-y-10">
          {/* DESPACHO RÁPIDO */}
          <section className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
               <Tag className="w-5 h-5 text-indigo-600" />
               <h3 className="text-[12px] font-black uppercase text-slate-800 tracking-widest">Despacho de Situação (Autonomia Imediata)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <select 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold uppercase text-[11px] outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                  value={doc.status[doc.status.length - 1]}
                  onChange={(e) => handleQuickStatusChange(e.target.value as DocumentStatus)}
                  disabled={!canEditTechnicalFields}
               >
                  <option value="">DEFINIR NOVA SITUAÇÃO...</option>
                  {informativeStatusOptions.map(status => (
                    <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                  ))}
               </select>
               <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <div>
                     <span className="text-[9px] font-black text-slate-400 uppercase block">Situação Vigente</span>
                     <span className="text-[11px] font-black text-indigo-700 uppercase">{STATUS_LABELS[doc.status[doc.status.length - 1]]}</span>
                  </div>
               </div>
            </div>
          </section>

          {/* ACORDEÕES TÉCNICOS */}
          <div className="space-y-4">
            <AccordionSection id="direito" title="Direito Violado" color="bg-blue-600" active={activeSection} onToggle={setActiveSection} saved={tempViolacoes.length > 0}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {Object.entries(SIPIA_HIERARCHY).map(([fund, grps]) => (
                  <div key={fund} className="space-y-2">
                    <div className="text-[10px] font-black text-blue-800 uppercase border-b border-blue-100">{fund}</div>
                    {Object.entries(grps).map(([grp, items]) => (
                      <div key={grp} className="pl-2">
                         {items.map(item => (<div key={item} onClick={() => canEditTechnicalFields && setTempViolacoes(prev => prev.some(v => v.especifico === item) ? prev.filter(v => v.especifico !== item) : [...prev, { fundamental: fund, grupo: grp, especifico: item }])} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-[10px] uppercase font-bold ${tempViolacoes.some(v => v.especifico === item) ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}>{tempViolacoes.some(v => v.especifico === item) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-20" />} {item}</div>))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection id="agente" title="Agente Violador" color="bg-orange-500" active={activeSection} onToggle={setActiveSection} saved={tempAgentes.length > 0}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(AGENTES_VIOLADORES_ESTRUTURA).map(([cat, info]) => (
                  <div key={cat} className="space-y-2">
                    <div className="text-[10px] font-black text-orange-800 uppercase border-b border-orange-100">{cat}</div>
                    {info.options.map(opt => (<div key={opt} onClick={() => canEditTechnicalFields && setTempAgentes(prev => prev.some(a => a.principal === opt) ? prev.filter(a => a.principal !== opt) : [...prev, {categoria: cat, principal: opt, tipo: 'PRINCIPAL'}])} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-[10px] uppercase font-bold ${tempAgentes.some(a => a.principal === opt) ? 'bg-orange-50 text-orange-700' : 'hover:bg-slate-50'}`}>{tempAgentes.some(a => a.principal === opt) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-20" />} {opt}</div>))}
                  </div>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection id="medidas" title="Medidas ECA (Art. 101/129)" color="bg-emerald-600" active={activeSection} onToggle={setActiveSection} saved={selectedMedidas101.length > 0 || selectedMedidas129.length > 0}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-2">
                  {MEDIDAS_101_ECA.map(m => (
                    <div key={m.id} onClick={() => canEditTechnicalFields && setSelectedMedidas101(p => p.includes(m.id) ? p.filter(x => x !== m.id) : [...p, m.id])} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer text-[10px] font-bold uppercase transition-all ${selectedMedidas101.includes(m.id) ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 hover:bg-emerald-50'}`}>
                      {selectedMedidas101.includes(m.id) ? <CheckSquare className="w-4 h-4 mt-0.5" /> : <Square className="w-4 h-4 mt-0.5 opacity-20" />}
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionSection>
          </div>

          {canEditTechnicalFields && (
            <div className="grid grid-cols-2 gap-6 pt-6">
              <button onClick={() => handleSave(false)} className="py-6 bg-slate-600 text-white rounded-3xl font-black uppercase text-[12px] shadow-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-3"><Save className="w-5 h-5" /> [Salvar Rascunho]</button>
              <button onClick={() => handleSave(true)} className="py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[12px] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"><CheckCircle2 className="w-5 h-5" /> [Concluir Prontuário]</button>
            </div>
          )}

          {/* VALIDAÇÃO DO TRIO */}
          {(doc.status.includes('AGUARDANDO_VALIDACAO') || doc.status.includes('OFICIALIZADO')) && (
            <div className="mt-8 pt-8 border-t bg-slate-50/50 rounded-[2.5rem] p-8 space-y-6 border border-slate-100 shadow-inner">
               <h4 className="text-[12px] font-black text-slate-800 uppercase flex items-center gap-2"><Users2 className="w-5 h-5 text-blue-600" /> Assinaturas Colegiadas (Imediata)</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {validationTracker.map((status, idx) => {
                    const isMe = status.name.toUpperCase() === currentUser.nome.toUpperCase();
                    return (
                      <div key={idx} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${status.validated ? 'bg-white border-emerald-500 shadow-md' : 'bg-red-50 border-red-100 opacity-60'}`}>
                         <span className="text-[12px] font-black uppercase text-slate-700">{status.name}</span>
                         <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${status.validated ? 'bg-emerald-500 text-white' : 'bg-red-100 text-red-500'}`}>
                            {status.validated ? `VALIDADO` : 'AGUARDANDO'}
                         </div>
                         {!status.validated && isMe && doc.status.includes('AGUARDANDO_VALIDACAO') && (
                           <button onClick={handleValidate} className="mt-2 py-2 px-4 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg animate-bounce">Assinar Digitalmente</button>
                         )}
                      </div>
                    );
                  })}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* PAINEL DE INTELIGÊNCIA E AUDITORIA (OCULTO/INFERIOR) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
         <button 
           onClick={() => setShowIntelligence(!showIntelligence)}
           className="w-full p-10 flex items-center justify-between bg-slate-900 text-white hover:bg-slate-800 transition-all border-b border-white/5"
         >
            <div className="flex items-center gap-6">
               <div className="p-4 bg-blue-600 rounded-2xl shadow-xl">
                  <Database className="w-8 h-8" />
               </div>
               <div className="text-left">
                  <h3 className="text-[18px] font-black uppercase tracking-tight">Centro de Inteligência SIMCT</h3>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Dossiê Familiar & Histórico de Auditoria Institucional</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               {familyDossier.isRecurrent && <span className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase animate-pulse">🚩 Família Reincidente</span>}
               {showIntelligence ? <X className="w-8 h-8 text-slate-400" /> : <ChevronDown className="w-8 h-8 text-slate-400" />}
            </div>
         </button>

         {showIntelligence && (
            <div className="p-12 space-y-16 animate-in slide-in-from-bottom-5 duration-500">
               
               {/* 1. DOSSIÊ FAMILIAR COMPLETO */}
               <section className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                     <UserRound className="w-6 h-6 text-blue-600" />
                     <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-widest">Dossiê de Atendimento Familiar (Inteligência Institucional)</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                     <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase mb-3">Histórico Total</span>
                        <span className="text-3xl font-black text-slate-900">{familyDossier.history.length + 1} Prontuários</span>
                     </div>
                     <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-blue-400 uppercase mb-3">Vítimas Identificadas</span>
                        <span className="text-3xl font-black text-blue-900">{familyDossier.totalChildren} Filhos</span>
                     </div>
                     <div className="p-8 bg-purple-50 rounded-3xl border border-purple-100 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-purple-400 uppercase mb-3">Órgãos Envolvidos</span>
                        <span className="text-3xl font-black text-purple-900">{familyDossier.allAgencies.length} Serviços</span>
                     </div>
                     <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-emerald-400 uppercase mb-3">Status na Rede</span>
                        <span className="text-3xl font-black text-emerald-900">{familyDossier.isRecurrent ? 'Recorrente' : 'Novo'}</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><LayoutList className="w-3.5 h-3.5" /> Cronologia de Entradas</label>
                        <div className="space-y-3">
                           {familyDossier.history.length > 0 ? familyDossier.history.map(h => (
                              <div key={h.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-all shadow-sm">
                                 <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl"><FileText className="w-4 h-4 text-slate-400" /></div>
                                    <div>
                                       <div className="text-[12px] font-black text-slate-800 uppercase">{h.origem}</div>
                                       <div className="text-[10px] font-bold text-slate-400 uppercase">{new Date(h.data_recebimento).toLocaleDateString('pt-BR')} • {h.canal_comunicado}</div>
                                    </div>
                                 </div>
                                 <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase">#{h.id}</span>
                              </div>
                           )) : (
                              <div className="p-10 border-2 border-dashed border-slate-100 rounded-2xl text-center text-slate-300 font-bold uppercase text-[11px]">Nenhum registro anterior para esta família.</div>
                           )}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> Órgãos Comunicantes no Histórico</label>
                        <div className="flex flex-wrap gap-2">
                           {familyDossier.allAgencies.map(agency => (
                              <span key={agency} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase border border-slate-200">{agency}</span>
                           ))}
                        </div>
                     </div>
                  </div>
               </section>

               {/* 2. LINHA DO TEMPO DE AUDITORIA (MOVIMENTAÇÕES) */}
               <section className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                     <History className="w-6 h-6 text-emerald-600" />
                     <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-widest">Trilha de Auditoria Institucional (Movimentações de ADM e Conselheiros)</h4>
                  </div>
                  
                  <div className="space-y-8 relative pl-10 before:content-[''] before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                     {logs.length > 0 ? logs.map((log, idx) => {
                        const isSystem = log.tipo === 'SISTEMA' || log.tipo === 'SEGURANÇA';
                        const isTech = log.tipo === 'VALIDAÇÃO';
                        return (
                           <div key={log.id} className="relative animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
                              <div className={`absolute -left-10 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-md z-10 ${isSystem ? 'bg-red-500' : isTech ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-slate-300 transition-all shadow-sm">
                                 <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm"><UserCog className="w-5 h-5 text-slate-400" /></div>
                                       <div>
                                          <span className="text-[13px] font-black text-slate-900 uppercase">{log.usuario_nome}</span>
                                          <div className="flex items-center gap-2 mt-0.5">
                                             <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${isSystem ? 'bg-red-100 text-red-600' : isTech ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {log.tipo}
                                             </span>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <span className="text-[11px] font-bold text-slate-400 uppercase block tracking-tighter">{new Date(log.data_hora).toLocaleDateString('pt-BR')}</span>
                                       <span className="text-[13px] font-black text-slate-800">{new Date(log.data_hora).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                 </div>
                                 <p className="text-[14px] font-bold text-slate-600 uppercase leading-relaxed bg-white/50 p-4 rounded-xl border border-slate-100/50">{log.acao}</p>
                              </div>
                           </div>
                        );
                     }) : (
                        <div className="p-20 text-center flex flex-col items-center">
                           <History className="w-12 h-12 text-slate-100 mb-4" />
                           <p className="text-[14px] font-bold text-slate-300 uppercase tracking-widest">Iniciando rastreamento de auditoria para este procedimento...</p>
                        </div>
                     )}
                  </div>
               </section>

               <footer className="pt-10 border-t border-slate-100 flex items-center justify-center gap-3 opacity-40">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Registros Imutáveis SICT - Segurança Jurídica Institucional</p>
               </footer>
            </div>
         )}
      </div>
    </div>
  );
};

interface AccordionSectionProps {
  id: string; title: string; color: string; active: string | null; onToggle: (id: string) => void;
  saved: boolean; children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ 
  id, title, color, active, onToggle, saved, children 
}) => {
  const isOpen = active === id;
  return (
    <div className={`border-2 rounded-[2rem] overflow-hidden transition-all ${isOpen ? 'border-slate-300 shadow-xl scale-[1.01]' : 'border-slate-100 shadow-sm'}`}>
      <button onClick={() => onToggle(isOpen ? null : id)} className={`w-full flex items-center justify-between p-7 ${isOpen ? `${color} text-white` : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
        <div className="flex items-center gap-5">
          {isOpen ? <ChevronDown className="w-6 h-6" /> : <Play className={`w-5 h-5 ${saved ? 'text-emerald-500' : 'opacity-40'}`} />}
          <span className="text-[15px] font-black uppercase tracking-widest">{title}</span>
        </div>
        {saved && <CheckCircle className={`w-7 h-7 ${isOpen ? 'text-white' : 'text-emerald-500'}`} />}
      </button>
      {isOpen && <div className="p-10 bg-white animate-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
};

export default DocumentView;