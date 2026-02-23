import React, { useState, useEffect, useMemo } from 'react';
// Ícones injetados via SVG para não depender de instalação de bibliotecas
const IconeLogin = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#2563EB'}}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // LOGICA DE LOGIN IDÊNTICA AO AI STUDIO
  const handleLogin = (e) => {
    e.preventDefault();
    if ((selectedUserId === 'LEANDRO' || selectedUserId === 'LUDIMILA') && password === '123' && acceptedTerms) {
      setCurrentUser({ nome: selectedUserId, cargo: 'CONSELHEIRO', perfil: selectedUserId === 'LUDIMILA' ? 'ADMIN' : 'CONSELHEIRO' });
    } else {
      alert("Credenciais inválidas ou Termos não aceitos!");
    }
  };

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ backgroundColor: 'white', width: '400px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', border: '1px solid #E5E7EB' }}>
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#111827', color: 'white' }}>
            <IconeLogin />
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginTop: '15px', letterSpacing: '2px' }}>SIMCT HORTOLÂNDIA</h2>
            <p style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase' }}>Acesso Restrito - Rede de Proteção</p>
          </div>
          <form onSubmit={handleLogin} style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input placeholder="USUÁRIO" style={{ padding: '15px', borderRadius: '15px', border: '2px solid #F3F4F6', fontWeight: 'bold', outline: 'none' }} value={selectedUserId} onChange={e => setSelectedUserId(e.target.value.toUpperCase())} />
            <input type="password" placeholder="SENHA" style={{ padding: '15px', borderRadius: '15px', border: '2px solid #F3F4F6', fontWeight: 'bold', outline: 'none' }} value={password} onChange={e => setPassword(e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4B5563' }}>ACEITO LGPD E SIGILO PROFISSIONAL</label>
            </div>
            <button style={{ backgroundColor: '#111827', color: 'white', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '13px' }}>ACESSAR SISTEMA</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6', fontFamily: 'Inter, sans-serif' }}>
      {/* MENU LATERAL PROFISSIONAL */}
      <aside style={{ width: '280px', backgroundColor: '#111827', color: 'white', position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '30px', fontWeight: '900', fontSize: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          SIM<span style={{ color: '#2563EB' }}>CT</span>
        </div>
        <nav style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['DASHBOARD', 'NOVO REGISTRO', 'RELATÓRIOS', 'BUSCA ATIVA', 'CONFIGURAÇÕES'].map(item => (
            <button key={item} onClick={() => setActiveTab(item)} style={{ textAlign: 'left', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === item ? '#2563EB' : 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{item}</button>
          ))}
        </nav>
        <button onClick={() => setCurrentUser(null)} style={{ margin: '20px', padding: '15px', backgroundColor: '#EF4444', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '900' }}>SAIR</button>
      </aside>

      <main style={{ marginLeft: '280px', flex: 1, padding: '40px' }}>
        <header style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>ZELAR PELO CUMPRIMENTO DO DIREITO</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
            <span style={{ fontSize: '18px', fontWeight: '900' }}>{currentUser.nome}</span>
            <span style={{ color: '#2563EB', fontWeight: 'bold', fontSize: '14px' }}>({currentUser.cargo})</span>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO DINÂMICO */}
        {activeTab === 'DASHBOARD' && (
          <div style={{ display: 'grid', gap: '25px' }}>
             <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                <h3 style={{ margin: 0, color: '#111827' }}>BEM-VINDO AO PAINEL DE CONTROLE</h3>
                <p style={{ color: '#6B7280' }}>Hortolândia/SP - Gestão de Garantia de Direitos</p>
             </div>
          </div>
        )}

        {activeTab === 'NOVO REGISTRO' && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 30px 0', borderBottom: '2px solid #F3F4F6', paddingBottom: '15px' }}>📝 FORMULÁRIO DE ENTRADA</h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: '900', color: '#6B7280' }}>ORIGEM DO COMUNICADO</label>
              <select style={{ padding: '15px', borderRadius: '15px', border: '2px solid #F3F4F6', fontWeight: 'bold' }}>
                <option>SELECIONE A INSTITUIÇÃO...</option>
                <option>CONSELHO TUTELAR - SEDE</option>
                <option>MINISTÉRIO PÚBLICO</option>
                <option>DELEGACIA DE POLÍCIA</option>
              </select>
              <button style={{ backgroundColor: '#10B981', color: 'white', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900' }}>SALVAR REGISTRO NO SIMCT</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
