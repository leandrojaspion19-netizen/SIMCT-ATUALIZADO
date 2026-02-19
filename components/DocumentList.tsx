
import React, { useState } from 'react';
import { Search, Clock, UserCheck, Activity, CheckCircle2, FileText, ChevronDown, UserRound, ShieldAlert, Scale, TriangleAlert, Ban, Filter, RefreshCw, Building2, Baby, Users, MapPin, Fingerprint, LayoutGrid, Eye } from 'lucide-react';
import { Documento, User as UserType, DocumentStatus } from '../types';
import { STATUS_LABELS, INITIAL_USERS, BAIRROS, REDE_HORTOLANDIA } from '../constants';

const getStatusStyle = (status: DocumentStatus, isImprocedente?: boolean) => {
  if (isImprocedente) return { color: 'bg-slate-400', border: 'border-l-slate-400', icon: <Ban className="w-4 h-4" /> };
  switch (status) {
    case 'NAO_LIDO': return { color: 'bg-[#2563EB]', border: 'border-l-[#2563EB]', icon: <Activity className="w-4 h-4" /> };
    case 'AGUARDANDO_VALIDACAO': return { color: 'bg-[#EF4444]', border: 'border-l-[#EF4444]', icon: <ShieldAlert className="w-4 h-4" /> };
    case 'OFICIALIZADO': return { color: 'bg-emerald-600', border: 'border-l-emerald-600', icon: <CheckCircle2 className="w-4 h-4" /> };
    case 'EM_PREENCHIMENTO': return { color: 'bg-slate-400', border: 'border-l-slate-400', icon: <FileText className="w-4 h-4" /> };
    default: return { color: 'bg-[#9CA3AF]', border: 'border-l-[#9CA3AF]', icon: <Clock className="w-4 h-4" /> };
  }
};

interface DocumentListProps {
  documents: Documento[];
  currentUser: UserType;
  onSelectDoc: (id: string) => void;
  onEditDoc: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onScience: (id: string) => void;
  onUpdateStatus: (id: string, status: DocumentStatus[]) => void;
  isReadOnly?: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, currentUser, onSelectDoc, onEditDoc, isReadOnly }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const initialFilters = {
    term: '', area_servico: '', genitora_nome: '', crianca_nome: '', bairro: '', cpf_term: '', status: '', conselheiro_ref_id: ''
  };
  const [filters, setFilters] = useState(initialFilters);

  const filteredDocs = documents.filter(doc => {
    const matchTerm = !filters.term || 
      doc.crianca_nome.toUpperCase().includes(filters.term.toUpperCase()) || 
      doc.genitora_nome.toUpperCase().includes(filters.term.toUpperCase());
    
    const matchService = !filters.area_servico || 
      doc.monitoramento?.requisicoes?.some(r => r.area === filters.area_servico);
    
    const matchBairro = !filters.bairro || doc.bairro === filters.bairro;
    const matchStatus = !filters.status || doc.status.includes(filters.status as DocumentStatus);
    const matchRef = !filters.conselheiro_ref_id || doc.conselheiro_referencia_id === filters.conselheiro_ref_id;
    
    return matchTerm && matchService && matchBairro && matchStatus && matchRef;
  });

  const clearFilters = () => setFilters(initialFilters);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563] w-5 h-5" />
            <input 
              type="text" 
              placeholder="BUSCA RÁPIDA (CRIANÇA OU MÃE)..." 
              className="w-full pl-12 pr-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none font-bold text-[13px] uppercase focus:border-[#2563EB] transition-all" 
              value={filters.term} 
              onChange={(e) => setFilters({...filters, term: e.target.value})} 
            />
          </div>
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-[12px] uppercase tracking-widest transition-all ${showAdvancedFilters ? 'bg-[#111827] text-white' : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" /> {showAdvancedFilters ? 'Fechar Filtros' : 'Filtros Avançados'}
          </button>
        </div>

        {/* DIRETRIZ 95.1: Motor de filtros padronizado expansível */}
        {showAdvancedFilters && (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Building2 className="w-3 h-3" /> Rede</label>
                   <select className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase" value={filters.area_servico} onChange={e => setFilters({...filters, area_servico: e.target.value})}>
                      <option value="">TODAS</option>
                      {Object.keys(REDE_HORTOLANDIA).map(a => <option key={a} value={a}>{a}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Bairro</label>
                   <select className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase" value={filters.bairro} onChange={e => setFilters({...filters, bairro: e.target.value})}>
                      <option value="">TODOS</option>
                      {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><LayoutGrid className="w-3 h-3" /> Status</label>
                   <select className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                      <option value="">TODOS</option>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Ref.</label>
                   <select className="w-full p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase" value={filters.conselheiro_ref_id} onChange={e => setFilters({...filters, conselheiro_ref_id: e.target.value})}>
                      <option value="">QUALQUER</option>
                      {INITIAL_USERS.filter(u => u.perfil === 'CONSELHEIRO').map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                   </select>
                </div>
             </div>
             <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-black uppercase text-[9px] border border-red-100 hover:bg-red-50 transition-all">
                <RefreshCw className="w-3 h-3" /> Limpar Filtros SIMCT
             </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDocs.map(doc => {
          const mainStatus = doc.status[doc.status.length - 1] || 'AGUARDANDO_ANALISE';
          const style = getStatusStyle(mainStatus, doc.is_improcedente);
          const refCouncilor = INITIAL_USERS.find(u => u.id === doc.conselheiro_referencia_id);
          const confirmacoes = doc.medidas_detalhadas?.[0]?.confirmacoes || [];
          const iValidated = confirmacoes.some(c => c.usuario_id === currentUser.id);
          const totalValidatedCount = confirmacoes.length;
          const trioSize = doc.conselheiros_providencia_nomes?.length || 3;
          const allValidated = totalValidatedCount >= trioSize;
          const isInTrio = doc.conselheiros_providencia_nomes?.includes(currentUser.nome.toUpperCase());

          let dynamicLabel = STATUS_LABELS[mainStatus];
          if (isInTrio && !allValidated) dynamicLabel = iValidated ? "⏳ Aguardando Colegas" : "📋 Pendente de Validação";

          return (
            <div key={doc.id} onClick={() => onSelectDoc(doc.id)} className={`bg-white rounded-2xl border border-[#E5E7EB] ${style.border} border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden`}>
               <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                     <div className="flex flex-wrap items-center gap-2">
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-lg text-white text-[10px] font-black uppercase tracking-widest ${style.color}`}>{style.icon} {dynamicLabel}</span>
                        <span className="text-[11px] font-mono font-bold text-slate-300 uppercase">#{doc.id}</span>
                     </div>
                     <div>
                        <h3 className="text-[17px] font-black text-[#111827] uppercase group-hover:text-[#2563EB] transition-colors">{doc.crianca_nome || 'NÃO INFORMADO'}</h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                           <div className="flex items-center gap-2 text-[11px] text-[#4B5563] font-bold uppercase"><UserRound className="w-3.5 h-3.5" /> MÃE: {doc.genitora_nome}</div>
                           <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-bold uppercase"><MapPin className="w-3.5 h-3.5" /> {doc.bairro}</div>
                        </div>
                     </div>
                     <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-black text-[#2563EB] uppercase"><UserCheck className="w-3 h-3" /> Titular: {refCouncilor?.nome || 'N/A'}</div>
                     </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                     {!isReadOnly && <button onClick={(e) => { e.stopPropagation(); onEditDoc(doc.id); }} className="p-3 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-xl hover:bg-[#111827] hover:text-white transition-all"><FileText className="w-4 h-4" /></button>}
                     <button className="p-3 bg-[#111827] text-white rounded-xl shadow-lg hover:bg-[#2563EB] transition-all"><Eye className="w-4 h-4" /></button>
                  </div>
               </div>
            </div>
          );
        })}
        {filteredDocs.length === 0 && (
          <div className="py-20 text-center bg-white border-4 border-dashed border-slate-100 rounded-[2rem]">
             <Search className="w-12 h-12 text-slate-100 mx-auto mb-4" />
             <p className="text-[13px] font-black text-slate-300 uppercase tracking-widest">Nenhum procedimento localizado com os filtros ativos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
