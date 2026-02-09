
import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, ChevronDown, Calendar, Users, MapPin, Building2, X, ArrowRight } from 'lucide-react';
import { Documento, User, DocumentStatus } from '../types';
import { BAIRROS, ORIGENS_CATEGORIZADAS, INITIAL_USERS, STATUS_LABELS } from '../constants';

// Interface for AdvancedSearch props
interface AdvancedSearchProps {
  documents: Documento[];
  currentUser: User;
  onSelectDoc: (id: string) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ documents, onSelectDoc }) => {
  // State for search filters
  const [filters, setFilters] = useState({
    termo: '',
    origem: '',
    bairro: '',
    status: '',
    dataInicio: '',
    dataFim: ''
  });

  // State and Ref for Comunicante dropdown menu
  const [isFolderMenuOpen, setIsFolderMenuOpen] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (folderRef.current && !folderRef.current.contains(event.target as Node)) {
        setIsFolderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Logic to filter documents based on active filters
  const filteredDocs = documents.filter(doc => {
    const searchLower = (filters.termo || '').toUpperCase();
    const criancaNome = (doc.crianca_nome || '').toUpperCase();
    const genitoraNome = (doc.genitora_nome || '').toUpperCase();

    const matchTermo = !filters.termo || 
      criancaNome.includes(searchLower) ||
      genitoraNome.includes(searchLower);
    
    const matchOrigem = !filters.origem || doc.origem === filters.origem;
    const matchBairro = !filters.bairro || doc.bairro === filters.bairro;
    const matchStatus = !filters.status || doc.status.includes(filters.status as DocumentStatus);
    
    const docDate = new Date(doc.data_recebimento).getTime();
    const matchDataInicio = !filters.dataInicio || docDate >= new Date(filters.dataInicio).getTime();
    const matchDataFim = !filters.dataFim || docDate <= new Date(filters.dataFim).getTime();

    return matchTermo && matchOrigem && matchBairro && matchStatus && matchDataInicio && matchDataFim;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
          <input 
            type="text" 
            placeholder="PESQUISAR POR NOME DA CRIANÇA OU GENITORA..." 
            className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-slate-800 text-xs uppercase tracking-wider focus:border-blue-500 transition-all" 
            value={filters.termo}
            onChange={e => handleFilterChange('termo', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2 relative" ref={folderRef}>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Comunicante</label>
              <div 
                onClick={() => setIsFolderMenuOpen(!isFolderMenuOpen)}
                className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-all cursor-pointer flex items-center justify-between min-h-[48px]"
              >
                <span className={filters.origem ? "text-slate-800" : "text-slate-400"}>
                  {filters.origem || "TODOS OS COMUNICANTES"}
                </span>
                <ChevronDown className={`w-4 h-4 ${isFolderMenuOpen ? 'text-blue-600' : 'text-slate-300'}`} />
              </div>

              {isFolderMenuOpen && (
                <div className="absolute z-[100] left-0 right-0 top-[calc(100%+8px)] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[350px] flex flex-col">
                  <div className="overflow-y-auto p-2 space-y-1">
                    <div 
                      onClick={() => { handleFilterChange('origem', ''); setIsFolderMenuOpen(false); }}
                      className="p-3 hover:bg-slate-100 rounded-xl cursor-pointer text-[10px] font-black text-slate-400 uppercase tracking-widest"
                    >
                      TODOS OS COMUNICANTES
                    </div>
                    {ORIGENS_CATEGORIZADAS.map(group => (
                      <div key={group.label} className="space-y-1 mt-2">
                        <div className="px-3 py-1 text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">{group.label}</div>
                        {group.options.map(opt => (
                          <div 
                            key={opt}
                            onClick={() => { handleFilterChange('origem', opt); setIsFolderMenuOpen(false); }}
                            className="p-3 hover:bg-slate-100 rounded-xl cursor-pointer text-[10px] font-black text-slate-800 uppercase"
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Bairro</label>
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-all" value={filters.bairro} onChange={e => handleFilterChange('bairro', e.target.value)}>
                <option value="">TODOS OS BAIRROS</option>
                {BAIRROS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Status</label>
              <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-all" value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
                <option value="">TODOS OS STATUS</option>
                {Object.entries(STATUS_LABELS).map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Data Início</label>
              <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black outline-none" value={filters.dataInicio} onChange={e => handleFilterChange('dataInicio', e.target.value)} />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Resultados da Busca Administrativa</h2>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest">{filteredDocs.length} Registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocolo</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Criança / Adolescente</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Genitora</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Origem</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-all cursor-pointer" onClick={() => onSelectDoc(doc.id)}>
                  <td className="px-8 py-6 text-[10px] font-mono font-bold text-slate-400">{doc.id}</td>
                  <td className="px-8 py-6 font-black text-slate-900 text-sm uppercase tracking-tight">{doc.crianca_nome || 'N/I'}</td>
                  <td className="px-8 py-6 text-[10px] text-slate-500 font-black uppercase">{doc.genitora_nome || 'N/I'}</td>
                  <td className="px-8 py-6 text-[10px] text-blue-600 font-black uppercase">{doc.origem}</td>
                  {/* Corrected property access from doc.data_rece_bimento to doc.data_recebimento */}
                  <td className="px-8 py-6 text-xs font-black text-slate-700">{new Date(doc.data_recebimento).toLocaleDateString('pt-BR')}</td>
                  <td className="px-8 py-6 text-right"><ArrowRight className="w-5 h-5 text-slate-200" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
