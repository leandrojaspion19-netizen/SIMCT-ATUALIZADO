import React, { useState, useEffect } from 'react';
import { X, Save, Clock, ShieldCheck, Database, FileText, UserRound, Baby, MapPin } from 'lucide-react';
import { Documento, User, ChildData } from './types';
// Fix: CANAIS_COMUNICACAO does not exist in constants.tsx. Using CANAIS_COMUNICADO_LIST instead.
import { BAIRROS, INITIAL_USERS, classifyTurno, CANAIS_COMUNICADO_LIST, UNIFIED_GENDER_OPTIONS } from './constants';

interface DocumentRegistrationProps {
  documents: Documento[];
  currentUser: User;
  onSubmit: (data: any, files: File[]) => void;
  onCancel: () => void;
}

const DocumentRegistration: React.FC<DocumentRegistrationProps> = ({ currentUser, onSubmit, onCancel }) => {
  const isAdminGroup = ['EDSON', 'FATIMA', 'LUIZ'].includes(currentUser.nome.toUpperCase());
  
  const [formData, setFormData] = useState({
    origem: '', canal_comunicado: '', tipo_documento: '',
    data_rece_bimento: new Date().toISOString().split('T')[0],
    hora_rece_bimento: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}),
    genitora_nome: '', bairro: '', crianca_nome: '',
    criancas: [{ nome: '', data_nascimento: '', genero_identidade: '' }] as ChildData[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // DIRETRIZ 20/33: Bypass ADM
    if (!formData.genitora_nome || !formData.tipo_documento) {
      alert("CAMPOS OBRIGATÓRIOS: Nome da Família e Tipo de Documento.");
      return;
    }

    const finalData = {
      ...formData,
      informacoes_documento: `${formData.tipo_documento} - INICIAL`,
      periodo_rece_bimento: classifyTurno(formData.data_rece_bimento, formData.hora_rece_bimento),
      status: ['AGUARDANDO_ANALISE']
    };

    onSubmit(finalData, []);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <header className="p-10 bg-[#111827] text-white flex justify-between items-center">
          <div>
            <span className="px-3 py-1 bg-blue-600 text-[10px] font-black uppercase rounded-full mb-2 inline-block">SIMCT ETAPA 1</span>
            <h2 className="text-[24px] font-black uppercase">Novo Procedimento</h2>
          </div>
          <button type="button" onClick={onCancel} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Nome da Família / Criança *</label>
                 <input type="text" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase outline-none focus:border-blue-500" value={formData.genitora_nome} onChange={e => setFormData({...formData, genitora_nome: e.target.value.toUpperCase(), crianca_nome: e.target.value.toUpperCase()})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Tipo de Documento / Origem *</label>
                 <input type="text" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase outline-none focus:border-blue-500" value={formData.tipo_documento} onChange={e => setFormData({...formData, tipo_documento: e.target.value.toUpperCase()})} />
              </div>
           </div>

           <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Data do Aporte</label>
                 <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.data_rece_bimento} onChange={e => setFormData({...formData, data_rece_bimento: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Hora do Aporte</label>
                 <input type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.hora_rece_bimento} onChange={e => setFormData({...formData, hora_rece_bimento: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Bairro</label>
                 <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})}>
                    <option value="">SELECIONE...</option>
                    {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
                 </select>
              </div>
           </div>

           <button type="submit" className="w-full py-8 bg-[#111827] text-white rounded-[2rem] font-black uppercase text-[15px] tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4">
              <Save className="w-6 h-6" /> [Salvar Prontuário e Monitoramento]
           </button>
        </form>
      </div>
    </div>
  );
};

export default DocumentRegistration;