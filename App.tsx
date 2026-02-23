import React, { useState, useMemo } from 'react';

// SIMCT HORTOLÂNDIA - VERSÃO INTEGRADA E ESTÁVEL
export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('registro');

  // Cores do Projeto das Fotos
  const CORES = {
    primaria: '#111827', // Azul Escuro/Preto das fotos
    secundaria: '#2563EB', // Azul Royal
    sucesso: '#10B981', // Verde
    alerta: '#EF4444', // Vermelho
    fundo: '#F3F4F6'
  };

  return (
    <div style={{ backgroundColor: CORES.fundo, minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* HEADER IDÊNTICO ÀS FOTOS */}
      <header style={{ backgroundColor: CORES.primaria, color: 'white', padding: '30px', textAlign: 'center', borderRadius: '0 0 40px 40px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '2px' }}>SICT - HORTOLÂNDIA</h1>
        <p style={{ margin: '5px 0 0', opacity: 0.6, fontSize: '10px', fontWeight: 'bold' }}>SISTEMA INTEGRADO MUNICIPAL DO CONSELHO TUTELAR</p>
      </header>

      <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 20px' }}>
        
        {/* MENU DE NAVEGAÇÃO - ABAS */}
        <nav style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <button 
            onClick={() => setAbaAtiva('registro')}
            style={{ flex: 1, padding: '18px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '900', transition: '0.3s', backgroundColor: abaAtiva === 'registro' ? CORES.secundaria : 'white', color: abaAtiva === 'registro' ? 'white' : '#6B7280', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
          >
            📝 NOVO REGISTRO
          </button>
          <button 
            onClick={() => setAbaAtiva('relatorios')}
            style={{ flex: 1, padding: '18px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '900', transition: '0.3s', backgroundColor: abaAtiva === 'relatorios' ? CORES.secundaria : 'white', color: abaAtiva === 'relatorios' ? 'white' : '#6B7280', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
          >
            📊 RELATÓRIOS & INTELIGÊNCIA
          </button>
        </nav>

        {/* ABA: RELATÓRIOS (O QUE VOCÊ ME MANDOU NO BLOCO DE NOTAS) */}
        {abaAtiva === 'relatorios' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '30px', textAlign: 'center', borderTop: `8px solid ${CORES.secundaria}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h4 style={{ color: '#4B5563', fontSize: '12px', fontWeight: '900' }}>👶 1ª INFÂNCIA (0-6)</h4>
                <p style={{ fontSize: '32px', fontWeight: '900', color: CORES.primaria, margin: '10px 0' }}>0</p>
              </div>
              <div style={{ background: 'white', padding: '30px', borderRadius: '30px', textAlign: 'center', borderTop: `8px solid ${CORES.secundaria}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h4 style={{ color: '#4B5563', fontSize: '12px', fontWeight: '900' }}>👦 CRIANÇAS</h4>
                <p style={{ fontSize: '32px', fontWeight: '900', color: CORES.primaria, margin: '10px 0' }}>0</p>
              </div>
              <div style={{ background: 'white', padding: '30px', borderRadius: '30px', textAlign: 'center', borderTop: `8px solid ${CORES.secundaria}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h4 style={{ color: '#4B5563', fontSize: '12px', fontWeight: '900' }}>🧑 ADOLESCENTES</h4>
                <p style={{ fontSize: '32px', fontWeight: '900', color: CORES.primaria, margin: '10px 0' }}>0</p>
              </div>
            </div>

            {/* SEÇÃO DE INTELIGÊNCIA */}
            <div style={{ backgroundColor: CORES.primaria, color: 'white', padding: '40px', borderRadius: '40px', marginTop: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>🛡️ CENTRO DE INTELIGÊNCIA SIMCT</h3>
              <p style={{ opacity: 0.5, fontSize: '11px', marginTop: '5px' }}>AUDITORIA E DOSSIÊ FAMILIAR CRUZADO</p>
              <div style={{ marginTop: '30px', padding: '20px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold' }}>AGUARDANDO SELEÇÃO DE PRONTUÁRIO PARA ANÁLISE DE REINCIDÊNCIA...</p>
              </div>
            </div>
          </div>
        )}

        {/* ABA: REGISTRO (FORMULÁRIO DAS FOTOS) */}
        {abaAtiva === 'registro' && (
          <div style={{ background: 'white', padding: '40px', borderRadius: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: '900', color: CORES.primaria, borderBottom: '2px solid #F3F4F6', paddingBottom: '15px', marginBottom: '25px' }}>📝 FORMULÁRIO DE ENTRADA</h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#6B7280', marginBottom: '8px' }}>DATA E HORA DO RECEBIMENTO</label>
                <input type="datetime-local" style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid #F3F4F6', outline: 'none', fontWeight: 'bold' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#6B7280', marginBottom: '8px' }}>ORIGEM DO COMUNICADO (HORTOLÂNDIA)</label>
                <select style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '2px solid #F3F4F6', outline: 'none', fontWeight: 'bold', appearance: 'none' }}>
                  <option>SELECIONE A INSTITUIÇÃO...</option>
                  <option>EDUCAÇÃO MUNICIPAL</option>
                  <option>SAÚDE (UBS/HOSPITAL)</option>
                  <option>SEGURANÇA PÚBLICA (PM/GM)</option>
                </select>
              </div>

              <button style={{ backgroundColor: CORES.sucesso, color: 'white', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '14px', marginTop: '10px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                💾 SALVAR REGISTRO NO SICT
              </button>
            </div>
          </div>
        )}
      </div>

      <footer style={{ textAlign: 'center', padding: '40px', opacity: 0.4, fontSize: '10px', fontWeight: '900', color: '#6B7280' }}>
        CENTRAL DE DADOS SICT - SEGURANÇA JURÍDICA INSTITUCIONAL
      </footer>
    </div>
  );
}
