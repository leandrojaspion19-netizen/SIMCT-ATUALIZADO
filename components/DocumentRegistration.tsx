
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Plus, Trash2, ShieldCheck, AlertCircle, Zap, UserCheck, Calendar, Fingerprint, ChevronDown, Lock, Clock, Upload, FileText, Scale, Gavel, LayoutList, Users, Baby, ShieldAlert, Search, Check, Info, Users2, History, Sparkles, Loader2, UserRound, ArrowRightCircle, ShieldEllipsis, AlertTriangle, Database, UserPlus, ToggleLeft, ToggleRight } from 'lucide-react';
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

  const isEditing = !!initialData;
  const isAdmin = currentUser.perfil === 'ADMIN' || currentUser.perfil === 'ADMINISTRATIVO';

  // Lógica de Trava de Referência: ADM altera se for Novo registro e optar por manual; Conselheiro só altera se for o titular.
  const isReferenceLocked = useMemo(() => {
    // Se for ADM e optar por manual no registro de caso antigo, desbloqueia.
    if (isAdmin && !isEditing && formData.is_manual_override) return false;
    // Caso contrário, se for ADM, permanece bloqueado para seguir a regra de proteção.
    if (isAdmin) return true;
    // Para conselheiros, só desbloqueia se ele for a própria referência do caso em edição.
    if (isEditing && initialData?.conselheiro_referencia_id !== currentUser.id) return true;
    return false;
  }, [currentUser, isEditing, initialData, formData.is_manual_override, isAdmin]);

  const getErrorClass = (value: any) => {
    const isEmpty = !value || value === '' || (Array.isArray(value) && value.length === 0);
    return attemptedSubmit && isEmpty ? 'border-red-500 bg-red-50' : 'border-[#E5E7EB]';
  };

  useEffect(() => {
    const cleanCpf = formData.cpf_genitora.replace(/\D/g, '');
    const cleanNome = formData.genitora_nome.trim().toUpperCase();
    if ((cleanCpf.length === 11 || cleanNome.length > 5) && !isEditing) {
      const history = documents.filter(d => {
         const matchCpf = cleanCpf.length === 11 && d.cpf_genitora?.replace(/\D/g, '') === cleanCpf;
         const matchNome = cleanNome.length > 5 && d.genitora_nome?.toUpperCase() === cleanNome;
         return matchCpf || matchNome;
      });
      setFamilyHistory(history);
      if (history.length > 0) {
        const latestDoc = history[history.length - 1];
        if (!formData.genitora_nome && latestDoc.genitora_nome) {
          setFormData(prev => ({ ...prev, genitora_nome: latestDoc.genitora_nome, bairro: prev.bairro || latestDoc.bairro }));
        }
        const childrenMap = new Map<string, ChildData>();
        history.forEach(doc => {
          doc.criancas.forEach(child => {
            const age = calculateAge(child.data_nascimento);
            if (age !== null && age < 18) {
              const key = (child.cpf || child.nome).toUpperCase();
              childrenMap.set(key, { ...child, idade_calculada: age });
            }
          });
        });
        setHistoricalChildren(Array.from(childrenMap.values()));
      }
    }
  }, [formData.cpf_genitora, formData.genitora_nome, documents, isEditing]);

  // DISTRIBUIÇÃO AUTOMÁTICA AVANÇADA
  useEffect(() => {
    const valUpper = formData.origem.toUpperCase();
    const isNominalNotification = valUpper.startsWith('NOTIFICAÇÃO ');
    
    if (!formData.is_manual_override && !isNominalNotification && !isEditing && formData.data_recebimento && formData.tipo_documento) {
      const escala = getEffectiveEscala(formData.data_recebimento);
      let autoProvId = '';
      if (escala && escala.length > 0) {
        // Sequência baseada apenas em documentos distribuídos automaticamente (não altera a sequência)
        const autoDocsNoMesmoDia = documents.filter(d => 
          d.data_recebimento === formData.data_recebimento && 
          d.distribuicao_automatica &&
          !d.origem.toUpperCase().startsWith('NOTIFICAÇÃO ')
        ).length;
        
        const indexEscala = autoDocsNoMesmoDia % escala.length;
        const provName = escala[indexEscala].toUpperCase();
        const provCouncilor = INITIAL_USERS.find(u => u.nome.toUpperCase() === provName);
        if (provCouncilor) autoProvId = provCouncilor.id;
      }

      const councilors = INITIAL_USERS.filter(u => u.perfil === 'CONSELHEIRO' && u.status !== 'BLOQUEADO');
      const relevantDocs = documents
        .filter(d => d.distribuicao_automatica && !d.origem.toUpperCase().startsWith('NOTIFICAÇÃO '))
        .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

      const lastRefId = relevantDocs[0]?.conselheiro_referencia_id;
      const stats = councilors.map(c => ({
        id: c.id,
        count: documents.filter(d => d.conselheiro_referencia_id === c.id && d.distribuicao_automatica && !d.origem.toUpperCase().startsWith('NOTIFICAÇÃO ')).length
      }));

      let candidates = stats.filter(s => s.id !== lastRefId);
      if (candidates.length === 0) candidates = stats;
      candidates.sort((a, b) => a.count - b.count);
      const autoRefId = candidates[0]?.id;

      if (autoRefId !== formData.conselheiro_referencia_id || autoProvId !== formData.conselheiro_providencia_id) {
        setFormData(prev => ({ 
          ...prev, 
          conselheiro_referencia_id: autoRefId || prev.conselheiro_referencia_id,
          conselheiro_providencia_id: autoProvId || prev.conselheiro_providencia_id
        }));
      }
    }
  }, [formData.data_recebimento, formData.is_manual_override, formData.tipo_documento, formData.origem, isEditing, documents]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate || birthDate.length < 10) return null;
    const today = new Date();
    const birth = new Date(birthDate + 'T12:00:00');
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleInputChange = (field: string, value: any) => {
    let autoUpdates = {};
    if (field === 'origem' && typeof value === 'string') {
      const valUpper = value.toUpperCase();
      if (valUpper.startsWith('NOTIFICAÇÃO ')) {
        const councilorName = valUpper.replace('NOTIFICAÇÃO ', '').trim();
        const councilor = INITIAL_USERS.find(u => u.nome.toUpperCase() === councilorName);
        if (councilor) {
          autoUpdates = { 
            conselheiro_providencia_id: councilor.id,
            conselheiro_referencia_id: councilor.id 
          };
        }
      }
    }
    setFormData(prev => ({ ...prev, [field]: value, ...autoUpdates }));
  };

  const handleChildChange = (index: number, field: keyof ChildData, value: any) => { 
    const newChildren = [...formData.criancas];
    let updatedChild = { ...newChildren[index], [field]: value };
    if (field === 'data_nascimento') {
      const age = calculateAge(value);
      updatedChild.idade_calculada = age !== null ? age : 0;
      if (age !== null && age >= 18) {
        alert("IDADE EXCEDIDA: Indivíduos com 18 anos ou mais devem ser atendidos pelo CREAS adulto.");
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
    setFormData(prev => ({ ...prev, criancas: [...prev.criancas, { nome: '', data_nascimento: '', sexo: '', cpf: '', idade_calculada: 0 }] }));
  };

  const validateForm = () => {
    const required = [formData.genitora_nome, formData.data_recebimento, formData.hora_rece_bimento, formData.bairro, formData.origem, formData.tipo_documento, formData.informacoes_documento];
    const hasEmptyRequired = required.some(f => !f || f === '');
    const hasEmptyChild = formData.criancas.some(c => !c.nome || !c.data_nascimento || !c.sexo);
    return !hasEmptyRequired && !hasEmptyChild;
  };

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    setAttemptedSubmit(true);
    if (!validateForm()) {
      alert("CAMPOS OBRIGATÓRIOS PENDENTES: Por favor, preencha os itens destacados em vermelho.");
      return;
    }
    onSubmit(formData, []); 
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
        
        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-[#E5E7EB]"><ShieldCheck className="w-6 h-6 text-[#2563EB]" /></div>
                <div>
                  <h4 className="text-[13px] font-semibold uppercase text-[#111827]">Gestão de Atribuição</h4>
                  <p className="text-[11px] font-medium text-[#4B5563] uppercase">Conselheiro de Referência e Providência</p>
                </div>
              </div>

              {isAdmin && !isEditing && (
                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-xl border border-slate-200 shadow-sm">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer" htmlFor="manual-dist">Atribuição Manual (Caso Antigo)</label>
                   <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_manual_override: !prev.is_manual_override, distribuicao_automatica: !prev.is_manual_override ? false : true }))}
                    className="focus:outline-none"
                   >
                     {formData.is_manual_override ? <ToggleRight className="w-8 h-8 text-[#2563EB]" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                   </button>
                </div>
              )}
            </div>

            {(formData.is_manual_override || isEditing || formData.origem.toUpperCase().startsWith('NOTIFICAÇÃO')) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-widest flex items-center gap-2">
                    Referência {isReferenceLocked && <Lock className="w-3 h-3 text-slate-400" />}
                  </label>
                  <select 
                    disabled={isReferenceLocked}
                    className={`w-full p-2.5 bg-white border rounded-lg text-[13px] uppercase ${isReferenceLocked ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-70' : getErrorClass(formData.conselheiro_referencia_id)}`} 
                    value={formData.conselheiro_referencia_id} 
                    onChange={e => handleInputChange('conselheiro_referencia_id', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {councilors.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-widest">Providência</label>
                  <select 
                    className={`w-full p-2.5 bg-white border rounded-lg text-[13px] uppercase ${getErrorClass(formData.conselheiro_providencia_id)}`} 
                    value={formData.conselheiro_providencia_id} 
                    onChange={e => handleInputChange('conselheiro_providencia_id', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {councilors.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#4B5563] uppercase tracking-widest">Origem / Comunicante *</label>
                <select className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium uppercase outline-none transition-all ${getErrorClass(formData.origem)}`} value={formData.origem} onChange={e => handleInputChange('origem', e.target.value)}>
                  <option value="">Selecione...</option>
                  {ORIGENS_CATEGORIZADAS.map(group => (<optgroup key={group.label} label={group.label}>{group.options.map(o => <option key={o} value={o}>{o}</option>)}</optgroup>))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#4B5563] uppercase tracking-widest">Tipo de Documento *</label>
                <select className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium uppercase outline-none transition-all ${getErrorClass(formData.tipo_documento)}`} value={formData.tipo_documento} onChange={e => handleInputChange('tipo_documento', e.target.value)}>
                  <option value="">Selecione...</option>
                  {TIPOS_DOCUMENTO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#4B5563] uppercase tracking-widest">Data e Horário de Recebimento *</label>
                <div className="flex gap-3">
                  <input 
                    type="date" 
                    className={`flex-1 p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium outline-none transition-all ${getErrorClass(formData.data_recebimento)}`} 
                    value={formData.data_recebimento} 
                    onChange={e => handleInputChange('data_recebimento', e.target.value)} 
                  />
                  <input 
                    type="time" 
                    className={`w-32 p-3 bg-[#F9FAFB] border rounded-xl text-[14px] font-medium outline-none transition-all ${getErrorClass(formData.hora_rece_bimento)}`} 
                    value={formData.hora_rece_bimento} 
                    onChange={e => handleInputChange('hora_rece_bimento', e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[#4B5563] uppercase tracking-widest">Mãe / Responsável Legal *</label>
              <input type="text" className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[14px] uppercase outline-none transition-all ${getErrorClass(formData.genitora_nome)}`} value={formData.genitora_nome} onChange={e => handleInputChange('genitora_nome', e.target.value.toUpperCase())} placeholder="NOME COMPLETO DA GENITORA" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-[15px] font-bold text-[#111827] uppercase tracking-widest flex items-center gap-2"><Baby className="w-5 h-5 text-[#2563EB]" /> Crianças/Adolescentes</h3>
              <button type="button" onClick={addChild} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#2563EB] rounded-lg text-[11px] font-bold uppercase hover:bg-blue-100 transition-all"><Plus className="w-4 h-4" /> Adicionar Outro</button>
            </div>
            {formData.criancas.map((crianca, idx) => (
              <div key={idx} className="p-6 bg-white border border-[#E5E7EB] rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 relative shadow-sm">
                {formData.criancas.length > 1 && <button type="button" onClick={() => setFormData(prev => ({ ...prev, criancas: prev.criancas.filter((_, i) => i !== idx) }))} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>}
                <div className="md:col-span-1 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#4B5563] uppercase">Nome Completo *</label>
                    <input type="text" className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[13px] uppercase outline-none ${getErrorClass(crianca.nome)}`} value={crianca.nome} onChange={e => handleChildChange(idx, 'nome', e.target.value.toUpperCase())} />
                  </div>
                  {idx === 0 && (
                    <div className="space-y-1 animate-in slide-in-from-top-2">
                      <label className="text-[11px] font-bold text-[#4B5563] uppercase">Endereço da Criança/Adolescente *</label>
                      <select 
                        className={`w-full p-3 bg-white border rounded-xl text-[13px] uppercase outline-none transition-all ${getErrorClass(formData.bairro)}`} 
                        value={formData.bairro} 
                        onChange={e => handleInputChange('bairro', e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#4B5563] uppercase">Nascimento *</label>
                  <input type="date" className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[13px] outline-none ${getErrorClass(crianca.data_nascimento)}`} value={crianca.data_nascimento} onChange={e => handleChildChange(idx, 'data_nascimento', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#4B5563] uppercase">Gênero *</label>
                  <select className={`w-full p-3 bg-[#F9FAFB] border rounded-xl text-[13px] uppercase outline-none ${getErrorClass(crianca.sexo)}`} value={crianca.sexo} onChange={e => handleChildChange(idx, 'sexo', e.target.value)}>
                    <option value="">Selecione...</option>
                    {Object.entries(GENDER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
             <h3 className="text-[15px] font-bold text-[#111827] uppercase tracking-widest flex items-center gap-2"><AlertCircle className="w-5 h-5 text-[#2563EB]" /> Conteúdo do Relato *</h3>
             <textarea className={`w-full p-4 bg-[#F9FAFB] border rounded-xl text-[14px] min-h-[120px] uppercase outline-none transition-all ${getErrorClass(formData.informacoes_documento)}`} value={formData.informacoes_documento} onChange={e => handleInputChange('informacoes_documento', e.target.value.toUpperCase())} placeholder="DESCREVA OS DETALHES DO DOCUMENTO OU DENÚNCIA..." />
          </div>
          <button type="submit" className="w-full py-5 bg-[#111827] text-white rounded-xl font-bold uppercase text-[14px] tracking-widest shadow-lg hover:bg-[#2563EB] transition-all flex items-center justify-center gap-3"><Save className="w-5 h-5" /> Registrar Procedimento Digital</button>
        </form>
      </div>
    </div>
  );
};

export default DocumentRegistration;
