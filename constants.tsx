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

export const FERIADOS_HORTOLANDIA = [
  '01-01', // Ano Novo
  '20-01', // São Sebastião (Padroeiro)
  '21-04', // Tiradentes
  '01-05', // Dia do Trabalho
  '19-05', // Aniversário de Hortolândia
  '07-09', // Independência
  '12-10', // Aparecida
  '02-11', // Finados
  '15-11', // Proclamação
  '20-11', // Zumbi
  '25-12', // Natal
];

export const checkIsPlantao = (dateStr: string, timeStr: string): 'PLANTAO' | 'COMERCIAL' => {
  const date = new Date(dateStr + 'T12:00:00');
  const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
  const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  
  // Fim de semana é plantão
  if (dayOfWeek === 0 || dayOfWeek === 6) return 'PLANTAO';
  
  // Feriado é plantão
  if (FERIADOS_HORTOLANDIA.includes(monthDay)) return 'PLANTAO';
  
  // Fora do horário comercial (08:00 às 17:00)
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const morningLimit = 8 * 60; // 08:00
    const eveningLimit = 17 * 60; // 17:00
    
    if (totalMinutes < morningLimit || totalMinutes > eveningLimit) {
      return 'PLANTAO';
    }
  }
  
  return 'COMERCIAL';
};

export const GENDER_LABELS: Record<string, string> = {
  'M': 'MASCULINO',
  'F': 'FEMININO',
  'NB': 'NÃO BINÁRIO',
  'T': 'TRANSGÊNERO',
  'I': 'INTERSEXO',
  'OUTRO': 'OUTRO'
};

export const ANNUAL_ESCALA: Record<string, Record<number, string[]>> = {
  '2026-02': {
    1: ['MILENA'], 2: ['MIRIAN', 'LUIZA', 'SANDRA'], 3: ['LEANDRO', 'MILENA', 'LUIZA'], 4: ['SANDRA', 'MIRIAN', 'MILENA'], 5: ['MILENA', 'LEANDRO', 'MIRIAN'], 6: ['LUIZA', 'SANDRA', 'LEANDRO'], 7: ['LUIZA'], 8: ['LUIZA'], 9: ['LEANDRO', 'MIRIAN', 'MILENA'], 10: ['SANDRA', 'LUIZA', 'MIRIAN'], 11: ['MILENA', 'LEANDRO', 'LUIZA'], 12: ['LUIZA', 'SANDRA', 'LEANDRO'], 13: ['MIRIAN', 'MILENA', 'SANDRA'], 14: ['MIRIAN'], 15: ['MIRIAN'], 16: ['SANDRA', 'LEANDRO', 'LUIZA'], 17: ['MILENA', 'MIRIAN', 'LEANDRO'], 18: ['LUIZA', 'SANDRA', 'MIRIAN'], 19: ['MIRIAN', 'MILENA', 'SANDRA'], 20: ['LEANDRO', 'LUIZA', 'MILENA'], 21: ['LEANDRO'], 22: ['LEANDRO'], 23: ['MILENA', 'SANDRA', 'MIRIAN'], 24: ['LUIZA', 'LEANDRO', 'SANDRA'], 25: ['MIRIAN', 'MILENA', 'LEANDRO'], 26: ['LEANDRO', 'LUIZA', 'MILENA'], 27: ['SANDRA', 'MIRIAN', 'LUIZA'], 28: ['SANDRA']
  },
  '2026-03': {
    1: ['SANDRA'], 2: ['LUIZA', 'MILENA', 'LEANDRO'], 3: ['MIRIAN', 'SANDRA', 'MILENA'], 4: ['LEANDRO', 'LUIZA', 'SANDRA'], 5: ['SANDRA', 'MIRIAN', 'LUIZA'], 6: ['MILENA', 'LEANDRO', 'MIRIAN'], 7: ['MILENA'], 8: ['MILENA'], 9: ['MIRIAN', 'LUIZA', 'SANDRA'], 10: ['LEANDRO', 'MILENA', 'LUIZA'], 11: ['SANDRA', 'MIRIAN', 'MILENA'], 12: ['MILENA', 'LEANDRO', 'MIRIAN'], 13: ['LUIZA', 'SANDRA', 'LEANDRO'], 14: ['LUIZA'], 15: ['LUIZA'], 16: ['LEANDRO', 'MIRIAN', 'MILENA'], 17: ['SANDRA', 'LUIZA', 'MIRIAN'], 18: ['MILENA', 'LEANDRO', 'LUIZA'], 19: ['LUIZA', 'SANDRA', 'LEANDRO'], 20: ['MIRIAN', 'MILENA', 'SANDRA'], 21: ['MIRIAN'], 22: ['MIRIAN'], 23: ['SANDRA', 'LEANDRO', 'LUIZA'], 24: ['MILENA', 'MIRIAN', 'LEANDRO'], 25: ['LUIZA', 'SANDRA', 'MIRIAN'], 26: ['MIRIAN', 'MILENA', 'SANDRA'], 27: ['LEANDRO', 'LUIZA', 'MILENA'], 28: ['LEANDRO'], 29: ['LEANDRO'], 30: ['MILENA', 'SANDRA', 'MIRIAN'], 31: ['LUIZA', 'LEANDRO', 'SANDRA']
  }
};

export const getEffectiveEscala = (dateStr: string): string[] => {
  if (!dateStr) return [];
  const date = new Date(dateStr + 'T12:00:00');
  const dayOfWeek = date.getDay(); 
  let targetDate = new Date(date);
  if (dayOfWeek === 0) targetDate.setDate(date.getDate() - 2);
  else if (dayOfWeek === 6) targetDate.setDate(date.getDate() - 1);
  const yearMonth = `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const day = targetDate.getDate();
  return ANNUAL_ESCALA[yearMonth]?.[day] || [];
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
      "Ana José Bodini Januário Dona – Escola Municipal de Ensino Fundamental",
      "Armelinda Espurio da Silva – Escola Municipal de Ensino Fundamental",
      "Bairro Taquara Branca – EMEIEF",
      "Bairro Três Casas – Escola Municipal de Educação Infantil",
      "Caio Fernando Gomes Pereira – Escola Municipal de Ensino Fundamental",
      "Centro de Educação Básica do Município de Hortolândia",
      "Centro Integrado de Educação e Reabilitação Municipal",
      "Claudio Roberto Marques – Professor – Escola Municipal de Ensino Fundamental",
      "EMEF Jardim Primavera",
      "EMEF Salvador Zacharias P. Junior (municipal)",
      "EMEI Carlos Vilela",
      "EMEI Jardim Minda",
      "EMEI Jardim Nossa Senhora Auxiliadora",
      "EMEI Jardim Nosso Senhor da Auxiliadora",
      "EMEI Jardim Nova Europa",
      "EMEI Jardim Santa Amélia",
      "EMEI Jardim Santa Clara do Lago I",
      "EMEI Jardim Santa Clara do Lago II",
      "EMEI Jardim Santa Emilia",
      "EMEI Jardim Santa Esmeralda",
      "EMEI Jardim Santiago",
      "EMEI Jardim São Pedro",
      "EMEI Nicolas Thiago dos Santos Lofrani",
      "EMEI Residencial São Sebastião II",
      "EMEI Tarsila do Amaral",
      "EMEI Vila Real Sebastiana das Dores",
      "EMEI Villagio Guiraldelli",
      "EMEIEF Jardim Santa Amélia Humberto de Amorim Lopes",
      "EMEIEF José Tenório da Silva",
      "EMEIEF Luiza Vitória Oliveira Cruz",
      "Emiliano Sanchez – Escola Municipal de Educação Infantil",
      "Escola Municipal de Educação Básica Josias da Silva Macedo",
      "Escola Municipal de Educação Básica Richard Chibim Naumann",
      "Escola Municipal de Educação Infantil Angelita Inocente Nunes Bidutti",
      "Escola Municipal de Educação Infantil Antonieta Claudine Oliveira Fusaro Catuzzo",
      "Escola Municipal de Educação Infantil Jardim Interlagos",
      "Escola Municipal de Educação Infantil Jardim Nossa Senhora de Fátima",
      "Escola Municipal de Educação Infantil Jardim Novo Cambuí",
      "Escola Municipal de Educação Infantil Miguel Camillo",
      "Escola Municipal de Educação Infantil Olinda Maria de Jesus Souza",
      "Escola Municipal de Educação Infantil Professora Izabel Sostena de Souza",
      "Escola Municipal de Ensino Fundamental Dayla Cristina Souza de Amorim",
      "Escola Municipal de Ensino Fundamental Jardim Amanda Caic",
      "Escola Municipal de Ensino Fundamental Lourenço Daniel Zanardi",
      "Escola Municipal de Ensino Fundamental Samuel da Silva Mendonça",
      "Fernanda Grazielle Resende Covre – Escola Municipal de Ensino Fundamental",
      "Helena Furtado Takahashi – Professora – Escola Municipal de Ensino Fundamental",
      "Janilde Flores Gaby do Vale – Professora – Escola Municipal de Ensino Fundamental",
      "Jardim Amanda I – Escola Municipal de Educação Infantil",
      "Jardim Amanda II – Escola Municipal de Educação Infantil",
      "Jardim Boa Esperança – EMEF José Roque (unidade municipal)",
      "João Calixto da Silva – Escola Municipal de Ensino Fundamental",
      "João Carlos do Amaral Soares – Escola Municipal de Educação Infantil e Fundamental",
      "Maria Célia Cabral Amaral – Escola Municipal de Ensino Fundamental",
      "Renato da Costa Lima – Escola Municipal de Ensino Fundamental"
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  },
  {
    label: 'EDUCAÇÃO - ESCOLA ESTADUAL',
    options: [
      "Antonio Zanluchi Professor — Hortolândia-SP",
      "Cel Jto A EE Liomar Freitas Câmara Profa — Hortolândia-SP",
      "Centro de Progressão Penitenciária de Hortolândia — Hortolândia-SP",
      "Conceição Aparecida Terza Gomes Cardinales Professora — Hortolândia-SP",
      "Cristiane Chaves Moreira Braga Professora — Hortolândia-SP",
      "Eliseo Marson Professor — Hortolândia-SP",
      "ETEC de Hortolândia (Escola Técnica Estadual)",
      "Euzebio Antonio Rodrigues Professor — Hortolândia-SP",
      "Guido Rosolen — Hortolândia-SP",
      "Hedy Madalena Bocchi Professora — Hortolândia-SP",
      "Honorino Fabbri Doutor — Hortolândia-SP",
      "Jardim Aline — Hortolândia-SP",
      "Jardim Santa Clara do Lago — Hortolândia-SP",
      "Jonatas Davi Visel dos Santos — Hortolândia-SP",
      "José Claret Dionisio Professor — Hortolândia-SP",
      "Liomar Freitas Câmara Professora — Hortolândia-SP",
      "Manoel Ignacio da Silva — Hortolândia-SP",
      "Maria Antonietta Garnero La Fortezza Professora — Hortolândia-SP",
      "Maria Cristina de Souza Lobo Professora — Hortolândia-SP",
      "Maria Rita Araujo Costa Professora — Hortolândia-SP",
      "Maristela Carolina Mellin — Hortolândia-SP",
      "Paulina Rosa Professora — Hortolândia-SP",
      "Paulo Camilo de Camargo — Hortolândia-SP",
      "Priscila Fernandes da Rocha — Hortolândia-SP",
      "Raquel Saes Melhado da Silva Professora — Hortolândia-SP",
      "Recreio Alvorada — Hortolândia-SP",
      "Roberto Rodrigues de Azevedo Pastor — Hortolândia-SP",
      "Yasuo Sasaki — Hortolândia-SP"
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  },
  { label: 'OUTROS ÓRGÃOS (SGD)', options: ['OUTRO ÓRGÃO DO SISTEMA DE GARANTIA DE DIREITOS'] },
  { label: 'NOTIFICAÇÕES NOMINAIS', options: ['NOTIFICAÇÃO LEANDRO', 'NOTIFICAÇÃO LUIZA', 'NOTIFICAÇÃO MILENA', 'NOTIFICAÇÃO MIRIAN', 'NOTIFICAÇÃO SANDRA'].sort() }
];

export const EQUIPAMENTOS_REDE = [
  'UBS ADELAIDE', 'UBS AMANDA I', 'UBS AMANDA II', 'UBS ROSOLÉM', 
  'UBS SANTA CLARA', 'UBS NOVA HORTOLÂNDIA', 'UBS NOVO ÂNGULO', 
  'UBS MINDA', 'UBS FIGUEIRAS', 'UBS ORESTES ONGARO', 
  'CRAS AMANDA', 'CRAS ROSOLÉM', 'CRAS NOVO ÂNGULO', 'CRAS SANTA CLARA', 
  'CREAS', 'ACOLHIMENTO MUNICIPAL', 'CAPS INFANTIL', 'CAPS AD'
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const PASTAS_ART136_III_A = [
  { 
    area: 'SAÚDE', 
    servicos: [
      'UBS ADELAIDE', 'UBS AMANDA I', 'UBS AMANDA II', 'UBS FIGUEIRAS', 'UBS MINDA', 
      'UBS NOVA HORTOLÂNDIA', 'UBS NOVO ÂNGULO', 'UBS ORESTES ONGARO', 'UBS ROSOLÉM', 
      'UBS SANTA CLARA', 'CAPS AD', 'CAPS INFANTIL', 'UPA AMANDA', 'UPA ROSOLÉM', 
      'HOSPITAL MÁRIO COVAS', 'AMBULATÓRIO DE ESPECIALIDADES'
    ].sort() 
  },
  { 
    area: 'EDUCAÇÃO', 
    servicos: [
      'SECRETARIA MUNICIPAL DE EDUCAÇÃO (SME)', 'CONSELHO ESCOLAR', 'EMEB ADELAIDE', 
      'EMEB CLÁUDIO ROBERTO', 'EMEB DR. EDSON MOREIRA', 'EE ROSOLÉM', 'EE JARDIM AMANDA', 
      'COLEGIO IASP', 'SUPERVISÃO DE ENSINO'
    ].sort() 
  },
  {
    area: 'EDUCAÇÃO - ESCOLA MUNICIPAL',
    servicos: [
      "Ana José Bodini Januário Dona – Escola Municipal de Ensino Fundamental",
      "Armelinda Espurio da Silva – Escola Municipal de Ensino Fundamental",
      "Bairro Taquara Branca – EMEIEF",
      "Bairro Três Casas – Escola Municipal de Educação Infantil",
      "Caio Fernando Gomes Pereira – Escola Municipal de Ensino Fundamental",
      "Centro de Educação Básica do Município de Hortolândia",
      "Centro Integrado de Educação e Reabilitação Municipal",
      "Claudio Roberto Marques – Professor – Escola Municipal de Ensino Fundamental",
      "EMEF Jardim Primavera",
      "EMEF Salvador Zacharias P. Junior (municipal)",
      "EMEI Carlos Vilela",
      "EMEI Jardim Minda",
      "EMEI Jardim Nossa Senhora Auxiliadora",
      "EMEI Jardim Nosso Senhor da Auxiliadora",
      "EMEI Jardim Nova Europa",
      "EMEI Jardim Santa Amélia",
      "EMEI Jardim Santa Clara do Lago I",
      "EMEI Jardim Santa Clara do Lago II",
      "EMEI Jardim Santa Emilia",
      "EMEI Jardim Santa Esmeralda",
      "EMEI Jardim Santiago",
      "EMEI Jardim São Pedro",
      "EMEI Nicolas Thiago dos Santos Lofrani",
      "EMEI Residencial São Sebastião II",
      "EMEI Tarsila do Amaral",
      "EMEI Vila Real Sebastiana das Dores",
      "EMEI Villagio Guiraldelli",
      "EMEIEF Jardim Santa Amélia Humberto de Amorim Lopes",
      "EMEIEF José Tenório da Silva",
      "EMEIEF Luiza Vitória Oliveira Cruz",
      "Emiliano Sanchez – Escola Municipal de Educação Infantil",
      "Escola Municipal de Educação Básica Josias da Silva Macedo",
      "Escola Municipal de Educação Básica Richard Chibim Naumann",
      "Escola Municipal de Educação Infantil Angelita Inocente Nunes Bidutti",
      "Escola Municipal de Educação Infantil Antonieta Claudine Oliveira Fusaro Catuzzo",
      "Escola Municipal de Educação Infantil Jardim Interlagos",
      "Escola Municipal de Educação Infantil Jardim Nossa Senhora de Fátima",
      "Escola Municipal de Educação Infantil Jardim Novo Cambuí",
      "Escola Municipal de Educação Infantil Miguel Camillo",
      "Escola Municipal de Educação Infantil Olinda Maria de Jesus Souza",
      "Escola Municipal de Educação Infantil Professora Izabel Sostena de Souza",
      "Escola Municipal de Ensino Fundamental Dayla Cristina Souza de Amorim",
      "Escola Municipal de Ensino Fundamental Jardim Amanda Caic",
      "Escola Municipal de Ensino Fundamental Lourenço Daniel Zanardi",
      "Escola Municipal de Ensino Fundamental Samuel da Silva Mendonça",
      "Fernanda Grazielle Resende Covre – Escola Municipal de Ensino Fundamental",
      "Helena Furtado Takahashi – Professora – Escola Municipal de Ensino Fundamental",
      "Janilde Flores Gaby do Vale – Professora – Escola Municipal de Ensino Fundamental",
      "Jardim Amanda I – Escola Municipal de Educação Infantil",
      "Jardim Amanda II – Escola Municipal de Educação Infantil",
      "Jardim Boa Esperança – EMEF José Roque (unidade municipal)",
      "João Calixto da Silva – Escola Municipal de Ensino Fundamental",
      "João Carlos do Amaral Soares – Escola Municipal de Educação Infantil e Fundamental",
      "Maria Célia Cabral Amaral – Escola Municipal de Ensino Fundamental",
      "Renato da Costa Lima – Escola Municipal de Ensino Fundamental"
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  },
  {
    area: 'EDUCAÇÃO - ESCOLA ESTADUAL',
    servicos: [
      "Antonio Zanluchi Professor — Hortolândia-SP",
      "Cel Jto A EE Liomar Freitas Câmara Profa — Hortolândia-SP",
      "Centro de Progressão Penitenciária de Hortolândia — Hortolândia-SP",
      "Conceição Aparecida Terza Gomes Cardinales Professora — Hortolândia-SP",
      "Cristiane Chaves Moreira Braga Professora — Hortolândia-SP",
      "Eliseo Marson Professor — Hortolândia-SP",
      "ETEC de Hortolândia (Escola Técnica Estadual)",
      "Euzebio Antonio Rodrigues Professor — Hortolândia-SP",
      "Guido Rosolen — Hortolândia-SP",
      "Hedy Madalena Bocchi Professora — Hortolândia-SP",
      "Honorino Fabbri Doutor — Hortolândia-SP",
      "Jardim Aline — Hortolândia-SP",
      "Jardim Santa Clara do Lago — Hortolândia-SP",
      "Jonatas Davi Visel dos Santos — Hortolândia-SP",
      "José Claret Dionisio Professor — Hortolândia-SP",
      "Liomar Freitas Câmara Professora — Hortolândia-SP",
      "Manoel Ignacio da Silva — Hortolândia-SP",
      "Maria Antonietta Garnero La Fortezza Professora — Hortolândia-SP",
      "Maria Cristina de Souza Lobo Professora — Hortolândia-SP",
      "Maria Rita Araujo Costa Professora — Hortolândia-SP",
      "Maristela Carolina Mellin — Hortolândia-SP",
      "Paulina Rosa Professora — Hortolândia-SP",
      "Paulo Camilo de Camargo — Hortolândia-SP",
      "Priscila Fernandes da Rocha — Hortolândia-SP",
      "Raquel Saes Melhado da Silva Professora — Hortolândia-SP",
      "Recreio Alvorada — Hortolândia-SP",
      "Roberto Rodrigues de Azevedo Pastor — Hortolândia-SP",
      "Yasuo Sasaki — Hortolândia-SP"
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  },
  { 
    area: 'ASSISTÊNCIA SOCIAL', 
    servicos: [
      'CRAS AMANDA', 'CRAS NOVO ÂNGULO', 'CRAS ROSOLÉM', 'CRAS SANTA CLARA', 
      'CRAS PRIMAVERA', 'CRAS VILA REAL', 'CREAS', 'NAD', 'DAS', 
      'SERVIÇO DE ABORDAGEM SOCIAL', 'ACOLHIMENTO MUNICIPAL'
    ].sort() 
  },
  { area: 'PREVIDÊNCIA', servicos: ['INSS HORTOLÂNDIA', 'PREV HORTOLÂNDIA'].sort() },
  { area: 'TRABALHO', servicos: ['PAT (POSTO DE ATENDIMENTO AO TRABALHADOR)', 'BANCO DO POVO', 'SECRETARIA DE DESENVOLVIMENTO ECONÔMICO'].sort() },
  { area: 'SEGURANÇA', servicos: ['GUARDA CIVIL MUNICIPAL (GCM)', 'POLÍCIA MILITAR (PM)', 'POLÍCIA CIVIL', 'CONSELHO COMUNITÁRIO DE SEGURANÇA (CONSEG)'].sort() }
];

export const TIPOS_DOCUMENTO = ['ATENDIMENTO PRESENCIAL', 'COMUNICAÇÃO INTERNA', 'DENÚNCIA ANÔNIMA', 'DENÚNCIA ESPONTÂNEA', 'DENÚNCIA TELEFÔNICA', 'DISQUE 100', 'E-MAIL INSTITUCIONAL', 'FICAI / COMUNICAÇÃO ESCOLAR', 'NOTIFICAÇÃO', 'OFÍCIO', 'RELATÓRIO', 'REQUISIÇÃO', 'TERMO DE DECLARAÇÃO'].sort();

export const SUSPEITOS = ['PAI', 'MAE', 'PADRASTO', 'MADRASTA', 'TIOS', 'TERCEIROS', 'DESCONHECIDO'].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const AGENTES_VIOLADORES_ESTRUTURA: Record<string, { desc: string, options: string[] }> = {
  "ESTADO": {
    desc: "Quando a violação decorre de ação, omissão ou falha de órgãos, instituições ou agentes públicos.",
    options: ["Instituição de Saúde", "Hospital", "Ambulatório", "Posto de Saúde", "Instituição de Ensino", "Escola", "Creche", "Cartório", "Defensoria Pública", "Entidade de Atendimento", "Entidade / Organização de Assistência", "Justiça da Infância e da Juventude", "Ministério Público", "Polícia Civil", "Polícia Militar", "Pessoa Física (no exercício de função pública)"].sort()
  },
  "FAMÍLIA": {
    desc: "Quando a violação ocorre no âmbito familiar, por ação ou omissão de responsáveis legais ou parentes.",
    options: ["Mãe", "Pai", "Padrasto", "Madrasta", "Avós", "Irmãos", "Tio / Tia", "Responsável (que seja membro da família)", "Parentes de segundo grau", "Parentes de 3º grau ou mais", "Outro (familiar não listado)"].sort()
  },
  "SOCIEDADE": {
    desc: "Quando a violação é praticada por pessoas físicas não familiares, instituições privadas ou coletividades sociais.",
    options: ["Empresa / Empregador / Estabelecimento Comercial", "Instituição Privada", "Entidade (com ou sem fins lucrativos)", "Meios de Comunicação", "Pessoa Física (não familiar)", "Clube / Associação", "Entidades Religiosas", "Organizações Não-Governamentais (ONGs)", "Vizinho", "Amigo", "Conhecido", "Desconhecido", "Profissional autônomo", "Outro"].sort()
  },
  "PRÓPRIA CONDUTA": {
    desc: "Quando a violação decorre de comportamento do próprio adolescente, conforme avaliação técnica.",
    options: ["Própria Conduta"]
  }
};

export const TIPOS_VIOLENCIA: ViolenceType[] = ['FÍSICA', 'PSICOLÓGICA', 'SEXUAL', 'NEGLIGÊNCIA', 'OUTROS'];

export const STATUS_LABELS: Record<string, string> = {
  AGUARDANDO_RESPOSTA: 'Aguardando Resposta', ARQUIVADO: 'Arquivado', NAO_LIDO: 'Documento não lido', NOTICIA_FATO_ENCAMINHADA: 'Notícia de Fato encaminhada', NOTIFICACAO: 'Notificação', NOTIFICACAO_REFERENCIA: 'Notificação/ Referência', OFICIO_RESPONDIDO: 'Ofício Respondido', RESPONDER_OFICIO: 'Responder Ofício', RESPOSTA_ENVIADA: 'Resposta enviada', SOLICITACAO_REDE: 'Solicitação de informação para rede', MONITORAMENTO: 'Monitoramento', SOLICITAR_REUNIAO_REDE: 'Solicitar reunião de rede', EMAIL_ENCAMINHADO: 'E-mail encaminhado', AGUARDANDO_VALIDACAO: 'Aguardando Validação', OFICIALIZADO: 'Oficializado'
};

export const SIPIA_HIERARCHY: Record<string, Record<string, string[]>> = {
  "Direito à Vida e à Saúde": {
    "Não atendimento em saúde": ["Outros (especificar)", "Falta de leitos para internação hospitalar", "Recusa na realização do aborto legal", "Não atendimento especializado", "Não atendimento a gestante", "Não atendimento a usuário de droga lícita ou ilícita", "Falta de vacinação", "Não atendimento emergencial"].sort(),
    "Atendimento inadequado em saúde": ["Falta de orientação aos pais/responsáveis quanto ao diagnóstico, estado de saúde, tratamento, conduta e acompanhamento prescrito", "Procedimento cirúrgico desnecessário (invasivo ou não)", "Falta de precedência no atendimento a criança e adolescente", "Extrações odontológicas desnecessárias", "Danos Decorrente de Procedimentos executados ou prescritos", "Negligência no atendimento pelos profissionais"].sort(),
    "Práticas irregulares em restabelecimento da saúde": ["Inexistência ou não preenchimento de prontuário", "Exigência da presença dos pais para o atendimento em saúde", "Falta de alojamento conjunto no nascimento", "Falta de notificação em caso de suspeita ou confirmação de violência", "Proibição ou falta de condições de permanência do responsável em internações", "Não identificação do recém-nascido e sua mãe", "Retirada compulsória de bebê"].sort(),
    "Ausência de ações específicas de saúde pública": ["Falta de ações específicas para prevenção ao uso abusivo de drogas lícitas ou ilícitas", "Falta de programas ou ações específicas para le tratamento do agressor e/ou abusador sexual", "Ausência de informações sobre doenças ou epidemias em curso", "Ausência de saneamento ambiental", "Ausência de saneamento básico"].sort(),
    "Prejuízo à vida e saúde por ação/omissão": ["Falta de notificação de doença infecto-contagiosa", "Recusa de atendimento médico por razões filosóficas, ideológicas ou religiosas", "Omissão de socorro à criança/adolescente", "Condições precárias ou insalubres de instituições destinadas ao abrigamento ou aplicação de medidas socioeducativas"].sort(),
    "Atos atentatórios à vida e à saúde": ["Ameaça de morte", "Uso de droga lícita ou ilícita (como forma de violência ou negligência)", "Tentativa de homicídio", "Tentativa de suicídio", "Automutilação/Lesão autoprovocada (em contexto de violação de direitos)", "Cirurgias com fins ilícitos para extração de órgãos"].sort()
  },
  "Educação, Culture, Esporte e Lazer": {
    "Inexistência de ensino fundamental ou oferta inadequada": ["Falta de Escola de Nível Fundamental", "Falta de escola", "Falta de vaga no ensino fundamental", "Inexistência de ensino fundamental completo"].sort()
  },
  "Liberdade, Respeito e Dignidade": {
    "Restrições ao direito de ir e vir": ["Apreensão ilegal", "Confinamento de qualquer espécie", "Detenção ilegal", "Exílio ou afastamento forçado", "Sequestro", "RecolHimento compulsório", "Impedimento de acesso a logradouro público, conjuntos habitacionais, etc."].sort(),
    "Discriminação": ["Discriminação de criança/adolescente com histórico de ato infracional", "Isolamento ou tratamento desigual por raça/etnia", "Isolamento ou tratamento desigual por gênero", "Isolamento ou tratamento desigual por características pessoais", "Isolamento ou tratamento desigual por motivos políticos e/ou ideológicos", "Intolerância religiosa", "Isolamento ou tratamento desigual por orientação sexual ou identity de gênero", "Incitação da população contra criança/adolescente", "Discriminação de criança/adolescente em situação de acolhimento institucional", "Discriminação de adolescentes submetidos à medida socioeducativa"].sort(),
    "Negação do direito à liberdade e à cidadania (Atos atentatórios à cidadania)": ["Cercamento de crença e culto religioso", "Violação da intimidade e da vida privada", "Exposição indevida da imagem da criança/adolescente", "Recusa de auxílio, refúgio ou orientação", "Cercamento ou desrespeito à liberdade de opinião, expressão e de manifestação do pensamento", "Omissão de autoridade no registro ou na apuração de queixa", "Local inadequado para abrigamento e internamento de criança ou adolescente", "Falta de denúncia de maus tratos", "Restrição de direito não prevista em lei ou por ordem judicial", "Não comunicação da apreensão pela autoridade policial", "Local inadequado para atendimento de medidas protetivas e socioeducativas", "Inexistência de Registro Civil de Nascimento", "Omissão de autoridade perante ameaça ou violação de direitos da criança e do adolescente", "Violência patrimonial"].sort(),
    "Violência psicológica": ["Tortura psicológica", "Tratamento cruel ou degradante", "Humilhação pública", "Agressão verbal e ameaça", "Agressão à autoestima", "Cyberbullying"].sort(),
    "Violência física": ["Supressão da alimentação com caráter punitivo", "Tortura física", "Punição corporal/castigo corporal", "Espancamento/Agressão física", "Castigo físico", "Maus Tratos", "Violência letal"].sort(),
    "Violência sexual - abuso": ["Estupro", "Exibicionismo", "Abuso verbal/Telefonemas obscenos", "Assédio sexual", "Abuso sexual por members do círculo de relações sociais e de amizade com conjunção carnal ou não", "Aliciamento sexual", "Satisfação de lascívia", "Abuso sexual por detentores de custódia legal com conjunção carnal ou não"].sort(),
    "Violência sexual - exploração sexual": ["Corrupção para a prostituição e/ou exploração sexual comercial", "Pornografia infantil", "Registro e armazenamento de cenas de sexo ou pornografia infantil", "Exploração sexual por members do círculo de relações sociais e de amizade", "Aliciamento para fins de exploração sexual", "Outros (especificar)"].sort()
  }
};

/**
 * ECA Articles and common measures applied by the Council.
 */
export const MEDIDAS_PROTECAO_ECA = [
  {
    artigo: 'Art. 101 - Medidas de Proteção',
    incisos: [
      'Art. 101, I', 'Art. 101, II', 'Art. 101, III', 'Art. 101, IV', 
      'Art. 101, V', 'Art. 101, VI', 'Art. 101, VII', 'Art. 101, VIII', 'Art. 101, IX'
    ]
  },
  {
    artigo: 'Art. 129 - Medidas aos Pais/Responsável',
    incisos: [
      'Art. 129, I', 'Art. 129, II', 'Art. 129, III', 'Art. 129, IV',
      'Art. 129, V', 'Art. 129, VI', 'Art. 129, VII', 'Art. 129, VIII', 'Art. 129, IX', 'Art. 129, X'
    ]
  },
  {
    artigo: 'Art. 136 - Atribuições do CT',
    incisos: [
      'Art. 136, I', 'Art. 136, II', 'Art. 136, III, a', 'Art. 136, III, b', 
      'Art. 136, IV', 'Art. 136, V', 'Art. 136, VI', 'Art. 136, VII', 'Art. 136, VIII'
    ]
  }
];

/**
 * Descriptions for the measures based on the legal text of the ECA.
 */
export const MEDIDAS_ECA_DESCRICAO: Record<string, string> = {
  'Art. 101, I': 'Encaminhamento aos pais ou responsável, mediante termo de responsabilidade.',
  'Art. 101, II': 'Orientação, apoio e acompanhamento temporários.',
  'Art. 101, III': 'Matrícula e frequência obrigatórias em estabelecimento oficial de ensino fundamental.',
  'Art. 101, IV': 'Inclusão em serviços e programas oficiais ou comunitários de proteção, apoio e promoção da família, da criança e do adolescente.',
  'Art. 101, V': 'Requisição de tratamento médico, psicológico ou psiquiátrico, em regime hospitalar ou ambulatorial.',
  'Art. 101, VI': 'Inclusão em programa oficial ou comunitário de auxílio, orientação e tratamento a alcoólatras e toxicômanos.',
  'Art. 101, VII': 'Acolhimento institucional.',
  'Art. 101, VIII': 'Inclusão em programa de acolhimento familiar.',
  'Art. 101, IX': 'Colocação em família substituta.',
  
  'Art. 129, I': 'Encaminhamento a programa oficial ou comunitário de proteção à família.',
  'Art. 129, II': 'Inclusão em programa oficial ou comunitário de auxílio, orientação e tratamento a alcoólatras e toxicômanos.',
  'Art. 129, III': 'Encaminhamento a tratamento psicológico ou psiquiátrico.',
  'Art. 129, IV': 'Encaminhamento a cursos ou programas de orientação.',
  'Art. 129, V': 'Obrigação de matricular o filho ou enteado e acompanhar sua frequência e aproveitamento escolar.',
  'Art. 129, VI': 'Obrigação de encaminhar a criança ou adolescente a tratamento especializado.',
  'Art. 129, VII': 'Advertência.',
  'Art. 129, VIII': 'Perda da guarda.',
  'Art. 129, IX': 'Destituição da tutela.',
  'Art. 129, X': 'Suspensão ou destituição do poder familiar.',

  'Art. 136, I': 'Atender as crianças e adolescentes nas hipóteses previstas nos arts. 98 e 105, aplicando as medidas previstas no art. 101, I a VII.',
  'Art. 136, II': 'Atender e aconselhar os pais ou responsável, aplicando as medidas previstas no art. 129, I a VII.',
  'Art. 136, III, a': 'Requisitar serviços públicos nas áreas de saúde, educação, serviço social, previdência, trabalho e segurança.',
  'Art. 136, III, b': 'Representar junto à autoridade judiciária nos casos de descumprimento injustificado de suas deliberações.',
  'Art. 136, IV': 'Encaminhar ao Ministério Público notícia de fato que constitua infração administrativa ou penal contra os direitos da criança ou do adolescente.',
  'Art. 136, V': 'Encaminhar à autoridade judiciária os casos de sua competência.',
  'Art. 136, VI': 'Providenciar a medida estabelecida pela autoridade judiciária, dentre as previstas no art. 101, de I a VI, para o adolescente autor de ato infracional.',
  'Art. 136, VII': 'Expedir notificações.',
  'Art. 136, VIII': 'Requisitar certidões de nascimento e de óbito de criança ou adolescente quando necessário.'
};