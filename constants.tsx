
import { User, Documento, Log, ViolenceType } from './types';

export interface UserWithPassword extends User {
  senha?: string;
}

export const INITIAL_USERS: UserWithPassword[] = [
  { id: 'admin_lud', nome: 'LUDIMILA', perfil: 'ADMIN', cargo: 'ADM GERAL', senha: '123456' },
  { id: 'admin1', nome: 'EDSON', perfil: 'ADMIN', cargo: 'ADM', senha: '123456' },
  { id: 'admin2', nome: 'LUIZ', perfil: 'ADMIN', cargo: 'ADM', senha: '123456' },
  { id: 'admin3', nome: 'FATIMA', perfil: 'ADMIN', cargo: 'ADM', senha: '123456' },
  { id: 'cons1', nome: 'LEANDRO', perfil: 'CONSELHEIRO', cargo: 'Conselheiro', senha: '123456' },
  { id: 'cons2', nome: 'LUIZA', perfil: 'CONSELHEIRO', cargo: 'Conselheira', senha: '123456' },
  { id: 'cons3', nome: 'MILENA', perfil: 'CONSELHEIRO', cargo: 'Conselheira', senha: '123456' },
  { id: 'cons4', nome: 'SANDRA', perfil: 'CONSELHEIRO', cargo: 'Conselheira', senha: '123456' },
  { id: 'cons5', nome: 'MIRIAN', perfil: 'CONSELHEIRO', cargo: 'Conselheira', senha: '123456' },
  { id: 'suplente1', nome: 'ROSILDA', perfil: 'SUPLENTE', cargo: 'Conselheira Suplente', senha: '123456', status: 'INATIVO' },
];

export const ANNUAL_ESCALA: Record<string, Record<number, string[]>> = {
  '2025-12': {
    1: ['LEANDRO', 'MIRIAN', 'MILENA'], 2: ['SANDRA', 'LUIZA', 'MIRIAN'], 3: ['MILENA', 'LEANDRO', 'LUIZA'], 4: ['LUIZA', 'SANDRA', 'LEANDRO'], 5: ['MIRIAN', 'MILENA', 'SANDRA'], 6: ['MIRIAN'], 7: ['MIRIAN'], 8: ['SANDRA', 'LEANDRO', 'LUIZA'], 9: ['MILENA', 'MIRIAN', 'LEANDRO'], 10: ['LUIZA', 'SANDRA', 'MIRIAN'], 11: ['MIRIAN', 'MILENA', 'SANDRA'], 12: ['LEANDRO', 'LUIZA', 'MILENA'], 13: ['LEANDRO'], 14: ['LEANDRO'], 15: ['MILENA', 'SANDRA', 'MIRIAN'], 16: ['LUIZA', 'LEANDRO', 'SANDRA'], 17: ['MIRIAN', 'MILENA', 'LEANDRO'], 18: ['LEANDRO', 'LUIZA', 'MILENA'], 19: ['SANDRA', 'MIRIAN', 'LUIZA'], 20: ['SANDRA'], 21: ['SANDRA'], 22: ['LUIZA', 'MILENA', 'LEANDRO'], 23: ['MIRIAN', 'SANDRA', 'MILENA'], 24: ['LEANDRO', 'LUIZA', 'SANDRA'], 25: ['SANDRA', 'MIRIAN', 'LUIZA'], 26: ['MILENA', 'LEANDRO', 'MIRIAN'], 27: ['MILENA'], 28: ['MILENA'], 29: ['MIRIAN', 'LUIZA', 'SANDRA'], 30: ['LEANDRO', 'MILENA', 'LUIZA'], 31: ['SANDRA', 'MIRIAN', 'MILENA']
  },
  '2026-02': {
    1: ['MILENA'], 2: ['MIRIAN', 'LUIZA', 'SANDRA'], 3: ['LEANDRO', 'MILENA', 'LUIZA'], 4: ['SANDRA', 'MIRIAN', 'MILENA'], 5: ['MILENA', 'LEANDRO', 'MIRIAN'], 6: ['LUIZA', 'SANDRA', 'LEANDRO'], 7: ['LUIZA'], 8: ['LUIZA'], 9: ['LEANDRO', 'MIRIAN', 'MILENA'], 10: ['SANDRA', 'LUIZA', 'MIRIAN'], 11: ['MILENA', 'LEANDRO', 'LUIZA'], 12: ['LUIZA', 'SANDRA', 'LEANDRO'], 13: ['MIRIAN', 'MILENA', 'SANDRA'], 14: ['MIRIAN'], 15: ['MIRIAN'], 16: ['SANDRA', 'LEANDRO', 'LUIZA'], 17: ['MILENA', 'MIRIAN', 'LEANDRO'], 18: ['LUIZA', 'SANDRA', 'MIRIAN'], 19: ['MIRIAN', 'MILENA', 'SANDRA'], 20: ['LEANDRO', 'LUIZA', 'MILENA'], 21: ['LEANDRO'], 22: ['LEANDRO'], 23: ['MILENA', 'SANDRA', 'MIRIAN'], 24: ['LUIZA', 'LEANDRO', 'SANDRA'], 25: ['MIRIAN', 'MILENA', 'LEANDRO'], 26: ['LEANDRO', 'LUIZA', 'MILENA'], 27: ['SANDRA', 'MIRIAN', 'LUIZA'], 28: ['SANDRA']
  },
  '2026-03': {
    1: ['SANDRA'], 2: ['LUIZA', 'MILENA', 'LEANDRO'], 3: ['MIRIAN', 'SANDRA', 'MILENA'], 4: ['LEANDRO', 'LUIZA', 'SANDRA'], 5: ['SANDRA', 'MIRIAN', 'LUIZA'], 6: ['MILENA', 'LEANDRO', 'MIRIAN'], 7: ['MILENA'], 8: ['MILENA'], 9: ['MIRIAN', 'LUIZA', 'SANDRA'], 10: ['LEANDRO', 'MILENA', 'LUIZA'], 11: ['SANDRA', 'MIRIAN', 'MILENA'], 12: ['MILENA', 'LEANDRO', 'MIRIAN'], 13: ['LUIZA', 'SANDRA', 'LEANDRO'], 14: ['LUIZA'], 15: ['LUIZA'], 16: ['LEANDRO', 'MIRIAN', 'MILENA'], 17: ['SANDRA', 'LUIZA', 'MIRIAN'], 18: ['MILENA', 'LEANDRO', 'LUIZA'], 19: ['LUIZA', 'SANDRA', 'LEANDRO'], 20: ['MIRIAN', 'MILENA', 'SANDRA'], 21: ['MIRIAN'], 22: ['MIRIAN'], 23: ['SANDRA', 'LEANDRO', 'LUIZA'], 24: ['MILENA', 'MIRIAN', 'LEANDRO'], 25: ['LUIZA', 'SANDRA', 'MIRIAN'], 26: ['MIRIAN', 'MILENA', 'SANDRA'], 27: ['LEANDRO', 'LUIZA', 'MILENA'], 28: ['LEANDRO'], 29: ['LEANDRO'], 30: ['MILENA', 'SANDRA', 'MIRIAN'], 31: ['LUIZA', 'LEANDRO', 'SANDRA']
  },
  '2026-04': {
    1: ['MIRIAN', 'MILENA', 'LEANDRO'], 2: ['LEANDRO', 'LUIZA', 'MILENA'], 3: ['SANDRA', 'MIRIAN', 'LUIZA'], 4: ['SANDRA'], 5: ['SANDRA'], 6: ['LUIZA', 'MILENA', 'LEANDRO'], 7: ['MIRIAN', 'SANDRA', 'MILENA'], 8: ['LEANDRO', 'LUIZA', 'SANDRA'], 9: ['SANDRA', 'MIRIAN', 'LUIZA'], 10: ['MILENA', 'LEANDRO', 'MIRIAN'], 11: ['MILENA'], 12: ['MILENA'], 13: ['MIRIAN', 'LUIZA', 'SANDRA'], 14: ['LEANDRO', 'MILENA', 'LUIZA'], 15: ['SANDRA', 'MIRIAN', 'MILENA'], 16: ['MILENA', 'LEANDRO', 'MIRIAN'], 17: ['LUIZA', 'SANDRA', 'LEANDRO'], 18: ['LUIZA'], 19: ['LUIZA'], 20: ['LEANDRO', 'MIRIAN', 'MILENA'], 21: ['SANDRA', 'LUIZA', 'MIRIAN'], 22: ['MILENA', 'LEANDRO', 'LUIZA'], 23: ['LUIZA', 'SANDRA', 'LEANDRO'], 24: ['MIRIAN', 'MILENA', 'SANDRA'], 25: ['MIRIAN'], 26: ['MIRIAN'], 27: ['SANDRA', 'LEANDRO', 'LUIZA'], 28: ['MILENA', 'MIRIAN', 'LEANDRO'], 29: ['LUIZA', 'SANDRA', 'MIRIAN'], 30: ['MIRIAN', 'MILENA', 'SANDRA']
  },
  '2026-05': {
    1: ['LEANDRO', 'LUIZA', 'MILENA'], 2: ['LEANDRO'], 3: ['LEANDRO'], 4: ['MILENA', 'SANDRA', 'MIRIAN'], 5: ['LUIZA', 'LEANDRO', 'SANDRA'], 6: ['MIRIAN', 'MILENA', 'LEANDRO'], 7: ['LEANDRO', 'LUIZA', 'MILENA'], 8: ['SANDRA', 'MIRIAN', 'LUIZA'], 9: ['SANDRA'], 10: ['SANDRA'], 11: ['LUIZA', 'MILENA', 'LEANDRO'], 12: ['MIRIAN', 'SANDRA', 'MILENA'], 13: ['LEANDRO', 'LUIZA', 'SANDRA'], 14: ['SANDRA', 'MIRIAN', 'LUIZA'], 15: ['MILENA', 'LEANDRO', 'MIRIAN'], 16: ['MILENA'], 17: ['MILENA'], 18: ['MIRIAN', 'LUIZA', 'SANDRA'], 19: ['LEANDRO', 'MILENA', 'LUIZA'], 20: ['SANDRA', 'MIRIAN', 'MILENA'], 21: ['MILENA', 'LEANDRO', 'MIRIAN'], 22: ['LUIZA', 'SANDRA', 'LEANDRO'], 23: ['LUIZA'], 24: ['LUIZA'], 25: ['LEANDRO', 'MIRIAN', 'MILENA'], 26: ['SANDRA', 'LUIZA', 'MIRIAN'], 27: ['MILENA', 'LEANDRO', 'LUIZA'], 28: ['LUIZA', 'SANDRA', 'LEANDRO'], 29: ['MIRIAN', 'MILENA', 'SANDRA'], 30: ['MIRIAN']
  },
  '2026-06': {
    1: ['SANDRA', 'LEANDRO', 'LUIZA'], 2: ['MILENA', 'MIRIAN', 'LEANDRO'], 3: ['LUIZA', 'SANDRA', 'MIRIAN'], 4: ['MIRIAN', 'MILENA', 'SANDRA'], 5: ['LEANDRO', 'LUIZA', 'MILENA'], 6: ['LEANDRO'], 7: ['LEANDRO'], 8: ['MILENA', 'SANDRA', 'MIRIAN'], 9: ['LUIZA', 'LEANDRO', 'SANDRA'], 10: ['MIRIAN', 'MILENA', 'LEANDRO'], 11: ['LEANDRO', 'LUIZA', 'MILENA'], 12: ['SANDRA', 'MIRIAN', 'LUIZA'], 13: ['SANDRA'], 14: ['SANDRA'], 15: ['LUIZA', 'MILENA', 'LEANDRO'], 16: ['MIRIAN', 'SANDRA', 'MILENA'], 17: ['LEANDRO', 'LUIZA', 'SANDRA'], 18: ['SANDRA', 'MIRIAN', 'LUIZA'], 19: ['MILENA', 'LEANDRO', 'MIRIAN'], 20: ['MILENA'], 21: ['MILENA'], 22: ['MIRIAN', 'LUIZA', 'SANDRA'], 23: ['LEANDRO', 'MILENA', 'LUIZA'], 24: ['SANDRA', 'MIRIAN', 'MILENA'], 25: ['MILENA', 'LEANDRO', 'MIRIAN'], 26: ['LUIZA', 'SANDRA', 'LEANDRO'], 27: ['LUIZA'], 28: ['LUIZA'], 29: ['LEANDRO', 'MIRIAN', 'MILENA'], 30: ['SANDRA', 'LUIZA', 'MIRIAN']
  },
  '2026-07': {
    1: ['MILENA', 'LEANDRO', 'LUIZA'], 2: ['LUIZA', 'SANDRA', 'LEANDRO'], 3: ['MIRIAN', 'MILENA', 'SANDRA'], 4: ['MIRIAN'], 5: ['MIRIAN'], 6: ['SANDRA', 'LEANDRO', 'LUIZA'], 7: ['MILENA', 'MIRIAN', 'LEANDRO'], 8: ['LUIZA', 'SANDRA', 'MIRIAN'], 9: ['MIRIAN', 'MILENA', 'SANDRA'], 10: ['LEANDRO', 'LUIZA', 'MILENA'], 11: ['LEANDRO'], 12: ['LEANDRO'], 13: ['MILENA', 'SANDRA', 'MIRIAN'], 14: ['LUIZA', 'LEANDRO', 'SANDRA'], 15: ['MIRIAN', 'MILENA', 'LEANDRO'], 16: ['LEANDRO', 'LUIZA', 'MILENA'], 17: ['SANDRA', 'MIRIAN', 'LUIZA'], 18: ['SANDRA'], 19: ['SANDRA'], 20: ['LUIZA', 'MILENA', 'LEANDRO'], 21: ['MIRIAN', 'SANDRA', 'MILENA'], 22: ['LEANDRO', 'LUIZA', 'SANDRA'], 23: ['SANDRA', 'MIRIAN', 'LUIZA'], 24: ['MILENA', 'LEANDRO', 'MIRIAN'], 25: ['MILENA'], 26: ['MILENA'], 27: ['MIRIAN', 'LUIZA', 'SANDRA'], 28: ['LEANDRO', 'MILENA', 'LUIZA'], 29: ['SANDRA', 'MIRIAN', 'MILENA'], 30: ['MILENA', 'LEANDRO', 'MIRIAN'], 31: ['LUIZA', 'SANDRA', 'LEANDRO']
  },
  '2026-08': {
    1: ['LUIZA'], 2: ['LUIZA'], 3: ['LEANDRO', 'MIRIAN', 'MILENA'], 4: ['SANDRA', 'LUIZA', 'MIRIAN'], 5: ['MILENA', 'LEANDRO', 'LUIZA'], 6: ['LUIZA', 'SANDRA', 'LEANDRO'], 7: ['MIRIAN', 'MILENA', 'SANDRA'], 8: ['MIRIAN'], 9: ['MIRIAN'], 10: ['SANDRA', 'LEANDRO', 'LUIZA'], 11: ['MILENA', 'MIRIAN', 'LEANDRO'], 12: ['LUIZA', 'SANDRA', 'MIRIAN'], 13: ['MIRIAN', 'MILENA', 'SANDRA'], 14: ['LEANDRO', 'LUIZA', 'MILENA'], 15: ['LEANDRO'], 16: ['LEANDRO'], 17: ['MILENA', 'SANDRA', 'MIRIAN'], 18: ['LUIZA', 'LEANDRO', 'SANDRA'], 19: ['MIRIAN', 'MILENA', 'LEANDRO'], 20: ['LEANDRO', 'LUIZA', 'MILENA'], 21: ['SANDRA', 'MIRIAN', 'LUIZA'], 22: ['SANDRA'], 23: ['SANDRA'], 24: ['LUIZA', 'MILENA', 'LEANDRO'], 25: ['MIRIAN', 'SANDRA', 'MILENA'], 26: ['LEANDRO', 'LUIZA', 'SANDRA'], 27: ['SANDRA', 'MIRIAN', 'LUIZA'], 28: ['MILENA', 'LEANDRO', 'MIRIAN'], 29: ['MILENA'], 30: ['MILENA'], 31: ['MIRIAN', 'LUIZA', 'SANDRA']
  },
  '2026-09': {
    1: ['LEANDRO', 'MILENA', 'LUIZA'], 2: ['SANDRA', 'MIRIAN', 'MILENA'], 3: ['MILENA', 'LEANDRO', 'MIRIAN'], 4: ['LUIZA', 'SANDRA', 'LEANDRO'], 5: ['LUIZA'], 6: ['LUIZA'], 7: ['LEANDRO', 'MIRIAN', 'MILENA'], 8: ['SANDRA', 'LUIZA', 'MIRIAN'], 9: ['MILENA', 'LEANDRO', 'LUIZA'], 10: ['LUIZA', 'SANDRA', 'LEANDRO'], 11: ['MIRIAN', 'MILENA', 'SANDRA'], 12: ['MIRIAN'], 13: ['MIRIAN'], 14: ['SANDRA', 'LEANDRO', 'LUIZA'], 15: ['MILENA', 'MIRIAN', 'LEANDRO'], 16: ['LUIZA', 'SANDRA', 'MIRIAN'], 17: ['MIRIAN', 'MILENA', 'SANDRA'], 18: ['LEANDRO', 'LUIZA', 'MILENA'], 19: ['LEANDRO'], 20: ['LEANDRO'], 21: ['MILENA', 'SANDRA', 'MIRIAN'], 22: ['LUIZA', 'LEANDRO', 'SANDRA'], 23: ['MIRIAN', 'MILENA', 'LEANDRO'], 24: ['LEANDRO', 'LUIZA', 'MILENA'], 25: ['SANDRA', 'MIRIAN', 'LUIZA'], 26: ['SANDRA'], 27: ['SANDRA'], 28: ['LUIZA', 'MILENA', 'LEANDRO'], 29: ['MIRIAN', 'SANDRA', 'MILENA'], 30: ['LEANDRO', 'LUIZA', 'SANDRA']
  },
  '2026-10': {
    1: ['SANDRA', 'MIRIAN', 'LUIZA'], 2: ['MILENA', 'LEANDRO', 'MIRIAN'], 3: ['MILENA'], 4: ['MILENA'], 5: ['MIRIAN', 'LUIZA', 'SANDRA'], 6: ['LEANDRO', 'MILENA', 'LUIZA'], 7: ['SANDRA', 'MIRIAN', 'MILENA'], 8: ['MILENA', 'LEANDRO', 'MIRIAN'], 9: ['LUIZA', 'SANDRA', 'LEANDRO'], 10: ['LUIZA'], 11: ['LUIZA'], 12: ['LEANDRO', 'MIRIAN', 'MILENA'], 13: ['SANDRA', 'LUIZA', 'MIRIAN'], 14: ['MILENA', 'LEANDRO', 'LUIZA'], 15: ['LUIZA', 'SANDRA', 'LEANDRO'], 16: ['MIRIAN', 'MILENA', 'SANDRA'], 17: ['MIRIAN'], 18: ['MIRIAN'], 19: ['SANDRA', 'LEANDRO', 'LUIZA'], 20: ['MILENA', 'MIRIAN', 'LEANDRO'], 21: ['LUIZA', 'SANDRA', 'MIRIAN'], 22: ['MIRIAN', 'MILENA', 'SANDRA'], 23: ['LEANDRO', 'LUIZA', 'MILENA'], 24: ['LEANDRO'], 25: ['LEANDRO'], 26: ['MILENA', 'SANDRA', 'MIRIAN'], 27: ['LUIZA', 'LEANDRO', 'SANDRA'], 28: ['MIRIAN', 'MILENA', 'LEANDRO'], 29: ['LEANDRO', 'LUIZA', 'MILENA'], 30: ['SANDRA', 'MIRIAN', 'LUIZA'], 31: ['SANDRA']
  },
  '2026-11': {
    1: ['SANDRA'], 2: ['LUIZA', 'MILENA', 'LEANDRO'], 3: ['MIRIAN', 'SANDRA', 'MILENA'], 4: ['LEANDRO', 'LUIZA', 'SANDRA'], 5: ['SANDRA', 'MIRIAN', 'LUIZA'], 6: ['MILENA', 'LEANDRO', 'MIRIAN'], 7: ['MILENA'], 8: ['MILENA'], 9: ['MIRIAN', 'LUIZA', 'SANDRA'], 10: ['LEANDRO', 'MILENA', 'LUIZA'], 11: ['SANDRA', 'MIRIAN', 'MILENA'], 12: ['MILENA', 'LEANDRO', 'MIRIAN'], 13: ['LUIZA', 'SANDRA', 'LEANDRO'], 14: ['LUIZA'], 15: ['LUIZA'], 16: ['LEANDRO', 'MIRIAN', 'MILENA'], 17: ['SANDRA', 'LUIZA', 'MIRIAN'], 18: ['MILENA', 'LEANDRO', 'LUIZA'], 19: ['LUIZA', 'SANDRA', 'LEANDRO'], 20: ['MIRIAN', 'MILENA', 'SANDRA'], 21: ['MIRIAN'], 22: ['MIRIAN'], 23: ['SANDRA', 'LEANDRO', 'LUIZA'], 24: ['MILENA', 'MIRIAN', 'LEANDRO'], 25: ['LUIZA', 'SANDRA', 'MIRIAN'], 26: ['MIRIAN', 'MILENA', 'SANDRA'], 27: ['LEANDRO', 'LUIZA', 'MILENA'], 28: ['LEANDRO'], 29: ['LEANDRO'], 30: ['MILENA', 'SANDRA', 'MIRIAN']
  }
};

export const getEffectiveEscala = (dateStr: string): string[] => {
  if (!dateStr) return [];
  const date = new Date(dateStr + 'T12:00:00');
  const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  const day = date.getDate();
  return ANNUAL_ESCALA[yearMonth]?.[day] || [];
};

export const FERIADOS_HORTOLANDIA = [
  '01-01', '20-01', '21-04', '01-05', '19-05', '07-09', '12-10', '02-11', '15-11', '20-11', '25-12',
];

export const checkIsPlantao = (dateStr: string, timeStr: string): 'PLANTAO' | 'COMERCIAL' => {
  const date = new Date(dateStr + 'T12:00:00');
  const dayOfWeek = date.getDay();
  const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  if (dayOfWeek === 0 || dayOfWeek === 6 || FERIADOS_HORTOLANDIA.includes(monthDay)) return 'PLANTAO';
  if (timeStr) {
    const [hours] = timeStr.split(':').map(Number);
    if (hours < 8 || hours >= 17) return 'PLANTAO';
  }
  return 'COMERCIAL';
};

export const GENDER_LABELS: Record<string, string> = {
  'M': 'MASCULINO', 'F': 'FEMININO', 'NB': 'NÃO BINÁRIO', 'T': 'TRANSGÊNERO', 'I': 'INTERSEXO', 'OUTRO': 'OUTRO'
};

export const TERMOS_CONFORMIDADE_LGPD = `
TERMO DE CIÊNCIA E RESPONSABILIDADE – LGPD E SIGILO PROFISSIONAL
O usuário declara estar ciente de que as informações tratadas no SIMCT Hortolândia são de natureza sigilosa e protegidas pelo Estatuto da Criança e do Adolescente (ECA) e pela Lei Geral de Proteção de Dados (LGPD).
`;

export const BAIRROS = [
  "Chácara Planalto", "Chácara Recreio Alvorada", "Chácara Reymar", "Chácaras Acaraí", "Chácaras Assay", "Chácaras de Recreio – 2000", "Chácaras Fazenda Coelho", "Chácaras Fazenda Fazenda Coelho", "Chácaras Havaí", "Chácaras Luzitana", "Chácaras Nova Boa Vista", "Chácaras Panaino", "Condomínio Chácara Grota Azul", "Conjunto Habitacional Jardim Primavera", "Jardim Adelaide", "Jardim Aline", "Jardim Amanda I", "Jardim Amanda II", "Jardim Bela Vista", "Jardim Boa Esperança", "Jardim Boa Vista", "Jardim Brasil", "Jardim Campos Verdes", "Jardim Carmen Cristina", "Jardim Conceição", "Jardim das Colinas", "Jardim das Figueiras I", "Jardim das Figueiras II", "Jardim das Laranjeiras", "Jardim das Paineiras", "Jardim do Bosque", "Jardim do Brás", "Jardim do Lago", "Jardim Estefânia", "Jardim Estrela", "Jardim Everest", "Jardim Flamboyant", "Jardim Girassol", "Jardim Golden Park Residence", "Jardim Green Park Residence", "Jardim Interlagos", "Jardim Ipê", "Jardim Lírio", "Jardim Malta", "Jardim Minda", "Jardim Mirante de Sumaré", "Jardim Nossa Senhora Auxiliadora", "Jardim Nossa Senhora da Penha", "Jardim Nossa Senhora de Fátima", "Jardim Nossa Senhora de Lourdes", "Jardim Nova Alvorada", "Jardim Nova América", "Jardim Nova Boa Vista", "Jardim Nova Europa", "Jardim Nova Hortolândia I", "Jardim Nova Hortolândia II", "Jardim Novo Ângulo", "Jardim Novo Cambuí", "Jardim Novo Estrela", "Jardim Novo Horizonte", "Jardim Paulistinha", "Jardim Residencial Firenze", "Jardim Ricardo", "Jardim Rosolém", "Jardim Santa Amélia", "Jardim Santa Cândida", "Jardim Santa Clara do Lago I", "Jardim Santa Clara do Lago II", "Jardim Santa Emília", "Jardim Santa Esmeralda", "Jardim Santa Fé", "Jardim Santa Izabel", "Jardim Santa Luzia", "Jardim Santa Rita de Cássia", "Jardim Santana", "Jardim Santiago", "Jardim André", "Jardim Antônio", "Jardim Benedito", "Jardim Bento", "Jardim Camilo", "Jardim Jorge", "Jardim Pedro", "Jardim Sebastião", "Jardim Stella", "Jardim Sumarezinho", "Jardim Terras de Santo Antônio", "Jardim Viagem", "Jardim Villagio Ghiraldelli", "Loteamento Adventista Campineiro", "Loteamento Jardim Vila Verde", "Loteamento Recanto do Sol", "Loteamento Remanso Campineiro", "Núcleo Santa Isabel", "Paraíso Novo Ângulo", "Paraíso Hortolândia", "Parque Bellaville", "Parque do Horto", "Parque dos Pinheiros", "Parque Gabriel", "Parque Horizonte", "Parque Hortolândia", "Parque Odimar", "Parque Orestes Ôngaro", "Parque Ortolândia", "Parque Perón", "Parque Residencial João Luiz", "Parque Residencial Maria de Lourdes", "Parque São Miguel", "Parque Terras de Santa Maria", "Residencial Anauá", "Residencial Jardim de Mônaco", "Residencial Jardim do Jatobá", "Sítio Panorama", "Vila América", "Vila Conquista", "Vila Guedes", "Vila Inema", "Vila Real", "Vila Real Continuação", "Vila Real Santista", "Vila São Francisco", "Vila São Pedro", "Villa Flora"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const ORIGENS_CATEGORIZADAS = [
  { label: 'CANAIS DIRETOS E DENÚNCIAS', options: ['DENÚNCIA ESPONTÂNEA', 'DENÚNCIA TELEFÔNICA', 'DISQUE 100', 'E-MAIL INSTITUCIONAL', 'NOTIFICAÇÃO', 'O PRÓPRIO CONSELHO TUTELAR', 'SIPIA / WEB'].sort() },
  { label: 'FAMÍLIA E COMUNIDADE', options: ['MÃE/PAI/RESPONSÁVEL', 'OUTRO MEMBRO DA FAMÍLIA', 'VIZINHO'].sort() },
  { label: 'JUSTIÇA E SEGURANÇA PÚBLICA', options: ['DEFENSORIA PÚBLICA', 'DELEGACIA DA MULHER', 'DELEGACIA DE POLÍCIA/POLÍCIA CIVIL', 'FÓRUM / JUDICIÁRIO', 'GUARDA CIVIL MUNICIPAL/POLÍCIA MUNICIPAL', 'MINISTÉRIO PÚBLICO', 'POLÍCIA MILITAR', 'VARA DA INFÂNCIA E JUVENTUDE E DO IDOSO', 'VARA ÚNICA - NÃO ESPECIFICADA DA INFÂNCIA JUVENTUDE E DO IDOSO'].sort() },
  { label: 'ASSISTÊNCIA SOCIAL E ENTIDADES', options: ['CASA DA CRIANÇA', 'CMDCA', 'CONSELHO MUNICIPAL', 'CRAS AMANDA', 'CRAS NOVO ÂNGULO', 'CRAS ROSOLÉM', 'CRAS SANTA CLARA', 'CREAS HORTOLÂNDIA', 'ORGANIZAÇÃO DA SOCIEDADE CIVIL'].sort() },
  { label: 'SAÚDE - UNIDADES E EMERGÊNCIA', options: ['CAPS AD', 'CAPS INFANTIL', 'HOSPITAL DE EMERGÊNCIA / UPA', 'HOSPITAL MÁRIO COVAS', 'SAMU', 'UPA AMANDA', 'UPA ROSOLÉM', 'UBS ADELAIDE', 'UBS AMANDA I', 'UBS AMANDA II', 'UBS FIGUEIRAS', 'UBS MINDA', 'UBS NOVA HORTOLÂNDIA', 'UBS NOVO ÂNGULO', 'UBS ORESTES ONGARO', 'UBS ROSOLÉM', 'UBS SANTA CLARA'].sort() },
  { label: 'EDUCAÇÃO - REDES DE ENSINO', options: ['CEI AMANDA', 'CEI ROSOLÉM', 'COLEGIO ADVENTISTA', 'COLEGIO ANHANGUERA', 'COLEGIO IASP', 'CRECHE MUNICIPAL', 'EE JARDIM AMANDA', 'EE PAULO CAMILO', 'EE PROF. MANOEL IGNÁCIO', 'EE PROFESSORA ELIANA LOPES', 'EE ROSOLÉM', 'EMEB ADELAIDE', 'EMEB CLÁUDIO ROBERTO', 'EMEB DR. EDSON MOREIRA', 'EMEB PROFª MARILDA FADEL', 'ESCOLA', 'OUTRA CRECHE', 'OUTRA ESCOLA PARTICULAR'].sort() },
  {
    label: 'EDUCAÇÃO - ESCOLA MUNICIPAL',
    options: [
      "Ana José Bodini Januário Dona – Escola Municipal de Ensino Fundamental", "Armelinda Espurio da Silva – Escola Municipal de Ensino Fundamental", "Bairro Taquara Branca – EMEIEF", "Bairro Três Casas – Escola Municipal de Educação Infantil", "Caio Fernando Gomes Pereira – Escola Municipal de Ensino Fundamental", "Centro de Educação Básica do Município de Hortolândia", "Centro Integrado de Educação e Reabilitação Municipal", "Claudio Roberto Marques – Professor – Escola Municipal de Ensino Fundamental", "EMEF Jardim Primavera", "EMEF Salvador Zacharias P. Junior (municipal)", "EMEI Carlos Vilela", "EMEI Jardim Minda", "EMEI Jardim Nossa Senhora Auxiliadora", "EMEI Jardim Nosso Senhor da Auxiliadora", "EMEI Jardim Nova Europa", "EMEI Jardim Santa Amélia", "EMEI Jardim Santa Clara do Lago I", "EMEI Jardim Santa Clara do Lago II", "EMEI Jardim Santa Emilia", "EMEI Jardim Santa Esmeralda", "EMEI Jardim Santiago", "EMEI Jardim São Pedro", "EMEI Nicolas Thiago dos Santos Lofrani", "EMEI Residencial São Sebastião II", "EMEI Tarsila do Amaral", "EMEI Vila Real Sebastiana das Dores", "EMEI Villagio Guiraldelli", "EMEIEF Jardim Santa Amélia Humberto de Amorim Lopes", "EMEIEF José Tenório da Silva", "EMEIEF Luiza Vitória Oliveira Cruz", "Emiliano Sanchez – Escola Municipal de Educação Infantil", "Escola Municipal de Educação Básica Josias da Silva Macedo", "Escola Municipal de Educação Básica Richard Chibim Naumann", "Escola Municipal de Educação Infantil Angelita Inocente Nunes Bidutti", "Escola Municipal de Educação Infantil Antonieta Claudine Oliveira Fusaro Catuzzo", "Escola Municipal de Educação Infantil Jardim Interlagos", "Escola Municipal de Educação Infantil Jardim Nossa Senhora de Fátima", "Escola Municipal de Educação Infantil Jardim Novo Cambuí", "Escola Municipal de Educação Infantil Miguel Camillo", "Escola Municipal de Educação Infantil Olinda Maria de Jesus Souza", "Escola Municipal de Educação Infantil Professora Izabel Sostena de Souza", "Escola Municipal de Ensino Fundamental Dayla Cristina Souza de Amorim", "Escola Municipal de Ensino Fundamental Jardim Amanda Caic", "Escola Municipal de Ensino Fundamental Lourenço Daniel Zanardi", "Escola Municipal de Ensino Fundamental Samuel da Silva Mendonça", "Fernanda Grazielle Resende Covre – Escola Municipal de Ensino Fundamental", "Helena Furtado Takahashi – Professora – Escola Municipal de Ensino Fundamental", "Janilde Flores Gaby do Vale – Professora – Escola Municipal de Ensino Fundamental", "Jardim Amanda I – Escola Municipal de Educação Infantil", "Jardim Amanda II – Escola Municipal de Educação Infantil", "Jardim Boa Esperança – EMEF José Roque (unidade municipal)", "João Calixto da Silva – Escola Municipal de Ensino Fundamental", "João Carlos do Amaral Soares – Escola Municipal de Educação Infantil e Fundamental", "Maria Célia Cabral Amaral – Escola Municipal de Ensino Fundamental", "Renato da Costa Lima – Escola Municipal de Ensino Fundamental"
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  },
  {
    label: 'EDUCAÇÃO - ESCOLA ESTADUAL',
    options: [
      "Antonio Zanluchi Professor — Hortolândia-SP", "Cel Jto A EE Liomar Freitas Câmara Profa — Hortolândia-SP", "Centro de Progressão Penitenciária de Hortolândia — Hortolândia-SP", "Conceição Aparecida Terza Gomes Cardinales Professora — Hortolândia-SP", "Cristiane Chaves Moreira Braga Professora — Hortolândia-SP", "Eliseo Marson Professor — Hortolândia-SP", "ETEC de Hortolândia (Escola Técnica Estadual)", "Euzebio Antonio Rodrigues Professor — Hortolândia-SP", "Guido Rosolen — Hortolândia-SP", "Hedy Madalena Bocchi Professora — Hortolândia-SP", "Honorino Fabbri Doutor — Hortolândia-SP", "Jardim Aline — Hortolândia-SP", "Jardim Santa Clara do Lago — Hortolândia-SP", "Jonatas Davi Visel dos Santos — Hortolândia-SP", "José Claret Dionisio Professor — Hortolândia-SP", "Liomar Freitas Câmara Professora — Hortolândia-SP", "Manoel Ignacio da Silva — Hortolândia-SP", "Maria Antonietta Garnero La Fortezza Professora — Hortolândia-SP", "Maria Cristina de Souza Lobo Professora — Hortolândia-SP", "Maria Rita Araujo Costa Professora — Hortolândia-SP", "Maristela Carolina Mellin — Hortolândia-SP", "Paulina Rosa Professora — Hortolândia-SP", "Paulo Camilo de Camargo — Hortolândia-SP", "Priscila Fernandes da Rocha — Hortolândia-SP", "Raquel Saes Melhado da Silva Professora — Hortolândia-SP", "Recreio Alvorada — Hortolândia-SP", "Roberto Rodrigues de Azevedo Pastor — Hortolândia-SP", "Yasuo Sasaki — Hortolândia-SP"
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  },
  { label: 'OUTROS ÓRGÃOS (SGD)', options: ['OUTRO ÓRGÃO DO SISTEMA DE GARANTIA DE DIREITOS'] },
  { label: 'NOTIFICAÇÕES NOMINAIS', options: ['NOTIFICAÇÃO LEANDRO', 'NOTIFICAÇÃO LUIZA', 'NOTIFICAÇÃO MILENA', 'NOTIFICAÇÃO MIRIAN', 'NOTIFICAÇÃO SANDRA'].sort() }
];

export const EQUIPAMENTOS_REDE = [
  'UBS ADELAIDE', 'UBS AMANDA I', 'UBS AMANDA II', 'UBS ROSOLÉM', 'UBS SANTA CLARA', 'UBS NOVA HORTOLÂNDIA', 'UBS NOVO ÂNGULO', 'UBS MINDA', 'UBS FIGUEIRAS', 'UBS ORESTES ONGARO', 'CRAS AMANDA', 'CRAS ROSOLÉM', 'CRAS NOVO ÂNGULO', 'CRAS SANTA CLARA', 'CREAS', 'ACOLHIMENTO MUNICIPAL', 'CAPS INFANTIL', 'CAPS AD'
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const PASTAS_ART136_III_A = [
  { area: 'SAÚDE', servicos: ['UBS ADELAIDE', 'UBS AMANDA I', 'UBS AMANDA II', 'UBS FIGUEIRAS', 'UBS MINDA', 'UBS NOVA HORTOLÂNDIA', 'UBS NOVO ÂNGULO', 'UBS ORESTES ONGARO', 'UBS ROSOLÉM', 'UBS SANTA CLARA', 'CAPS AD', 'CAPS INFANTIL', 'UPA AMANDA', 'UPA ROSOLÉM', 'HOSPITAL MÁRIO COVAS', 'AMBULATÓRIO DE ESPECIALIDADES'].sort() },
  { area: 'EDUCAÇÃO', servicos: ['SECRETARIA MUNICIPAL DE EDUCAÇÃO (SME)', 'CONSELHO ESCOLAR', 'EMEB ADELAIDE', 'EMEB CLÁUDIO ROBERTO', 'EMEB DR. EDSON MOREIRA', 'EE ROSOLÉM', 'EE JARDIM AMANDA', 'COLEGIO IASP', 'SUPERVISÃO DE ENSINO'].sort() },
  { area: 'ASSISTÊNCIA SOCIAL', servicos: ['CRAS AMANDA', 'CRAS NOVO ÂNGULO', 'CRAS ROSOLÉM', 'CRAS SANTA CLARA', 'CRAS PRIMAVERA', 'CRAS VILA REAL', 'CREAS', 'NAD', 'DAS', 'SERVIÇO DE ABORDAGEM SOCIAL', 'ACOLHIMENTO MUNICIPAL'].sort() },
  { area: 'PREVIDÊNCIA', servicos: ['INSS HORTOLÂNDIA', 'PREV HORTOLÂNDIA'].sort() },
  { area: 'TRABALHO', servicos: ['PAT (POSTO DE ATENDIMENTO AO TRABALHADOR)', 'BANCO DO POVO', 'SECRETARIA DE DESENVOLVIMENTO ECONÔMICO'].sort() },
  { area: 'SEGURANÇA', servicos: ['GUARDA CIVIL MUNICIPAL (GCM)', 'POLÍCIA MILITAR (PM)', 'POLÍCIA CIVIL', 'CONSELHO COMUNITÁRIO DE SEGURANÇA (CONSEG)'].sort() }
];

export const TIPOS_DOCUMENTO = ['ATENDIMENTO PRESENCIAL', 'COMUNICAÇÃO INTERNA', 'DENÚNCIA ANÔNIMA', 'DENÚNCIA ESPONTÂNEA', 'DENÚNCIA TELEFÔNICA', 'DISQUE 100', 'E-MAIL INSTITUCIONAL', 'FICAI / COMUNICAÇÃO ESCOLAR', 'NOTIFICAÇÃO', 'OFÍCIO', 'RELATÓRIO', 'REQUISIÇÃO', 'TERMO DE DECLARAÇÃO'].sort();

export const SUSPEITOS = ['PAI', 'MAE', 'PADRASTO', 'MADRASTA', 'TIOS', 'TERCEIROS', 'DESCONHECIDO'].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const AGENTES_VIOLADORES_ESTRUTURA: Record<string, { desc: string, options: string[] }> = {
  "ESTADO": { desc: "Ação/omissão de agentes públicos.", options: ["Instituição de Saúde", "Hospital", "Instituição de Ensino", "Polícia Civil", "Polícia Militar"].sort() },
  "FAMÍLIA": { desc: "Ocorre no âmbito familiar.", options: ["Mãe", "Pai", "Padrasto", "Madrasta", "Avós", "Tio / Tia"].sort() },
  "SOCIEDADE": { desc: "Pessoas físicas ou instituições privadas.", options: ["Vizinho", "Amigo", "Conhecido", "Desconhecido"].sort() },
  "PRÓPRIA CONDUTA": { desc: "Comportamento do próprio adolescente.", options: ["Própria Conduta"] }
};

export const TIPOS_VIOLENCIA: ViolenceType[] = ['FÍSICA', 'PSICOLÓGICA', 'SEXUAL', 'NEGLIGÊNCIA', 'OUTROS'];

export const STATUS_LABELS: Record<string, string> = {
  AGUARDANDO_RESPOSTA: 'Aguardando Resposta', ARQUIVADO: 'Arquivado', NAO_LIDO: 'Documento não lido', NOTICIA_FATO_ENCAMINHADA: 'Notícia de Fato encaminhada', NOTIFICACAO: 'Notificação', NOTIFICACAO_REFERENCIA: 'Notificação/ Referência', OFICIO_RESPONDIDO: 'Ofício Respondido', RESPONDER_OFICIO: 'Responder Ofício', RESPOSTA_ENVIADA: 'Resposta enviada', SOLICITACAO_REDE: 'Solicitação de informação para rede', MONITORAMENTO: 'Monitoramento', SOLICITAR_REUNIAO_REDE: 'Solicitar reunião de rede', EMAIL_ENCAMINHADO: 'E-mail encaminhado', AGUARDANDO_VALIDACAO: 'Aguardando Validação', OFICIALIZADO: 'Oficializado'
};

export const SIPIA_HIERARCHY: Record<string, Record<string, string[]>> = {
  "Direito à Vida e à Saúde": { "Atos atentatórios": ["Ameaça de morte", "Tentativa de homicídio"].sort() },
  "Educação, Culture, Esporte e Lazer": { "Inexistência de ensino": ["Falta de vaga", "Falta de escola"].sort() }
};

export const MEDIDAS_PROTECAO_ECA = [
  { artigo: 'Art. 101 - Medidas de Proteção', incisos: ['Art. 101, I', 'Art. 101, II', 'Art. 101, III', 'Art. 101, IV', 'Art. 101, V'] },
  { artigo: 'Art. 129 - Medidas aos Pais/Responsável', incisos: ['Art. 129, I', 'Art. 129, II', 'Art. 129, III', 'Art. 129, IV', 'Art. 129, V'] },
  { artigo: 'Art. 136 - Atribuições do CT', incisos: ['Art. 136, I', 'Art. 136, II', 'Art. 136, III, a', 'Art. 136, III, b'] }
];

export const MEDIDAS_ECA_DESCRICAO: Record<string, string> = {
  'Art. 101, I': 'Encaminhamento aos pais ou responsável.', 'Art. 101, II': 'Orientação e apoio temporários.', 'Art. 101, III': 'Matrícula obrigatória.', 'Art. 101, IV': 'Inclusão em serviços oficiais.', 'Art. 101, V': 'Requisição de tratamento médico.',
  'Art. 129, I': 'Encaminhamento a programa de proteção à família.', 'Art. 129, II': 'Tratamento a alcoólatras/toxicômanos.', 'Art. 129, III': 'Tratamento psicológico.', 'Art. 129, IV': 'Cursos de orientação.', 'Art. 129, V': 'Obrigação de matricular o filho.',
  'Art. 136, I': 'Atender crianças e adolescentes.', 'Art. 136, II': 'Atender e aconselhar pais.', 'Art. 136, III, a': 'Requisitar serviços públicos.', 'Art. 136, III, b': 'Representar junto à autoridade judiciária.'
};
