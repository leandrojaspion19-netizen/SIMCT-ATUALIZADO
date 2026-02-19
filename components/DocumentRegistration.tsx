
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Save, Baby, AlertCircle, Database, Search, ArrowRight, Megaphone, ClipboardList, UserRound, MapPin, FileText } from 'lucide-react';
import { Documento, User, ChildData, SuspectType, ViolenceType, SipiaViolation, AgenteVioladorEntry, MedidaAplicada } from '../types';
import { ORIGENS_CATEGORIZADAS, BAIRROS, INITIAL_USERS, getEffectiveEscala, CANAIS_COMUNICACAO, RODIZIO_ALFABETICO, getQueueCategory } from '../constants';

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
  const [childNameError, setChildNameError] = useState(false);
  const [atribuicaoMetodo, setAtribuicaoMetodo] = useState<'VINCULO' | 'RODIZIO' | null>(null);
  
  // DIRETRIZ 95.3: Busca inteligente de nomes
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    origem: initialData?.origem || '',
    canal_comunicado: initialData?.canal_comunicado || '',
    tipo_documento: initialData?.informacoes_documento?.split(' - REF: ')[0] || '', 
    data_recebimento: initialData?.data_recebimento || new Date().toISOString().split('T')[0], 
    hora_rece_bimento: initialData?.hora_rece_bimento || new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}),
    periodo_rece_bimento: initialData?.periodo_rece_bimento || 'COMERCIAL',
    genitora_nome: initialData?.genitora_nome || '',
    cpf_genitora: initialData?.cpf_genitora || '',
    bairro: initialData?.bairro || '',
    informacoes_documento: initialData?.informacoes_documento?.includes(' - REF: ') ? initialData.informacoes_documento.split(' - REF: ')[1] : initialData?.informacoes_documento || '',
    violacoesSipia: initialData?.violacoesSipia || [] as SipiaViolation[],
    agentesVioladores: initialData?.agentesVioladores || [] as AgenteVioladorEntry[],
    medidas_detalhadas: initialData?.medidas_detalhadas || [] as MedidaAplicada[],
    status: initialData?.status || ['NAO_LIDO'],
    conselheiro_referencia_id: initialData?.conselheiro_referencia_id || '',
    conselheiro_providencia_id: initialData?.conselheiro_providencia_id || '',
    conselheiros_providencia_nomes: initialData?.conselheiros_providencia_nomes || [] as string[],
    criancas: initialData?.criancas || [{ nome: '', data_nascimento: '', genero_identidade: '', cpf: '', idade_calculada: undefined, categoria_idade: '' }] as ChildData[],
    crianca_nome: initialData?.crianca_nome || '' 
  });

  const isEditing = !!initialData;
  const isAdminUser = currentUser.perfil === 'ADMIN' || currentUser.perfil === 'ADMINISTRATIVO';

  const showMonitoringWarning = useMemo(() => {
    return isAdminUser && initialData?.historico_monitoramento && initialData.historico_monitoramento.length > 0;
  }, [isAdminUser, initialData]);

  const handleInputChange = (field: string, value: any) => {
    if (field === 'crianca_nome') {
       const term = value.toUpperCase();
       setChildNameError(term.trim() === '');
       
       // DIRETRIZ 95.3: Inteligência de Busca
       if (term.length > 2) {
          const suggestions = documents
            .flatMap(d => [d.crianca_nome, ...d.criancas.map(c => c.nome)])
            .filter(n => n?.toUpperCase().includes(term))
            .filter((v, i, a) => v && a.indexOf(v) === i)
            .slice(0, 5);
          setNameSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
       } else {
          setShowSuggestions(false);
       }
    }
    if (field === 'genitora_nome') setGenitoraError(value.trim() === '');
    if (field === 'informacoes_documento') setRelatoError(value.trim() === '');

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectSuggestion = (name: string) => {
    const term = name.toUpperCase();
    setFormData(prev => {
      const updatedChildren = [...prev.criancas];
      updatedChildren[0] = { ...updatedChildren[0], nome: term };
      return {
        ...prev,
        crianca_nome: term,
        criancas: updatedChildren
      };
    });
    setShowSuggestions(false);
    setChildNameError(false);
  };

  const getErrorClass = (fieldValue: any) => {
    const isEmpty = fieldValue === undefined || fieldValue === null || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);
    return attemptedSubmit && isEmpty ? 'border-red-600 border-4 bg-red-50 ring-4 ring-red-100' : 'border-slate-200';
  };

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    setAttemptedSubmit(true);
    
    // DIRETRIZ 95.2: Trava de Sistema - Nome da Criança Obrigatório com Alerta Específico
    if (!formData.crianca_nome.trim()) {
       setChildNameError(true);
       alert("⚠️ Erro: É impossível iniciar um atendimento sem identificar a criança ou adolescente beneficiário.");
       return;
    }

    if (!formData.genitora_nome.trim()) { setGenitoraError(true); return; }
    if (!formData.informacoes_documento.trim()) { setRelatoError(true); return; }
    
    const finalData = { 
      ...formData, 
      informacoes_documento: `${formData.tipo_documento} - REF: ${formData.informacoes_documento}`
    };
    onSubmit(finalData, []); 
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        {showMonitoringWarning && (
          <div className="bg-amber-100 border-b-4 border-amber-400 p-8 flex items-start gap-6 animate-in slide-in-from-top duration-500">
             <div className="p-3 bg-amber-500 rounded-2xl shadow-lg"><Megaphone className="w-8 h-8 text-white animate-bounce" /></div>
             <div className="space-y-2">
                <h3 className="text-[16px] font-black text-amber-900 uppercase tracking-tight">INSTRUÇÕES DE MONITORAMENTO ATIVAS</h3>
                <p className="text-[12px] text-amber-800 font-bold uppercase leading-relaxed">🚨 LEITURA OBRIGATÓRIA: Este prontuário possui notas de monitoramento que devem ser revisadas.</p>
             </div>
          </div>
        )}

        <header className="p-10 bg-[#111827] text-white flex justify-between items-center">
          <div>
            <span className="px-3 py-1 bg-blue-600 text-[10px] font-black uppercase rounded-full mb-2 inline-block shadow-lg">SIMCT Hortolândia</span>
            <h2 className="text-[24px] font-black uppercase tracking-tight">Registro de Procedimento</h2>
          </div>
          <button type="button" onClick={onCancel} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          {/* DIRETRIZ 95.2: Identificação da Vítima Mandatória */}
          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Baby className="w-6 h-6 text-blue-600" />
                <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-800">1. Identificação Principal da Vítima (*)</h3>
             </div>
             <div className="relative">
                <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1 mb-2 block">Nome Completo da Criança ou Adolescente *</label>
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input 
                      type="text" 
                      autoComplete="off"
                      className={`w-full p-5 bg-slate-50 border rounded-[1.5rem] text-[15px] font-black uppercase outline-none focus:border-blue-600 transition-all pl-12 ${getErrorClass(formData.crianca_nome)}`} 
                      value={formData.crianca_nome} 
                      onChange={e => handleInputChange('crianca_nome', e.target.value.toUpperCase())} 
                      placeholder="NOME DA VÍTIMA É OBRIGATÓRIO PARA INICIAR O PRONTUÁRIO..." 
                   />
                </div>
                
                {/* DIRETRIZ 95.3: Sugestões de nomes Inteligentes */}
                {showSuggestions && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                     <div className="p-4 bg-blue-50 border-b border-blue-100 text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-3 h-3" /> Registros Similares no Banco SIMCT
                     </div>
                     {nameSuggestions.map((name, i) => (
                       <button 
                         key={i} type="button" 
                         onClick={() => selectSuggestion(name)}
                         className="w-full text-left p-4 hover:bg-slate-50 text-[12px] font-bold uppercase transition-all flex items-center justify-between group border-b last:border-0"
                       >
                         {name} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-600" />
                       </button>
                     ))}
                  </div>
                )}
                {childNameError && <p className="text-[10px] text-red-600 font-black uppercase mt-2 ml-1 flex items-center gap-1 animate-pulse"><AlertCircle className="w-3 h-3" /> Campo Obrigatório: impossível iniciar atendimento sem nome.</p>}
             </div>
          </section>

          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><ClipboardList className="w-6 h-6 text-slate-400" /><h3 className="text-[14px] font-black uppercase tracking-widest text-slate-800">2. Triagem e Documentação</h3></div>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº do Documento / Identificador</label>
                  <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold uppercase outline-none focus:border-blue-500" value={formData.tipo_documento} onChange={e => handleInputChange('tipo_documento', e.target.value.toUpperCase())} placeholder="EX: OFÍCIO 123/2026..." />
                </div>
             </div>
          </section>

          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><UserRound className="w-6 h-6 text-indigo-600" /><h3 className="text-[14px] font-black uppercase tracking-widest text-slate-800">3. Dados do Núcleo Familiar</h3></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">Nome da Genitora / Responsável Principal *</label>
                   <input type="text" className={`w-full p-5 bg-slate-50 border rounded-[1.5rem] text-[13px] font-black uppercase outline-none focus:border-blue-600 ${getErrorClass(formData.genitora_nome)}`} value={formData.genitora_nome} onChange={e => handleInputChange('genitora_nome', e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro de Residência *</label>
                   <select className={`w-full p-5 bg-slate-50 border rounded-[1.5rem] text-[13px] font-black uppercase outline-none focus:border-blue-600 ${getErrorClass(formData.bairro)}`} value={formData.bairro} onChange={e => handleInputChange('bairro', e.target.value)}>
                      <option value="">SELECIONE...</option>
                      {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
                   </select>
                </div>
             </div>
          </section>

          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><FileText className="w-6 h-6 text-amber-600" /><h3 className="text-[14px] font-black uppercase tracking-widest text-slate-800">4. Relato Inicial dos Fatos *</h3></div>
             <textarea 
                className={`w-full p-10 bg-slate-50 border-4 rounded-[3rem] text-[15px] font-medium min-h-[250px] uppercase outline-none focus:border-amber-600 transition-all ${getErrorClass(formData.informacoes_documento)}`} 
                value={formData.informacoes_documento} 
                onChange={e => handleInputChange('informacoes_documento', e.target.value.toUpperCase())} 
                placeholder="DESCREVA DETALHADAMENTE O RELATO APORTADO..." 
             />
             {relatoError && <p className="text-[10px] text-red-600 font-black uppercase ml-4">Campo Obrigatório: o relato dos fatos é essencial para o prontuário.</p>}
          </section>

          <button type="submit" className="w-full py-10 bg-[#111827] text-white rounded-[3rem] font-black uppercase text-[16px] tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-6 active:scale-95">
             <Save className="w-8 h-8" /> [SALVAR] PRONTUÁRIO SIMCT
          </button>
        </form>
      </div>
    </div>
  );
};

export default DocumentRegistration;
