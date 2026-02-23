import React, { useState } from 'react';

export default function App() {
  const [atendimentos, setAtendimentos] = useState([]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#004a99', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>SICT - HORTOLÂNDIA</h1>
        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Conselho Tutelar - Gestão de Dados e Atribuições</p>
      </header>

      {/* PAINEL DE RELATÓRIOS ESTATÍSTICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
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

      {/* FORMULÁRIO DE REGISTRO */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📝 NOVO REGISTRO</h3>
        <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data e Hora do Recebimento:</label>
            <input type="datetime-local" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Origem do Comunicado:</label>
            <select style={{ width: '100%', padding: '100', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option>Selecione a Instituição de Hortolândia...</option>
              <option>Educação Municipal</option>
              <option>Saúde (UBS/Hospital)</option>
              <option>Segurança Pública</option>
            </select>
          </div>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            💾 SALVAR NO SICT
          </button>
        </div>
      </div>
    </div>
  );
}
