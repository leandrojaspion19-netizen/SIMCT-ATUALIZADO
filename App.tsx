import React, { useState } from 'react';

export default function App() {
  // Estado para controlar qual aba está ativa: 'registro' ou 'relatorios'
  const [abaAtiva, setAbaAtiva] = useState('registro');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#004a99', color: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>SICT - HORTOLÂNDIA</h1>
      </header>

      {/* MENU DE NAVEGAÇÃO */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setAbaAtiva('registro')}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: abaAtiva === 'registro' ? '#004a99' : '#ccc', color: 'white', fontWeight: 'bold' }}
        >
          📝 NOVO REGISTRO
        </button>
        <button 
          onClick={() => setAbaAtiva('relatorios')}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: abaAtiva === 'relatorios' ? '#004a99' : '#ccc', color: 'white', fontWeight: 'bold' }}
        >
          📊 RELATÓRIOS
        </button>
      </nav>

      {/* CONTEÚDO DA ABA: RELATÓRIOS */}
      {abaAtiva === 'relatorios' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', animation: 'fadeIn 0.5s' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', borderTop: '5px solid #004a99' }}>
            <h4 style={{ margin: 0, color: '#555' }}>👶 1ª INFÂNCIA (0-6)</h4>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#004a99' }}>0</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', borderTop: '5px solid #004a99' }}>
            <h4 style={{ margin: 0, color: '#555' }}>👦 CRIANÇAS (7-12)</h4>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#004a99' }}>0</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', borderTop: '5px solid #004a99' }}>
            <h4 style={{ margin: 0, color: '#555' }}>🧑 ADOLESCENTES</h4>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0', color: '#004a99' }}>0</p>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA: NOVO REGISTRO */}
      {abaAtiva === 'registro' && (
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0 }}>📝 FORMULÁRIO DE ENTRADA</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Data e Hora:</label>
              <input type="datetime-local" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold' }}>
              💾 SALVAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
