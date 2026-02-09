
import { 
  Clock, 
  AlertCircle, 
  Search, 
  X,
  Layers,
  ArrowRight,
  ShieldAlert,
  CalendarDays,
  PlusCircle,
  Timer,
  Trash2,
  Calendar,
  UserCheck,
  Building2,
  FileText,
  Save,
  MessageSquare,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { INITIAL_USERS } from '../constants';
import { Documento, MonitoringInfo, User as UserType, RequisicaoServico } from '../types';

interface MonitoringDashboardProps {
  documents: Documento[];
  currentUser: UserType;
  effectiveUserId: string;
  onSelectDoc: (id: string) => void;
  onRemoveMonitoring: (id: string) => void;
  onUpdateMonitoring: (id: string, monitoring: MonitoringInfo) => void;
  isReadOnly?: boolean;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ 
  documents, 
  currentUser, 
  effectiveUserId,
  onSelectDoc, 
  onUpdateMonitoring,
  onRemoveMonitoring,
  isReadOnly
}) => {
  const [filters, setFilters] = useState({ termo: '' });
  const [extendingDoc, setExtendingDoc] = useState<Documento | null>(null);
  const [extendingReq, setExtendingReq] = useState<{ docId: string, req: RequisicaoServico } | null>(null);
  const [docToConfirmDelete, setDocToConfirmDelete] = useState<Documento | null>(null);
  const [extForm, setExtForm] = useState({ nova_data: '', justificativa: '' });
  const [collapsedDocs, setCollapsedDocs] = useState<Set<string>>(new Set());

  const filteredMonitoringDocs = useMemo(() => {
    return documents.filter(d => {
      // Regra: Somente com monitoramento ativo e não concluído.
      // E deve ser o Conselheiro de Referência do caso.
      if (!d.monitoramento || d.monitoramento.concluido || d.conselheiro_referencia_id !== currentUser.id) return false;
      
      const termo = filters.termo.toUpperCase();
      const matchTermo = !termo || 
                         d.crianca_nome.toUpperCase().includes(termo) || 
                         d.genitora_nome.toUpperCase().includes(termo);
      
      return matchTermo;
    });
  }, [documents, filters, currentUser]);

  const toggleVisibility = (docId: string) => {
    setCollapsedDocs(prev => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const getThermometerData = (prazo: string) => {
    if (!prazo) return { bg: 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB]', text: 'SEM PRAZO', color: 'slate' };
    const today = new Date(); today.setHours(0,0,0,0);
    const deadline = new Date(prazo); deadline.setHours(0,0,0,0);
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { bg: 'bg-red-50 text-red-700 border-red-200', text: 'VENCIDO', color: 'red' };
    if (diff <= 5) return { bg: 'bg-orange-50 text-orange-700 border-orange-200', text: 'URGENTE', color: 'orange' };
    return { bg: 'bg-green-50 text-green-700 border-green-200', text: 'EM DIA', color: 'green' };
  };

  const handleExtendDeadline = () => {
    if (!extendingDoc || !extForm.nova_data || !extForm.justificativa) return;

    const currentMonitoring = extendingDoc.monitoramento!;
    const newHistory = [
      ...(currentMonitoring.historicoPrazos || []),
      {
        data_anterior: currentMonitoring.prazoEsperado,
        data_nova: extForm.nova_data,
        justificativa: extForm.justificativa.toUpperCase(),
        usuario_nome: currentUser.nome,
        data_registro: new Date().toISOString()
      }
    ];

    onUpdateMonitoring(extendingDoc.id, {
      ...currentMonitoring,
      prazoEsperado: extForm.nova_data,
      historicoPrazos: newHistory
    });

    setExtendingDoc(null);
    setExtForm({ nova_data: '', justificativa: '' });
    alert("Prazo estendido e registrado no histórico com sucesso.");
  };

  const handleExtendReqDeadline = () => {
    if (!extendingReq || !extForm.nova_data) return;
    const doc = documents.find(d => d.id === extendingReq.docId);
    if (!doc || !doc.monitoramento) return;

    const requisicoesAtualizadas = doc.monitoramento.requisicoes?.map(r => 
      r.id === extendingReq.req.id ? { ...r, dataFinal: extForm.nova_data } : r
    );

    onUpdateMonitoring(extendingReq.docId, {
      ...doc.monitoramento,
      requisicoes: requisicoesAtualizadas
    });

    setExtendingReq(null);
    setExtForm({ nova_data: '', justificativa: '' });
    alert("Prazo da requisição atualizado com sucesso.");
  };

  const handleRemoveRequisicao = (docId: string, reqId: string) => {
    if (!window.confirm("CONFIRMAÇÃO DE EXCLUSÃO: Tem certeza que deseja excluir esta requisição do monitoramento ativo?")) {
      return;
    }

    const doc = documents.find(d => d.id === docId);
    if (!doc || !doc.monitoramento) return;

    const requisicoesAtualizadas = doc.monitoramento.requisicoes?.map(r => 
      r.id === reqId ? { ...r, excluidoDoMonitoramento: true } : r
    );

    // Se todas as requisições forem excluídas e não houver prazo geral, encerra o monitoramento do doc
    const todasConcluidas = requisicoesAtualizadas?.every(r => r.excluidoDoMonitoramento);
    const semPrazoGeral = !doc.monitoramento.prazoEsperado;

    onUpdateMonitoring(docId, {
      ...doc.monitoramento,
      requisicoes: requisicoesAtualizadas,
      concluido: todasConcluidas && semPrazoGeral
    });

    alert("Item removido do monitoramento ativo.");
  };

  const handleFinalDeleteConfirm = () => {
    if (docToConfirmDelete) {
      onRemoveMonitoring(docToConfirmDelete.id);
      setDocToConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <div className="bg-[#111827] p-10 rounded-2xl shadow-lg flex items-center gap-6">
        <div className="p-4 bg-[#2563EB] rounded-xl"><Clock className="w-8 h-8 text-white" /></div>
        <div>
          <h2 className="text-[20px] font-bold text-white uppercase tracking-tight">Monitoramento do Conselheiro</h2>
          <p className="text-[13px] text-[#9CA3AF] font-medium uppercase tracking-widest mt-1">Gestão de Requisições e Prazos Administrativos (Art. 136 ECA)</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563] w-5 h-5" />
          <input 
            type="text" 
            placeholder="PESQUISAR NO MONITORAMENTO POR NOME..." 
            className="w-full pl-12 pr-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none font-bold text-[13px] uppercase tracking-wider focus:border-[#2563EB]"
            value={filters.termo}
            onChange={e => setFilters({ termo: e.target.value })}
          />
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-[#F9FAFB] flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-[15px] font-bold text-[#111827] uppercase tracking-widest">Acompanhamentos Ativos</h2>
           </div>
           <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">{filteredMonitoringDocs.length} Casos</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-8 py-5 text-[10px] font-black text-[#4B5563] uppercase tracking-widest">Situação</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#4B5563] uppercase tracking-widest">Genitora / Criança</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#4B5563] uppercase tracking-widest">Requisições Art. 136 III a</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#4B5563] uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredMonitoringDocs.map(doc => {
                const monitoring = doc.monitoramento!;
                const activeRequisicoes = (monitoring.requisicoes || []).filter(r => !r.excluidoDoMonitoramento);
                const isHidden = collapsedDocs.has(doc.id);
                
                // Alerta Geral do Prazo Master
                const masterThermometer = getThermometerData(monitoring.prazoEsperado);
                const hasExpiredReq = activeRequisicoes.some(r => getThermometerData(r.dataFinal).color === 'red');
                const hasUrgentReq = activeRequisicoes.some(r => getThermometerData(r.dataFinal).color === 'orange');

                return (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        {monitoring.prazoEsperado && (
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border w-fit ${masterThermometer.bg}`}>
                            {masterThermometer.text} (GERAL)
                          </span>
                        )}
                        {hasExpiredReq && (
                          <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase border w-fit bg-red-600 text-white animate-pulse flex items-center gap-1">
                            <Bell className="w-3 h-3" /> REQUISIÇÃO VENCIDA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[14px] font-bold text-[#111827] uppercase leading-tight">{doc.crianca_nome}</div>
                      <div className="text-[11px] text-[#4B5563] font-medium uppercase mt-1 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Genitora: {doc.genitora_nome}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={() => toggleVisibility(doc.id)}
                          className="flex items-center gap-2 text-[10px] font-black text-[#2563EB] uppercase hover:underline w-fit"
                        >
                          {isHidden ? <><Eye className="w-3.5 h-3.5" /> Mostrar Serviços ({activeRequisicoes.length})</> : <><EyeOff className="w-3.5 h-3.5" /> Ocultar Serviços</>}
                        </button>

                        {!isHidden && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                            {activeRequisicoes.map((req) => {
                              const therm = getThermometerData(req.dataFinal);
                              return (
                                <div key={req.id} className={`p-3 rounded-xl border flex flex-col gap-2 relative group/req ${therm.bg}`}>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="text-[9px] font-black uppercase opacity-60 tracking-widest">{req.area}</div>
                                      <div className="text-[11px] font-bold uppercase">{req.servico}</div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/req:opacity-100 transition-all">
                                      <button 
                                        onClick={() => {
                                          setExtendingReq({ docId: doc.id, req });
                                          setExtForm({ ...extForm, nova_data: req.dataFinal });
                                        }}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                        title="Prorrogar Prazo"
                                      >
                                        <Timer className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleRemoveRequisicao(doc.id, req.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                        title="Excluir do Monitoramento"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 pt-1 border-t border-black/5">
                                    <span className="text-[10px] font-black uppercase flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {req.prazoDias} dias
                                    </span>
                                    <span className="text-[10px] font-black uppercase flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Vence: {new Date(req.dataFinal).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {activeRequisicoes.length === 0 && !isHidden && (
                          <span className="text-[10px] text-slate-400 font-bold uppercase italic">Nenhuma requisição pendente.</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {monitoring.prazoEsperado && (
                          <button 
                            onClick={() => setExtendingDoc(doc)}
                            className="p-2.5 bg-blue-50 text-[#2563EB] rounded-lg hover:bg-[#2563EB] hover:text-white transition-all shadow-sm"
                            title="Estender Prazo de Acompanhamento Geral"
                          >
                            <Timer className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => onSelectDoc(doc.id)} 
                          className="p-2.5 bg-[#111827] text-white rounded-lg hover:bg-[#2563EB] transition-all shadow-sm"
                          title="Acessar Prontuário Completo"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {!isReadOnly && (
                          <button 
                            onClick={() => setDocToConfirmDelete(doc)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Remover do Monitoramento Ativo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredMonitoringDocs.length === 0 && (
          <div className="py-20 text-center text-[#9CA3AF] uppercase font-black text-[12px] bg-slate-50/50">
             Nenhum acompanhamento pendente no monitoramento.
          </div>
        )}
      </section>

      {/* Modal de Confirmação de Exclusão de Monitoramento com Imagem */}
      {docToConfirmDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-[#E5E7EB] animate-in zoom-in-95 flex flex-col">
              <div className="h-48 w-full bg-red-50 flex items-center justify-center relative overflow-hidden">
                {/* Imagem de Alerta Institucional */}
                <img 
                  src="https://images.unsplash.com/photo-1590212151175-e58edd96185b?q=80&w=1000&auto=format&fit=crop" 
                  alt="Aviso de Segurança" 
                  className="w-full h-full object-cover opacity-20 absolute inset-0"
                />
                <div className="relative z-10 p-4 bg-white/90 rounded-2xl shadow-xl border border-red-100 flex flex-col items-center">
                   <AlertTriangle className="w-12 h-12 text-red-600 mb-2" />
                   <span className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em]">Ação de Alta Relevância</span>
                </div>
              </div>

              <div className="p-10 space-y-6">
                 <div className="text-center space-y-2">
                    <h3 className="text-[20px] font-bold text-[#111827] uppercase tracking-tight">Confirmar Encerramento?</h3>
                    <p className="text-[12px] text-[#4B5563] font-medium uppercase leading-relaxed">
                       Você está removendo o caso de <span className="font-bold text-[#111827]">{docToConfirmDelete.crianca_nome}</span> do monitoramento técnico ativo. Esta ação será registrada na trilha de auditoria do SIMCT.
                    </p>
                 </div>

                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
                    <ShieldAlert className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#4B5563] font-bold uppercase leading-tight">
                       O prontuário permanecerá no sistema, mas as requisições pendentes não aparecerão mais em seus alertas de prazo.
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <button 
                      onClick={() => setDocToConfirmDelete(null)}
                      className="py-4 bg-slate-100 text-[#4B5563] rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all"
                    >
                       Manter Ativo
                    </button>
                    <button 
                      onClick={handleFinalDeleteConfirm}
                      className="py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                       <CheckCircle2 className="w-4 h-4" /> Confirmar Exclusão
                    </button>
                 </div>
              </div>
              
              <footer className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Protocolo SICT: {docToConfirmDelete.id}</p>
              </footer>
           </div>
        </div>
      )}

      {/* Modal de Prorrogação de Prazo Geral */}
      {extendingDoc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 border border-[#E5E7EB] animate-in zoom-in-95 space-y-8 relative">
            <button onClick={() => setExtendingDoc(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>
            
            <header className="space-y-2">
               <div className="w-16 h-16 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mb-6">
                 <Timer className="w-8 h-8" />
               </div>
               <h3 className="text-[20px] font-bold text-[#111827] uppercase tracking-tight">Estender Acompanhamento</h3>
               <p className="text-[12px] text-[#4B5563] font-bold uppercase tracking-widest">Caso: {extendingDoc.crianca_nome}</p>
            </header>

            <div className="space-y-6">
               <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-900 font-bold uppercase leading-relaxed">
                     O prazo original de {new Date(extendingDoc.monitoramento!.prazoEsperado).toLocaleDateString('pt-BR')} será atualizado e registrado na trilha de auditoria.
                  </p>
               </div>

               <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#4B5563] uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Novo Prazo de Retorno
                  </label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-[14px] font-bold outline-none focus:border-[#2563EB]"
                    value={extForm.nova_data}
                    onChange={e => setExtForm({...extForm, nova_data: e.target.value})}
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#4B5563] uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Justificativa Técnica
                  </label>
                  <textarea 
                    className="w-full p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-[13px] font-bold uppercase outline-none focus:border-[#2563EB] min-h-[100px]"
                    placeholder="DESCREVA O MOTIVO TÉCNICO PARA A PRORROGAÇÃO..."
                    value={extForm.justificativa}
                    onChange={e => setExtForm({...extForm, justificativa: e.target.value})}
                  />
               </div>
            </div>

            <button 
              onClick={handleExtendDeadline}
              disabled={!extForm.nova_data || !extForm.justificativa}
              className="w-full py-5 bg-[#111827] text-white rounded-2xl font-black uppercase text-[13px] tracking-widest shadow-xl hover:bg-[#2563EB] disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              <Save className="w-5 h-5" /> Registrar Prorrogação
            </button>
          </div>
        </div>
      )}

      {/* NOVO: Modal de Prorrogação de Serviço Individual */}
      {extendingReq && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 border border-[#E5E7EB] animate-in zoom-in-95 space-y-8 relative">
            <button onClick={() => setExtendingReq(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>
            
            <header className="space-y-2">
               <div className="w-16 h-16 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mb-6">
                 <Timer className="w-8 h-8" />
               </div>
               <h3 className="text-[20px] font-bold text-[#111827] uppercase tracking-tight">Prorrogar Requisição</h3>
               <p className="text-[12px] text-[#4B5563] font-bold uppercase tracking-widest">{extendingReq.req.servico} ({extendingReq.req.area})</p>
            </header>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#4B5563] uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Novo Prazo de Resposta
                  </label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-[14px] font-bold outline-none focus:border-[#2563EB]"
                    value={extForm.nova_data}
                    onChange={e => setExtForm({...extForm, nova_data: e.target.value})}
                  />
               </div>
            </div>

            <button 
              onClick={handleExtendReqDeadline}
              disabled={!extForm.nova_data}
              className="w-full py-5 bg-[#111827] text-white rounded-2xl font-black uppercase text-[13px] tracking-widest shadow-xl hover:bg-[#2563EB] disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              <Save className="w-5 h-5" /> Atualizar Prazo da Requisição
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;
