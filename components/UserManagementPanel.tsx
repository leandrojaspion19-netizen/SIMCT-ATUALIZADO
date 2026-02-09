
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  Search, 
  MoreVertical, 
  Lock, 
  Unlock,
  Activity,
  UserCog,
  Key,
  Repeat,
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { User, UserStatus, UserRole } from '../types';
import { UserWithPassword } from '../constants';

interface UserManagementPanelProps {
  users: UserWithPassword[];
  onUpdateUser: (userId: string, updates: Partial<UserWithPassword>) => void;
  onAddLog: (action: string) => void;
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ users, onUpdateUser, onAddLog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [substitutionModal, setSubstitutionModal] = useState<User | null>(null);
  const [subForm, setSubForm] = useState({
    substituindo_id: '',
    data_inicio_substituicao: new Date().toISOString().split('T')[0],
    data_fim_prevista: '',
    motivo: 'FÉRIAS/LICENÇA'
  });

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const nome = (u.nome || '').toLowerCase();
    const cargo = (u.cargo || '').toLowerCase();
    return nome.includes(term) || cargo.includes(term);
  });

  const titularCouncilors = users.filter(u => u.perfil === 'CONSELHEIRO');

  const handleStatusChange = (userId: string, nome: string, currentStatus: UserStatus) => {
    let nextStatus: UserStatus = 'ATIVO';
    let actionLabel = '';

    if (currentStatus === 'ATIVO') {
      nextStatus = 'BLOQUEADO';
      actionLabel = 'BLOQUEADO';
    } else {
      nextStatus = 'ATIVO';
      actionLabel = 'REATIVADO';
    }

    onUpdateUser(userId, { status: nextStatus, tentativas_login: 0 });
    onAddLog(`Usuário ${nome} foi ${actionLabel} pela administração.`);
  };

  const handleResetPassword = (userId: string, nome: string) => {
    if (window.confirm(`SICT: Confirmar redefinição de senha para o usuário ${nome}? A nova senha será o padrão institucional: 123456`)) {
      onUpdateUser(userId, { senha: '123456', tentativas_login: 0, status: 'ATIVO' });
      onAddLog(`A senha do usuário ${nome} foi redefinida para o padrão 123456 pela administração.`);
      alert(`Senha de ${nome} redefinida com sucesso para o padrão: 123456`);
    }
  };

  const handleSaveSubstitution = () => {
    if (!substitutionModal) return;
    if (!subForm.substituindo_id) {
       alert("ERRO: Selecione o Conselheiro Titular que será substituído.");
       return;
    }

    const titular = users.find(u => u.id === subForm.substituindo_id);

    onUpdateUser(substitutionModal.id, {
       substituicao_ativa: true,
       substituindo_id: subForm.substituindo_id,
       data_inicio_substituicao: subForm.data_inicio_substituicao,
       data_fim_prevista: subForm.data_fim_prevista,
       status: 'ATIVO'
    });

    onAddLog(`Substituição ativada: Suplente ${substitutionModal.nome} agora atua no perfil de ${titular?.nome}.`);
    setSubstitutionModal(null);
    alert("Substituição ativada com sucesso. O sistema agora espelha o perfil do titular para a suplente.");
  };

  const handleEndSubstitution = (user: User) => {
    if (window.confirm(`Encerrar substituição para ${user.nome}? O acesso ao perfil do titular será revogado.`)) {
       onUpdateUser(user.id, {
          substituicao_ativa: false,
          substituindo_id: '',
          data_inicio_substituicao: '',
          data_fim_prevista: '',
          status: 'INATIVO'
       });
       onAddLog(`Substituição encerrada para ${user.nome}. O titular substituído reassume os processos.`);
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.perfil === 'SUPLENTE' && user.substituicao_ativa) {
       return <span className="px-3 py-1 bg-blue-100 text-[#2563EB] text-[11px] font-bold rounded-lg uppercase border border-blue-200 flex items-center gap-1"><Repeat className="w-3 h-3" /> Substituição</span>;
    }
    switch (user.status) {
      case 'BLOQUEADO': return <span className="px-3 py-1 bg-red-50 text-red-700 text-[11px] font-bold rounded-lg uppercase border border-red-100">Bloqueado</span>;
      case 'INATIVO': return <span className="px-3 py-1 bg-[#F9FAFB] text-[#4B5563] text-[11px] font-bold rounded-lg uppercase border border-[#E5E7EB]">Inativo</span>;
      default: return <span className="px-3 py-1 bg-green-50 text-[#059669] text-[11px] font-bold rounded-lg uppercase border border-green-100">Ativo</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <div className="bg-[#111827] p-10 rounded-2xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-[#2563EB] rounded-xl shadow-xl">
            <UserCog className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-white uppercase tracking-tight">Painel Administrativo de RH</h2>
            <p className="text-[13px] text-[#9CA3AF] font-medium uppercase tracking-widest mt-2">Controle de Usuários e Segurança do Sistema</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563] w-5 h-5" />
          <input 
            type="text" 
            placeholder="BUSCAR USUÁRIO POR NOME OU CARGO..." 
            className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none font-medium text-[#1F2937] text-[14px] uppercase focus:border-[#2563EB] transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-8 py-5 text-[11px] font-bold text-[#4B5563] uppercase tracking-widest">Usuário</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#4B5563] uppercase tracking-widest">Perfil de Acesso</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#4B5563] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#4B5563] uppercase tracking-widest text-right">Controle Administrativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-center font-bold text-[#9CA3AF] text-[13px] uppercase">
                        {(user.nome || '??').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-[#111827] text-[14px] uppercase">{user.nome}</div>
                        <div className="text-[12px] text-[#4B5563] font-medium uppercase">{user.cargo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[12px] font-bold text-[#4B5563] uppercase">{user.perfil}</div>
                  </td>
                  <td className="px-8 py-6">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.perfil === 'SUPLENTE' && (
                        user.substituicao_ativa ? (
                          <button 
                            onClick={() => handleEndSubstitution(user)}
                            className="p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                            title="Encerrar Substituição"
                          >
                            <Repeat className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase">Finalizar</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                               setSubstitutionModal(user);
                               setSubForm({...subForm, substituindo_id: ''});
                            }}
                            className="p-2.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-all flex items-center gap-2"
                            title="Ativar Substituição"
                          >
                            <Repeat className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase">Substituir</span>
                          </button>
                        )
                      )}
                      
                      <button 
                        onClick={() => handleResetPassword(user.id, user.nome)}
                        className="p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] text-[#4B5563] rounded-lg hover:bg-[#111827] hover:text-white transition-all shadow-sm"
                        title="Redefinir Senha"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(user.id, user.nome, user.status || 'ATIVO')}
                        className={`p-2.5 rounded-lg transition-all ${user.status === 'BLOQUEADO' ? 'bg-green-50 text-[#059669] hover:bg-[#059669] hover:text-white' : 'bg-red-50 text-red-700 hover:bg-red-700 hover:text-white'}`}
                      >
                        {user.status === 'BLOQUEADO' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Substituição */}
      {substitutionModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-10 border border-[#E5E7EB] animate-in zoom-in-95 space-y-8 relative">
              <button onClick={() => setSubstitutionModal(null)} className="absolute top-6 right-6 p-2 text-[#4B5563] hover:bg-slate-50 rounded-lg"><X className="w-6 h-6"/></button>
              
              <header className="space-y-2">
                 <div className="w-16 h-16 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mb-6"><Repeat className="w-8 h-8" /></div>
                 <h3 className="text-[20px] font-bold text-[#111827] uppercase tracking-tight">Ativar Substituição</h3>
                 <p className="text-[13px] text-[#4B5563] font-medium uppercase tracking-widest">Suplente: {substitutionModal.nome}</p>
              </header>

              <div className="space-y-6">
                 <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-[#2563EB] shrink-0" />
                    <p className="text-[13px] text-blue-900 font-medium uppercase leading-relaxed">
                       A suplente herdará integralmente a mesa de trabalho, documentos e agenda do titular selecionado enquanto a substituição estiver ativa.
                    </p>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-widest ml-1">Conselheiro Titular a ser Substituído</label>
                    <select 
                       className="w-full p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[14px] font-medium uppercase outline-none focus:border-[#2563EB]"
                       value={subForm.substituindo_id}
                       onChange={e => setSubForm({...subForm, substituindo_id: e.target.value})}
                    >
                       <option value="">SELECIONE O TITULAR...</option>
                       {titularCouncilors.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-widest ml-1">Data Início</label>
                       <input 
                          type="date" 
                          className="w-full p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[14px] font-medium outline-none"
                          value={subForm.data_inicio_substituicao}
                          onChange={e => setSubForm({...subForm, data_inicio_substituicao: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-widest ml-1">Retorno Previsto</label>
                       <input 
                          type="date" 
                          className="w-full p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[14px] font-medium outline-none"
                          value={subForm.data_fim_prevista}
                          onChange={e => setSubForm({...subForm, data_fim_prevista: e.target.value})}
                       />
                    </div>
                 </div>
              </div>

              <button 
                 onClick={handleSaveSubstitution}
                 className="w-full py-4 bg-[#111827] text-white rounded-xl font-bold uppercase text-[14px] tracking-widest shadow-lg hover:bg-[#2563EB] transition-all flex items-center justify-center gap-3"
              >
                 <ShieldCheck className="w-5 h-5" /> Confirmar e Ativar Acesso
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPanel;
