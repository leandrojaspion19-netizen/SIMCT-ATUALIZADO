
import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Eye, EyeOff, Clock, UserCheck, Activity, Archive, AlertCircle, AlertTriangle, CheckCircle2, FileText, CalendarDays, X, Trash2, MailWarning, Send, HelpCircle, BellRing, ChevronDown, Check, Zap, Edit2, Users, UserRound, ShieldAlert, ClipboardCheck } from 'lucide-react';
import { Documento, User as UserType, DocumentStatus } from '../types';
import { STATUS_LABELS, INITIAL_USERS } from '../constants';

const getStatusStyle = (status: DocumentStatus) => {
  switch (status) {
    case 'NAO_LIDO': return { color: 'bg-[#2563EB]', border: 'border-l-[#2563EB]', icon: <BellRing className="w-4 h-4" /> };
    case 'NOTIFICACAO': return { color: 'bg-[#EA580C]', border: 'border-l-[#EA580C]', icon: <MailWarning className="w-4 h-4" /> };
    case 'NOTIFICACAO_REFERENCIA': return { color: 'bg-[#EA580C]', border: 'border-l-[#EA580C]', icon: <UserCheck className="w-4 h-4" /> };
    case 'NOTICIA_FATO_ENCAMINHADA': return { color: 'bg-[#4F46E5]', border: 'border-l-[#4F46E5]', icon: <FileText className="w-4 h-4" /> };
    case 'AGUARDANDO_RESPOSTA': return { color: 'bg-[#D97706]', border: 'border-l-[#D97706]', icon: <Clock className="w-4 h-4" /> };
    case 'RESPONDER_OFICIO': return { color: 'bg-[#DC2626]', border: 'border-l-[#DC2626]', icon: <AlertTriangle className="w-4 h-4" /> };
    case 'OFICIO_RESPONDIDO': return { color: 'bg-[#059669]', border: 'border-l-[#059669]', icon: <CheckCircle2 className="w-4 h-4" /> };
    case 'SOLICITACAO_REDE': return { color: 'bg-[#4F46E5]', border: 'border-l-[#4F46E5]', icon: <HelpCircle className="w-4 h-4" /> };
    case 'RESPOSTA_ENVIADA': return { color: 'bg-[#059669]', border: 'border-l-[#059669]', icon: <Send className="w-4 h-4" /> };
    case 'ARQUIVADO': return { color: 'bg-[#4B5563]', border: 'border-l-[#4B5563]', icon: <Archive className="w-4 h-4" /> };
    case 'MONITORAMENTO': return { color: 'bg-[#8B5CF6]', border: 'border-l-[#8B5CF6]', icon: <Activity className="w-4 h-4" /> };
    case 'SOLICITAR_REUNIAO_REDE': return { color: 'bg-[#7C3AED]', border: 'border-l-[#7C3AED]', icon: <Users className="w-4 h-4" /> };
    case 'EMAIL_ENCAMINHADO': return { color: 'bg-[#0EA5E9]', border: 'border-l-[#0EA5E9]', icon: <Send className="w-4 h-4" /> };
    case 'AGUARDANDO_VALIDACAO': return { color: 'bg-[#EF4444]', border: 'border-l-[#EF4444]', icon: <ShieldAlert className="w-4 h-4" /> };
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

const DocumentList: React.FC<DocumentListProps> = ({ documents, currentUser, onSelectDoc, onEditDoc, onDeleteDoc, isReadOnly }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  const filteredDocs = documents.filter(doc => {
    const searchLower = searchTerm.toLowerCase();
    const criancaNome = (doc.crianca_nome || '').toLowerCase();
    const genitoraNome = (doc.genitora_nome || '').toLowerCase();
    const matchesSearch = criancaNome.includes(searchLower) || genitoraNome.includes(searchLower);
    const matchesStatus = statusFilter === 'TODOS' || (doc.status && doc.status.includes(statusFilter as DocumentStatus));
    return searchLower ? matchesSearch : matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563] w-5 h-5" />
            <input 
              type="text" 
              placeholder="BUSCAR POR CRIANÇA OU MÃE..." 
              className="w-full pl-12 pr-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none font-normal text-[14px] text-[#1F2937] focus:border-[#2563EB] transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex items-center gap-3">
            <select 
              className="px-6 py-4 bg-white border border-[#E5E7EB] rounded-xl outline-none font-bold text-[12px] uppercase tracking-widest text-[#111827] focus:border-[#2563EB] cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="TODOS">Todos os Status</option>
              {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDocs.map(doc => {
          const mainStatus = doc.status[doc.status.length - 1] || 'NAO_LIDO';
          const style = getStatusStyle(mainStatus);
          const refCouncilor = INITIAL_USERS.find(u => u.id === doc.conselheiro_referencia_id);
          const provCouncilor = INITIAL_USERS.find(u => u.id === doc.conselheiro_providencia_id);
          
          const isReferencia = doc.conselheiro_referencia_id === currentUser.id;
          const isValidationPending = doc.status.includes('AGUARDANDO_VALIDACAO');
          const isSignaturePending = doc.medidas_detalhadas?.some(m => m.conselheiros_requeridos.includes(currentUser.nome.toUpperCase()) && !m.confirmacoes.some(c => c.usuario_id === currentUser.id));

          return (
            <div key={doc.id} onClick={() => onSelectDoc(doc.id)} className={`bg-white rounded-2xl border border-[#E5E7EB] ${style.border} border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden`}>
               <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                     <div className="flex flex-wrap items-center gap-2">
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-lg text-white text-[10px] font-black uppercase tracking-widest ${style.color}`}>
                           {style.icon} {STATUS_LABELS[mainStatus]}
                        </span>
                        {isValidationPending && isReferencia && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5" /> Validar Providência
                          </span>
                        )}
                        {isSignaturePending && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg animate-pulse">
                            <ClipboardCheck className="w-3.5 h-3.5" /> Assinar Medidas
                          </span>
                        )}
                        <span className="text-[11px] font-mono font-bold text-[#9CA3AF] uppercase">#{doc.id}</span>
                     </div>
                     
                     <div>
                        <h3 className="text-[18px] font-bold text-[#111827] uppercase leading-tight group-hover:text-[#2563EB] transition-colors">{doc.crianca_nome || 'NÃO INFORMADO'}</h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                           <div className="flex items-center gap-2 text-[12px] text-[#4B5563] font-medium uppercase"><UserRound className="w-3.5 h-3.5 text-[#9CA3AF]" /> MÃE: <span className="font-bold text-[#1F2937]">{doc.genitora_nome}</span></div>
                           <div className="flex items-center gap-2 text-[12px] text-[#4B5563] font-medium uppercase"><Clock className="w-3.5 h-3.5 text-[#9CA3AF]" /> {new Date(doc.data_recebimento).toLocaleDateString('pt-BR')}</div>
                        </div>

                        {/* BLOCO CONTEXTUAL PARA ASSINATURA PENDENTE */}
                        {isSignaturePending && (
                          <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-amber-700 uppercase tracking-widest">
                              <AlertCircle className="w-3.5 h-3.5" /> Requer sua assinatura técnica
                            </div>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase mr-1">Violações:</span>
                                {doc.violacoesSipia.map((v, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-white border border-blue-100 text-blue-700 text-[9px] font-bold rounded uppercase">
                                    {v.especifico}
                                  </span>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase mr-1">Agentes:</span>
                                {doc.agentesVioladores.map((a, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-white border border-amber-100 text-amber-700 text-[9px] font-bold rounded uppercase">
                                    {a.principal}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                     </div>

                     <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[11px] font-bold text-[#2563EB] uppercase">
                           <UserCheck className="w-3 h-3" /> Titular: {refCouncilor?.nome || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-[11px] font-bold text-amber-600 uppercase">
                           <Zap className="w-3 h-3" /> Providência: {provCouncilor?.nome || 'N/A'}
                        </div>
                     </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2">
                     {!isReadOnly && <button onClick={(e) => { e.stopPropagation(); onEditDoc(doc.id); }} className="p-3 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-xl hover:bg-[#111827] hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>}
                     <button className="p-3 bg-[#111827] text-white rounded-xl shadow-lg hover:bg-[#2563EB] transition-all"><Eye className="w-4 h-4" /></button>
                  </div>
               </div>
            </div>
          );
        })}
        {filteredDocs.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB]">
            <X className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
            <p className="text-[14px] font-bold text-[#9CA3AF] uppercase">Nenhum protocolo localizado com os filtros atuais.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
