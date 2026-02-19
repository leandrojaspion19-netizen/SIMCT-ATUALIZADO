
import React, { useState, useMemo } from 'react';
import { Search, Baby, Users, MapPin, Building2, Calendar, LayoutGrid, UserCheck, RefreshCw, Database, History, Fingerprint } from 'lucide-react';
import { Documento, User, DocumentStatus } from '../types';
import { BAIRROS, INITIAL_USERS, STATUS_LABELS, REDE_HORTOLANDIA } from '../constants';

interface AdvancedSearchProps {
  documents: Documento[];
  currentUser: User;
  onSelectDoc: (id: string) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ documents, onSelectDoc }) => {
  // DIRETRIZ 95.1: 8 Filtros Obrigatórios e Padronizados
  const initialFilters = {
    area_servico: '',      // 1. Escolher o Serviço (Rede)
    genitora_nome: '',     // 2. Nome da Genitora
    crianca_nome: '',      // 3. Nome da Criança/Adolescente
    bairro: '',            // 4. Bairro
    cpf_term: '',          // 5. CPF
    dataInicio: '',        // 6. Data de Registro (Início)
    dataFim: '',           // 6. Data de Registro (Fim)
    status: '',            // 7. Status do Documento
    conselheiro_ref_id: '' // 8. Conselheiro de Referência
  };

  const [filters, setFilters] = useState(initialFilters);

  const handleFilterChange = (field: keyof typeof initialFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => setFilters(initialFilters);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchService = !filters.area_servico || 
        doc.monitoramento?.requisicoes?.some(r => r.area === filters.area_servico);
      
      const matchGenitora = !filters.genitora_nome || 
        doc.genitora_nome.toUpperCase().includes(filters.genitora_nome.toUpperCase());
      
      const matchCrianca = !filters.crianca_nome || 
        doc.crianca_nome.toUpperCase().includes(filters.crianca_nome.toUpperCase());
      
      const matchBairro = !filters.bairro || doc.bairro === filters.bairro;
      
      const cleanTerm = filters.cpf_term.replace(/\D/g, '');
      const matchCpf = !filters.cpf_term || 
        doc.cpf_genitora?.replace(/\D/g, '').includes(cleanTerm) ||
        doc.criancas.some(c => c.cpf?.replace(/\D/g, '').includes(cleanTerm));
      
      const docDate = new Date(doc.data_recebimento).getTime();
      const matchDate = (!filters.dataInicio || docDate >= new Date(filters.dataInicio).getTime()) &&
                        (!filters.dataFim || docDate <= new Date(filters.dataFim).getTime());
      
      const matchStatus = !filters.status || doc.status.includes(filters.status as DocumentStatus);
      const matchRef = !filters.conselheiro_ref_id || doc.conselheiro_referencia_id === filters.conselheiro_ref_id;

      return matchService && matchGenitora && matchCrianca && matchBairro && matchCpf && matchDate && matchStatus && matchRef;
    });
  }, [documents, filters]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-32 translate-x-32 opacity-50 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
           <div className="flex items-center gap-4">
              <div className="p-4 bg-[#111827] text-white rounded-2xl shadow-xl"><Search className="w-8 h-8" /></div>
              <div>
                 <h2 className="text-[20px] font-black uppercase tracking-tight text-slate-800">Motor de Busca Padronizado</h2>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Diretriz 95 - Filtros Estratégicos Unificados</p>
              </div>
           </div>
           <button onClick={clearFilters} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100 shadow-sm active:scale-95">
              <RefreshCw className="w-4 h-4" /> Limpar Filtros
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Building2 className="w-3 h-3" /> 1. Rede de Serviço</label>
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-all" value={filters.area_servico} onChange={e => handleFilterChange('area_servico', e.target.value)}>
                <option value="">TODAS AS ÁREAS</option>
                {Object.keys(REDE_HORTOLANDIA).map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Users className="w-3 h-3" /> 2. Nome da Genitora</label>
              <input type="text" placeholder="BUSCAR MÃE..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500" value={filters.genitora_nome} onChange={e => handleFilterChange('genitora_nome', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Baby className="w-3 h-3" /> 3. Nome da Criança</label>
              <input type="text" placeholder="BUSCAR VÍTIMA..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500" value={filters.crianca_nome} onChange={e => handleFilterChange('crianca_nome', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> 4. Bairro</label>
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-all" value={filters.bairro} onChange={e => handleFilterChange('bairro', e.target.value)}>
                <option value="">TODOS OS BAIRROS</option>
                {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Fingerprint className="w-3 h-3" /> 5. CPF (Criança/Mãe)</label>
              <input type="text" placeholder="000.000.000-00" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black outline-none focus:border-blue-500" value={filters.cpf_term} onChange={e => handleFilterChange('cpf_term', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> 6. Período Registro</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] outline-none" value={filters.dataInicio} onChange={e => handleFilterChange('dataInicio', e.target.value)} />
                <input type="date" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] outline-none" value={filters.dataFim} onChange={e => handleFilterChange('dataFim', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><LayoutGrid className="w-3 h-3" /> 7. Situação / Status</label>
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-all" value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
                <option value="">TODOS OS STATUS</option>
                {Object.entries(STATUS_LABELS).map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> 8. Conselheiro Ref.</label>
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-all" value={filters.conselheiro_ref_id} onChange={e => handleFilterChange('conselheiro_ref_id', e.target.value)}>
                <option value="">QUALQUER REFERÊNCIA</option>
                {INITIAL_USERS.filter(u => u.perfil === 'CONSELHEIRO').map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Database className="w-5 h-5 text-blue-600" /> Resultados SIMCT</h2>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100 shadow-sm">{filteredDocs.length} Prontuários</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocolo</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Vítima (Criança/Adol.)</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Responsável (Mãe)</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Bairro</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Referência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDocs.map(doc => {
                 const ref = INITIAL_USERS.find(u => u.id === doc.conselheiro_referencia_id);
                 return (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => onSelectDoc(doc.id)}>
                    <td className="px-8 py-6 text-[11px] font-mono font-bold text-slate-400 group-hover:text-blue-600">#{doc.id}</td>
                    <td className="px-8 py-6 font-black text-slate-900 text-[14px] uppercase group-hover:translate-x-1 transition-transform">{doc.crianca_nome}</td>
                    <td className="px-8 py-6 text-[10px] text-slate-500 font-black uppercase">{doc.genitora_nome}</td>
                    <td className="px-8 py-6 text-[10px] text-emerald-600 font-black uppercase">{doc.bairro}</td>
                    <td className="px-8 py-6 text-right">
                       <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase border border-blue-100">{ref?.nome || 'N/A'}</span>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
        {filteredDocs.length === 0 && (
          <div className="py-40 text-center bg-slate-50/50 flex flex-col items-center">
             <History className="w-16 h-16 text-slate-200 mb-6" />
             <p className="text-[13px] font-black text-slate-300 uppercase tracking-[0.3em]">Nenhum registro localizado no banco unificado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
