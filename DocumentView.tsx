
// DIRETRIZ 72/73: Restaurando funcionalidade de tipificação e garantindo importação de ícones necessários.
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Scale, X, Check, Clock, AlertCircle, Info, 
  Save, ShieldAlert, History, ClipboardList, CheckSquare, Square, 
  SendHorizonal, ListChecks, Activity, Ban, Calendar, UserRound, 
  CheckCircle, ChevronDown, Play, RotateCcw, Users2
} from 'lucide-react';
import { 
  Documento, Log, User as UserType, DocumentStatus, 
  MedidaAplicada, SipiaViolation, AgenteVioladorEntry
} from './types';
import { 
  STATUS_LABELS, INITIAL_USERS, 
  SIPIA_HIERARCHY, AGENTES_VIOLADORES_ESTRUTURA, 
  getEffectiveEscala, MEDIDAS_101_ECA, MEDIDAS_129_ECA, ATRIBUICOES_136_ECA
} from './constants';

interface DocumentViewProps {
  document: Documento;
  allDocuments: Documento[]; 
  currentUser: UserType;
  onBack: () => void;
  onUpdateDocument: (id: string, fields: Partial<Documento>) => void;
  onAddLog: (docId: string, acao: string) => void;
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

  // DIRETRIZ 78: SOBERANIA TÉCNICA - Editor Único do Trio de Imediata
  const isImediataResponsavel = doc.conselheiro_providencia_id === currentUser.id;
  const canEditTechnicalFields = isImediataResponsavel && !doc.status.includes('OFICIALIZADO');

  const validationTracker = useMemo(() => {
    const trio = doc.conselheiros_providencia_nomes || [];
    const confirmacoes = doc.medidas_detalhadas?.[0]?.confirmacoes || [];
    return trio.map(name => {
      const match = confirmacoes.find(c => c.usuario_nome.toUpperCase().includes(name.toUpperCase()));
      return { name, validated: !!match, timestamp: match?.usuario_nome.split(' - ')[1] || null };
    });
  }, [doc.conselheiros_providencia_nomes, doc.medidas_detalhadas]);

  const toggleSipia = (fund: string, grp: string, item: string) => {
    if (!canEditTechnicalFields) return;
    setTempViolacoes(prev => prev.some(v => v.especifico === item) ? prev.filter(v => v.especifico !== item) : [...prev, { fundamental: fund, grupo: grp, especifico: item }]);
  };

  const handleSave = (finalize: boolean) => {
    if (!canEditTechnicalFields) return;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
    
    // DIRETRIZ 78.2: REVALIDAÇÃO AUTOMÁTICA (Reseta assinaturas se as medidas forem alteradas)
    const newSignature = { usuario_id: currentUser.id, usuario_nome: `${currentUser.nome} - ${formattedDate}`, data_hora: now.toISOString() };
    
    const combinedMedidas: MedidaAplicada[] = [
      ...selectedMedidas101.map(id => ({ 
        id: `med-101-${id}-${Date.now()}`, 
        artigo_inciso: `Art. 101, ${id}`, 
        texto: MEDIDAS_101_ECA.find(m => m.id === id)?.label || '', 
        autor_id: currentUser.id, autor_nome: currentUser.nome, 
        data_lancamento: now.toISOString(), 
        conselheiros_requeridos: doc.conselheiros_providencia_nomes, 
        confirmacoes: [newSignature] 
      })),
      ...selectedMedidas129.map(id => ({ 
        id: `med-129-${id}-${Date.now()}`, 
        artigo_inciso: `Art. 129, ${id}`, 
        texto: MEDIDAS_129_ECA.find(m => m.id === id)?.label || '', 
        autor_id: currentUser.id, autor_nome: currentUser.nome, 
        data_lancamento: now.toISOString(), 
        conselheiros_requeridos: doc.conselheiros_providencia_nomes, 
        confirmacoes: [newSignature] 
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
      observacao_monitoramento: obsMonitoramento
    });
    
    onAddLog(doc.id, `EDITOU MEDIDAS; REVALIDAÇÃO COLETIVA SOLICITADA.`);
    alert(finalize ? "Documento enviado para validação coletiva." : "Rascunho salvo.");
  };

  const handleValidate = () => {
    const now = new Date();
    const formatted = `${currentUser.nome} - ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}`;
    const updated = (doc.medidas_detalhadas || []).map(m => ({
      ...m,
      confirmacoes: [...m.confirmacoes, { usuario_id: currentUser.id, usuario_nome: formatted, data_hora: now.toISOString() }]
    }));
    onUpdateDocument(doc.id, { medidas_detalhadas: updated });
    onAddLog(doc.id, `CONFIRMOU VALIDAÇÃO COLETIVA.`);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <header className="p-8 bg-[#111827] text-white flex items-center justify-between">
            <button onClick={onBack} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><ArrowLeft className="w-6 h-6" /></button>
            <div className="text-center"><h2 className="text-[20px] font-black uppercase">{doc.crianca_nome}</h2><p className="text-[10px] opacity-60 uppercase">SIMCT #{doc.id}</p></div>
            <div className="w-12 h-12"></div>
          </header>

          <div className="p-10 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-[14px] font-black uppercase text-slate-800 flex items-center gap-2"><Scale className="w-5 h-5 text-blue-600" /> Mérito Técnico</h3>
              {canEditTechnicalFields && <span className="text-[9px] font-black text-emerald-600 uppercase animate-pulse">Soberania de Edição Ativa</span>}
            </div>

            {/* SEÇÕES EXPANSÍVEIS - Diretrizes 74, 75, 76 */}
            <div className="space-y-4">
              <AccordionSection 
                id="direito" title="Direito Violado" color="bg-blue-600" active={activeSection} onToggle={setActiveSection}
                saved={tempViolacoes.length > 0}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2">
                  {Object.entries(SIPIA_HIERARCHY).map(([fund, grps]) => (
                    <div key={fund} className="space-y-2">
                      <div className="text-[10px] font-black text-blue-800 uppercase border-b border-blue-100">{fund}</div>
                      {Object.entries(grps).map(([grp, items]) => (
                        <div key={grp} className="pl-2">
                          <div className="text-[8px] font-black text-slate-400 uppercase">{grp}</div>
                          {items.map(item => (
                            <div key={item} onClick={() => toggleSipia(fund, grp, item)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-[10px] uppercase font-bold ${tempViolacoes.some(v => v.especifico === item) ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}>
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
                saved={tempAgentes.length > 0}>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(AGENTES_VIOLADORES_ESTRUTURA).map(([cat, info]) => (
                    <div key={cat} className="space-y-2">
                      <div className="text-[10px] font-black text-orange-800 uppercase border-b border-orange-100">{cat}</div>
                      {info.options.map(opt => (
                        <div key={opt} onClick={() => canEditTechnicalFields && setTempAgentes(prev => prev.some(a => a.principal === opt) ? prev.filter(a => a.principal !== opt) : [...prev, {categoria: cat, principal: opt, tipo: 'PRINCIPAL'}])} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-[10px] uppercase font-bold ${tempAgentes.some(a => a.principal === opt) ? 'bg-orange-50 text-orange-700' : 'hover:bg-slate-50'}`}>
                          {tempAgentes.some(a => a.principal === opt) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-20" />} {opt}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </AccordionSection>

              <AccordionSection 
                id="medidas" title="Medidas de Proteção" color="bg-emerald-600" active={activeSection} onToggle={setActiveSection}
                saved={(selectedMedidas101.length + selectedMedidas129.length) > 0}>
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-emerald-800 uppercase">Art. 101 - Criança/Adolescente</div>
                  {MEDIDAS_101_ECA.map(m => (
                    <div key={m.id} onClick={() => canEditTechnicalFields && setSelectedMedidas101(p => p.includes(m.id) ? p.filter(x => x !== m.id) : [...p, m.id])} className="flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-emerald-50 text-[10px] uppercase font-bold">
                       {selectedMedidas101.includes(m.id) ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 opacity-20" />} {m.label}
                    </div>
                  ))}
                </div>
              </AccordionSection>
            </div>

            {canEditTechnicalFields && (
              <div className="grid grid-cols-2 gap-4 pt-6">
                <button onClick={() => handleSave(false)} className="py-4 bg-slate-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-lg flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Salvar Rascunho</button>
                <button onClick={() => handleSave(true)} className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-lg flex items-center justify-center gap-2"><SendHorizonal className="w-4 h-4" /> Finalizar Tipificação</button>
              </div>
            )}

            {/* RASTREAMENTO DE VALIDAÇÃO NO RODAPÉ - Diretrizes 76, 77 */}
            <div className="mt-10 pt-8 border-t bg-slate-50/50 rounded-[2rem] p-8">
               <h4 className="text-[12px] font-black text-slate-800 uppercase mb-6 flex items-center gap-2"><Users2 className="w-5 h-5" /> Status de Validação do Trio</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {validationTracker.map((status, idx) => (
                    <div key={idx} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 ${status.validated ? 'bg-white border-emerald-500 shadow-md' : 'bg-red-50 border-red-100 opacity-60'}`}>
                       <span className="text-[12px] font-black uppercase">{status.name}</span>
                       <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${status.validated ? 'bg-emerald-500 text-white' : 'bg-red-100 text-red-500'}`}>
                          {status.validated ? `VALIDADO EM ${status.timestamp}` : 'PENDENTE'}
                       </div>
                       {!status.validated && doc.conselheiros_providencia_nomes.includes(currentUser.nome.toUpperCase()) && currentUser.nome.toUpperCase() === status.name && (
                         <button onClick={handleValidate} className="mt-2 py-2 px-4 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg animate-bounce">Validar Agora</button>
                       )}
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccordionSection: React.FC<{ id: string, title: string, color: string, active: string | null, onToggle: (id: string) => void, saved: boolean, children: React.ReactNode }> = ({ id, title, color, active, onToggle, saved, children }) => {
  const isOpen = active === id;
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <button onClick={() => onToggle(id)} className={`w-full flex items-center justify-between p-5 transition-all ${isOpen ? `${color} text-white` : 'bg-slate-50 hover:bg-slate-100'}`}>
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <Play className={`w-4 h-4 ${saved ? 'text-emerald-500' : 'text-slate-300'}`} />}
          <span className="text-[13px] font-black uppercase tracking-widest">{title}</span>
        </div>
        {saved && <CheckCircle className={`w-5 h-5 ${isOpen ? 'text-white' : 'text-emerald-500'}`} />}
      </button>
      {isOpen && <div className="p-6 bg-white animate-in slide-in-from-top-2">{children}</div>}
    </div>
  );
};

export default DocumentView;
