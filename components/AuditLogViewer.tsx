
import React, { useState } from 'react';
import { History, Search, User, FileText, Calendar } from 'lucide-react';
import { Log } from '../types';

interface AuditLogViewerProps {
  logs: Log[];
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [filter, setFilter] = useState('');

  const filteredLogs = logs.filter(l => {
    const searchLower = filter.toLowerCase();
    const userName = (l.usuario_nome || '').toLowerCase();
    const action = (l.acao || '').toLowerCase();
    const docId = (l.documento_id || '').toLowerCase();
    
    return userName.includes(searchLower) || 
           action.includes(searchLower) ||
           docId.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563] w-5 h-5" />
          <input 
            type="text" 
            placeholder="FILTRAR POR USUÁRIO, AÇÃO OU ID..." 
            className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none font-medium text-[14px] text-[#1F2937] focus:border-[#2563EB] transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="text-[13px] text-[#4B5563] font-semibold uppercase flex items-center gap-2">
           <History className="w-4 h-4" /> Total de {logs.length} ações registradas
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <h2 className="font-bold text-[#111827] uppercase tracking-tight text-[15px]">Trilha de Auditoria Jurídica</h2>
        </div>
        <div className="p-0">
          <div className="divide-y divide-[#E5E7EB]">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-[#F9FAFB] transition-colors flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded uppercase">
                      <User className="w-3 h-3" /> {log.usuario_nome}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF] font-semibold uppercase tracking-widest flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(log.data_hora).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-[#1F2937] font-semibold text-[14px] uppercase">
                    {log.acao}
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-[#4B5563] font-medium uppercase">
                    <FileText className="w-3 h-3" /> Protocolo: <span className="font-mono text-[#2563EB]">{log.documento_id}</span>
                  </div>
                </div>
                <div className="shrink-0 text-[10px] font-bold text-[#E5E7EB] uppercase tracking-[0.2em] hidden md:block select-none">
                   LOG_ENTRY_VALIDATED
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="p-20 text-center text-[#9CA3AF] uppercase font-semibold text-[14px]">
                Nenhum registro de log encontrado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;
