
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Plus, Trash2, ShieldCheck, AlertCircle, Zap, UserCheck, Calendar, Fingerprint, ChevronDown, Lock, Clock, Upload, FileText, Scale, Gavel, LayoutList, Users, Baby, ShieldAlert, Search, Check, Info, Users2, History, Sparkles, Loader2, UserRound, ArrowRightCircle, ShieldEllipsis, AlertTriangle, Database, UserPlus } from 'lucide-react';
import { Documento, User, ChildData, SuspectType, ViolenceType, SipiaViolation, AgenteVioladorEntry, MedidaAplicada } from '../types';
import { ORIGENS_CATEGORIZADAS, BAIRROS, TIPOS_DOCUMENTO, SUSPEITOS, TIPOS_VIOLENCIA, INITIAL_USERS, ANNUAL_ESCALA, GENDER_LABELS, SIPIA_HIERARCHY, MEDIDAS_PROTECAO_ECA, MEDIDAS_ECA_DESCRICAO, AGENTES_VIOLADORES_ESTRUTURA, getEffectiveEscala } from '../constants';
import FamilyHistoryModal from './FamilyHistoryModal';

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState<{ type: 'CPF_MAE' | 'CPF_CRIANCA' | 'NOME_MAE', docId: string } | null>(null);
  
  // Estado para armazenar crianças encontradas no histórico
  const [historicalChildren, setHistoricalChildren] = useState<ChildData[]>([]);
  const [familyHistory, setFamilyHistory] = useState<Documento[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [formData, setFormData] = useState({
    origem: initialData?.origem || '',
    tipo_documento: initialData?.tipo_documento || '',
    data_recebimento: initialData?.data_recebimento || new Date().toISOString().split('T')[0],
    hora_rece_bimento: initialData?.hora_rece_bimento || new Date().toTimeString().substring(0, 5),
    cpf_genitora: initialData?.cpf_genitora || '',
    genitora_nome: initialData?.genitora_nome || '',
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
    criancas: initialData?.criancas || [{ nome: '', data_nascimento: '', sexo: '', cpf: '', idade_calculada: 0 }] as ChildData[],
    crianca_nome: initialData?.crianca_nome || '' 
  });

  const isAdm = currentUser.perfil === 'ADMIN' || currentUser.perfil === 'ADMINISTRATIVO';
  const isEditing = !!initialData;

  // Lógica de Reconhecimento de Dados por CPF e Histórico Familiar
  useEffect(() => {
    const cleanCpf = formData.cpf_genitora.replace(/\D/g, '');
    const cleanNome = formData.genitora_nome.trim().toUpperCase();
    
    if ((cleanCpf.length === 11 || cleanNome.length > 5) && !isEditing) {
      // Busca histórico consolidado
      const history = documents.filter(d => {
         const matchCpf = cleanCpf.length === 11 && d.cpf_genitora?.replace(/\D/g, '') === cleanCpf;
         const matchNome = cleanNome.length > 5 && d.genitora_nome?.toUpperCase() === cleanNome;
         return matchCpf || matchNome;
      });

      setFamilyHistory(history);

      if (history.length > 0) {
        // Pega os dados mais recentes da genitora
        const latestDoc = history[history.length - 1];
        
        // Autopreenchimento da genitora (se o nome atual estiver vazio)
        if (!formData.genitora_nome && latestDoc.genitora_nome) {
          setFormData(prev => ({ 
            ...prev, 
            genitora_nome: latestDoc.genitora_nome,
            bairro: prev.bairro || latestDoc.bairro 
          }));
        }

        // Extração de crianças vinculadas
        const childrenMap = new Map<string, ChildData>();
        history.forEach(doc => {
          doc.criancas.forEach(child => {
            const age = calculateAge(child.data_nascimento);
            // REGRA DE BLOQUEIO LEGAL: Somente crianças/adolescentes < 18 anos
            if (age !== null && age < 18) {
              const key = (child.cpf || child.nome).toUpperCase();
              childrenMap.set(key, { ...child, idade_calculada: age });
            }
          });
        });
        
        setHistoricalChildren(Array.from(childrenMap.values()));
      } else {
        setHistoricalChildren([]);
      }
    } else {
      setHistoricalChildren([]);
      setFamilyHistory([]);
    }
  }, [formData.cpf_genitora, formData.genitora_nome, documents, isEditing]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate || birthDate.length < 10) return null;
    const today = new Date();
    const birth = new Date(birthDate + 'T12:00:00');
    if (isNaN(birth.getTime())) return null;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSelectHistoricalChild = (child: ChildData) => {
    // Verifica se a criança já foi adicionada
    const alreadyIn = formData.criancas.some(c => 
      (c.cpf && c.cpf === child.cpf) || 
      (c.nome.toUpperCase() === child.nome.toUpperCase())
    );

    if (alreadyIn) {
      alert("Aviso: Esta criança já foi incluída no procedimento atual.");
      return;
    }

    // Se o primeiro campo de criança estiver vazio, preenche ele. Caso contrário, adiciona um novo.
    const isFirstEmpty = formData.criancas.length === 1 && !formData.criancas[0].nome;
    
    if (isFirstEmpty) {
      const newChildren = [{ ...child }];
      setFormData(prev => ({ 
        ...prev, 
        criancas: newChildren,
        crianca_nome: child.nome.toUpperCase() 
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        criancas: [...prev.criancas, { ...child }]
      }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === 'hora_rece_bimento' || field === 'data_recebimento') {
      const targetDate = field === 'data_recebimento' ? value : formData.data_recebimento;
      const targetTime = field === 'hora_rece_bimento' ? value : formData.hora_rece_bimento;
      if (targetDate && targetTime) {
        const now = new Date();
        const inputDateTime = new Date(`${targetDate}T${targetTime}`);
        if (inputDateTime > now) {
          alert("ERRO: Não é permitido registrar data ou horário superior ao atual.");
          return;
        }
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleChildChange = (index: number, field: keyof ChildData, value: any) => { 
    const newChildren = [...formData.criancas];
    let updatedChild = { ...newChildren[index], [field]: value };

    if (field === 'cpf' && value && value.length >= 11) {
      const match = documents.find(d => d.criancas.some(c => c.cpf === value) && d.id !== initialData?.id);
      if (match) setDuplicateAlert({ type: 'CPF_CRIANCA', docId: match.id });
    }

    if (field === 'data_nascimento') {
      const age = calculateAge(value);
      updatedChild.idade_calculada = age !== null ? age : 0;
      
      if (age !== null && age >= 18) {
        alert("BLOQUEIO DE CADASTRO: O sistema Papel Zero destina-se exclusivamente a crianças e adolescentes. Indivíduos com 18 anos completos ou mais devem ser encaminhados aos serviços de atendimento adulto (CREAS/Assistência Social).");
        updatedChild.data_nascimento = '';
        updatedChild.idade_calculada = 0;
      }
    }

    newChildren[index] = updatedChild;
    if (index === 0 && field === 'nome') {
      setFormData(prev => ({ ...prev, criancas: newChildren, crianca_nome: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, criancas: newChildren })); 
    }
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      criancas: [...prev.criancas, { nome: '', data_nascimento: '', sexo: '', cpf: '', idade_calculada: 0 }]
    }));
  };

  const removeChild = (index: number) => {
    if (formData.criancas.length === 1) return;
    const newChildren = formData.criancas.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, criancas: newChildren }));
  };

  const getValidationClass = (fieldValue: any) => {
    const isEmpty = !fieldValue || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);
    return attemptedSubmit && isEmpty 
      ? 'border-red-500 bg-red-50 focus:border-red-600' 
      : 'border-[#E5E7EB] focus:border-[#2563EB]';
  };

  const validateForm = () => {
    const requiredFields = [
      formData.genitora_nome,
      formData.data_recebimento,
      formData.hora_rece_bimento,
      formData.bairro,
      formData.origem,
      formData.tipo_documento,
      formData.informacoes_documento
    ];
    const hasEmptyRequired = requiredFields.some(f => !f || f === '');
    const hasEmptyChild = formData.criancas.some(c => !c.nome || !c.data_nascimento || !c.sexo);
    return !hasEmptyRequired && !hasEmptyChild;
  };

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    setAttemptedSubmit(true);
    if (!validateForm()) {
      alert("CAMPOS OBRIGATÓRIOS PENDENTES: Por favor, preencha todos os campos destacados em vermelho.");
      return;
    }
    onSubmit(formData, selectedFiles); 
  };

  const councilors = INITIAL_USERS.filter(u => u.perfil === 'CONSELHEIRO');

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <header className="p-8 bg-[#111827] text-white flex justify-between items-center">
          <div>
            <h2 className="text-[20px] font-bold uppercase tracking-tight">{isEditing ? 'Editar Procedimento' : 'Novo Procedimento Digital'}</h2>
            <p className="text-[13px] font-medium uppercase opacity-60 tracking-widest mt-1">SIMCT Hortolândia - IA Papel Zero</p>
          </div>
          <button onClick={onCancel} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><X className="w-6 h-6" /></button>
        </header>
        
        {/* ALERTA DE HISTÓRICO FAMILIAR */}
        {familyHistory.length > 0 && !isEditing && (
           <div className="m-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-amber-200 rounded-xl"><AlertTriangle className="w-6 h-6 text-amber-700" /></div>
                 <div>
                    <h4 className="text-[14px] font-black text-amber-900 uppercase">Atenção: Núcleo Familiar Recorrente</h4>
                    <p className="text-[11px] font-bold text-amber-700 uppercase">Este núcleo familiar possui {familyHistory.length} atendimentos anteriores registrados no sistema.</p>
                 </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowHistoryModal(true)}
                className="px-6 py-3 bg-amber-600 text-white rounded-xl text-[11px] font-black uppercase shadow-lg hover:bg-amber-700 transition-all flex items-center gap-2"
              >
                 <History className="w-4 h-4" /> Ver Histórico Completo
              </button>
           </div>
        )}

        {duplicateAlert && (
          <div className="m-8 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <div className="flex-1">
              <h4 className="text-[13px] font-bold text-amber-900 uppercase">Atenção: Família já Cadastrada</h4>
              <p className="text-[11px] font-medium text-amber-700 uppercase">
                O CPF informado ({duplicateAlert.type}) já consta no prontuário técnico <span className="font-bold underline">#{duplicateAlert.docId}</span>.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl space-y-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#E5E7EB]"><ShieldCheck className="w-6 h-6 text-[#2563EB]" /></div>
                <div>
                  <h4 className="text-[13px] font-semibold uppercase text-[#111827] tracking-wider">Gestão de Atribuição</h4>
                  <p className="text-[11px] font-medium text-[#4B5563] uppercase">Conselheiro de Referência e Providência</p>
                </div>
              </div>
              {!isEditing && (
                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-[#E5E7EB]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded text-[#2563EB]" checked={formData.is_manual_override} onChange={e => handleInputChange('is_manual_override', e.target.checked)} />
                    <span className="text-[11px] font-bold uppercase text-[#111827]">Atribuição Manual</span>
                  </label>
                </div>
              )}
            </div>

            {(formData.is_manual_override || isEditing) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-widest">Conselheiro de Referência *</label>
                    <select 
                      disabled={isEditing && currentUser.id !== initialData?.conselheiro_referencia_id}
                      className={`w-full p-2.5 bg-white border rounded-lg text-[13px] font-medium uppercase outline-none focus:border-[#2563EB] ${isEditing && currentUser.id !== initialData?.conselheiro_referencia_id ? 'opacity-60 cursor-not-allowed' : ''} ${getValidationClass(formData.conselheiro_referencia_id)}`} 
                      value={formData.conselheiro_referencia_id} 
                      onChange={e => handleInputChange('conselheiro_referencia_id', e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {councilors.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
              <FileText className="w-5 h-5 text-[#2563EB]" />
              <h3 className="text-[15px] font-bold text-[#111827] uppercase tracking-widest">Identificação do Documento</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#4B5563] uppercase tracking-widest">Origem / Comunicante *</label>
                <select className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium uppercase outline-none transition-all ${getValidationClass(formData.origem)}`} value={formData.origem} onChange={e => handleInputChange('origem', e.target.value)}>
                  <option value="">Selecione...</option>
                  {ORIGENS_CATEGORIZADAS.map(group => (<optgroup key={group.label} label={group.label}>{group.options.map(o => <option key={o} value={o}>{o}</option>)}</optgroup>))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#4B5563] uppercase tracking-widest">Tipo de Documento *</label>
                <select className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium uppercase outline-none transition-all ${getValidationClass(formData.tipo_documento)}`} value={formData.tipo_documento} onChange={e => handleInputChange('tipo_documento', e.target.value)}>
                  <option value="">Selecione...</option>
                  {TIPOS_DOCUMENTO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#4B5563] uppercase tracking-widest">Data Recebimento *</label>
                <input type="date" className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium outline-none transition-all ${getValidationClass(formData.data_recebimento)}`} value={formData.data_recebimento} onChange={e => handleInputChange('data_recebimento', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#4B5563] uppercase tracking-widest">Horário de Entrada *</label>
                <input type="time" className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium outline-none transition-all ${getValidationClass(formData.hora_rece_bimento)}`} value={formData.hora_rece_bimento} onChange={e => handleInputChange('hora_rece_bimento', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
              <Users2 className="w-5 h-5 text-[#2563EB]" />
              <h3 className="text-[15px] font-bold text-[#111827] uppercase tracking-widest">Dados da Genitora / Responsável</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#4B5563] uppercase tracking-widest">Nome Completo *</label>
                <input type="text" className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium uppercase outline-none transition-all ${getValidationClass(formData.genitora_nome)}`} value={formData.genitora_nome} onChange={e => handleInputChange('genitora_nome', e.target.value.toUpperCase())} placeholder="NOME DA MÃE OU RESPONSÁVEL LEGAL" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#4B5563] uppercase tracking-widest">CPF da Genitora</label>
                <input type="text" placeholder="000.000.000-00" className="w-full p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[14px] font-medium uppercase outline-none focus:border-[#2563EB]" value={formData.cpf_genitora} onChange={e => handleInputChange('cpf_genitora', e.target.value)} />
              </div>
            </div>
            
            {/* NOVO: Lista de Sugestões de Vínculos Familiares baseada em histórico */}
            {historicalChildren.length > 0 && (
              <div className="mt-4 p-6 bg-blue-50 border border-blue-100 rounded-2xl animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-[#2563EB]" />
                  <h4 className="text-[11px] font-black text-[#2563EB] uppercase tracking-widest">Vínculos Familiares Identificados no Histórico</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {historicalChildren.map((child, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm hover:border-[#2563EB] transition-all">
                      <div>
                        <p className="text-[11px] font-black text-[#111827] uppercase">{child.nome}</p>
                        <p className="text-[10px] font-bold text-[#4B5563] uppercase">{child.idade_calculada} Anos | {GENDER_LABELS[child.sexo] || child.sexo}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleSelectHistoricalChild(child)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-[#111827] transition-all shadow-md"
                        title="Adicionar ao Procedimento"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[9px] font-bold text-blue-400 uppercase leading-relaxed italic">
                  * Somente crianças/adolescentes com menos de 18 anos completos são sugeridos para novos procedimentos (ECA Art. 2º).
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                 <Baby className="w-5 h-5 text-[#2563EB]" />
                 <h3 className="text-[15px] font-bold text-[#111827] uppercase tracking-widest">Dados da Criança / Adolescente</h3>
              </div>
              <button type="button" onClick={addChild} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#2563EB] rounded-lg text-[11px] font-bold uppercase hover:bg-blue-100 transition-all shadow-sm">
                <Plus className="w-4 h-4" /> Adicionar Outro Filho
              </button>
            </div>
            <div className="space-y-6">
              {formData.criancas.map((crianca, idx) => (
                <div key={idx} className={`p-6 bg-white border rounded-2xl relative shadow-sm hover:border-[#2563EB] transition-all ${attemptedSubmit && (!crianca.nome || !crianca.data_nascimento || !crianca.sexo) ? 'border-red-300' : 'border-[#E5E7EB]'}`}>
                  {formData.criancas.length > 1 && (
                    <button type="button" onClick={() => removeChild(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-6 space-y-2">
                      <label className="text-[12px] font-semibold text-[#4B5563] uppercase tracking-wider">Nome Completo *</label>
                      <input type="text" className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium uppercase outline-none transition-all ${getValidationClass(crianca.nome)}`} value={crianca.nome} onChange={e => handleChildChange(idx, 'nome', e.target.value.toUpperCase())} placeholder="NOME DA CRIANÇA OU ADOLESCENTE" />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-[12px] font-semibold text-[#4B5563] uppercase tracking-wider">CPF da Criança</label>
                      <input type="text" className="w-full p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[14px] font-medium uppercase outline-none focus:border-[#2563EB]" value={crianca.cpf || ''} onChange={e => handleChildChange(idx, 'cpf', e.target.value)} placeholder="000.000.000-00" />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-[12px] font-semibold text-[#4B5563] uppercase tracking-wider">Data de Nascimento *</label>
                      <input type="date" className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium outline-none transition-all ${getValidationClass(crianca.data_nascimento)}`} value={crianca.data_nascimento} onChange={e => handleChildChange(idx, 'data_nascimento', e.target.value)} />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[12px] font-semibold text-[#4B5563] uppercase tracking-wider">Gênero *</label>
                      <select className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium uppercase outline-none transition-all ${getValidationClass(crianca.sexo)}`} value={crianca.sexo} onChange={e => handleChildChange(idx, 'sexo', e.target.value)}>
                        <option value="">SELECIONE...</option>
                        {Object.entries(GENDER_LABELS).map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-8 space-y-2">
                      <label className="text-[12px] font-semibold text-[#4B5563] uppercase tracking-wider">Bairro do Fato *</label>
                      <select className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium uppercase outline-none transition-all ${getValidationClass(formData.bairro)}`} value={formData.bairro} onChange={e => handleInputChange('bairro', e.target.value)}>
                        <option value="">Selecione o Bairro/Local...</option>
                        {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    {crianca.idade_calculada !== null && crianca.idade_calculada >= 0 && crianca.data_nascimento && (
                      <div className="md:col-span-12 flex flex-wrap items-center gap-4 mt-2 animate-in fade-in slide-in-from-left-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-[12px] font-bold text-slate-700 uppercase shadow-sm border border-slate-200">
                          <Clock className="w-4 h-4 text-slate-500" />
                          Idade: {crianca.idade_calculada} Anos
                        </div>
                        {crianca.idade_calculada <= 6 && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 border border-pink-100 rounded-xl text-[10px] font-black uppercase shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> Primeira Infância
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
                <AlertCircle className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-[15px] font-bold text-[#111827] uppercase tracking-widest">Informações / Documento *</h3>
             </div>
             <textarea 
               className={`w-full p-4 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium outline-none min-h-[120px] focus:border-[#2563EB] transition-all ${getValidationClass(formData.informacoes_documento)}`}
               placeholder="DESCREVA AQUI O CONTEÚDO PRINCIPAL DO DOCUMENTO OU RELATO RECEBIDO..."
               value={formData.informacoes_documento}
               onChange={e => handleInputChange('informacoes_documento', e.target.value.toUpperCase())}
             />
          </div>
          <button type="submit" className="w-full py-5 bg-[#111827] text-white rounded-xl font-bold uppercase text-[14px] tracking-widest shadow-lg hover:bg-[#2563EB] transition-all flex items-center justify-center gap-3">
            <Save className="w-5 h-5" /> Finalizar Registro e Distribuição
          </button>
        </form>
      </div>

      {showHistoryModal && (
        <FamilyHistoryModal 
          history={familyHistory} 
          currentUser={currentUser} 
          onClose={() => setShowHistoryModal(false)} 
        />
      )}
    </div>
  );
};

export default DocumentRegistration;
