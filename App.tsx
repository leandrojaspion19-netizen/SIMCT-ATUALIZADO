import React, { useState } from 'react';

export default function App() {
  // Criando a lista de atendimentos para a Vercel não dar erro
  const [atendimentos, setAtendimentos] = useState([]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#004a99', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>SICT - HORTOLÂNDIA</h1>
        <p style={{ margin: 5 }}>Conselho Tutelar - Gestão de Dados</p>
      </header>

      {/* SEÇÃO DE RELATÓRIOS (CORAÇÃO DOS DADOS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: 0, color: '#004a99' }}>1ª INFÂNCIA (0-6)</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>0</p>
        </div>
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: 0, color: '#004a99' }}>CRIANÇAS (7-12)</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>0</p>
        </div>
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: 0, color: '#004a99' }}>ADOLESCENTES</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>0</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>📋 NOVO DOCUMENTO</h3>
        <p>Sistema pronto para receber os dados de Hortolândia.</p>
        <button style={{ backgroundColor: '#004a99', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
          Criar Novo Registro
        </button>
      </div>
    </div>
  );
}
