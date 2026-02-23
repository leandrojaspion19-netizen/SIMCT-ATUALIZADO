import React from 'react';

// SISTEMA SICT HORTOLÂNDIA - VERSÃO ESTÁVEL
export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ backgroundColor: '#004a99', color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
        <h1>SICT - HORTOLÂNDIA</h1>
        <p>Sistema Integrado do Conselho Tutelar</p>
      </header>

      <main style={{ marginTop: '20px' }}>
        <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <h3>📋 NOVO REGISTRO</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <label>Data e Hora:</label>
            <input type="datetime-local" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>
        </section>

        <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
          <h3>📊 RELATÓRIOS (Coração dos Dados)</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
            <div><strong>1ª Infância (0-6)</strong><br/>0</div>
            <div><strong>Crianças</strong><br/>0</div>
            <div><strong>Adolescentes</strong><br/>0</div>
          </div>
        </section>

        <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>🏢 ORIGEM DO COMUNICADO</h3>
          <select style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
            <option>Selecione a Categoria (Educação, Saúde, etc)</option>
          </select>
          <select style={{ width: '100%', padding: '8px' }}>
            <option>Selecione a Instituição de Hortolândia</option>
          </select>
        </section>
      </main>

      <footer style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        © 2026 SICT - Conselheiro Leandro - Hortolândia/SP
      </footer>
    </div>
  );
}
