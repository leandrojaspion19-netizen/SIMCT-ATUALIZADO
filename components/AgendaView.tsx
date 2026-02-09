
import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trash2, 
  X,
  AlertCircle
} from 'lucide-react';
import { AgendaEntry, User } from '../types';
import { INITIAL_USERS } from '../constants';

interface AgendaViewProps {
  agenda: AgendaEntry[];
  setAgenda: React.Dispatch<React.SetStateAction<AgendaEntry[]>>;
  currentUser: User;
  effectiveUserId: string;
  isReadOnly?: boolean;
}

const AgendaView: React.FC<AgendaViewProps> = ({ agenda, setAgenda, currentUser, effectiveUserId, isReadOnly }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  // Consideramos ADMIN como gestores de agenda
  const isAdmin = currentUser.perfil === 'ADMIN';
  const councilors = INITIAL_USERS.filter(u => u.perfil === 'CONSELHEIRO');
  
  const [newEntry, setNewEntry] = useState<Omit<AgendaEntry, 'id'>>({
    conselheiro_id: isAdmin ? '' : effectiveUserId,
    data: todayStr,
    hora: '09:00',
    local: '',
    participantes: '',
    descricao: '',
    tipo: 'REUNIAO'
  });

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.conselheiro_id) {
      alert("ERRO: Selecione um conselheiro para este compromisso.");
      return;
    }

    // BLOQUEIO DE AGENDAMENTO RETROATIVO (DATA E HORA)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDay = String(now.getDate()).padStart(2, '0');
    const todayStrLocal = `${currentYear}-${currentMonth}-${currentDay}`;
    const currentTimeStrLocal = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    if (newEntry.data < todayStrLocal) {
      alert("ERRO DE SEGURANÇA: Não é permitido realizar agendamentos em datas retroativas.");
      return;
    }

    if (newEntry.data === todayStrLocal && newEntry.hora < currentTimeStrLocal) {
      alert("ERRO DE SEGURANÇA: O horário selecionado já passou. Não é permitido agendamento retroativo para o dia de hoje.");
      return;
    }

    // REGRA DE INTELIGÊNCIA: Intervalo mínimo de 30 minutos
    const hasConflict = agenda.some(entry => {
      if (entry.conselheiro_id !== newEntry.conselheiro_id || entry.data !== newEntry.data) return false;
      
      const [h1, m1] = entry.hora.split(':').map(Number);
      const [h2, m2] = newEntry.hora.split(':').map(Number);
      
      const totalMinutes1 = h1 * 60 + m1;
      const totalMinutes2 = h2 * 60 + m2;
      
      return Math.abs(totalMinutes1 - totalMinutes2) < 30;
    });

    if (hasConflict) {
      alert("CONFLITO DE AGENDA: Já existe um compromisso agendado para este conselheiro em um intervalo inferior a 30 minutos neste mesmo dia.");
      return;
    }

    const entry: AgendaEntry = { ...newEntry, id: `agenda-${Date.now()}` };
    setAgenda(prev => [...prev, entry]);
    setShowAddModal(false);
    
    // Reset form
    setNewEntry({
      conselheiro_id: isAdmin ? '' : effectiveUserId,
      data: todayStr,
      hora: '09:00',
      local: '',
      participantes: '',
      descricao: '',
      tipo: 'REUNIAO'
    });
  };

  const visibleEvents = agenda
    .filter(a => isAdmin ? true : a.conselheiro_id === effectiveUserId)
    .sort((a, b) => {
      const dateCompare = new Date(a.data).getTime() - new Date(b.data).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.hora.localeCompare(b.hora);
    });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl border shadow-sm">
        <h2 className="text-xl font-bold uppercase tracking-tight">Agenda do Conselho</h2>
        {!isReadOnly && (
          <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-bold uppercase text-xs flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Compromisso
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {visibleEvents.map((item) => {
          const assignedUser = INITIAL_USERS.find(u => u.id === item.conselheiro_id);
          return (
            <div key={item.id} className="bg-white p-6 rounded-2xl border flex gap-6 shadow-sm group">
               <div className="w-24 shrink-0 flex flex-col items-center justify-center bg-slate-50 rounded-xl">
                  <span className="text-2xl font-bold">{new Date(item.data + 'T12:00:00').getDate()}</span>
                  <span className="text-[10px] font-black uppercase">{new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' })}</span>
               </div>
               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase">{item.tipo}</span>
                    <div className="text-[12px] font-bold text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.hora}</div>
                    {isAdmin && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase border border-blue-100">
                        Agenda de: {assignedUser?.nome || 'N/A'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 uppercase">{item.descricao}</h3>
                  <div className="text-xs text-slate-500 uppercase mt-2 flex gap-4">
                     <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.local}</div>
                     <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {item.participantes}</div>
                  </div>
               </div>
               {!isReadOnly && (
                 <button onClick={() => setAgenda(prev => prev.filter(a => a.id !== item.id))} className="text-slate-200 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-5 h-5" /></button>
               )}
            </div>
          );
        })}
        {visibleEvents.length === 0 && (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB]">
            <Calendar className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
            <p className="text-[14px] font-bold text-[#9CA3AF] uppercase">Nenhum compromisso localizado na agenda.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden">
            <header className="p-6 bg-slate-900 text-white flex justify-between items-center">
               <h3 className="font-bold uppercase tracking-widest text-sm">Novo Compromisso</h3>
               <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </header>
            <form onSubmit={handleAddEntry} className="p-8 space-y-4">
               {isAdmin && (
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conselheiro Destinatário</label>
                   <select 
                      required 
                      className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-xs uppercase outline-none focus:border-blue-500"
                      value={newEntry.conselheiro_id}
                      onChange={e => setNewEntry({...newEntry, conselheiro_id: e.target.value})}
                   >
                     <option value="">Selecione o Conselheiro...</option>
                     {councilors.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                   </select>
                 </div>
               )}
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data do Evento</label>
                 <input required type="date" className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-sm uppercase outline-none focus:border-blue-500" value={newEntry.data} onChange={e => setNewEntry({...newEntry, data: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                 <input required type="time" className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-sm outline-none focus:border-blue-500" value={newEntry.hora} onChange={e => setNewEntry({...newEntry, hora: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Local</label>
                 <input required placeholder="LOCAL" className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-xs uppercase outline-none focus:border-blue-500" value={newEntry.local} onChange={e => setNewEntry({...newEntry, local: e.target.value.toUpperCase()})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assunto / Descrição</label>
                 <input required placeholder="DESCRIÇÃO" className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-xs uppercase outline-none focus:border-blue-500" value={newEntry.descricao} onChange={e => setNewEntry({...newEntry, descricao: e.target.value.toUpperCase()})} />
               </div>
               <button type="submit" className="w-full py-5 bg-[#2563EB] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 mt-4">Salvar Agendamento</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaView;
