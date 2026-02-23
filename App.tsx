import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- CONFIGURAÇÕES E CONSTANTES INTEGRADAS (PARA EVITAR ERROS NA VERCEL) ---
const CT_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6A8u03A307V8A6_vC3B0C77z1u5w8rW6pLg&s";

const INITIAL_USERS = [
  { id: '1', nome: 'LEANDRO', cargo: 'CONSELHEIRO', perfil: 'CONSELHEIRO', senha: '123', status: 'ATIVO' },
  { id: '2', nome: 'LUDIMILA', cargo: 'ADMINISTRADORA', perfil: 'ADMIN', senha: '123', status: 'ATIVO' },
  { id: '3', nome: 'COORDENAÇÃO', cargo: 'COORDENADOR', perfil: 'ADMIN', senha: '123', status: 'ATIVO' }
];

// --- COMPONENTE DE LOGIN (VISUAL DAS SUAS FOTOS) ---
const LoginIllustration = () => (
  <div style={{ width: '100%', height: '200px', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '10px' }}>
    <img src={CT_LOGO_URL} style={{ width: '80px', borderRadius: '15px' }} alt="Logo CT" />
    <div style={{ textAlign: 'center' }}>
      <h3 style={{ margin: 0, fontSize: '14px', letterSpacing: '2px' }}>SIMCT HORTOLÂNDIA</h3>
      <p style={{ margin: 0, fontSize: '10px', opacity: 0.6 }}>ACESSO RESTRITO E SEGURO</p>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL DO SISTEMA ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Função de Login
  const handleLogin = (e) => {
    e.preventDefault();
    const user = INITIAL_USERS.find(u => u.nome === selectedUserId.toUpperCase());
    if (user && user.senha === password && acceptedTerms) {
      setCurrentUser(user);
    } else if (!acceptedTerms) {
      setLoginError("ACEITE OS TERMOS LGPD");
    } else {
      setLoginError("USUÁRIO OU SENHA INCORRETOS");
    }
  };

  // Se não estiver logado, mostra a tela de login
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: 'white', width: '380px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }}>
          <LoginIllustration />
          <form onSubmit={handleLogin} style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              placeholder="USUÁRIO" 
              style={{ padding: '15px', borderRadius: '15px', border: '2px solid #F3F4F6', fontWeight: 'bold' }} 
              value={selectedUserId} 
              onChange={e => setSelectedUserId(e.target.value.toUpperCase())}
            />
            <input 
              type="password" 
              placeholder="SENHA" 
              style={{ padding: '15px', borderRadius: '15px', border: '2px solid #F3F4F6', fontWeight: 'bold' }} 
              value={password} 
              onChange={e => setPassword(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 'bold', color: '#4B5563' }}>
              <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
              <label>ACEITO TERMOS LGPD E SIGILO</label>
            </div>
            {loginError && <p style={{ color: 'red', fontSize: '10px', fontWeight: 'bold', textAlign: 'center' }}>{loginError}</p>}
            <button style={{ backgroundColor: '#111827', color: 'white', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: '900', cursor: 'pointer' }}>ACESSAR SIMCT</button>
          </form>
        </div>
      </div>
    );
  }

  // SISTEMA APÓS LOGIN
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#F9FAFB' }}>
      {/* MENU LATERAL AZUL ESCURO (DAS FOTOS) */}
      <aside style={{ width: '280px', backgroundColor: '#111827', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={CT_LOGO_URL} style={{ width: '35px' }} alt="Logo" />
          <span style={{ fontWeight: '900', fontSize: '18px', letterSpacing: '1px' }}>SIMCT</span>
        </div>
        
        <nav style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'dashboard' ? '#2563EB' : 'transparent', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🏠 PAINEL GERAL</button>
          <button onClick={() => setActiveTab('relatorios')} style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'relatorios' ? '#2563EB' : 'transparent', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>📊 RELATÓRIOS</button>
          <button onClick={() => setActiveTab('search')} style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'search' ? '#2563EB' : 'transparent', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🔍 BUSCA ATIVA</button>
        </nav>

        <button onClick={() => setCurrentUser(null)} style={{ margin: '20px', padding: '15px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>SAIR</button>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>ZELAR PELO CUMPRIMENTO DO DIREITO</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
             <span style={{ fontSize: '18px', fontWeight: '900' }}>{currentUser.nome}</span>
             <span style={{ color: '#2563EB', fontWeight: 'bold', fontSize: '14px' }}>({currentUser.cargo})</span>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <h3 style={{ fontWeight: '900' }}>BEM-VINDO AO SIMCT HORTOLÂNDIA</h3>
            <p style={{ color: '#6B7280' }}>Nenhum procedimento pendente para sua referência hoje.</p>
          </div>
        )}

        {activeTab === 'relatorios' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '25px', textAlign: 'center', borderTop: '6px solid #2563EB' }}>
              <h4 style={{ fontSize: '11px', color: '#6B7280' }}>👶 1ª INFÂNCIA</h4>
              <p style={{ fontSize: '32px', fontWeight: '900', margin: '10px 0' }}>0</p>
            </div>
            {/* Outros cards seguem o mesmo padrão */}
          </div>
        )}
      </main>
    </div>
  );
}
