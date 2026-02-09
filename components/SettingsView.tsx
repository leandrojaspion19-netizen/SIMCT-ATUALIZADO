
import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, Eye, EyeOff, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { UserWithPassword } from '../constants';

interface SettingsViewProps {
  currentUser: User;
  onUpdatePassword: (newPassword: string) => boolean;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onUpdatePassword }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    if (newPassword.length < 3) {
      setStatus({ type: 'error', message: 'A nova senha deve ter pelo menos 3 caracteres.' });
      return;
    }

    const success = onUpdatePassword(newPassword);
    if (success) {
      setStatus({ type: 'success', message: 'Senha alterada com sucesso! Use a nova senha no próximo acesso.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setStatus({ type: 'error', message: 'Erro ao atualizar. Verifique os dados e tente novamente.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Segurança da Conta</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Gerencie seu acesso ao sistema</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-blue-800">Mantenha sua senha segura</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                Como você lida com dados sensíveis de crianças e adolescentes, sua senha é a sua assinatura digital. 
                Nunca a compartilhe com outros colegas.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Atual</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showPass ? "text" : "password"}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPass ? 'Ocultar Senhas' : 'Mostrar Senhas'}
            </button>
          </div>

          {status.type && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-xs font-bold">{status.message}</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
          >
            <Save className="w-5 h-5" /> ATUALIZAR ACESSO
          </button>
        </form>
      </div>
      
      <div className="mt-8 bg-slate-100 p-6 rounded-[2rem] border border-slate-200">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed text-center">
          Conselho Tutelar de Hortolândia - SP <br/>
          Sua segurança garante a proteção dos dados dos munícipes.
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
