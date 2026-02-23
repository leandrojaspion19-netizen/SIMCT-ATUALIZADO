import React, { useState, useEffect } from 'react';

// --- CONFIGURAÇÃO INTEGRADA DO SICT HORTOLÂNDIA ---
const CT_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6A8u03A307V8A6_vC3B0C77z1u5w8rW6pLg&s";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = selectedUserId.toUpperCase();
    if ((user === 'LEANDRO' || user === 'LUDIMILA') && password === '123' && acceptedTerms) {
      setCurrentUser({ nome: user, cargo: user === 'LUDIMILA' ? 'ADMIN' : 'CONSELHEIRO' });
    } else {
      alert("Credenciais inválidas ou Termos não aceitos!");
    }
  };

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: 'white', width: '380px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }}>
          <div style={{ padding: '40px', backgroundColor: '#111827', textAlign: 'center', color: 'white' }}>
            <img src={CT_LOGO_URL} style={{ width: '60px', borderRadius: '12px', marginBottom: '15px' }} alt="Logo" />
            <h2 style={{ margin: 0, fontSize: '16px', letterSpacing: '2px', fontWeight: '900' }}>SIMCT HORTOLÂNDIA</h2>
          </div>
          <form onSubmit={handleLogin} style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input placeholder="USUÁRIO" style={{ padding: '15px', borderRadius: '15px', border: '2px solid #F3F4F6', fontWeight: 'bold' }} value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} />
            <input type="password" placeholder="SENHA" style={{ padding: '15px', borderRadius: '15px', border: '2px solid #F3F4F6', fontWeight: 'bold' }} value={password} onChange={e => setPassword(e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 'bold', color: '#4B5563' }}>
              <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} />
              <label>ACEITO TERMOS LGPD E SIGILO</label>
            </div>
            <button style={{ backgroundColor: '#111827', color: 'white', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: '900', cursor: 'pointer' }}>ACESSAR SISTEMA</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#F9FAFB' }}>
      <aside style={{ width: '280px', backgroundColor: '#111827', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '30px', fontWeight: '900', fontSize: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>SIMCT</div>
        <nav style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'dashboard' ? '#2563EB' : 'transparent', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🏠 PAINEL GERAL</button>
          <button onClick={() => setActiveTab('relatorios')} style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'relatorios' ? '#2563EB' : 'transparent', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>📊 RELATÓRIOS</button>
        </nav>
        <button onClick={() => setCurrentUser(null)} style={{ margin: '20px', padding: '15px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>SAIR</button>
      </aside>

      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>ZELAR PELO CUMPRIMENTO DO DIREITO</h2>
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
             <span style={{ fontSize: '18px', fontWeight: '900' }}>{currentUser.nome}</span>
             <span style={{ color: '#2563EB', fontWeight: 'bold' }}>({currentUser.cargo})</span>
          </div>
        </header>

        <div style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          {activeTab === 'dashboard' ? (
            <div>
              <h3 style={{ fontWeight: '900' }}>BEM-VINDO AO SIMCT</h3>
              <p style={{ color: '#6B7280' }}>Sistema pronto para operação em Hortolândia.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
               <div style={{ padding: '20px', background: '#F3F4F6', borderRadius: '15px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '10px', color: '#6B7280' }}>1ª INFÂNCIA</h4>
                  <p style={{ fontSize: '24px', fontWeight: '900' }}>0</p>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
