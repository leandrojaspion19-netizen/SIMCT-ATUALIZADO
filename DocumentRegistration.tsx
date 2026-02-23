// SICT HORTOLÂNDIA - SISTEMA ATUALIZADO (LAYOUT IMPECÁVEL)
import React, { useState } from 'react';

const SICT_Hortolandia = () => {
  // Estado para os Relatórios (O Coração dos Dados)
  const [registros, setRegistros] = useState([]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* 1. SEÇÃO: NOVO DOCUMENTO (Controle de Plantão) */}
      <section style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>📅 NOVO DOCUMENTO</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="date" max={new Date().toISOString().split("T")[0]} />
          <input type="time" placeholder="Horário de Recebimento" />
        </div>
      </section>

      {/* 2. SEÇÃO: ORIGEM E CANAL (Pastas de Hortolândia) */}
      <section style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
        <h3>📋 ORIGEM E CANAL DO COMUNICADO</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          
          <select>
            <option>SELECIONE A CATEGORIA</option>
            <option>EDUCAÇÃO MUNICIPAL</option>
            <option>EDUCAÇÃO ESTADUAL</option>
            <option>SAÚDE</option>
            <option>SEGURANÇA</option>
            <option>FAMÍLIA</option>
          </select>

          <select>
            <option>INSTITUIÇÃO (ORDEM ALFABÉTICA)</option>
            {/* Aqui entrarão as listas de Escolas e UBSs */}
          </select>

          <select>
            <option>CANAL DO COMUNICADO</option>
            <option>Atendimento Presencial</option>
            <option>Atendimento Telefônico</option>
            <option>E-mail Institucional</option>
            <option>Ofício</option>
            <option>Disque 100</option>
          </select>
        </div>
      </section>

      {/* 3. SEÇÃO: RELATÓRIO ESTATÍSTICO (Produtividade) */}
      <section style={{ backgroundColor: '#f0f7ff', padding: '15px', borderRadius: '8px' }}>
        <h3>📊 RESUMO DE ATENDIMENTOS (POLÍTICAS PÚBLICAS)</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div><strong>1ª Infância (0-6):</strong> 0</div>
          <div><strong>Crianças:</strong> 0</div>
          <div><strong>Adolescentes:</strong> 0</div>
          <div><strong>Total Atribuições:</strong> 0</div>
        </div>
      </section>

    </div>
  );
};

export default SICT_Hortolandia;
