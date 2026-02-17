
import React, { useState, useEffect } from 'react';
import { X, Save, ShieldCheck, Zap, Lock, FilePlus2, Baby, FileText, UserPlus, Clock, AlertCircle, Fingerprint, UserSearch, Calendar, Info, CheckSquare, MapPin, ClipboardList, CalendarX } from 'lucide-react';
import { Documento, User, ChildData, SuspectType, ViolenceType, SipiaViolation, AgenteVioladorEntry, MedidaAplicada } from '../types';
import { ORIGENS_CATEGORIZADAS, BAIRROS, INITIAL_USERS, getEffectiveEscala, CANAIS_COMUNICACAO, UNIFIED_GENDER_OPTIONS, RODIZIO_ALFABETICO } from '../constants';

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
  const [referenciaIdentificada, setReferenciaIdentificada] = useState<string | null>(null);
  const [maioridadeBloqueio, setMaioridadeBloqueio] = useState<string | null>(null);
  const [showEscalaModal, setShowEscalaModal] = useState(false);
  const [scaleError, setScaleError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    origem: initialData?.origem || '',
    canal_comunicado: initialData?.canal_comunicado || '',
    tipo_documento: initialData?.informacoes_documento.split(' - REF: ')[0] || '', 
    data_recebimento: initialData?.data_recebimento || '', 
    hora_rece_bimento: initialData?.hora_rece_bimento || '',
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
  const isAdminProfile = currentUser.perfil === 'ADMIN';

  // DIRETRIZ 46.2: MOTOR DA REFERÊNCIA (VÍNCULO OU RODÍZIO ALFABÉTICO RIGOROSO)
  useEffect(() => {
    if (isEditing) return;

    const nomeCrianca = formData.criancas[0]?.nome?.trim().toUpperCase();
    const cpfCrianca = formData.criancas[0]?.cpf?.replace(/\D/g, '');
    const cpfMae = formData.cpf_genitora?.replace(/\D/g, '');

    if (!nomeCrianca && !cpfCrianca && !cpfMae) {
      setReferenciaIdentificada(null);
      return;
    }

    // Prioridade 1: Vínculo Histórico (CPF ou Nome)
    const match = documents.find(d => 
      (cpfCrianca && d.criancas.some(c => c.cpf?.replace(/\D/g, '') === cpfCrianca)) ||
      (cpfMae && d.cpf_genitora?.replace(/\D/g, '') === cpfMae) ||
      (nomeCrianca && d.criancas.some(c => c.nome.trim().toUpperCase() === nomeCrianca))
    );

    if (match) {
      const councilor = INITIAL_USERS.find(u => u.id === match.conselheiro_referencia_id);
      setReferenciaIdentificada(councilor?.nome || 'Conselheiro Natural');
      setFormData(prev => ({
        ...prev,
        conselheiro_referencia_id: match.conselheiro_referencia_id,
        is_manual_override: true, // Indica vínculo histórico fixo
        bairro: prev.bairro || match.bairro
      }));
    } else {
      setReferenciaIdentificada(null);
      // Prioridade 2: Sequência Alfabética Rigorosa (Diretriz 46.1)
      // Independência: Casos por vínculo não contam para o rodízio
      const rotationDocs = documents.filter(d => !d.is_manual_override);
      const index = rotationDocs.length % RODIZIO_ALFABETICO.length;
      const nextName = RODIZIO_ALFABETICO[index];
      const nextId = INITIAL_USERS.find(u => u.nome.toUpperCase() === nextName.toUpperCase())?.id || '';
      
      setFormData(prev => ({ 
        ...prev, 
        conselheiro_referencia_id: nextId,
        is_manual_override: false 
      }));
    }
  }, [formData.criancas[0]?.nome, formData.criancas[0]?.cpf, formData.cpf_genitora, documents, isEditing]);

  // DIRETRIZ 46.3: MOTOR DA PROVIDÊNCIA IMEDIATA (VIA ESCALA)
  useEffect(() => {
    if (!formData.data_recebimento) return;

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const inputDate = new Date(formData.data_recebimento + 'T12:00:00');

    if (inputDate > today) {
      setDateError("Data Inválida");
      setFormData(prev => ({ ...prev, data_recebimento: '' }));
      return;
    }
    setDateError(null);

    const escalaDoDia = getEffectiveEscala(formData.data_recebimento);
    if (escalaDoDia.length === 0) {
      setScaleError("⚠️ Escala não encontrada para esta data.");
      setFormData(prev => ({ ...prev, conselheiros_providencia_nomes: [], conselheiro_providencia_id: '' }));
    } else {
      setScaleError(null);
      const provId = INITIAL_USERS.find(u => u.nome.toUpperCase() === escalaDoDia[0]?.toUpperCase())?.id || '';
      setFormData(prev => ({ 
        ...prev, 
        conselheiro_providencia_id: provId,
        conselheiros_providencia_nomes: escalaDoDia
      }));
    }
  }, [formData.data_recebimento, formData.hora_rece_bimento]);

  const handleInputChange = (field: string, value: any) => {
    if (field === 'informacoes_documento') setRelatoError(value.trim() === '');
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChildChange = (index: number, field: keyof ChildData, value: any) => { 
    const newChildren = [...formData.criancas];
    let updatedChild = { ...newChildren[index] };
    (updatedChild as any)[field] = value;

    if (field === 'idade_calculada') {
       const age = parseInt(value);
       updatedChild.idade_calculada = isNaN(age) ? undefined : age;
       if (age >= 18) setMaioridadeBloqueio(updatedChild.nome || `Criança ${index + 1}`);
       else setMaioridadeBloqueio(null);
    }

    newChildren[index] = updatedChild;
    if (index === 0 && field === 'nome') {
      setFormData(prev => ({ ...prev, criancas: newChildren, crianca_nome: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, criancas: newChildren })); 
    }
  };

  const getErrorClass = (fieldValue: any) => {
    const isEmpty = fieldValue === undefined || fieldValue === null || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);
    return attemptedSubmit && isEmpty ? 'border-red-600 border-4 bg-red-50' : 'border-slate-200';
  };

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    setAttemptedSubmit(true);

    const child = formData.criancas[0];
    if (!child.genero_identidade || child.idade_calculada === undefined) {
      alert("ERRO: Gênero e Idade são campos obrigatórios.");
      return;
    }

    if (maioridadeBloqueio) {
      alert("⚠️ Bloqueio de Cadastro: Indivíduo com 18 anos ou mais identificado (Art. 2º do ECA).");
      return;
    }

    if (!formData.origem || !formData.canal_comunicado || !formData.bairro || !formData.data_recebimento) {
      alert("ERRO: Preencha todos os campos obrigatórios da Triagem e Localização.");
      return;
    }

    if (!formData.informacoes_documento || formData.informacoes_documento.trim() === '') {
      setRelatoError(true);
      return;
    }
    
    const finalData = {
      ...formData,
      informacoes_documento: `${formData.tipo_documento} - REF: ${formData.informacoes_documento}`
    };

    onSubmit(finalData, []); 
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <header className="p-10 bg-[#111827] text-white flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">SIMCT Hortolândia</span>
              <span className="px-3 py-1 bg-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full">Diretriz 46 Ativa</span>
            </div>
            <h2 className="text-[24px] font-black uppercase tracking-tight">Registro de Novo Procedimento</h2>
          </div>
          <button type="button" onClick={onCancel} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          
          {/* DIRETRIZ 46.4 - ORDEM OBRIGATÓRIA DA INTERFACE */}
          
          {/* 1. TIPO DE ORIGEM & 2. CANAL DE COMUNICAÇÃO & 3. TIPO DE DOCUMENTO */}
          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <ClipboardList className="w-6 h-6 text-blue-600" />
                <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-800">Triage Administrativa</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Tipo de Origem *</label>
                  <select className={`w-full p-4 bg-slate-50 border rounded-2xl text-[12px] font-bold uppercase outline-none focus:border-blue-500 ${getErrorClass(formData.origem)}`} value={formData.origem} onChange={e => handleInputChange('origem', e.target.value)}>
                    <option value="">Selecione...</option>
                    {ORIGENS_CATEGORIZADAS.map(g => <optgroup key={g.label} label={g.label}>{g.options.map(o => <option key={o} value={o}>{o}</option>)}</optgroup>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Canal de Comunicação *</label>
                  <select className={`w-full p-4 bg-slate-50 border rounded-2xl text-[12px] font-bold uppercase outline-none focus:border-blue-500 ${getErrorClass(formData.canal_comunicado)}`} value={formData.canal_comunicado} onChange={e => handleInputChange('canal_comunicado', e.target.value)}>
                    <option value="">Selecione...</option>
                    {CANAIS_COMUNICACAO.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">3. Tipo de Documento (Identificação)</label>
                  <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold uppercase outline-none focus:border-blue-500" placeholder="Nº DO OFÍCIO OU PROCESSO" value={formData.tipo_documento} onChange={e => handleInputChange('tipo_documento', e.target.value.toUpperCase())} />
                </div>
             </div>
          </section>

          {/* 4. DATA E HORA DO APORTE */}
          <section className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-6">
             <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1 max-w-md">
                   <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">4. Data e Hora do Aporte * (Sem datas futuras)</label>
                   <div className="flex gap-2">
                      <input type="date" className={`flex-1 p-4 bg-white border rounded-xl text-sm font-bold outline-none ${dateError ? 'border-red-500 border-2' : 'border-blue-200'}`} value={formData.data_rece_bimento} onChange={e => handleInputChange('data_recebimento', e.target.value)} />
                      <input type="time" className="w-32 p-4 bg-white border border-blue-200 rounded-xl text-sm font-bold outline-none" value={formData.hora_rece_bimento} onChange={e => handleInputChange('hora_rece_bimento', e.target.value)} />
                   </div>
                   {dateError && <p className="text-[9px] text-red-600 font-black uppercase ml-1 animate-pulse">{dateError}</p>}
                </div>
                <button type="button" onClick={() => setShowEscalaModal(true)} className="px-6 py-4 bg-white border-2 border-blue-200 text-blue-600 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3"><Calendar className="w-4 h-4" /> [Conferir Escala]</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-blue-200/50">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-blue-900/60 uppercase tracking-widest ml-1">Atribuição: Referência</label>
                   <div className="w-full p-4 bg-white border-2 border-blue-200 rounded-2xl text-[13px] font-black text-blue-900 uppercase flex items-center justify-between shadow-sm">
                      <span>{INITIAL_USERS.find(u => u.id === formData.conselheiro_referencia_id)?.nome || 'Pendente...'}</span>
                      {referenciaIdentificada ? <Fingerprint className="w-4 h-4 text-blue-600" /> : <Zap className="w-4 h-4 text-emerald-500" />}
                   </div>
                   {referenciaIdentificada ? (
                     <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase w-fit">📌 Referência mantida: {referenciaIdentificada}</div>
                   ) : (
                     <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase w-fit">Rodízio Alfabético Rigoroso</div>
                   )}
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-blue-900/60 uppercase tracking-widest ml-1">Atribuição: Providência Imediata (Trio)</label>
                   <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-1 border-l-8 border-l-amber-500 shadow-sm">
                      {formData.conselheiros_providencia_nomes.length > 0 ? (
                        formData.conselheiros_providencia_nomes.map((n, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] font-black text-amber-900 uppercase">
                             <CheckSquare className="w-3 h-3" /> {n}
                          </div>
                        ))
                      ) : <span className="text-[10px] text-amber-600 font-bold uppercase italic">Aguardando Aporte Temporal...</span>}
                   </div>
                </div>
             </div>
          </section>

          {/* 5. BAIRRO DA CRIANÇA/ADOLESCENTE */}
          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <MapPin className="w-6 h-6 text-red-600" />
                <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-800">Localização</h3>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">5. Bairro da Criança / Adolescente *</label>
                <select className={`w-full p-5 bg-slate-50 border rounded-2xl text-[13px] font-black uppercase outline-none focus:border-red-500 ${getErrorClass(formData.bairro)}`} value={formData.bairro} onChange={e => handleInputChange('bairro', e.target.value)}>
                  <option value="">SELECIONE O BAIRRO DE HORTOLÂNDIA...</option>
                  {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
             </div>
          </section>

          {/* 6. DADOS BIOGRÁFICOS */}
          <section className="space-y-8">
             <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                   <Baby className="w-6 h-6 text-emerald-600" />
                   <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-800">6. Dados Biográficos (Obrigatórios)</h3>
                </div>
                <button type="button" onClick={() => setFormData(p => ({...p, criancas: [...p.criancas, { nome: '', data_nascimento: '', genero_identidade: '', cpf: '', idade_calculada: undefined, categoria_idade: '' }]}))} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md">
                   <UserPlus className="w-4 h-4" /> [+] Adicionar Irmão
                </button>
             </div>
             <div className="space-y-8">
                {formData.criancas.map((child, idx) => (
                   <div key={idx} className={`p-8 border-2 rounded-[2.5rem] relative ${child.idade_calculada && child.idade_calculada >= 18 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      {idx > 0 && <button type="button" onClick={() => setFormData(p => ({...p, criancas: p.criancas.filter((_, i) => i !== idx)}))} className="absolute -top-3 -right-3 p-2 bg-red-600 text-white rounded-full"><X className="w-4 h-4" /></button>}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                            <input type="text" className="w-full p-4 bg-white border border-slate-200 rounded-xl text-[13px] font-bold uppercase outline-none focus:border-blue-600" value={child.nome} onChange={e => handleChildChange(idx, 'nome', e.target.value.toUpperCase())} placeholder="NOME DA CRIANÇA" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">Idade Atual *</label>
                            <input type="number" className={`w-full p-4 bg-white border rounded-xl text-[14px] font-black outline-none ${getErrorClass(child.idade_calculada)}`} value={child.idade_calculada ?? ''} onChange={e => handleChildChange(idx, 'idade_calculada', e.target.value)} placeholder="0" />
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">Gênero / Identidade de Gênero *</label>
                            <select className={`w-full p-4 bg-white border rounded-xl text-[12px] font-bold uppercase outline-none focus:border-blue-600 ${getErrorClass(child.genero_identidade)}`} value={child.genero_identidade} onChange={e => handleChildChange(idx, 'genero_identidade', e.target.value)}>
                               <option value="">Selecione...</option>
                               {UNIFIED_GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                         </div>
                         <div className="flex items-center gap-4 px-6 bg-blue-50 border border-blue-100 rounded-2xl">
                            <div className="flex flex-col"><span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Status Biográfico</span><span className={`text-[11px] font-black uppercase ${child.idade_calculada && child.idade_calculada >= 18 ? 'text-red-600 font-black' : 'text-slate-700'}`}>{child.idade_calculada && child.idade_calculada >= 18 ? "BLOQUEIO: MAIORIDADE IDENTIFICADA" : (child.categoria_idade || "Pendente...")}</span></div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </section>

          {/* 7. RELATO INICIAL */}
          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <FileText className={`w-6 h-6 ${relatoError ? 'text-red-600' : 'text-amber-600'}`} />
                <h3 className={`text-[14px] font-black uppercase tracking-widest ${relatoError ? 'text-red-900' : 'text-slate-800'}`}>7. Relato Inicial dos Fatos *</h3>
             </div>
             <div className="relative">
                <textarea className={`w-full p-10 bg-slate-50 border-4 rounded-[3rem] text-[15px] font-medium min-h-[300px] uppercase outline-none transition-all ${relatoError ? 'border-red-600 bg-red-50 focus:border-red-700 shadow-[0_0_0_8px_rgba(220,38,38,0.1)]' : 'border-slate-200 focus:border-blue-600'}`} value={formData.informacoes_documento} onChange={e => handleInputChange('informacoes_documento', e.target.value.toUpperCase())} placeholder="DESCREVA DETALHADAMENTE O RELATO..." />
                {relatoError && <p className="absolute bottom-6 left-10 text-[10px] font-black text-red-600 uppercase">Campo obrigatório: descreva o relato dos fatos para prosseguir.</p>}
             </div>
          </section>

          <button type="submit" className="w-full py-10 bg-[#111827] text-white rounded-[3rem] font-black uppercase text-[16px] tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-6 active:scale-[0.98] group">
             <Save className="w-8 h-8 group-hover:animate-pulse" /> [SALVAR] REGISTRO SIMCT
          </button>
        </form>
      </div>

      {/* MODAL VISUALIZADOR DE ESCALA */}
      {showEscalaModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/60 animate-in fade-in">
           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 border border-slate-200 animate-in zoom-in-95 relative">
              <button onClick={() => setShowEscalaModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-6 h-6" /></button>
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8">
                 <Calendar className="w-10 h-10 text-blue-600" />
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Escala Mensal Hortolândia</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Referência: Ciclo 2026</p>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
                    <Info className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-slate-600 font-medium uppercase leading-relaxed">
                       O motor SIMCT cruza a data do aporte com a tabela oficial de Hortolândia para garantir o trio de resposta da Providência Imediata.
                    </p>
                 </div>
                 <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 text-white font-black uppercase text-[11px] tracking-widest border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                       <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> {formData.data_rece_bimento ? new Date(formData.data_rece_bimento + 'T12:00:00').toLocaleDateString('pt-BR') : 'Data Não Definida'}</span>
                       <span className="text-blue-400 font-black tracking-[0.2em]">MOTOR SIMCT</span>
                    </div>
                    <div className="p-10 space-y-4">
                       {formData.conselheiros_providencia_nomes.length > 0 ? (
                         formData.conselheiros_providencia_nomes.map((n, i) => (
                           <div key={i} className="flex items-center justify-between text-white p-5 bg-white/5 rounded-2xl border border-white/5">
                             <div className="flex items-center gap-4">
                               <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 font-black text-xs">{i+1}</div>
                               <span className="text-sm font-bold uppercase tracking-tight">{n}</span>
                             </div>
                             <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${i === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>{i === 0 ? 'Plantonista' : 'Suporte'}</span>
                           </div>
                         ))
                       ) : (
                         <div className="text-center py-10 opacity-40">
                            <CalendarX className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-white font-bold uppercase text-xs">Defina a data no formulário para validar.</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
              <button onClick={() => setShowEscalaModal(false)} className="w-full py-5 bg-slate-100 text-slate-800 rounded-2xl font-black uppercase text-xs tracking-widest mt-8 hover:bg-slate-200 shadow-md">Fechar</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default DocumentRegistration;
