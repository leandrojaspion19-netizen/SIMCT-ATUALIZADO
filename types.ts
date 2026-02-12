
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
  substituindo_id?: string;
  substituicao_ativa?: boolean;
  motivo_substituicao?: string;
  data_inicio_substituicao?: string;
  data_fim_prevista?: string;
}

export type DocumentStatus = 
  | 'NAO_LIDO' 
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
  | 'EMAIL_ENCAMINHADO'
  | 'AGUARDANDO_VALIDACAO'
  | 'OFICIALIZADO';

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
  requisicao_detalhes?: RequisicaoServico; // Novo campo para Art 136 III a
}

export interface Documento {
  id: string;
  origem: string;
  canal_comunicado: string; 
  data_recebimento: string;
  hora_rece_bimento?: string;
  periodo_recebimento?: 'COMERCIAL' | 'PLANTAO';
  data_encaminhamento: string;
  crianca_nome: string; 
  criancas: ChildData[]; 
  genitora_nome: string;
  cpf_genitora?: string; 
  bairro: string;
  informacoes_documento: string; 
  violacoesSipia: SipiaViolation[];
  agentesVioladores: AgenteVioladorEntry[];
  medidasProtecao: string[]; 
  medidas_detalhadas?: MedidaAplicada[];
  suspeito: SuspectType;
  violencias: ViolenceType[];
  observacoes_iniciais: string;
  status: DocumentStatus[];
  conselheiro_referencia_id: string;
  conselheiros_providencia_nomes: string[];
  conselheiro_providencia_id: string; 
  criado_por_id: string;
  criado_em: string;
  monitoramento?: MonitoringInfo;
  ciencia_registrada_por: string[];
  distribuicao_automatica: boolean;
  Status_Assinatura?: string; 
  is_manual_override?: boolean;
}

export interface Log {
  id: string;
  documento_id: string;
  usuario_id: string;
  usuario_nome: string;
  acao: string;
  data_hora: string;
}

export interface AgendaEntry {
  id: string;
  conselheiro_id: string;
  data: string;
  hora: string;
  local: string;
  participantes: string;
  descricao: string;
  tipo: 'REUNIAO' | 'NOTIFICACAO' | 'AUDIENCIA' | 'REUNIAO_REDE';
}

export interface ChildData {
  nome: string;
  data_nascimento: string;
  cpf?: string;
  idade_calculada?: number;
  categoria_idade?: string;
  sexo: string;
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
  especificacao?: string;
}

export interface DocumentFile {
  id: string;
  documento_id: string;
  nome: string;
  tipo: string;
  url: string;
  tamanho: number;
}

export interface MonitoringHistory {
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
  excluidoDoMonitoramento?: boolean;
}

export interface MonitoringInfo {
  servicos: string[];
  prazoEsperado: string;
  prazosIndividuais?: Record<string, string>;
  concluido: boolean;
  ativadoPorNome?: string;
  dataAtivacao?: string;
  historicoPrazos?: MonitoringHistory[];
  requisicoes?: RequisicaoServico[]; // Novo campo para rastrear requisições do Art 136 III a
}
