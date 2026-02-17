
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, ShieldCheck, Scale, X, Edit2, Check, Gavel, LayoutList, Users2, Lock, Zap, Clock, AlertCircle, Info, UserRound, MessageSquareWarning, Plus, Save, Search, Trash2, Sparkles, Loader2, BellRing, CheckCircle2, Fingerprint, Baby, ShieldAlert, ClipboardCheck, ShieldEllipsis, History, ChevronDown, ChevronUp, FolderTree, Building2, ChevronRight, Share2, FileText, AlertTriangle, Building, Users, Ban, FileWarning, PencilLine, RefreshCw, Footprints, ClipboardList, CheckSquare, Square, HeartHandshake, BookOpen, Megaphone, Printer, SendHorizonal, ListFilter } from 'lucide-react';
import { Documento, DocumentFile, Log, User as UserType, DocumentStatus, MedidaAplicada, SipiaViolation, AgenteVioladorEntry, EdicaoRegistro, RequisicaoServico } from '../types';
import { STATUS_LABELS, INITIAL_USERS, MEDIDAS_ECA_DESCRICAO, SIPIA_HIERARCHY, AGENTES_VIOLADORES_ESTRUTURA, MEDIDAS_PROTECAO_ECA, getEffectiveEscala, REDE_HORTOLANDIA } from '../constants';
import FamilyHistoryModal from './FamilyHistoryModal';

const MEDIDAS_101_ECA = [
  { id: 'I', label: 'I - Encaminhamento: aos pais ou responsável, mediante termo de responsabilidade.' },
  { id: 'II', label: 'II - Orientação: apoio e acompanhamento temporários.' },
  { id: 'III', label: 'III - Educação: matrícula e frequência obrigatórias em estabelecimento oficial de ensino fundamental.' },
  { id: 'IV', label: 'IV - Programas: inclusão em serviços e programas oficiais ou comunitários de proteção, apoio e promoção da família, da criança e do adolescente (Lei 13.257/2016).' },
  { id: 'V', label: 'V - Saúde: requisição de tratamento médico, psicológico ou psiquiátrico, em regime hospitalar ou ambulatorial, extensivo às famílias (Lei 15.280/2025).' },
  { id: 'VI', label: 'VI - Tratamento Específico: inclusão em programa oficial ou comunitário de auxílio, orientação e tratamento a alcoólatras e toxicômanos.' },
  { id: 'VII', label: 'VII - Acolhimento: acolhimento institucional (Lei 12.010/2009).' }
];

const MEDIDAS_129_ECA = [
  { id: 'I', label: 'I - Apoio à Família: encaminhamento a serviços e programas oficiais ou comunitários de proteção, apoio e promoção da família (Lei 13.257/2016).' },
  { id: 'II', label: 'II - Tratamento de Adicções: inclusão em programa oficial ou comunitário de auxílio, orientação e tratamento a alcoólatras e toxicômanos.' },
  { id: 'III', label: 'III - Saúde Mental: encaminhamento a tratamento psicológico ou psiquiátrico.' },
  { id: 'IV', label: 'IV - Cursos de Orientação: encaminhamento a cursos ou programs de orientação.' },
  { id: 'V', label: 'V - Obrigação Escolar: obrigação de matricular o filho ou pupilo e acompanhar sua frequência e aproveitamento escolar.' },
  { id: 'VI', label: 'VI - Tratamento Especializado: obrigação de encaminhar a criança ou adolescente a tratamento especializado.' },
  { id: 'VII', label: 'VII - Advertência: advertência formal (registrada em termo).' }
];

const ATRIBUICOES_136_ECA = [
  { id: 'I', label: 'I - Atender Crianças/Adolescentes: (Arts. 98 e 105).' },
  { id: 'II', label: 'II - Atender/Aconselhar Pais: (Art. 129).' },
  { id: 'III-a', label: 'III - Promover Execução: (a) Requisitar serviços de saúde, educação, assistência social (Lei 15.268/2025), previdência, trabalho e segurança.' },
  { id: 'III-b', label: 'III - Representar junto à autoridade judiciária nos casos de descumprimento injustificado de suas deliberações.' },
  { id: 'IV/V', label: 'IV/V - Encaminhamentos: Notícia de fato ao MP ou casos à autoridade judiciária.' },
  { id: 'VII', label: 'VII - Notificações: Expedir notificações oficiais.' },
  { id: 'VIII', label: 'VIII - Certidões: Requisitar certidões de nascimento/óbito.' },
  { id: 'XI', label: 'XI - Poder Familiar: Representar ao MP para perda/suspensão do poder familiar.' },
  { id: 'XIII-XX', label: 'XIII a XX - Lei Henry Borel (14.344/22): Ações articuladas contra violência doméstica, representação para afastamento do agressor e medidas protetivas de urgência.' }
];

const SITUACOES_PRONTUARIO = [
  { id: 'EM_PREENCHIMENTO', label: 'EM PREENCHIMENTO (Rascunho)' },
  { id: 'AGUARDANDO_VALIDACAO', label: 'AGUARDANDO VALIDAÇÃO' },
  { id: 'MONITORAMENTO', label: 'EM MONITORAMENTO' },
  { id: 'CONCLUIDO', label: 'CONCLUÍDO' },
  { id: 'ARQUIVADO', label: 'ARQUIVADO' }
];

interface DocumentViewProps {
  document: Documento;
  allDocuments: Documento[]; 
  files: DocumentFile[];
  logs: Log[];
  currentUser: UserType;
  isReadOnly?: boolean;
  forceEdit?: boolean;
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
  forceEdit,
  onBack, 
  onEdit,
  onUpdateStatus,
  onUpdateDocument,
  onAddLog
}) => {
  const [showSipiaModal, setShowSipiaModal] = useState(false);
  const [showAgenteModal, setShowAgenteModal] = useState(false);
  const [showFamilyHistoryModal, setShowFamilyHistoryModal] = useState(false);
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [showRequisicaoModal, setShowRequisicaoModal] = useState(false);
  
  const [tempViolacoes, setTempViolacoes] = useState<SipiaViolation[]>(doc.violacoesSipia || []);
  const [tempAgentes, setTempAgentes] = useState<AgenteVioladorEntry[]>(doc.agentesVioladores || []);
  
  const [selectedMedidas101, setSelectedMedidas101] = useState<string[]>(
    (doc.medidas_detalhadas || [])
      .filter(m => m.artigo_inciso.startsWith('Art. 101')) 
      .map(m => m.artigo_inciso.replace('Art. 101, ', ''))
  );
  
  const [selectedMedidas129, setSelectedMedidas129] = useState<string[]>(
    (doc.medidas_detalhadas || [])
      .filter(m => m.artigo_inciso.startsWith('Art. 129'))
      .map(m => m.artigo_inciso.replace('Art. 129, ', ''))
  );

  const [selectedAtribuicoes136, setSelectedAtribuicoes136] = useState<string[]>(doc.atribuicoes_136 || []);

  const [complementoMedidas, setComplementoMedidas] = useState<string>(doc.complemento_medidas || '');
  const [isImprocedente, setIsImprocedente] = useState<boolean>(doc.is_improcedente || false);
  const [justificativaImprocedencia, setJustificativaImprocedencia] = useState<string>(doc.justificativa_improcedencia || '');
  
  const [tempStatus, setTempStatus] = useState<DocumentStatus>(
    (doc.status[doc.status.length - 1] as DocumentStatus) || 'EM_PREENCHIMENTO'
  );

  const [newRequisicao, setNewRequisicao] = useState<{
    area: string;
    subGrupo: string;
    equipamento: string;
    prazoDias: number;
    detalhes: string;
  }>({
    area: '',
    subGrupo: '',
    equipamento: '',
    prazoDias: 10,
    detalhes: ''
  });

  const needsImmediateMP = selectedMedidas101.includes('VII');
  const isReqAreaSelected = selectedAtribuicoes136.includes('III-a');

  const hasExpiredRequisicao = useMemo(() => {
    if (!doc.monitoramento?.requisicoes) return false;
    const now = new Date();
    return doc.monitoramento.requisicoes.some(r => !r.excluidoDoMonitoramento && new Date(r.dataFinal) < now);
  }, [doc.monitoramento]);

  const familyHistory = useMemo(() => {
    return allDocuments.filter(d => {
       if (d.id === doc.id) return false;
       const matchCpf = doc.cpf_genitora && d.cpf_genitora && doc.cpf_genitora.replace(/\D/g, '') === d.cpf_genitora.replace(/\D/g, '');
       const matchNome = doc.genitora_nome && d.genitora_nome && doc.genitora_nome.trim().toUpperCase() === d.genitora_nome.trim().toUpperCase();
       return matchCpf || matchNome;
    });
  }, [allDocuments, doc]);

  const isConselheiro = currentUser.perfil === 'CONSELHEIRO' || (currentUser.perfil === 'SUPLENTE' && currentUser.substituicao_ativa);
  const isReferencia = doc.conselheiro_referencia_id === currentUser.id;
  const isProvidencia = doc.conselheiro_providencia_id === currentUser.id;

  const escalaDia = useMemo(() => getEffectiveEscala(doc.data_recebimento || new Date().toISOString().split('T')[0]), [doc.data_recebimento]);
  const isParticipanteDia = escalaDia.some(n => n.toUpperCase() === currentUser.nome.toUpperCase());
  
  const alreadySigned = doc.medidas_detalhadas?.[0]?.confirmacoes.some(c => c.usuario_id === currentUser.id) || false;
  const needsValidation = doc.status.includes('AGUARDANDO_VALIDACAO') && isParticipanteDia && !alreadySigned;

  const isDirectActionMode = isConselheiro && (isReferencia || (isParticipanteDia && !alreadySigned));

  const isAdminProfile = currentUser.nome === 'EDSON' || currentUser.nome === 'FATIMA' || currentUser.nome === 'LUIZ';

  const isCompleteForFinalize = useMemo(() => {
    if (isAdminProfile) return true; 
    if (isImprocedente) return justificativaImprocedencia.trim().length >= 5 && tempAgentes.length > 0;
    return (
      tempViolacoes.length > 0 &&
      tempAgentes.length > 0 &&
      selectedMedidas101.length > 0 &&
      selectedAtribuicoes136.length > 0
    );
  }, [isImprocedente, justificativaImprocedencia, tempViolacoes, tempAgentes, selectedMedidas101, selectedAtribuicoes136, isAdminProfile]);

  const hasMeritoForFinalize = useMemo(() => {
    if (isAdminProfile) return true;
    return (tempViolacoes.length > 0 || isImprocedente) && tempAgentes.length > 0;
  }, [tempViolacoes, isImprocedente, tempAgentes, isAdminProfile]);

  useEffect(() => {
    if (forceEdit && isDirectActionMode && tempViolacoes.length === 0 && !isImprocedente) {
      setShowSipiaModal(true);
    }
  }, [forceEdit, isDirectActionMode]);

  const toggleSipia = (fundamental: string, grupo: string, especifico: string) => {
    if (tempViolacoes.some(v => v.especifico === especifico)) {
      setTempViolacoes(tempViolacoes.filter(v => v.especifico !== especifico));
    } else {
      setTempViolacoes([...tempViolacoes, { fundamental, grupo, especifico }]);
    }
  };

  const toggleAgente = (categoria: string, principal: string) => {
    if (tempAgentes.some(a => a.principal === principal)) {
      setTempAgentes(tempAgentes.filter(a => a.principal !== principal));
    } else {
      setTempAgentes([...tempAgentes, { categoria, principal, tipo: 'PRINCIPAL' }]);
    }
  };

  const toggleMedida101 = (id: string) => {
    setSelectedMedidas101(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const toggleMedida129 = (id: string) => {
    setSelectedMedidas129(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const toggleAtribuicao136 = (id: string) => {
    if (id === 'III-a' && !selectedAtribuicoes136.includes(id)) {
      setShowRequisicaoModal(true);
    }
    setSelectedAtribuicoes136(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleToggleImprocedencia = () => {
    const newVal = !isImprocedente;
    setIsImprocedente(newVal);
    if (newVal) {
      setTempViolacoes([]);
      setTempAgentes([]);
      setSelectedMedidas101([]);
      setSelectedMedidas129([]);
      setSelectedAtribuicoes136([]);
    }
  };

  const saveProvidencias = (forceFinalize: boolean = false) => {
    if (forceFinalize) {
      if (!isCompleteForFinalize) {
        if (!hasMeritoForFinalize) {
          alert("ERRO DE FINALIZAÇÃO: Selecione obrigatoriamente o Direito e o Agente Violador.");
          return;
        }
        alert("DIRETRIZ SIMCT: Preencha Direito, Agente, Medida e Atribuição para poder FINALIZAR.");
        return;
      }
    }

    const hadValidations = (doc.medidas_detalhadas?.[0]?.confirmacoes.length || 0) > 1;
    if (hadValidations && forceFinalize) {
      if (!window.confirm("Atenção: Ao alterar estes campos, as validações anteriores serão removidas.")) return;
    }

    const combinedMedidas: MedidaAplicada[] = [
      ...selectedMedidas101.map(id => ({
        id: `med-101-${id}-${Date.now()}`,
        artigo_inciso: `Art. 101, ${id}`,
        texto: MEDIDAS_101_ECA.find(m => m.id === id)?.label || '',
        autor_id: currentUser.id,
        autor_nome: currentUser.nome,
        data_launch: new Date().toISOString(),
        data_lancamento: new Date().toISOString(),
        conselheiros_requeridos: escalaDia.map(n => n.toUpperCase()),
        confirmacoes: [{ usuario_id: currentUser.id, usuario_nome: currentUser.nome, data_hora: new Date().toISOString() }]
      })),
      ...selectedMedidas129.map(id => ({
        id: `med-129-${id}-${Date.now()}`,
        artigo_inciso: `Art. 129, ${id}`,
        texto: MEDIDAS_129_ECA.find(m => m.id === id)?.label || '',
        autor_id: currentUser.id,
        autor_nome: currentUser.nome,
        data_launch: new Date().toISOString(),
        data_lancamento: new Date().toISOString(),
        conselheiros_requeridos: escalaDia.map(n => n.toUpperCase()),
        confirmacoes: [{ usuario_id: currentUser.id, usuario_nome: currentUser.nome, data_hora: new Date().toISOString() }]
      }))
    ];

    let updatedMonitoring = doc.monitoramento || { servicos: [], prazoEsperado: '', concluido: false, requisicoes: [] };
    if (isReqAreaSelected && newRequisicao.equipamento) {
      const dataFinal = new Date();
      dataFinal.setDate(dataFinal.getDate() + newRequisicao.prazoDias);
      const reqIndividual: RequisicaoServico = {
        id: `req-${Date.now()}`,
        area: newRequisicao.area,
        servico: newRequisicao.equipamento,
        prazoDias: newRequisicao.prazoDias,
        dataFinal: dataFinal.toISOString()
      };
      updatedMonitoring = { ...updatedMonitoring, requisicoes: [...(updatedMonitoring.requisicoes || []), reqIndividual] };
      onAddLog(doc.id, `REQUISIÇÃO: Serviço registrado para ${newRequisicao.equipamento}.`);
    }

    let finalStatus: DocumentStatus[] = doc.status.filter(s => !SITUACOES_PRONTUARIO.some(sp => sp.id === s));
    if (forceFinalize) {
      finalStatus.push('AGUARDANDO_VALIDACAO');
      onAddLog(doc.id, `FINALIZAÇÃO: Decisão técnica finalizada por ${currentUser.nome}.`);
    } else {
      finalStatus.push(tempStatus);
      onAddLog(doc.id, `ATUALIZAÇÃO: Prontuário atualizado por ${currentUser.nome}.`);
    }

    const incisos101Str = selectedMedidas101.join(', ');
    const incisos129Str = selectedMedidas129.join(', ');
    const incisos136Str = selectedAtribuicoes136.join(', ');
    let fundamentacao = isImprocedente ? `PROCESSO DECLARADO IMPROCEDENTE: ${justificativaImprocedencia.toUpperCase()}` : `Diante dos fatos, aplico as medidas de proteção à criança/adolescente (Art. 101, incisos ${incisos101Str}) e, cumulativamente, as medidas aos pais/responsável conforme Art. 129, incisos ${incisos129Str} da Lei 8.069/90.\n\nNo uso das atribuições conferidas pelo Art. 136, incisos ${incisos136Str} da Lei 8.069/90, decido pela aplicação das medidas supra mencionadas.`;

    onUpdateDocument(doc.id, {
      violacoesSipia: tempViolacoes,
      agentesVioladores: tempAgentes,
      medidas_detalhadas: combinedMedidas,
      atribuicoes_136: selectedAtribuicoes136,
      observacoes_iniciais: fundamentacao,
      status: finalStatus,
      is_improcedente: isImprocedente,
      justificativa_improcedencia: justificativaImprocedencia,
      complemento_medidas: complementoMedidas,
      monitoramento: updatedMonitoring
    });

    if (forceFinalize) onBack();
    else alert("Prontuário salvo como rascunho no SIMCT.");
  };

  const handleValidarColegiada = () => {
    if (!doc.medidas_detalhadas || doc.medidas_detalhadas.length === 0) return;
    const timestamp = new Date().toISOString();
    const firstMedida = doc.medidas_detalhadas[0];
    const newConfirmations = [...firstMedida.confirmacoes, { usuario_id: currentUser.id, usuario_nome: currentUser.nome, data_hora: timestamp }];
    const updatedMedidas = doc.medidas_detalhadas.map((m, idx) => idx === 0 ? { ...m, confirmacoes: newConfirmations } : m);
    let newStatus = [...doc.status];
    if (newConfirmations.length >= 3) {
      newStatus = newStatus.filter(s => s !== 'AGUARDANDO_VALIDACAO');
      if (!newStatus.includes('OFICIALIZADO')) newStatus.push('OFICIALIZADO');
    }
    onUpdateDocument(doc.id, { medidas_detalhadas: updatedMedidas, status: newStatus });
    onAddLog(doc.id, `VALIDAÇÃO: Documento validado por ${currentUser.nome} no SIMCT.`);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      {hasExpiredRequisicao && (
        <div className="mb-8 p-6 bg-red-600 text-white rounded-[2rem] shadow-2xl flex items-center justify-between border-4 border-red-500 animate-pulse">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-10 h-10" />
            <div>
              <h4 className="text-[16px] font-black uppercase tracking-widest">PRAZO DE REQUISIÇÃO EXPIRADO</h4>
              <p className="text-[11px] font-bold opacity-90 uppercase">PROVIDENCIAR ART. 136, III, 'b' (Representação Judiciária)</p>
            </div>
          </div>
          <ShieldAlert className="w-12 h-12 opacity-30" />
        </div>
      )}

      {isDirectActionMode && (
        <div className="mb-10 p-10 bg-[#1e293b] text-white rounded-[3rem] shadow-2xl flex flex-col gap-10 border-b-8 border-[#0f172a] animate-in slide-in-from-top-4">
           <header className="flex items-center justify-between border-b border-white/10 pb-6">
             <div className="flex items-center gap-5">
               <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-500/20"><ShieldAlert className="w-10 h-10 text-white" /></div>
               <div><h3 className="text-[22px] font-black uppercase tracking-tight">Protocolo Decisório SIMCT</h3><p className="text-[11px] font-bold opacity-60 uppercase tracking-[0.3em]">Hortolândia • Gestão Municipal</p></div>
             </div>
             <button onClick={handleToggleImprocedencia} className={`px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg ${isImprocedente ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}><Ban className="w-5 h-5" /> Improcedente</button>
           </header>

           {needsValidation && (
             <button onClick={handleValidarColegiada} className="w-full py-10 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase text-[18px] tracking-[0.2em] shadow-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-6 animate-pulse">
                <ShieldCheck className="w-10 h-10" /> [CONFIRMAR MINHA VALIDAÇÃO NO COLEGIADO]
             </button>
           )}

           {!isImprocedente ? (
             <div className="space-y-12">
                <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                   <div className="flex items-center gap-3"><ListFilter className="w-5 h-5 text-blue-400" /><label className="text-[11px] font-black text-white/60 uppercase tracking-[0.2em]">Situação Prontuário SIMCT</label></div>
                   <select className="w-full p-5 bg-slate-900 border border-white/10 rounded-2xl text-[13px] font-black uppercase text-white outline-none focus:border-blue-500 transition-all cursor-pointer" value={tempStatus} onChange={e => setTempStatus(e.target.value as DocumentStatus)}>{SITUACOES_PRONTUARIO.map(sit => <option key={sit.id} value={sit.id}>{sit.label}</option>)}</select>
                </div>

                {needsImmediateMP && <div className="p-8 bg-red-600 border border-red-500 rounded-[2rem] flex items-center gap-6 shadow-2xl animate-bounce"><Megaphone className="w-12 h-12 text-white shrink-0" /><div><h4 className="text-[16px] font-black uppercase text-white tracking-widest">Notificação Incontinenti MP</h4><p className="text-[12px] font-bold text-red-100 uppercase mt-1">Acolhimento detectado (Art. 136 ECA).</p></div></div>}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <button onClick={() => setShowSipiaModal(true)} className={`p-8 bg-blue-500/10 border rounded-[2.5rem] hover:bg-blue-500/20 transition-all flex items-center gap-6 group ${tempViolacoes.length === 0 ? 'border-blue-500/30' : 'border-blue-500/50 shadow-blue-500/10'}`}><Scale className={`w-12 h-12 transition-transform group-hover:scale-110 ${tempViolacoes.length === 0 ? 'text-blue-300 opacity-50' : 'text-blue-400'}`} /><div className="text-left"><span className={`text-[10px] font-black uppercase tracking-widest block ${tempViolacoes.length === 0 ? 'text-blue-300 opacity-50' : 'text-blue-400'}`}>Violações SIPIA</span><span className="text-[16px] font-black uppercase">{tempViolacoes.length} Selecionadas</span></div></button>
                   <button onClick={() => setShowAgenteModal(true)} className={`p-8 bg-amber-500/10 border rounded-[2.5rem] hover:bg-amber-500/20 transition-all flex items-center gap-6 group ${tempAgentes.length === 0 ? 'border-amber-500/30' : 'border-amber-500/50 shadow-amber-500/10'}`}><Users2 className={`w-12 h-12 transition-transform group-hover:scale-110 ${tempAgentes.length === 0 ? 'text-amber-300 opacity-50' : 'text-amber-400'}`} /><div className="text-left"><span className={`text-[10px] font-black uppercase tracking-widest block ${tempAgentes.length === 0 ? 'text-amber-300 opacity-50' : 'text-amber-400'}`}>Agentes Violadores</span><span className="text-[16px] font-black uppercase">{tempAgentes.length} Selecionados</span></div></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6"><h4 className="text-[13px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3"><Baby className="w-5 h-5" /> Medidas Art. 101</h4><div className="space-y-3 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin">{MEDIDAS_101_ECA.map(med => <div key={med.id} onClick={() => toggleMedida101(med.id)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${selectedMedidas101.includes(med.id) ? 'bg-emerald-600/20 border-emerald-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>{selectedMedidas101.includes(med.id) ? <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" /> : <Square className="w-5 h-5 text-white/20 shrink-0" />}<span className={`text-[11px] font-bold uppercase leading-tight ${selectedMedidas101.includes(med.id) ? 'text-emerald-50' : 'text-white/60'}`}>{med.label}</span></div>)}</div></div>
                   <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6"><h4 className="text-[13px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-3"><HeartHandshake className="w-5 h-5" /> Medidas Art. 129</h4><div className="space-y-3 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin">{MEDIDAS_129_ECA.map(med => <div key={med.id} onClick={() => toggleMedida129(med.id)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${selectedMedidas129.includes(med.id) ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>{selectedMedidas129.includes(med.id) ? <CheckSquare className="w-5 h-5 text-indigo-400 shrink-0" /> : <Square className="w-5 h-5 text-white/20 shrink-0" />}<span className={`text-[11px] font-bold uppercase leading-tight ${selectedMedidas129.includes(med.id) ? 'text-indigo-50' : 'text-white/60'}`}>{med.label}</span></div>)}</div></div>
                </div>

                <div className="p-10 bg-white/5 border border-blue-500/20 rounded-[3rem] space-y-8"><div className="flex items-center justify-between border-b border-white/10 pb-4"><h4 className="text-[15px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-4"><BookOpen className="w-6 h-6" /> Atribuições Art. 136</h4></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-6 scrollbar-thin">{ATRIBUICOES_136_ECA.map(atr => <div key={atr.id} onClick={() => toggleAtribuicao136(atr.id)} className={`p-5 rounded-[2rem] border transition-all cursor-pointer flex items-start gap-5 ${selectedAtribuicoes136.includes(atr.id) ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>{selectedAtribuicoes136.includes(atr.id) ? <CheckSquare className="w-6 h-6 text-blue-400 shrink-0" /> : <Square className="w-6 h-6 text-white/20 shrink-0" />}<div className="space-y-1"><span className={`text-[12px] font-black uppercase tracking-tight block ${selectedAtribuicoes136.includes(atr.id) ? 'text-blue-50' : 'text-white/60'}`}>{atr.id}</span><p className={`text-[11px] font-bold leading-relaxed uppercase ${selectedAtribuicoes136.includes(atr.id) ? 'text-blue-100' : 'text-white/40'}`}>{atr.label}</p></div></div>)}</div></div>

                {showRequisicaoModal && (
                  <div className="p-10 bg-blue-600/20 border border-blue-500 rounded-[3rem] space-y-8 animate-in slide-in-from-top-4">
                    <div className="flex items-center justify-between"><h4 className="text-[16px] font-black text-white uppercase tracking-widest flex items-center gap-4"><Building2 className="w-7 h-7" /> Requisição SIMCT Hortolândia</h4><button onClick={() => setShowRequisicaoModal(false)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2"><label className="text-[10px] font-black text-blue-200 uppercase tracking-widest ml-1">Área Serviço</label><select className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-[12px] font-black uppercase outline-none focus:border-white transition-all" value={newRequisicao.area} onChange={e => setNewRequisicao({...newRequisicao, area: e.target.value, subGrupo: '', equipamento: ''})}><option value="">Selecione...</option>{Object.keys(REDE_HORTOLANDIA).map(area => <option key={area} value={area}>{area}</option>)}</select></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-blue-200 uppercase tracking-widest ml-1">Sub-Grupo</label><select className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-[12px] font-black uppercase outline-none focus:border-white transition-all" disabled={!newRequisicao.area} value={newRequisicao.subGrupo} onChange={e => setNewRequisicao({...newRequisicao, subGrupo: e.target.value, equipamento: ''})}><option value="">Selecione...</option>{newRequisicao.area && Object.keys((REDE_HORTOLANDIA as any)[newRequisicao.area]).map(sub => <option key={sub} value={sub}>{sub}</option>)}</select></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-blue-200 uppercase tracking-widest ml-1">Equipamento Mapeado</label><select className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-[12px] font-black uppercase outline-none focus:border-white transition-all" disabled={!newRequisicao.subGrupo} value={newRequisicao.equipamento} onChange={e => setNewRequisicao({...newRequisicao, equipamento: e.target.value})}><option value="">Selecione...</option>{newRequisicao.subGrupo && (REDE_HORTOLANDIA as any)[newRequisicao.area][newRequisicao.subGrupo].map((eq: string) => <option key={eq} value={eq}>{eq}</option>)}</select></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-blue-200 uppercase tracking-widest ml-1">Prazo (Dias)</label><input type="number" className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-[12px] font-black outline-none" value={newRequisicao.prazoDias} onChange={e => setNewRequisicao({...newRequisicao, prazoDias: parseInt(e.target.value)})} /></div>
                    </div>
                    <button onClick={() => setShowRequisicaoModal(false)} className="w-full py-5 bg-white text-blue-600 rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl hover:scale-[1.02] transition-all">Confirmar Requisição</button>
                  </div>
                )}

                <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4"><label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Considerações Técnicas SIMCT</label><textarea className="w-full p-6 bg-black/20 border border-white/10 rounded-3xl text-[13px] font-bold text-white uppercase outline-none focus:border-blue-500 transition-all min-h-[120px]" placeholder="REGISTRE DETALHES ADICIONAIS DO CASO..." value={complementoMedidas} onChange={e => setComplementoMedidas(e.target.value)} /></div>
             </div>
           ) : (
             <div className="p-8 bg-red-600/10 border border-red-600/30 rounded-[2.5rem] space-y-4 animate-in zoom-in-95"><h4 className="text-[13px] font-black text-red-400 uppercase tracking-widest flex items-center gap-3"><FileWarning className="w-6 h-6" /> Fundamentação de Improcedência SIMCT</h4><textarea className="w-full p-6 bg-black/20 border border-white/10 rounded-3xl text-[13px] font-bold text-white uppercase outline-none focus:border-red-500 transition-all min-h-[200px]" placeholder="MOTIVO TÉCNICO..." value={justificativaImprocedencia} onChange={e => setJustificativaImprocedencia(e.target.value)} /></div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => saveProvidencias(false)} className="py-8 rounded-[2rem] font-black uppercase text-[15px] tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 group bg-slate-600 text-white hover:bg-slate-500"><Save className="w-8 h-8 group-hover:animate-pulse" /> [Salvar Prontuário SIMCT]</button>
              <button onClick={() => saveProvidencias(true)} className={`py-8 rounded-[2rem] font-black uppercase text-[15px] tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 group ${isCompleteForFinalize ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed opacity-60'}`}><SendHorizonal className="w-8 h-8 group-hover:translate-x-1" /> [Finalizar e Validar Colegiado]</button>
           </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <header className="p-8 bg-[#111827] text-white flex items-center justify-between">
          <div className="flex items-center gap-4"><button onClick={onBack} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><ArrowLeft className="w-6 h-6" /></button><div><h2 className="text-[20px] font-black uppercase tracking-tight">{doc.crianca_nome}</h2><div className="text-[11px] font-bold opacity-60 uppercase tracking-widest mt-1">SIMCT Protocolo #{doc.id}</div></div></div>
          <div className="flex items-center gap-3"><button onClick={() => setShowAuditHistory(true)} className="flex items-center gap-2 px-6 py-4 bg-slate-800 text-white border border-white/10 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg hover:bg-slate-700"><ClipboardList className="w-4 h-4 text-blue-400" /> [HISTÓRICO SIMCT]</button><button onClick={() => setShowFamilyHistoryModal(true)} className="flex items-center gap-2 px-6 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg"><History className="w-4 h-4" /> Histórico Familiar ({familyHistory.length})</button></div>
        </header>

        <div className="p-10 space-y-12">
          {doc.observacoes_iniciais && (
            <div className={`p-10 border-l-8 rounded-[2.5rem] animate-in zoom-in-95 ${doc.is_improcedente ? 'bg-red-50 border-red-500' : 'bg-emerald-50 border-emerald-500'}`}>
               <div className="flex items-center gap-3 mb-6">{doc.is_improcedente ? <FileWarning className="w-8 h-8 text-red-600" /> : <ShieldCheck className="w-8 h-8 text-emerald-600" />}<h4 className="text-[14px] font-black uppercase tracking-widest">Protocolo Técnico SIMCT</h4></div>
               <div className="text-[16px] font-bold text-slate-800 uppercase leading-relaxed tracking-tight whitespace-pre-wrap">{doc.observacoes_iniciais}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentView;
