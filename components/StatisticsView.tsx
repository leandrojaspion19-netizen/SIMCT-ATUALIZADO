
import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, ShieldAlert, Activity, Filter, CalendarDays, X, BarChart, ArrowUpRight, Sparkles, ClipboardList, Building2, UserCheck, MailWarning, MapPin, Map, Scale, Gavel, History, FileText, AlertCircle, Stethoscope, GraduationCap, Heart, ShieldCheck, Zap, Briefcase, Users2, Clock, LayoutList, Sun } from 'lucide-react';
import { Documento, User as UserType, SipiaViolation, AgenteVioladorEntry } from '../types';
import { TIPOS_VIOLENCIA, STATUS_LABELS, INITIAL_USERS, BAIRROS } from '../constants';
import AIStatisticsAnalyzer from './AIStatisticsAnalyzer';

interface StatisticsViewProps {
  documents: Documento[];
}

const StatisticsView: React.FC<StatisticsViewProps> = ({ documents }) => {
  const stats = useMemo(() => {
    const counts = { 
      totalCriancas: 0, 
      violencias: {} as Record<string, number>, 
      bairros: {} as Record<string, number>,
      direitos: {} as Record<string, number>,
      agentes: {} as Record<string, number>,
      origens: {} as Record<string, number>,
      atribuicoesECA: {} as Record<string, number>,
      medidas101: {} as Record<string, number>,
      medidas129: {} as Record<string, number>,
      periodos: {
        COMERCIAL: 0,
        PLANTAO: 0
      }
    };

    documents.forEach(doc => {
      if (doc.periodo_recebimento) {
        counts.periodos[doc.periodo_recebimento] = (counts.periodos[doc.periodo_recebimento] || 0) + 1;
      }

      (doc.violencias || []).forEach(v => {
        if (v) counts.violencias[v] = (counts.violencias[v] || 0) + 1;
      });
      
      if (doc.bairro) {
        counts.bairros[doc.bairro] = (counts.bairros[doc.bairro] || 0) + 1;
      }
      
      counts.totalCriancas += doc.criancas?.length || 0;

      (doc.violacoesSipia || []).forEach(v => {
        if (v && v.fundamental && v.especifico) {
          const key = `${v.fundamental} | ${v.especifico}`;
          counts.direitos[key] = (counts.direitos[key] || 0) + 1;
        }
      });

      (doc.agentesVioladores || []).forEach(a => {
        if (a && a.principal) {
          counts.agentes[a.principal] = (counts.agentes[a.principal] || 0) + 1;
        }
      });

      if (doc.origem) {
        counts.origens[doc.origem] = (counts.origens[doc.origem] || 0) + 1;
      }

      (doc.medidas_detalhadas || []).forEach(m => {
        if (m && m.artigo_inciso) {
          counts.atribuicoesECA[m.artigo_inciso] = (counts.atribuicoesECA[m.artigo_inciso] || 0) + 1;
          if (m.artigo_inciso.startsWith('Art. 101')) {
            counts.medidas101[m.artigo_inciso] = (counts.medidas101[m.artigo_inciso] || 0) + 1;
          } else if (m.artigo_inciso.startsWith('Art. 129')) {
            counts.medidas129[m.artigo_inciso] = (counts.medidas129[m.artigo_inciso] || 0) + 1;
          }
        }
      });
    });
    return counts;
  }, [documents]);

  const sortRanking = (record: Record<string, number>) => 
    Object.entries(record).sort(([,a], [,b]) => b - a);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="bg-[#111827] p-10 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#2563EB] rounded-xl shadow-md"><TrendingUp className="w-8 h-8 text-white" /></div>
          <div>
            <h2 className="text-[20px] font-bold text-white uppercase tracking-tight">Estatísticas Estratégicas</h2>
            <p className="text-[13px] text-[#9CA3AF] font-medium uppercase mt-1">Monitoramento de Violações e Atuações Técnicas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Prontuários" value={documents.length} color="text-[#1F2937]" />
        <StatCard label="Crianças Atendidas" value={stats.totalCriancas} color="text-[#2563EB]" />
        <StatCard label="Violações Identificadas" value={Object.keys(stats.direitos).length} color="text-red-600" />
        <StatCard label="Medidas Aplicadas" value={Object.keys(stats.atribuicoesECA).length} color="text-[#D97706]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          label="Horário Comercial (08h-17h)" 
          value={stats.periodos.COMERCIAL} 
          color="text-blue-600" 
          icon={<Sun className="w-4 h-4 text-blue-500" />}
        />
        <StatCard 
          label="Plantão / Pós-Horário" 
          value={stats.periodos.PLANTAO} 
          color="text-amber-600" 
          icon={<Zap className="w-4 h-4 text-amber-500" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* DIREITOS VIOLADOS - SIPIA DETALHADO */}
        <section className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-4">
            <Scale className="w-5 h-5 text-blue-600" />
            <h3 className="text-[16px] font-bold text-[#111827] uppercase">Direito Fundamental e Específico (SIPIA)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortRanking(stats.direitos).slice(0, 10).map(([key, count]) => {
              const [fundamental, especifico] = key.split(' | ');
              return (
                <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{fundamental}</span>
                       <span className="text-[#1F2937] text-[13px] font-bold mt-1 uppercase leading-tight">{especifico}</span>
                    </div>
                    <span className="text-[11px] font-black text-[#1F2937] bg-white border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">{count} CASOS</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500 shadow-sm" 
                      style={{ width: `${documents.length > 0 ? (count / documents.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          {Object.keys(stats.direitos).length === 0 && (
            <p className="text-center text-[12px] text-slate-400 font-bold uppercase py-8 italic">Aguardando lançamentos técnicos para gerar estatísticas.</p>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* MEDIDAS ECA - ART 101 */}
        <section className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-4">
            <Gavel className="w-5 h-5 text-emerald-600" />
            <h3 className="text-[16px] font-bold text-[#111827] uppercase">Medidas Protetivas (Art. 101 ECA)</h3>
          </div>
          <div className="space-y-4">
            {sortRanking(stats.medidas101).map(([medida, count]) => (
              <div key={medida} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold uppercase">
                  <span className="text-[#4B5563] truncate mr-4">{medida}</span>
                  <span className="text-[#1F2937] bg-slate-100 px-2 rounded">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${documents.length > 0 ? (count / documents.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {Object.keys(stats.medidas101).length === 0 && (
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase italic py-4">Sem medidas protetivas lançadas.</p>
            )}
          </div>
        </section>

        {/* MEDIDAS ECA - ART 129 */}
        <section className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-[16px] font-bold text-[#111827] uppercase">Medidas aos Pais/Resp. (Art. 129 ECA)</h3>
          </div>
          <div className="space-y-4">
            {sortRanking(stats.medidas129).map(([medida, count]) => (
              <div key={medida} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold uppercase">
                  <span className="text-[#4B5563] truncate mr-4">{medida}</span>
                  <span className="text-[#1F2937] bg-slate-100 px-2 rounded">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${documents.length > 0 ? (count / documents.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {Object.keys(stats.medidas129).length === 0 && (
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase italic py-4">Sem medidas aos pais lançadas.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AGENTES VIOLADORES */}
        <section className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-4">
            <Users2 className="w-5 h-5 text-amber-600" />
            <h3 className="text-[16px] font-bold text-[#111827] uppercase">Agentes Violadores</h3>
          </div>
          <div className="space-y-4">
            {sortRanking(stats.agentes).slice(0, 8).map(([agente, count]) => (
              <div key={agente} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold uppercase">
                  <span className="text-[#4B5563]">{agente}</span>
                  <span className="text-[#1F2937]">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${documents.length > 0 ? (count / documents.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BAIRROS COM MAIOR INCIDÊNCIA */}
        <section className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-4">
            <MapPin className="w-5 h-5 text-red-600" />
            <h3 className="text-[16px] font-bold text-[#111827] uppercase">Incidência por Bairro</h3>
          </div>
          <div className="space-y-4">
            {sortRanking(stats.bairros).slice(0, 8).map(([bairro, count]) => (
              <div key={bairro} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold uppercase">
                  <span className="text-[#4B5563]">{bairro}</span>
                  <span className="text-[#1F2937]">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-500" 
                    style={{ width: `${documents.length > 0 ? (count / documents.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-12">
        <AIStatisticsAnalyzer stats={stats} totalDocs={documents.length} />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: number, color: string, icon?: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="text-[12px] font-semibold text-[#4B5563] uppercase tracking-wider">{label}</div>
      {icon}
    </div>
    <div className={`text-[24px] font-bold ${color}`}>{value}</div>
  </div>
);

export default StatisticsView;
