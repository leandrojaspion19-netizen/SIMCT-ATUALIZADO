
export type UserRole = 'ADMIN' | 'CONSELHEIRO' | 'ADMINISTRATIVO' | 'SUPLENTE';
export type UserStatus = 'ATIVO' | 'BLOQUEADO' | 'INATIVO' | 'AFASTADO';
export type ViolenceType = 'FÍSICA' | 'PSICOLÓGICA' | 'SEXUAL' | 'NEGLIGÊNCIA' | 'OUTROS';
export type SuspectType = 'PAI' | 'MAE' | 'PADRASTO' | 'MADRASTA' | 'TIOS' | 'TERCEIROS' | 'DESCONHECIDO';

export interface User {
  id: string;
  nome: string;
  perfil: UserRole;
  cargo: string;
  status?: UserStatus;
  tentativas_login?: number;
  substituicao_ativa?: boolean;
  substituindo_id?: string;
  data_inicio_substituicao?: string;
  data_fim_prevista?: string;
}

export type DocumentStatus = 
  | 'NAO_LIDO' 
  | 'EM_PREENCHIMENTO'
  | 'AGUARDANDO_VALIDACAO'
  | 'OFICIALIZADO'
  | 'CONCLUIDO'
  | 'TIPIFICACAO_INCOMPLETA'
  | 'AGUARDANDO_ANALISE'
  | 'NOTIFICACAO'
  | 'NOTIFICACAO_REFERENCIA'
  | 'NOTICIA_FATO_ENCAMINHADA'
  | 'AGUARDANDO_RESPOSTA'
  | 'RESPONDER_OFICIO'
  | 'OFICIO_RESPONDIDO'
  | 'SOLICITACAO_REDE'
  | 'RESPOSTA_ENVIADA'
  | 'ARQUIVADO'
  | 'MONITORAMENTO'
  | 'SOLICITAR_REUNIAO_REDE'
  | 'EMAIL_ENCAMINHADO';

export interface MedidaConfirmacao {
  usuario_id: string;
  usuario_nome: string;
  data_hora: string;
}

export interface MedidaAplicada {
  id: string;
  artigo_inciso: string;
  texto: string;
  autor_id: string;
  autor_nome: string;
  data_lancamento: string;
  conselheiros_requeridos: string[]; 
  confirmacoes: MedidaConfirmacao[];
}

export interface HistoricoPrazo {
  data_anterior: string;
  data_nova: string;
  justificativa: string;
  usuario_nome: string;
  data_registro: string;
}

export interface RequisicaoServico {
  id: string;
  area: string;
  servico: string;
  prazoDias: number;
  dataFinal: string;
  isForaDaRede: boolean;
  excluidoDoMonitoramento?: boolean;
  observacoes?: string; // Diretriz 93.2
}

export interface MonitoringInfo {
  concluido: boolean;
  prazoEsperado: string;
  historicoPrazos?: HistoricoPrazo[];
  requisicoes?: RequisicaoServico[];
}

export interface HistoricoMonitoramento {
  id: string;
  texto: string;
  data_hora: string;
  usuario_nome: string;
}

export interface SnapshotComparativo {
  violacoesSipia: SipiaViolation[];
  agentesVioladores: AgenteVioladorEntry[];
  medidas_detalhadas: MedidaAplicada[];
  atribuicoes_136: string[];
  observacao_monitoramento: string;
}

export interface Documento {
  id: string;
  origem: string;
  canal_comunicado: string; 
  data_recebimento: string;
  hora_rece_bimento?: string;
  periodo_rece_bimento?: 'COMERCIAL' | 'PLANTAO';
  crianca_nome: string; 
  criancas: ChildData[]; 
  genitora_nome: string;
  cpf_genitora?: string; 
  bairro: string; 
  informacoes_documento: string; 
  violacoesSipia: SipiaViolation[];
  agentesVioladores: AgenteVioladorEntry[];
  medidas_detalhadas?: MedidaAplicada[];
  atribuicoes_136?: string[];
  fundamentacao_tecnica?: string; // Diretriz 89.2
  relato_providencias?: string; // Diretriz 89.2
  observacoes_iniciais: string;
  status: DocumentStatus[];
  conselheiro_referencia_id: string;
  conselheiro_providencia_id: string; 
  conselheiros_providencia_nomes: string[];
  criado_em: string;
  is_improcedente?: boolean;
  justificativa_improcedencia?: string;
  observacao_monitoramento?: string; 
  monitoramento?: MonitoringInfo;
  historico_monitoramento?: HistoricoMonitoramento[];
  criado_por_id?: string;
  ciência_registrada_por?: string[];
  distribuicao_automatica?: boolean;
  is_manual_override?: boolean;
  snapshot_validado?: SnapshotComparativo;
}

export type LogType = 'SEGURANÇA' | 'DOCUMENTO' | 'SISTEMA' | 'VALIDAÇÃO' | 'MONITORAMENTO';

export interface Log {
  id: string;
  documento_id: string;
  usuario_id: string;
  usuario_nome: string;
  acao: string;
  tipo: LogType;
  data_hora: string;
}

export interface ChildData {
  nome: string;
  data_nascimento: string;
  cpf?: string;
  genero_identidade: string;
  idade_calculada?: number;
  categoria_idade?: string;
}

export interface SipiaViolation {
  fundamental: string;
  grupo: string;
  especifico: string;
}

export interface AgenteVioladorEntry {
  principal: string; 
  categoria: string; 
  tipo: 'PRINCIPAL' | 'SECUNDARIO';
}

export interface DocumentFile {
  id: string;
  nome: string;
  tamanho: number;
  tipo: string;
  url: string;
  data_upload: string;
}

export interface AgendaEntry {
  id: string;
  conselheiro_id: string;
  data: string;
  hora: string;
  local: string;
  participantes: string;
  descricao: string;
  tipo: 'REUNIAO' | 'VISITA' | 'AUDIENCIA' | 'OUTROS';
}
