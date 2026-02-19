import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Eye, EyeOff, Clock, UserCheck, Activity, Archive, AlertCircle, AlertTriangle, CheckCircle2, FileText, CalendarDays, X, Trash2, MailWarning, Send, HelpCircle, BellRing, ChevronDown, Check, Zap, Edit2, Users, UserRound, ShieldAlert, ClipboardCheck, ShieldCheck, Scale, RefreshCw, TriangleAlert } from 'lucide-react';
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
    case 'EM_PREENCHIMENTO': return { color: 'bg-slate-400', border: 'border-l-slate-400', icon: <FileText className="w-4 h-4" /> };
    case 'AGUARDANDO_VALIDACAO': return { color: 'bg-[#EF4444]', border: 'border-l-[#EF4444]', icon: <ShieldAlert className="w-4 h-4" /> };
    case 'OFICIALIZADO': return { color: 'bg-emerald-600', border: 'border-l-emerald-600', icon: <ShieldCheck className="w-4 h-4" /> };
    case 'TIPIFICACAO_INCOMPLETA': return { color: 'bg-red-600', border: 'border-l-red-600', icon: <AlertCircle className="w-4 h-4" /> };
    case 'AGUARDANDO_ANALISE': return { color: 'bg-slate-400', border: 'border-l-slate-400', icon: <Clock className="w-4 h-4" /> };
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

  const getDeadlineAlerts = (doc: Documento) => {
    if (!doc.monitoramento?.requisicoes) return null;
    const now = new Date();
    const activeReqs = doc.monitoramento.requisicoes.filter(r => !r.excluidoDoMonitoramento);
    
    let isExpired = false;
    let isUrgent = false;
    let expiredServiceName = '';

    activeReqs.forEach(r => {
      const deadline = new Date(r.dataFinal);
      const diffMs = deadline.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours < 0) {
        isExpired = true;
        expiredServiceName = r.servico;
      } else if (diffHours <= 48) {
        isUrgent = true;
      }
    });

    if (isExpired) return { type: 'EXPIRED', label: `⏰ PRAZO VENCIDO: ${expiredServiceName.toUpperCase()}`, color: 'bg-red-600 animate-pulse' };
    if (isUrgent) return { type: 'URGENT', label: '🟡 PRAZO URGENTE (48H)', color: 'bg-amber-500' };
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563] w-5 h-5" />
            <input type="text" placeholder="BUSCAR NO SIMCT POR CRIANÇA OU MÃE..." className="w-full pl-12 pr-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none font-normal text-[14px] text-[#1F2937] focus:border-[#2563EB] transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <select className="px-6 py-4 bg-white border border-[#E5E7EB] rounded-xl outline-none font-bold text-[12px] uppercase tracking-widest text-[#111827] focus:border-[#2563EB] cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="TODOS">Todos os Status SIMCT</option>
              {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDocs.map(doc => {
          const mainStatus = doc.status[doc.status.length - 1] || 'AGUARDANDO_ANALISE';
          const style = getStatusStyle(mainStatus);
          const refCouncilor = INITIAL_USERS.find(u => u.id === doc.conselheiro_referencia_id);
          const provCouncilor = INITIAL_USERS.find(u => u.id === doc.conselheiro_providencia_id);
          const isReferencia = doc.conselheiro_referencia_id === currentUser.id;
          const isImediataResponsavel = doc.conselheiro_providencia_id === currentUser.id;
          
          const isValidationPending = doc.status.includes('AGUARDANDO_VALIDACAO');
          const isSignaturePendingForMe = doc.medidas_detalhadas?.some(m => m.conselheiros_requeridos.includes(currentUser.nome.toUpperCase()) && !m.confirmacoes.some(c => c.usuario_id === currentUser.id));

          // DIRETRIZ 78: Alerta Pulsante de Soberania Técnica
          const isIncompleteTipification = doc.status.includes('TIPIFICACAO_INCOMPLETA') || doc.status.includes('AGUARDANDO_ANALISE');
          const isCriticalPending = isImediataResponsavel && isIncompleteTipification;
          
          const isRevalidationNeeded = isReferencia && isValidationPending && !isSignaturePendingForMe && !isImediataResponsavel;

          const deadlineAlert = getDeadlineAlerts(doc);

          return (
            <div key={doc.id} onClick={() => onSelectDoc(doc.id)} className={`bg-white rounded-2xl border border-[#E5E7EB] ${style.border} border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden ${isCriticalPending ? 'ring-4 ring-red-500 ring-offset-4 animate-pulse' : ''}`}>
               <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                     <div className="flex flex-wrap items-center gap-2">
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-lg text-white text-[10px] font-black uppercase tracking-widest ${style.color}`}>{style.icon} {STATUS_LABELS[mainStatus]}</span>
                        
                        {deadlineAlert && (
                          <span className={`flex items-center gap-2 px-3 py-1 text-white text-[9px] font-black uppercase tracking-widest rounded-lg ${deadlineAlert.color}`}>
                             <Clock className="w-3.5 h-3.5" /> {deadlineAlert.label}
                          </span>
                        )}

                        {isCriticalPending && (
                          <span className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.1em] rounded-xl animate-bounce shadow-lg">
                             <TriangleAlert className="w-4 h-4 fill-white text-red-600" /> 🚨 VOCÊ É A IMEDIATA: Tipificação Obrigatória Pendente
                          </span>
                        )}

                        {isRevalidationNeeded && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                             <RefreshCw className="w-3.5 h-3.5" /> 🟡 ATENÇÃO: REVALIDAÇÃO
                          </span>
                        )}

                        {isSignaturePendingForMe && isValidationPending && !isCriticalPending && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                             <ClipboardCheck className="w-3.5 h-3.5" /> Assinar SIMCT
                          </span>
                        )}
                        <span className="text-[11px] font-mono font-bold text-[#9CA3AF] uppercase">#{doc.id}</span>
                     </div>
                     <div>
                        <h3 className="text-[18px] font-bold text-[#111827] uppercase group-hover:text-[#2563EB] transition-colors">{doc.crianca_nome || 'NÃO INFORMADO'}</h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                           <div className="flex items-center gap-2 text-[12px] text-[#4B5563] font-medium uppercase"><UserRound className="w-3.5 h-3.5 text-[#9CA3AF]" /> MÃE: <span className="font-bold text-[#1F2937]">{doc.genitora_nome}</span></div>
                           <div className="flex items-center gap-2 text-[12px] text-[#4B5563] font-medium uppercase"><Clock className="w-3.5 h-3.5 text-[#9CA3AF]" /> {new Date(doc.data_recebimento).toLocaleDateString('pt-BR')}</div>
                        </div>
                        {isCriticalPending && (
                          <p className="text-[10px] font-black text-red-600 uppercase mt-3 tracking-widest bg-red-50 p-2 rounded-lg border border-red-100">
                            ⚠️ Bloqueio Institucional: Este caso exige sua análise técnica imediata conforme Art. 131 do ECA.
                          </p>
                        )}
                        {isRevalidationNeeded && (
                          <p className="text-[10px] font-black text-amber-600 uppercase mt-2 tracking-widest">
                            🔄 REVALIDAÇÃO: Este procedimento foi alterado e aguarda sua nova assinatura.
                          </p>
                        )}
                     </div>
                     <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[11px] font-bold text-[#2563EB] uppercase"><UserCheck className="w-3 h-3" /> Titular: {refCouncilor?.nome || 'N/A'}</div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-[11px] font-bold text-amber-600 uppercase"><Zap className="w-3 h-3" /> Providência: {provCouncilor?.nome || 'N/A'}</div>
                     </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                     {isCriticalPending && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSelectDoc(doc.id); }}
                          className="px-6 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.1em] shadow-2xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <Scale className="w-5 h-5" /> [Tipificar Agora]
                        </button>
                     )}
                     {!isReadOnly && <button onClick={(e) => { e.stopPropagation(); onEditDoc(doc.id); }} className="p-3 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-xl hover:bg-[#111827] hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>}
                     <button className="p-3 bg-[#111827] text-white rounded-xl shadow-lg hover:bg-[#2563EB] transition-all"><Eye className="w-4 h-4" /></button>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentList;