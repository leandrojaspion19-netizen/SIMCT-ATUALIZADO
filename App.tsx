
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LayoutDashboard, LogOut, FilePlus, Database, BarChart3, CalendarDays, Briefcase, UserCog, X, Repeat, AlertCircle, ShieldCheck, CheckCircle2, Zap, ClipboardCheck, ArrowRight, Activity, Lock, Users, Heart, GraduationCap, Building2 } from 'lucide-react';
import { User, Documento, Log, DocumentFile, AgendaEntry, DocumentStatus, MonitoringInfo, MedidaAplicada } from './types';
import { INITIAL_USERS, UserWithPassword, ANNUAL_ESCALA, getEffectiveEscala, checkIsPlantao } from './constants';
import DocumentList from './components/DocumentList';
import DocumentRegistration from './components/DocumentRegistration';
import DocumentView from './components/DocumentView';
import MonitoringDashboard from './components/MonitoringDashboard';
import AuditLogViewer from './components/AuditLogViewer';
import AdvancedSearch from './components/AdvancedSearch';
import SettingsView from './components/SettingsView';
import AgendaView from './components/AgendaView';
import StatisticsView from './components/StatisticsView';
import AppointmentAlert from './components/AppointmentAlert';
import UserManagementPanel from './components/UserManagementPanel';

const CT_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6A8u03A307V8A6_vC3B0C77z1u5w8rW6pLg&s";

// Novo componente de ilustração decorativa para a tela de login (Opção 1: Institucional e Acolhedor)
const LoginIllustration: React.FC = () => (
  <div className="w-full h-64 bg-gradient-to-br from-[#EFF6FF] to-[#ECFDF5] relative overflow-hidden">
    {/* Imagem de Fundo Artística - Estilo Ilustração Digital Humanizada */}
    <img 
      src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop" 
      alt="Rede de Proteção" 
      className="w-full h-full object-cover opacity-20 mix-blend-multiply"
    />
    
    {/* Camada de Gradiente para suavização */}
    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
    
    {/* Elementos Simbólicos da Rede de Proteção (SVG/Lucide) */}
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="relative w-full max-w-xs flex items-center justify-center">
        {/* Ícones flutuantes representando a Rede (Educação, Saúde, Assistência) */}
        <div className="absolute -top-10 -left-4 p-2.5 bg-white rounded-xl shadow-md border border-blue-100 animate-bounce duration-[3000ms]">
          <GraduationCap className="w-5 h-5 text-blue-500" />
        </div>
        <div className="absolute -bottom-8 -right-2 p-2.5 bg-white rounded-xl shadow-md border border-emerald-100 animate-bounce duration-[4000ms]">
          <Heart className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="absolute top-2 -right-8 p-2 bg-white rounded-xl shadow-md border border-amber-100 animate-pulse">
          <Building2 className="w-4 h-4 text-amber-500" />
        </div>

        {/* Núcleo Central: Proteção e Família */}
        <div className="flex flex-col items-center text-center space-y-3 z-10">
          <div className="p-4 bg-white/90 backdrop-blur-md rounded-[2rem] shadow-xl border border-blue-50 flex items-center justify-center">
            <Users className="w-10 h-10 text-[#2563EB]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[12px] font-black text-[#111827] uppercase tracking-[0.3em] opacity-80">SIMCT Hortolândia</h3>
            <p className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Rede de Garantia de Direitos</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Selo de Confiança */}
    <div className="absolute bottom-4 left-6 flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-blue-100/50">
      <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
      <span className="text-[9px] font-black text-[#2563EB] uppercase tracking-widest">Acesso Seguro</span>
    </div>
  </div>
);

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void; collapsed?: boolean; }> = ({ icon, label, active, onClick, collapsed }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-[#2563EB] text-white shadow-md' : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'}`}>
    <div className="shrink-0">{icon}</div>
    {!collapsed && <span className="text-[14px] font-semibold uppercase tracking-wide whitespace-nowrap">{label}</span>}
  </button>
);

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'my-docs' | 'monitoring' | 'logs' | 'search' | 'settings' | 'agenda' | 'statistics' | 'edit' | 'user-management'>('dashboard');
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [users, setUsers] = useState<UserWithPassword[]>([]);
  const [agenda, setAgenda] = useState<AgendaEntry[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [acknowledgedEventIds, setAcknowledgedEventIds] = useState<string[]>([]);
  const [acknowledgedReminderIds, setAcknowledgedReminderIds] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const savedDocs = localStorage.getItem('pt_docs');
    const savedLogs = localStorage.getItem('pt_logs');
    const savedFiles = localStorage.getItem('pt_files');
    const savedUsers = localStorage.getItem('pt_users');
    const savedAgenda = localStorage.getItem('pt_agenda');
    const savedAck = localStorage.getItem('pt_ack_events');
    const savedAckRem = localStorage.getItem('pt_ack_reminders');
    
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedFiles) setFiles(JSON.parse(savedFiles));
    if (savedAgenda) setAgenda(JSON.parse(savedAgenda));
    if (savedAck) setAcknowledgedEventIds(JSON.parse(savedAck));
    if (savedAckRem) setAcknowledgedReminderIds(JSON.parse(savedAckRem));

    const baseUsers = INITIAL_USERS.map(u => ({ ...u, status: u.status || 'ATIVO', tentativas_login: 0 }));
    if (savedUsers) {
      const stored = JSON.parse(savedUsers);
      const merged = baseUsers.map(bu => {
        const found = stored.find((s: any) => s.id === bu.id);
        return found ? { ...bu, ...found } : bu;
      });
      setUsers(merged);
    } else {
      setUsers(baseUsers);
    }
    setTimeout(() => setIsInitializing(false), 1500);
  }, []);

  useEffect(() => {
    localStorage.setItem('pt_docs', JSON.stringify(documents));
    localStorage.setItem('pt_logs', JSON.stringify(logs));
    localStorage.setItem('pt_files', JSON.stringify(files));
    localStorage.setItem('pt_users', JSON.stringify(users));
    localStorage.setItem('pt_agenda', JSON.stringify(agenda));
    localStorage.setItem('pt_ack_events', JSON.stringify(acknowledgedEventIds));
    localStorage.setItem('pt_ack_reminders', JSON.stringify(acknowledgedReminderIds));
  }, [documents, logs, files, users, agenda, acknowledgedEventIds, acknowledgedReminderIds]);

  const addLog = useCallback((docId: string, acao: string) => {
    if (!currentUser) return;
    const newLog: Log = { id: `log-${Date.now()}`, documento_id: docId, usuario_id: currentUser.id, usuario_nome: currentUser.nome, acao, data_hora: new Date().toISOString() };
    setLogs(prev => [newLog, ...prev]);
  }, [currentUser]);

  const calculateSequentialReference = (docs: Documento[]) => {
    const activeCouncilorIds = ['cons1', 'cons2', 'cons3', 'cons4', 'cons5']; 
    const autoDocs = docs.filter(d => d.distribuicao_automatica === true);
    if (autoDocs.length === 0) return activeCouncilorIds[0];
    const lastDoc = [...autoDocs].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())[0];
    const lastCouncilorId = lastDoc.conselheiro_referencia_id;
    const lastIndex = activeCouncilorIds.indexOf(lastCouncilorId);
    const currentIndex = lastIndex === -1 ? 0 : lastIndex;
    const nextIndex = (currentIndex + 1) % activeCouncilorIds.length;
    return activeCouncilorIds[nextIndex];
  };

  const calculateSequentialProvidencia = (docs: Documento[]) => {
    const activeCouncilorIds = ['cons1', 'cons2', 'cons3', 'cons4', 'cons5']; 
    const totalDocsCount = docs.length;
    return activeCouncilorIds[totalDocsCount % activeCouncilorIds.length];
  };

  const handleDocumentSubmit = (data: any, files: File[]) => {
    if (editingDocId) {
      setDocuments(prev => prev.map(d => d.id === editingDocId ? { ...d, ...data } : d));
      addLog(editingDocId, `Prontuário técnico atualizado por ${currentUser?.nome}.`);
      setEditingDocId(null);
      handleNavigate('dashboard');
      return;
    }
    let finalRefId = data.conselheiro_referencia_id;
    let logMsg = "";
    if (!data.is_manual_override) {
      const historicalRef = documents.find(d => 
        (d.genitora_nome && d.genitora_nome.trim().toUpperCase() === (data.genitora_nome || '').trim().toUpperCase()) ||
        (d.criancas?.some(c => data.criancas?.some((nc: any) => (nc.nome || '').trim().toUpperCase() === (c.nome || '').trim().toUpperCase())))
      );
      if (historicalRef) {
        finalRefId = historicalRef.conselheiro_referencia_id;
        logMsg = `Vínculo Histórico: Família vinculada ao titular ${INITIAL_USERS.find(u => u.id === finalRefId)?.nome}.`;
      } else {
        finalRefId = calculateSequentialReference(documents);
        logMsg = `Distribuição Isonômica Inteligente: Atribuição cíclica global para ${INITIAL_USERS.find(u => u.id === finalRefId)?.nome}.`;
      }
    } else {
      logMsg = `Inserção Manual: Prontuário físico/antigo atribuído manualmente a ${INITIAL_USERS.find(u => u.id === finalRefId)?.nome}.`;
    }
    const provNomesEscala = getEffectiveEscala(data.data_recebimento);
    let finalProvId = calculateSequentialProvidencia(documents);
    const periodo = checkIsPlantao(data.data_recebimento, data.hora_rece_bimento);
    const id = `doc-${Math.random().toString(36).substr(2, 9)}`;
    const newDoc: Documento = { 
      ...data, 
      id, 
      criado_em: new Date().toISOString(), 
      status: ['NAO_LIDO'], 
      criado_por_id: currentUser!.id, 
      ciencia_registrada_por: [], 
      conselheiro_referencia_id: finalRefId,
      conselheiro_providencia_id: finalProvId,
      conselheiros_providencia_nomes: provNomesEscala,
      periodo_recebimento: periodo,
      distribuicao_automatica: !data.is_manual_override 
    };
    setDocuments(prev => [newDoc, ...prev]);
    addLog(id, logMsg + ` Atribuído para Providência Imediata sequencial: ${INITIAL_USERS.find(u => u.id === finalProvId)?.nome}.`);
    handleNavigate('dashboard');
  };

  const handleLogout = () => { setCurrentUser(null); handleNavigate('dashboard'); };
  const handleNavigate = (tab: typeof activeTab) => { setActiveTab(tab); setSelectedDocId(null); setEditingDocId(null); };

  const activeAlert = useMemo(() => {
    if (!currentUser) return null;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    return agenda.find(event => {
      if (event.conselheiro_id !== currentUser.id) return false;
      const isToday = event.data === todayStr;
      try {
        const eventFullDate = new Date(`${event.data}T${event.hora}:00`);
        const diffMs = eventFullDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= 2 && !acknowledgedReminderIds.includes(event.id)) return true;
        if (isToday && !acknowledgedEventIds.includes(event.id)) return true;
      } catch (e) { return false; }
      return false;
    });
  }, [agenda, currentUser, acknowledgedEventIds, acknowledgedReminderIds]);

  const handleDismissAlert = useCallback((eventId: string) => {
    const now = new Date();
    const event = agenda.find(a => a.id === eventId);
    if (event) {
      try {
        const eventFullDate = new Date(`${event.data}T${event.hora}:00`);
        const diffMs = eventFullDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= 2) {
          setAcknowledgedReminderIds(prev => {
            if (prev.includes(eventId)) return prev;
            return [...prev, eventId];
          });
        }
      } catch (e) { }
    }
    setAcknowledgedEventIds(prev => {
      if (prev.includes(eventId)) return prev;
      return [...prev, eventId];
    });
  }, [agenda]);

  const peerPendingSignatureCount = useMemo(() => {
    if (!currentUser) return 0;
    return documents.filter(doc => 
      doc.medidas_detalhadas?.some(m => 
        m.conselheiros_requeridos.includes(currentUser.nome.toUpperCase()) && 
        !m.confirmacoes.some(c => c.usuario_id === currentUser.id) &&
        m.autor_id !== currentUser.id 
      )
    ).length;
  }, [documents, currentUser]);

  const handleGoToFirstPending = () => {
    if (!currentUser) return;
    const firstPendingDoc = documents.find(doc =>
      doc.medidas_detalhadas?.some(m =>
        m.conselheiros_requeridos.includes(currentUser.nome.toUpperCase()) &&
        !m.confirmacoes.some(c => c.usuario_id === currentUser.id) &&
        m.autor_id !== currentUser.id
      )
    );
    if (firstPendingDoc) setSelectedDocId(firstPendingDoc.id);
  };

  const renderContent = () => {
    if (!currentUser) return null;
    const isLud = currentUser.nome === 'LUDIMILA';
    const isAdministrative = currentUser.perfil === 'ADMIN' || currentUser.perfil === 'ADMINISTRATIVO';
    if (activeTab === 'user-management' && isLud) return <UserManagementPanel users={users} onUpdateUser={(id, upd) => setUsers(prev => prev.map(u => u.id === id ? {...u, ...upd} : u))} onAddLog={(action) => addLog('SISTEMA', action)} />;
    if (activeTab === 'register') return <DocumentRegistration documents={documents} currentUser={currentUser} onSubmit={handleDocumentSubmit} onCancel={() => handleNavigate('dashboard')} nextCouncilorId="" />;
    if (activeTab === 'edit' && editingDocId) return <DocumentRegistration documents={documents} currentUser={currentUser} initialData={documents.find(d => d.id === editingDocId)} onSubmit={handleDocumentSubmit} onCancel={() => handleNavigate('dashboard')} nextCouncilorId="" />;
    if (selectedDocId) {
      const doc = documents.find(d => d.id === selectedDocId);
      if (!doc) return null;
      return <DocumentView document={doc} allDocuments={documents} files={[]} logs={logs.filter(l => l.documento_id === selectedDocId)} currentUser={currentUser} isReadOnly={isAdministrative} onBack={() => setSelectedDocId(null)} onEdit={() => { setEditingDocId(doc.id); setActiveTab('edit'); }} onDelete={(id) => setDocuments(prev => prev.filter(d => d.id !== id))} onUpdateStatus={(id, s) => setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: s } : d))} onUpdateDocument={(id, fields) => setDocuments(prev => prev.map(d => d.id === id ? {...d, ...fields} : d))} onAddLog={addLog} onScience={() => {}} />;
    }
    return (
      <div className="space-y-6">
        {peerPendingSignatureCount > 0 && activeTab === 'dashboard' && (
          <div className="p-6 bg-amber-600 rounded-2xl text-white flex items-center justify-between shadow-xl border-2 border-amber-400 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl"><ClipboardCheck className="w-8 h-8 text-white" /></div>
              <div>
                <h4 className="font-black uppercase text-[15px] tracking-widest">Validação de Colegiado Pendente</h4>
                <p className="text-[12px] font-medium opacity-90 uppercase">Você possui {peerPendingSignatureCount} prontuário(s) que exigem sua assinatura técnica imediata.</p>
              </div>
            </div>
            <button onClick={handleGoToFirstPending} className="px-6 py-3 bg-white text-amber-600 rounded-xl font-black uppercase text-[11px] hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2">Verificar Pendências <ArrowRight className="w-4 h-4" /></button>
          </div>
        )}
        {(() => {
          switch (activeTab) {
            case 'dashboard': return <DocumentList documents={documents} currentUser={currentUser} isReadOnly={isAdministrative} onSelectDoc={setSelectedDocId} onEditDoc={(id) => { setEditingDocId(id); setActiveTab('edit'); }} onDeleteDoc={(id) => setDocuments(prev => prev.filter(d => d.id !== id))} onScience={() => {}} onUpdateStatus={() => {}} />;
            case 'my-docs': 
              const myReferenciaDocs = documents.filter(d => d.conselheiro_referencia_id === currentUser.id || d.conselheiro_providencia_id === currentUser.id);
              return <DocumentList documents={myReferenciaDocs} currentUser={currentUser} isReadOnly={isAdministrative} onSelectDoc={setSelectedDocId} onEditDoc={(id) => { setEditingDocId(id); setActiveTab('edit'); }} onDeleteDoc={(id) => setDocuments(prev => prev.filter(d => d.id !== id))} onScience={() => {}} onUpdateStatus={() => {}} />;
            case 'monitoring': return <MonitoringDashboard documents={documents} currentUser={currentUser} effectiveUserId={currentUser.id} onSelectDoc={setSelectedDocId} onUpdateMonitoring={(id, m) => { setDocuments(prev => prev.map(d => d.id === id ? {...d, monitoramento: m} : d)); addLog(id, "Prorrogação de prazo de acompanhamento registrada."); }} onRemoveMonitoring={(id) => { setDocuments(prev => prev.map(d => d.id === id ? {...d, monitoramento: {...d.monitoramento!, concluido: true}} : d)); addLog(id, "Acompanhamento ativo removido do Monitoramento."); }} isReadOnly={isAdministrative} />;
            case 'agenda': return <AgendaView agenda={agenda} setAgenda={setAgenda} currentUser={currentUser} effectiveUserId={currentUser.id} isReadOnly={isLud || currentUser.perfil === 'ADMINISTRATIVO'} />;
            case 'search': return <AdvancedSearch documents={documents} currentUser={currentUser} onSelectDoc={setSelectedDocId} />;
            case 'logs': return <AuditLogViewer logs={logs} />;
            case 'settings': return <SettingsView currentUser={currentUser} onUpdatePassword={(p) => { setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, senha: p } : u)); addLog('SISTEMA', 'SEGURANÇA DIGITAL: Credenciais de acesso atualizadas pelo próprio titular.'); return true; }} />;
            case 'statistics': return <StatisticsView documents={documents} />;
            default: return null;
          }
        })()}
      </div>
    );
  };

  if (isInitializing) return <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center text-white"><h1 className="text-[20px] font-bold animate-pulse uppercase tracking-[0.3em]">SIMCT HORTOLÂNDIA</h1></div>;

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F9FAFB]">
      <div className="bg-white rounded-[2.5rem] shadow-xl max-w-md w-full overflow-hidden border border-[#E5E7EB] animate-in fade-in duration-700">
        <LoginIllustration />
        <div className="p-10 pt-6">
          <header className="flex flex-col items-center mb-10 text-center">
            <img src={CT_LOGO_URL} alt="SIMCT" className="w-16 h-16 mb-4" />
            <h1 className="text-[18px] font-bold uppercase tracking-tight">SIM<span className="text-[#2563EB]">CT</span> Hortolândia</h1>
          </header>
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            setLoginError(null); 
            const userInput = (selectedUserId || '').trim().toUpperCase();
            const user = users.find(u => (u.nome || '').toUpperCase() === userInput); 
            if (!user || user.senha !== password) { setLoginError("Erro: Credenciais inválidas."); return; } 
            
            // VERIFICAÇÃO DE BLOQUEIO DE ACESSO
            if (user.status === 'BLOQUEADO') { 
              setLoginError("ACESSO BLOQUEADO: PROCURE A ADM GERAL."); 
              return; 
            } 

            if (!acceptedTerms) { setLoginError("Obrigatório aceitar termos LGPD."); return; } 
            setCurrentUser(user); 
            addLog('SISTEMA', 'AUDITORIA DE ACESSO: Sessão iniciada com sucesso via autenticação digital.'); 
          }} className="space-y-6">
            <div className="relative">
              <input placeholder="USUÁRIO" className="w-full p-4 pl-12 bg-slate-50 border border-[#E5E7EB] rounded-xl outline-none font-bold uppercase focus:border-[#2563EB] transition-all" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} />
              <Lock className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <div className="relative">
              <input type="password" placeholder="SENHA" className="w-full p-4 pl-12 bg-slate-50 border border-[#E5E7EB] rounded-xl outline-none font-bold focus:border-[#2563EB] transition-all" value={password} onChange={e => setPassword(e.target.value)} />
              <ShieldCheck className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex items-center gap-3 p-1">
              <input type="checkbox" className="w-4 h-4 text-[#2563EB] border-[#E5E7EB] rounded focus:ring-[#2563EB]" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
              <label className="text-[12px] font-medium uppercase text-[#4B5563]">Aceito LGPD e Sigilo Profissional</label>
            </div>
            {loginError && <div className="p-4 bg-red-50 text-red-700 text-[12px] font-bold uppercase rounded-xl border border-red-100">{loginError}</div>}
            <button type="submit" className="w-full py-4 bg-[#111827] text-white rounded-xl font-bold uppercase text-[13px] tracking-widest shadow-lg hover:bg-[#2563EB] transition-all">Acessar Sistema</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] font-['Inter']">
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-[#111827] transition-all flex flex-col fixed inset-y-0 z-50`}>
        <div className="p-6 flex items-center gap-4 border-b border-white/5"><img src={CT_LOGO_URL} alt="SIMCT" className="w-10 h-10" />{isSidebarOpen && <span className="text-white font-bold text-[18px] uppercase">SIM<span className="text-[#2563EB]">CT</span></span>}</div>
        <nav className="flex-1 px-4 mt-8 space-y-2">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Painel Geral" active={activeTab === 'dashboard'} onClick={() => handleNavigate('dashboard')} collapsed={!isSidebarOpen} />
          {(currentUser.perfil === 'ADMIN' || currentUser.perfil === 'ADMINISTRATIVO') && currentUser.nome !== 'LUDIMILA' && <NavItem icon={<FilePlus className="w-5 h-5" />} label="NOVO PROCEDIMENTO" active={activeTab === 'register'} onClick={() => handleNavigate('register')} collapsed={!isSidebarOpen} />}
          {currentUser.perfil === 'CONSELHEIRO' && (<><NavItem icon={<Briefcase className="w-5 h-5" />} label="Minha Referência" active={activeTab === 'my-docs'} onClick={() => handleNavigate('my-docs')} collapsed={!isSidebarOpen} /><NavItem icon={<Activity className="w-5 h-5" />} label="Monitoramento" active={activeTab === 'monitoring'} onClick={() => handleNavigate('monitoring')} collapsed={!isSidebarOpen} /></>)}
          <NavItem icon={<CalendarDays className="w-5 h-5" />} label="Agenda" active={activeTab === 'agenda'} onClick={() => handleNavigate('agenda')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Database className="w-5 h-5" />} label="Busca Ativa" active={activeTab === 'search'} onClick={() => handleNavigate('search')} collapsed={!isSidebarOpen} />
          <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Relatórios" active={activeTab === 'statistics'} onClick={() => handleNavigate('statistics'} collapsed={!isSidebarOpen} />
          <NavItem icon={<ShieldCheck className="w-5 h-5" />} label="Minha Senha" active={activeTab === 'settings'} onClick={() => handleNavigate('settings'} collapsed={!isSidebarOpen} />
          {currentUser.nome === 'LUDIMILA' && <NavItem icon={<UserCog className="w-5 h-5" />} label="Gestão de RH" active={activeTab === 'user-management'} onClick={() => handleNavigate('user-management')} collapsed={!isSidebarOpen} />}
        </nav>
        <div className="p-4 border-t border-white/5"><button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><LogOut className="w-5 h-5" />{isSidebarOpen && <span className="text-[13px] font-semibold uppercase">Logout</span>}</button></div>
      </aside>
      <main className={`flex-1 ${isSidebarOpen ? 'ml-80' : 'ml-24'} transition-all min-h-screen relative`}>
        <div className="p-8">
          <header className="flex items-center justify-between mb-12">
            <div><h2 className="text-[13px] font-medium text-[#4B5563] uppercase tracking-widest">Gestão Papel Zero Hortolândia</h2><div className="flex items-center gap-2 mt-1"><span className="text-[16px] font-semibold text-[#111827] uppercase">{currentUser.nome}</span><span className="text-[14px] font-medium text-[#2563EB] uppercase">({currentUser.cargo})</span></div></div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white border border-[#E5E7EB] rounded-xl shadow-sm hover:bg-slate-50">{isSidebarOpen ? <X className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}</button>
          </header>
          {renderContent()}
        </div>
        {activeAlert && <AppointmentAlert event={activeAlert} onView={(id) => { handleDismissAlert(id); setActiveTab('agenda'); }} onDismiss={handleDismissAlert} isReminder={!!(activeAlert && agenda.find(a => a.id === activeAlert.id) && (() => { const now = new Date(); const eventDate = new Date(`${activeAlert.data}T${activeAlert.hora}:00`); const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60); return diffHours > 0 && diffHours <= 2; })())} />}
      </main>
    </div>
  );
};

export default App;
