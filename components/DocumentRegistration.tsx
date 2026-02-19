import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Save, ShieldCheck, Zap, Baby, FileText, UserPlus, Clock, AlertCircle, Fingerprint, Calendar, Info, CheckSquare, MapPin, ClipboardList, Moon, Sun, Heart, ShieldAlert, UserRound, Users, ListOrdered, Database, Search, Lock, Square, BarChart2, RefreshCw, Layers, Megaphone } from 'lucide-react';
import { Documento, User, ChildData, SuspectType, ViolenceType, SipiaViolation, AgenteVioladorEntry, MedidaAplicada } from '../types';
import { ORIGENS_CATEGORIZADAS, BAIRROS, INITIAL_USERS, getEffectiveEscala, CANAIS_COMUNICACAO, UNIFIED_GENDER_OPTIONS, RODIZIO_ALFABETICO, classifyTurno, getQueueCategory, QueueCategory } from '../constants';

interface DocumentRegistrationProps {
  documents: Documento[];
  currentUser: User;
  initialData?: Documento | null;
  onSubmit: (data: any, files: File[]) => void;
  onCancel: () => void;
  nextCouncilorId: string;
}

const DocumentRegistration: React.FC<DocumentRegistrationProps> = ({ 
  documents, 
  currentUser, 
  initialData,
  onSubmit, 
  onCancel
}) => {
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [relatoError, setRelatoError] = useState(false);
  const [genitoraError, setGenitoraError] = useState(false);
  const [referenciaIdentificada, setReferenciaIdentificada] = useState<string | null>(null);
  const [atribuicaoMetodo, setAtribuicaoMetodo] = useState<'VINCULO' | 'RODIZIO' | null>(null);
  const [atribuicaoProvidenciaMetodo, setAtribuicaoProvidenciaMetodo] = useState<'ESCALA' | 'RODIZIO' | 'EQUIDADE' | null>(null);
  const [maioridadeBloqueio, setMaioridadeBloqueio] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [siblingsFound, setSiblingsFound] = useState<string[]>([]);
  const [isManualAdjustment, setIsManualAdjustment] = useState(false);
  const [historyIncompleteFields, setHistoryIncompleteFields] = useState<string[]>([]);
  const [skipNotice, setSkipNotice] = useState<string | null>(null);
  const [atribuicaoJustificativa, setAtribuicaoJustificativa] = useState<string>('');
  
  const [formData, setFormData] = useState({
    origem: initialData?.origem || '',
    canal_comunicado: initialData?.canal_comunicado || '',
    tipo_documento: initialData?.informacoes_documento.split(' - REF: ')[0] || '', 
    data_recebimento: initialData?.data_recebimento || '', 
    hora_rece_bimento: initialData?.hora_rece_bimento || '',
    periodo_rece_bimento: initialData?.periodo_rece_bimento || 'COMERCIAL' as 'COMERCIAL' | 'PLANTAO',
    genitora_nome: initialData?.genitora_nome || '',
    cpf_genitora: initialData?.cpf_genitora || '',
    bairro: initialData?.bairro || '',
    informacoes_documento: initialData?.informacoes_documento || '',
    suspeito: (initialData?.suspeito || 'DESCONHECIDO') as SuspectType,
    violencias: initialData?.violencias || [] as ViolenceType[],
    violacoesSipia: initialData?.violacoesSipia || [] as SipiaViolation[],
    agentesVioladores: initialData?.agentesVioladores || [] as AgenteVioladorEntry[],
    medidas_detalhadas: initialData?.medidas_detalhadas || [] as MedidaAplicada[],
    observacoes_iniciais: initialData?.observacoes_iniciais || '',
    status: initialData?.status || ['NAO_LIDO'],
    distribuicao_automatica: initialData?.distribuicao_automatica ?? true,
    is_manual_override: initialData?.is_manual_override || false,
    conselheiro_referencia_id: initialData?.conselheiro_referencia_id || '',
    conselheiro_providencia_id: initialData?.conselheiro_providencia_id || '',
    conselheiros_providencia_nomes: initialData?.conselheiros_providencia_nomes || [] as string[],
    criancas: initialData?.criancas || [{ nome: '', data_nascimento: '', genero_identidade: '', cpf: '', idade_calculada: undefined, categoria_idade: '' }] as ChildData[],
    crianca_nome: initialData?.crianca_nome || '' 
  });

  const isEditing = !!initialData;
  const isAdminUser = currentUser.perfil === 'ADMIN' || currentUser.perfil === 'ADMINISTRATIVO';

  // DIRETRIZ 67.4: ALERTA ADM PARA OBSERVAÇÕES TÉCNICAS
  const showMonitoringWarning = useMemo(() => {
    return isAdminUser && initialData?.historico_monitoramento && initialData.historico_monitoramento.length > 0;
  }, [isAdminUser, initialData]);

  const currentCategoryInfo = useMemo(() => {
    if (!formData.origem || !formData.canal_comunicado) return null;
    return getQueueCategory(formData.origem, formData.canal_comunicado);
  }, [formData.origem, formData.canal_comunicado]);

  const calculateAge = useCallback((birthDate: string): number | undefined => {
    if (!birthDate) return undefined;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }, []);

  const processAgeCategory = useCallback((age: number | undefined) => {
    if (age === undefined) return "Pendente...";
    if (age >= 18) return "BLOQUEIO: MAIORIDADE";
    if (age <= 6) return "PRIMEIRA INFÂNCIA";
    return age < 12 ? "CRIANÇA" : "ADOLESCENTE";
  }, []);

  const performCriticalRecovery = useCallback((cpfValue: string, isChildCpf: boolean, childIdx: number = 0) => {
    if (isEditing) return;
    const cleanCpf = cpfValue.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return;

    const match = documents.find(d => 
      isChildCpf 
        ? d.criancas.some(c => c.cpf?.replace(/\D/g, '') === cleanCpf)
        : d.cpf_genitora?.replace(/\D/g, '') === cleanCpf
    );

    if (match) {
      const refCouncilor = INITIAL_USERS.find(u => u.id === match.conselheiro_referencia_id);
      const childMatch = isChildCpf ? match.criancas.find(c => c.cpf?.replace(/\D/g, '') === cleanCpf) : match.criancas[0];
      const age = calculateAge(childMatch?.data_nascimento || '');
      const missing: string[] = [];
      if (!match.genitora_nome) missing.push('genitora_nome');
      if (!childMatch?.data_nascimento) missing.push('data_nascimento');
      if (!childMatch?.genero_identidade) missing.push('genero_identidade');
      if (!match.bairro) missing.push('bairro');
      setHistoryIncompleteFields(missing);

      setFormData(prev => {
        const updatedChildren = [...prev.criancas];
        updatedChildren[childIdx] = {
          ...updatedChildren[childIdx],
          nome: childMatch?.nome || updatedChildren[childIdx].nome,
          data_nascimento: childMatch?.data_nascimento || updatedChildren[childIdx].data_nascimento,
          genero_identidade: childMatch?.genero_identidade || updatedChildren[childIdx].genero_identidade,
          idade_calculada: age,
          categoria_idade: processAgeCategory(age)
        };
        return {
          ...prev,
          genitora_nome: match.genitora_nome || prev.genitora_nome,
          bairro: match.bairro || prev.bairro,
          conselheiro_referencia_id: match.conselheiro_referencia_id, 
          criancas: updatedChildren,
          is_manual_override: true 
        };
      });
      setReferenciaIdentificada(refCouncilor?.nome || 'CONSELHEIRO NATURAL');
      setAtribuicaoMetodo('VINCULO');
      setIsManualAdjustment(false);
      if (age !== undefined && age >= 18) setMaioridadeBloqueio(childMatch?.nome || "Indivíduo");
      else setMaioridadeBloqueio(null);

      const siblings = documents
        .filter(d => d.cpf_genitora?.replace(/\D/g, '') === (match.cpf_genitora?.replace(/\D/g, '') || cleanCpf))
        .flatMap(d => d.criancas.map(c => c.nome))
        .filter((nome, index, self) => self.indexOf(nome) === index && nome !== childMatch?.nome);
      setSiblingsFound(siblings);
    }
  }, [documents, isEditing, calculateAge, processAgeCategory]);

  useEffect(() => {
    if (isEditing || atribuicaoMetodo === 'VINCULO' || isManualAdjustment) return;
    const rotationDocs = documents.filter(d => !d.is_manual_override).sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
    let nextIndex = 0;
    if (rotationDocs.length > 0) {
      const lastRefId = rotationDocs[0].conselheiro_referencia_id;
      const lastRefName = INITIAL_USERS.find(u => u.id === lastRefId)?.nome.toUpperCase();
      const lastIdx = RODIZIO_ALFABETICO.indexOf(lastRefName || '');
      nextIndex = (lastIdx + 1) % RODIZIO_ALFABETICO.length;
    }
    const nextName = RODIZIO_ALFABETICO[nextIndex];
    const nextId = INITIAL_USERS.find(u => u.nome.toUpperCase() === nextName.toUpperCase())?.id || '';
    setFormData(prev => ({ ...prev, conselheiro_referencia_id: nextId }));
    setAtribuicaoMetodo('RODIZIO');
  }, [documents, isEditing, atribuicaoMetodo, isManualAdjustment]);

  const matricialWorkload = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const trio = getEffectiveEscala(todayStr, timeStr);

    if (!trio || trio.length === 0) return [];

    return trio.map(name => {
      const nameUpper = name.toUpperCase();
      const docsInPlantao = documents.filter(d => {
        const dDate = new Date(d.criado_em);
        const dTrio = getEffectiveEscala(dDate.toISOString().split('T')[0], dDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        const assignedUser = INITIAL_USERS.find(u => u.id === d.conselheiro_providencia_id);
        return JSON.stringify(dTrio) === JSON.stringify(trio) && 
               assignedUser?.nome.toUpperCase() === nameUpper;
      });

      const concludedCount = docsInPlantao.filter(d => 
        (d.violacoesSipia?.length > 0 && d.agentesVioladores?.length > 0 && d.status.includes('AGUARDANDO_VALIDACAO')) || 
        d.status.includes('OFICIALIZADO') || 
        d.is_improcedente
      ).length;

      const stats = {
        name: nameUpper,
        OFICIO_TECNICO: docsInPlantao.filter(d => getQueueCategory(d.origem, d.canal_comunicado).category === 'OFICIO_TECNICO').length,
        DENUNCIA_ANONIMA: docsInPlantao.filter(d => getQueueCategory(d.origem, d.canal_comunicado).category === 'DENUNCIA_ANONIMA').length,
        PRESENCIAL: docsInPlantao.filter(d => getQueueCategory(d.origem, d.canal_comunicado).category === 'PRESENCIAL').length,
        DIGITAL: docsInPlantao.filter(d => getQueueCategory(d.origem, d.canal_comunicado).category === 'DIGITAL').length,
        total: docsInPlantao.length,
        concluded: concludedCount
      };
      return stats;
    });
  }, [documents]);

  useEffect(() => {
    if (isEditing) return;
    
    const updateAssignment = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      if (currentCategoryInfo) {
        const escalaTrioRaw = getEffectiveEscala(todayStr, timeStr);
        if (!escalaTrioRaw || escalaTrioRaw.length === 0) {
            setDateError("Aguardando reconhecimento de escala atual...");
            return;
        }

        const lastAssignedDoc = [...documents].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())[0];
        const lastProvName = INITIAL_USERS.find(u => u.id === lastAssignedDoc?.conselheiro_providencia_id)?.nome.toUpperCase();
        
        const candidates = escalaTrioRaw.filter(name => name.toUpperCase() !== lastProvName);
        const finalCandidates = candidates.length > 0 ? candidates : escalaTrioRaw;

        const currentCategory = currentCategoryInfo.category;
        const candidatesStats = matricialWorkload.filter(s => finalCandidates.includes(s.name));
        
        const sorted = [...candidatesStats].sort((a, b) => {
          const catDiff = a[currentCategory] - b[currentCategory];
          if (catDiff !== 0) return catDiff;
          const totalDiff = a.total - b.total;
          if (totalDiff !== 0) return totalDiff;
          return a.name.localeCompare(b.name);
        });

        const chosenName = sorted[0].name;
        const chosenId = INITIAL_USERS.find(u => u.nome.toUpperCase() === chosenName)?.id || '';

        setFormData(prev => ({ 
            ...prev, 
            conselheiro_providencia_id: chosenId, 
            conselheiros_providencia_nomes: escalaTrioRaw 
        }));
        setAtribuicaoProvidenciaMetodo('EQUIDADE');
        setAtribuicaoJustificativa(`✅ Atribuído a ${chosenName} para equalização de categoria: ${currentCategoryInfo.label}.`);
        
        if (lastProvName && escalaTrioRaw.includes(lastProvName)) {
           setSkipNotice(`${lastProvName} em período de intervalo técnico.`);
        } else {
           setSkipNotice(null);
        }
      }
    };

    updateAssignment();
    const interval = setInterval(updateAssignment, 30000); 
    return () => clearInterval(interval);
  }, [formData.origem, formData.canal_comunicado, documents, isEditing, currentCategoryInfo, matricialWorkload]);

  useEffect(() => {
    if (formData.data_recebimento && formData.hora_rece_bimento) {
      const currentTurno = classifyTurno(formData.data_recebimento, formData.hora_rece_bimento);
      setFormData(prev => ({ ...prev, periodo_rece_bimento: currentTurno }));
      const inputDate = new Date(formData.data_rece_bimento + 'T12:00:00');
      if (inputDate.getFullYear() > 2026) setDateError("DATA INVÁLIDA: LIMITE DEZ/2026");
      else setDateError(null);
    }
  }, [formData.data_rece_bimento, formData.hora_rece_bimento]);

  const handleInputChange = (field: string, value: any) => {
    if (field === 'informacoes_documento') setRelatoError(value.trim() === '');
    if (field === 'genitora_nome') setGenitoraError(value.trim() === '');
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'cpf_genitora' && value.replace(/\D/g, '').length === 11) performCriticalRecovery(value, false);
  };

  const handleChildChange = (index: number, field: keyof ChildData, value: any) => { 
    const newChildren = [...formData.criancas];
    let updatedChild = { ...newChildren[index] };
    (updatedChild as any)[field] = value;
    if (field === 'data_nascimento') {
       const age = calculateAge(value);
       updatedChild.idade_calculada = age;
       updatedChild.categoria_idade = processAgeCategory(age);
       if (age && age >= 18) setMaioridadeBloqueio(updatedChild.nome || `Indivíduo`);
       else setMaioridadeBloqueio(null);
    }
    if (field === 'cpf' && value.replace(/\D/g, '').length === 11) performCriticalRecovery(value, true, index);
    newChildren[index] = updatedChild;
    setFormData(prev => ({ ...prev, criancas: newChildren, crianca_nome: index === 0 && field === 'nome' ? value.toUpperCase() : prev.crianca_nome }));
  };

  const formatCPF = (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');

  const getErrorClass = (fieldValue: any, fieldKey?: string) => {
    const isEmpty = fieldValue === undefined || fieldValue === null || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);
    const isHistoryMissing = fieldKey && historyIncompleteFields.includes(fieldKey);
    if (isHistoryMissing) return 'border-red-600 border-4 bg-red-50 ring-4 ring-red-100 shadow-[0_0_0_10px_rgba(239,68,68,0.05)] animate-in fade-in zoom-in-95';
    return attemptedSubmit && isEmpty ? 'border-red-600 border-4 bg-red-50 ring-4 ring-red-100' : 'border-slate-200';
  };

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    setAttemptedSubmit(true);
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const finalTrio = getEffectiveEscala(todayStr, timeStr);

    if (!finalTrio || finalTrio.length === 0) {
       alert("ERRO DE SISTEMA: Não foi possível carimbar a escala atual (Hoje). Contate o ADM.");
       return;
    }

    if (!formData.genitora_nome.trim()) { setGenitoraError(true); alert("ERRO: Nome da Genitora é obrigatório."); return; }
    if (!formData.informacoes_documento.trim()) { setRelatoError(true); alert("ERRO: Relato Inicial é obrigatório."); return; }
    const child = formData.criancas[0];
    if (!child.data_nascimento || !child.genero_identidade || !formData.bairro) { alert("ERRO DE INTEGRIDADE: Campos biográficos e de localização são obrigatórios."); return; }
    if (maioridadeBloqueio) { alert(`⚠️ BLOQUEIO DE CADASTRO: Indivíduo (${maioridadeBloqueio}) possui 18 anos ou mais. Sem competência para novos procedimentos (Art. 2º ECA).`); return; }
    
    const finalData = { 
      ...formData, 
      informacoes_documento: `${formData.tipo_documento} - REF: ${formData.informacoes_documento}`,
      conselheiros_providencia_nomes: finalTrio,
      Status_Assinatura: atribuicaoJustificativa
    };
    onSubmit(finalData, []); 
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        {/* DIRETRIZ 67.4: ALERTA ADM PARA OBSERVAÇÕES TÉCNICAS */}
        {showMonitoringWarning && (
          <div className="bg-amber-100 border-b-4 border-amber-400 p-8 flex items-start gap-6 animate-in slide-in-from-top duration-500">
             <div className="p-3 bg-amber-500 rounded-2xl shadow-lg"><Megaphone className="w-8 h-8 text-white animate-bounce" /></div>
             <div className="space-y-2">
                <h3 className="text-[16px] font-black text-amber-900 uppercase tracking-tight">INSTRUÇÕES DE MONITORAMENTO ATIVAS</h3>
                <p className="text-[12px] text-amber-800 font-bold uppercase leading-relaxed">
                   🚨 LEITURA OBRIGATÓRIA: Este prontuário possui orientações qualitativas recentes do Conselheiro de Referência. Leia as notas de monitoramento antes de prosseguir com o cadastro.
                </p>
                <div className="pt-2">
                   {initialData?.historico_monitoramento?.slice(0, 1).map(note => (
                      <div key={note.id} className="p-4 bg-white/50 rounded-xl border border-amber-200 text-[11px] font-black uppercase text-amber-900">
                         Última Nota ({new Date(note.data_hora).toLocaleDateString('pt-BR')}): "{note.texto}"
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        <header className="p-10 bg-[#111827] text-white flex justify-between items-center relative">
          <div className="z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">SIMCT Hortolândia</span>
              <span className="px-3 py-1 bg-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1"><Database className="w-3 h-3" /> Soberania de Dados Ativa</span>
            </div>
            <h2 className="text-[24px] font-black uppercase tracking-tight">Registro de Procedimento</h2>
          </div>
          {atribuicaoMetodo === 'VINCULO' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] flex flex-col items-center gap-1 shadow-2xl animate-in zoom-in border-4 border-blue-400 ring-8 ring-blue-500/20"><span className="text-[14px] font-black uppercase tracking-wider flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> ✅ Prontuário Localizado</span><span className="text-[9px] font-bold opacity-80 uppercase tracking-widest">Referência fixa com o(a) Conselheiro(a) {referenciaIdentificada}</span></div>}
          <button type="button" onClick={onCancel} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all z-10"><X className="w-6 h-6" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          {/* Form fields remain exactly as they were, ensuring consistency with previous rules */}
          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><ClipboardList className="w-6 h-6 text-blue-600" /><h3 className="text-[14px] font-black uppercase tracking-widest text-slate-800">1. Triagem Administrativa</h3></div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Origem *</label>
                  <select className={`w-full p-4 bg-slate-50 border rounded-2xl text-[12px] font-bold uppercase outline-none focus:border-blue-500 transition-all ${getErrorClass(formData.origem)}`} value={formData.origem} onChange={e => handleInputChange('origem', e.target.value)}>
                    <option value="">Selecione...</option>
                    {ORIGENS_CATEGORIZADAS.map(g => <optgroup key={g.label} label={g.label}>{g.options.map(o => <option key={o} value={o}>{o}</option>)}</optgroup>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Canal de Comunicação *</label>
                  <select className={`w-full p-4 bg-slate-50 border rounded-2xl text-[12px] font-bold uppercase outline-none focus:border-blue-500 transition-all ${getErrorClass(formData.canal_comunicado)}`} value={formData.canal_comunicado} onChange={e => handleInputChange('canal_comunicado', e.target.value)}>
                    <option value="">Selecione...</option>
                    {CANAIS_COMUNICACAO.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº Ofício / Documento</label>
                  <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold uppercase outline-none focus:border-blue-500" placeholder="Nº IDENTIFICAÇÃO" value={formData.tipo_documento} onChange={e => handleInputChange('tipo_documento', e.target.value.toUpperCase())} />
                </div>
             </div>
             {currentCategoryInfo && (
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] space-y-4 animate-in fade-in">
                   <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                      <div className="flex items-center gap-3">
                         <BarChart2 className="w-5 h-5 text-blue-600" />
                         <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">
                            Fila de Distribuição: <span className="text-blue-600">{currentCategoryInfo.label}</span>
                         </span>
                      </div>
                   </div>
                   <div className="bg-white rounded-2xl overflow-hidden border border-blue-100 shadow-sm">
                      <table className="w-full text-left text-[9px] font-black uppercase">
                         <thead className="bg-blue-600 text-white">
                            <tr>
                               <th className="px-4 py-2 border-r border-blue-500/30">Conselheiro</th>
                               <th className="px-4 py-2 border-r border-blue-500/30">Ofício</th>
                               <th className="px-4 py-2 border-r border-blue-500/30">100</th>
                               <th className="px-4 py-2 border-r border-blue-500/30">Digital</th>
                               <th className="px-4 py-2 border-r border-blue-500/30">Presenc.</th>
                               <th className="px-4 py-2 border-r border-blue-500/30">TOTAL</th>
                               <th className="px-4 py-2">CONCLUÍDO</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-blue-50">
                            {matricialWorkload.map((s, idx) => (
                               <tr key={idx} className={INITIAL_USERS.find(u => u.id === formData.conselheiro_providencia_id)?.nome.toUpperCase() === s.name ? 'bg-blue-50' : ''}>
                                  <td className="px-4 py-3 border-r border-blue-100 flex items-center gap-2">
                                     {INITIAL_USERS.find(u => u.id === formData.conselheiro_providencia_id)?.nome.toUpperCase() === s.name && <CheckSquare className="w-3 h-3 text-blue-600" />}
                                     {s.name}
                                  </td>
                                  <td className="px-4 py-3 border-r border-blue-100 text-center">{s.OFICIO_TECNICO}</td>
                                  <td className="px-4 py-3 border-r border-blue-100 text-center">{s.DENUNCIA_ANONIMA}</td>
                                  <td className="px-4 py-3 border-r border-blue-100 text-center">{s.DIGITAL}</td>
                                  <td className="px-4 py-3 border-r border-blue-100 text-center">{s.PRESENCIAL}</td>
                                  <td className="px-4 py-3 border-r border-blue-100 text-center font-black text-blue-600">{s.total}</td>
                                  <td className="px-4 py-3 text-center bg-emerald-50 text-emerald-700 font-black">{s.concluded}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                   <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase italic">
                      <ShieldCheck className="w-3 h-3" /> {atribuicaoJustificativa}
                   </div>
                </div>
             )}
          </section>

          <section className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-8 shadow-inner ring-1 ring-blue-200">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Data e Hora do Aporte (Histórico) *</label>
                   <div className="flex gap-2">
                      <input type="date" className={`flex-1 p-4 bg-white border rounded-xl text-sm font-bold outline-none transition-all ${dateError ? 'border-red-500 border-4 animate-pulse' : 'border-blue-200'}`} value={formData.data_recebimento} onChange={e => handleInputChange('data_recebimento', e.target.value)} />
                      <input type="time" className="w-32 p-4 bg-white border border-blue-200 rounded-xl text-sm font-bold outline-none" value={formData.hora_rece_bimento} onChange={e => handleInputChange('hora_rece_bimento', e.target.value)} />
                   </div>
                   {dateError && <p className="text-[10px] text-red-600 font-black uppercase ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {dateError}</p>}
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex-1 p-5 rounded-2xl border-2 flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-md ${formData.periodo_rece_bimento === 'PLANTAO' ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-blue-100 border-blue-400 text-blue-800'}`}>
                       {formData.periodo_rece_bimento === 'PLANTAO' ? <><Moon className="w-4 h-4 fill-amber-600" /> Turno: Plantão</> : <><Sun className="w-4 h-4 fill-blue-600" /> Turno: Comercial</>}
                    </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-blue-200/50">
                <div className="space-y-3">
                   <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-blue-900/60 uppercase tracking-widest">Referência (Vínculo ou Rodízio)</label>
                      {atribuicaoMetodo !== 'VINCULO' && !isManualAdjustment && <button type="button" onClick={() => setIsManualAdjustment(true)} className="text-[8px] font-black text-blue-500 uppercase hover:underline bg-white px-2 py-0.5 rounded border border-blue-100 shadow-sm flex items-center gap-1"><Info className="w-2 h-2" /> Ajuste Manual</button>}
                   </div>
                   {isManualAdjustment ? (
                     <select className="w-full p-4 bg-white border-2 border-amber-400 rounded-2xl text-[13px] font-black uppercase outline-none shadow-md" value={formData.conselheiro_referencia_id} onChange={e => handleInputChange('conselheiro_referencia_id', e.target.value)}>
                        <option value="">Selecione Referência Manual...</option>
                        {INITIAL_USERS.filter(u => u.perfil === 'CONSELHEIRO').map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                     </select>
                   ) : (
                     <div className={`w-full p-4 border-2 rounded-2xl text-[13px] font-black uppercase flex items-center justify-between shadow-sm transition-all ${atribuicaoMetodo === 'VINCULO' ? 'bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed shadow-inner opacity-80' : 'bg-white border-blue-200 text-blue-900'}`}>
                        <span>{INITIAL_USERS.find(u => u.id === formData.conselheiro_referencia_id)?.nome || 'Processando...'}</span>
                        {atribuicaoMetodo === 'VINCULO' ? <Lock className="w-4 h-4" /> : <ListOrdered className="w-4 h-4 text-emerald-500" />}
                     </div>
                   )}
                   {atribuicaoMetodo === 'VINCULO' && <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase w-fit animate-in slide-in-from-left-2 shadow-lg">📌 Referência Identificada (Vínculo Histórico)</div>}
                </div>
                
                <div className="space-y-3">
                   <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-blue-900/60 uppercase tracking-widest flex items-center gap-2">Providência Imediata (Escala de Hoje)</label>
                      <button type="button" className="text-[8px] font-black text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-100 uppercase flex items-center gap-1"><Layers className="w-2.5 h-2.5" /> Equidade Matricial</button>
                   </div>
                   <div className={`p-4 rounded-2xl flex flex-col gap-1 border-l-8 shadow-sm relative overflow-hidden ${atribuicaoProvidenciaMetodo === 'EQUIDADE' ? 'bg-emerald-50 border-emerald-500' : 'bg-amber-50 border-amber-500'}`}>
                      <Zap className={`absolute -right-2 -bottom-2 w-16 h-16 opacity-20 ${atribuicaoProvidenciaMetodo === 'EQUIDADE' ? 'text-emerald-300' : 'text-amber-300'}`} />
                      {formData.conselheiros_providencia_nomes.length > 0 ? formData.conselheiros_providencia_nomes.map((n, i) => (
                        <div key={i} className={`flex items-center gap-2 text-[11px] font-black uppercase z-10 ${atribuicaoProvidenciaMetodo === 'EQUIDADE' ? 'text-emerald-900' : 'text-amber-900'}`}>
                           {INITIAL_USERS.find(u => u.id === formData.conselheiro_providencia_id)?.nome.toUpperCase() === n.toUpperCase() ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5 opacity-20" />}
                           {n}
                        </div>
                      )) : <div className="text-[11px] font-black text-red-600 uppercase py-2 animate-pulse">Aguardando escala de hoje...</div>}
                   </div>
                </div>
             </div>
          </section>

          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><UserRound className="w-6 h-6 text-indigo-600" /><h3 className="text-[14px] font-black uppercase tracking-widest text-slate-800">3. Identificação Familiar</h3></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">CPF da Genitora (Busca Instantânea) <Fingerprint className="w-3 h-3" /></label>
                   <div className="relative">
                      <input type="text" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-[13px] font-black outline-none focus:border-indigo-500 transition-all pl-12" value={formData.cpf_genitora} onChange={e => handleInputChange('cpf_genitora', formatCPF(e.target.value))} placeholder="000.000.000-00" />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">Nome da Genitora *</label>
                   <input type="text" className={`w-full p-5 bg-slate-50 border rounded-[1.5rem] text-[13px] font-black uppercase outline-none focus:border-indigo-500 transition-all ${getErrorClass(formData.genitora_nome, 'genitora_nome')}`} value={formData.genitora_nome} onChange={e => handleInputChange('genitora_nome', e.target.value.toUpperCase())} placeholder="NOME COMPLETO DA MÃE" />
                   {historyIncompleteFields.includes('genitora_nome') && <div className="flex items-center gap-1 text-[9px] text-red-600 font-black uppercase ml-1 animate-pulse"><AlertCircle className="w-2.5 h-2.5" /> Complete a informação histórica para prosseguir</div>}
                </div>
             </div>
          </section>

          <section className="space-y-8">
             <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3"><Baby className="w-6 h-6 text-emerald-600" /><h3 className="text-[14px] font-black uppercase tracking-widest text-slate-800">4. Dados da Vítima e Localização</h3></div>
                <button type="button" onClick={() => setFormData(p => ({...p, criancas: [...p.criancas, { nome: '', data_nascimento: '', genero_identidade: '', cpf: '', idade_calculada: undefined, categoria_idade: '' }]}))} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md hover:bg-blue-700 transition-all"><UserPlus className="w-4 h-4" /> [+] Adicionar Irmão</button>
             </div>
             <div className="space-y-8">
                {formData.criancas.map((child, idx) => (
                   <div key={idx} className={`p-10 border-4 rounded-[3rem] relative transition-all ${child.idade_calculada && child.idade_calculada >= 18 ? 'bg-red-50 border-red-500 shadow-[0_0_0_10px_rgba(239,68,68,0.1)]' : child.idade_calculada !== undefined && child.idade_calculada <= 6 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                      {idx > 0 && <button type="button" onClick={() => setFormData(p => ({...p, criancas: p.criancas.filter((_, i) => i !== idx)}))} className="absolute -top-4 -right-4 p-3 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"><X className="w-5 h-5" /></button>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF da Vítima (Busca Instantânea)</label><div className="relative"><input type="text" className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold outline-none focus:border-blue-600 transition-all pl-12" value={child.cpf} onChange={e => handleChildChange(idx, 'cpf', formatCPF(e.target.value))} placeholder="000.000.000-00" /><Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /></div></div>
                         <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label><input type="text" className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold uppercase outline-none focus:border-blue-600 transition-all" value={child.nome} onChange={e => handleChildChange(idx, 'nome', e.target.value.toUpperCase())} placeholder="NOME DA CRIANÇA" /></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="space-y-2"><label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">Data Nascimento *</label><input type="date" className={`w-full p-4 bg-white border rounded-2xl text-[13px] font-bold outline-none focus:border-red-500 transition-all ${getErrorClass(child.data_nascimento, 'data_nascimento')}`} value={child.data_nascimento} onChange={e => handleChildChange(idx, 'data_nascimento', e.target.value)} />{historyIncompleteFields.includes('data_nascimento') && <div className="flex items-center gap-1 text-[9px] text-red-600 font-black uppercase ml-1 animate-pulse"><AlertCircle className="w-2.5 h-2.5" /> Preencha data histórica</div>}</div>
                         <div className="space-y-2"><label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">Gênero / Identidade *</label><select className={`w-full p-4 bg-white border rounded-2xl text-[12px] font-bold uppercase outline-none focus:border-blue-600 transition-all ${getErrorClass(child.genero_identidade, 'genero_identidade')}`} value={child.genero_identidade} onChange={e => handleChildChange(idx, 'genero_identidade', e.target.value)}><option value="">SELECIONE...</option>{UNIFIED_GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>{historyIncompleteFields.includes('genero_identidade') && <div className="flex items-center gap-1 text-[9px] text-red-600 font-black uppercase ml-1 animate-pulse"><AlertCircle className="w-2.5 h-2.5" /> Identidade não registrada</div>}</div>
                         <div className="flex items-center gap-4">{child.idade_calculada !== undefined && child.idade_calculada <= 6 && <div className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-blue-200 animate-in zoom-in"><Heart className="w-5 h-5 mb-1 fill-white" /><span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">MAIOR PRIORIDADE: PRIMEIRA INFÂNCIA</span></div>}{child.idade_calculada !== undefined && child.idade_calculada >= 18 && <div className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-red-200 animate-pulse"><ShieldAlert className="w-5 h-5 mb-1" /><span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">BLOQUEIO: MAIORIDADE (ART. 2º ECA)</span></div>}{child.idade_calculada !== undefined && child.idade_calculada > 6 && child.idade_calculada < 18 && <div className="flex-1 px-6 py-4 bg-emerald-500 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-emerald-100"><ShieldCheck className="w-5 h-5 mb-1" /><span className="text-[9px] font-black uppercase tracking-widest">{child.categoria_idade}</span></div>}</div>
                      </div>
                   </div>
                ))}
             </div>
             <div className="space-y-2 mt-10"><label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">Bairro da Criança / Adolescente *</label><select className={`w-full p-5 bg-slate-50 border rounded-[1.5rem] text-[13px] font-black uppercase outline-none focus:border-red-500 transition-all ${getErrorClass(formData.bairro, 'bairro')}`} value={formData.bairro} onChange={e => handleInputChange('bairro', e.target.value)}><option value="">SELECIONE O BAIRRO DE HORTOLÂNDIA...</option>{BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}</select>{historyIncompleteFields.includes('bairro') && <div className="flex items-center gap-1 text-[9px] text-red-600 font-black uppercase ml-1 animate-pulse"><AlertCircle className="w-2.5 h-2.5" /> Bairro histórico não localizado, favor completar</div>}</div>
          </section>

          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><FileText className={`w-6 h-6 ${relatoError ? 'text-red-600' : 'text-amber-600'}`} /><h3 className={`text-[14px] font-black uppercase tracking-widest ${relatoError ? 'text-red-900' : 'text-slate-800'}`}>5. Relato Inicial dos Fatos *</h3></div>
             <div className="relative">
                <textarea className={`w-full p-10 bg-slate-50 border-4 rounded-[3rem] text-[15px] font-medium min-h-[300px] uppercase outline-none transition-all ${relatoError ? 'border-red-600 bg-red-50 focus:border-red-700 shadow-[0_0_0_12px_rgba(220,38,38,0.1)]' : 'border-slate-200 focus:border-blue-600'}`} value={formData.informacoes_documento} onChange={e => handleInputChange('informacoes_documento', e.target.value.toUpperCase())} placeholder="DESCREVA DETALHADAMENTE O RELATO DOS FATOS..." />
                {relatoError && <div className="absolute bottom-10 left-10 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl shadow-xl animate-bounce"><AlertCircle className="w-4 h-4" /><p className="text-[10px] font-black uppercase">Relato Obrigatório para salvar.</p></div>}
             </div>
          </section>

          <button type="submit" className="w-full py-10 bg-[#111827] text-white rounded-[3rem] font-black uppercase text-[16px] tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-6 active:scale-[0.98] group ring-8 ring-transparent hover:ring-blue-100">
             <Save className="w-8 h-8 group-hover:animate-pulse" /> [SALVAR] REGISTRO SIMCT
          </button>
        </form>
      </div>
    </div>
  );
};

export default DocumentRegistration;