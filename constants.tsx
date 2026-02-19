
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
  { id: 'cons5', nome: 'MIRIAN', perfil: 'CONSELHEIRO', cargo: 'Conselheira', senha: '123456' },
  { id: 'cons3', nome: 'MILENA', perfil: 'CONSELHEIRO', cargo: 'Conselheira', senha: '123456' },
  { id: 'cons4', nome: 'SANDRA', perfil: 'CONSELHEIRO', cargo: 'Conselheira', senha: '123456' },
  { id: 'suplente1', nome: 'ROSILDA', perfil: 'SUPLENTE', cargo: 'Conselheira Suplente', senha: '123456', status: 'INATIVO' },
];

export const RODIZIO_ALFABETICO = ['LEANDRO', 'LUIZA', 'MILENA', 'MIRIAN', 'SANDRA'];

export const ORIGENS_HIERARQUICAS = [
  {
    label: 'ASSISTÊNCIA SOCIAL',
    options: [
      'CRAS AMANDA', 'CRAS BRASIL', 'CRAS CENTRAL', 'CRAS NOVO ANGULO', 
      'CRAS PRIMAVERA', 'CRAS SANTA IZABEL', 'CREAS CENTRAL', 
      'DAS (DEPTO ASSISTÊNCIA SOCIAL)', 'INSTITUIÇÃO DE ACOLHIMENTO'
    ].sort()
  },
  {
    label: 'EDUCAÇÃO (ESTADUAL)',
    options: [
      'E.E. AGALVIRA PINTO MONTEIRO',
      'E.E. DR. HONORINO FABBRI',
      'E.E. GUIDO ROSOLEN',
      'E.E. JARDIM ALINE',
      'E.E. JARDIM SANTA CLARA DO LAGO',
      'E.E. JONATAS DAVI VISEL DOS SANTOS',
      'E.E. MANOEL IGNÁCIO DA SILVA',
      'E.E. MARISTELA CAROLINA MELLIN',
      'E.E. PASTOR ROBERTO RODRIGUES DE AZEVEDO',
      'E.E. PAULO CAMILO DE CAMARGO',
      'E.E. PRISCILA FERNANDES DA ROCHA',
      'E.E. PROF. ANTONIO ZANLUCHI',
      'E.E. PROF. ELISEO MARSON',
      'E.E. PROF. EUZEBIO ANTONIO RODRIGUES',
      'E.E. PROF. JOSÉ CLARET DIONISIO',
      'E.E. PROF. WICKLEIN MACEDO SALDANHA',
      'E.E. PROFª. CONCEIÇÃO A. T. G. CARDINALES',
      'E.E. PROFª. CRISTIANE C. M. BRAGA',
      'E.E. PROFª. HEDY MADALENA BOCCHI',
      'E.E. PROFª. LIOMAR FREITAS CÂMARA',
      'E.E. PROFª. LIOMAR FREITAS CÂMARA (CEL JTO)',
      'E.E. PROFª. MARIA ANTONIETTA G. LA FORTEZZA',
      'E.E. PROFª. MARIA CRISTINA DE SOUZA LOBO',
      'E.E. PROFª. MARIA ROBERTA DE LIMA',
      'E.E. PROFª. MARIA RITA ARAUJO COSTA',
      'E.E. PROFª. PAULINA ROSA',
      'E.E. PROFª. PRISCILA DE FÁTIMA PINTO',
      'E.E. PROFª. RAQUEL SAES MELHADO DA SILVA',
      'E.E. RECREIO ALVORADA',
      'E.E. YASUO SASAKI',
      'ETEC DE HORTOLÂNDIA',
      'CPP HORTOLÂNDIA (EDUCAÇÃO)'
    ].sort()
  },
  {
    label: 'EDUCAÇÃO (MUNICIPAL)',
    options: [
      'EMEF AMANDA', 
      'EMEF JD. BRASIL', 
      'EMEF MARLECIENE PEREIRA', 
      'EMEF RENATO COSTA LIMA', 
      'EMEF TARSILA DO AMARAL', 
      'EMEI ALVORADA', 
      'EMEI PRIMAVERA', 
      'EMEI ROSOLÉM', 
      'EMEI SANTA IZABEL',
      'EMEF ARMELINDA ESPURIO DA SILVA',
      'EMEIEF BAIRRO TAQUARA BRANCA',
      'EMEI BAIRRO TRÊS CASAS',
      'EMEF CAIO FERNANDO GOMES PEREIRA',
      'CENTRO DE EDUCAÇÃO BÁSICA DO MUNICÍPIO DE HORTOLÂNDIA',
      'CIER - CENTRO INTEGRADO DE EDUCAÇÃO E REABILITAÇÃO',
      'EMEF PROF. CLAUDIO ROBERTO MARQUES',
      'EMEF DAYLA CRISTINA SOUZA DE AMORIM',
      'EMEF SAMUEL DA SILVA MENDONÇA',
      'EMEI ANGELITA INOCENTE NUNES BIDUTTI',
      'EMEI ANTONIETA CLAUDINE OLIVEIRA FUSARO CATUZZO',
      'EMEI OLINDA MARIA DE JESUS SOUZA',
      'EMEI PROFª. IZABEL SOSTENA DE SOUZA',
      'EMEIEF JD. SANTA AMÉLIA (HUMBERTO DE AMORIM LOPES)',
      'EMEIEF JOSÉ TENÓRIO DA SILVA',
      'EMEIEF LUIZA VITÓRIA OLIVEIRA Cruz',
      'EMEI EMILIANO SANCHEZ',
      'EMEI MIGUEL CAMILLO',
      'EMEB JOSIAS DA SILVA MACEDO',
      'EMEB RICHARD CHIBIM NAUMANN',
      'EMEI CARLOS VILELA',
      'EMEI JARDIM INTERLAGOS',
      'EMEI JARDIM NOVO CAMBUÍ',
      'EMEF JARDIM AMANDA (CAIC)',
      'EMEF LOURENÇO DANIEL ZANARDI',
      'EMEF FERNANDA GRAZIELLE RESENDE COVRE',
      'EMEF PROFª. HELENA FURTADO TAKAHASHI',
      'EMEF PROFª. JANILDE FLORES GABY DO VALE',
      'EMEF DONA ANA JOSÉ BODINI JANUÁRIO',
      'EMEI JARDIM NOSSA SENHORA DE FÁTIMA',
      'EMEI JARDIM NOSSA SENHORA AUXILIADORA',
      'EMEI JARDIM NOVA EUROPA',
      'EMEF JARDIM PRIMAVERA',
      'EMEI JARDIM SÃO PEDRO',
      'EMEI JARDIM SANTA CLARA DO LAGO I',
      'EMEI JARDIM SANTA EMILIA',
      'EMEI JARDIM SANTA ESMERALDA',
      'EMEI JARDIM SANTIAGO',
      'EMEIEF JOÃO CARLOS DO AMARAL SOARES',
      'EMEF JOÃO CALIXTO DA SILVA',
      'EMEI JARDIM AMANDA I',
      'EMEI JARDIM AMANDA II',
      'EMEF MARIA CÉLIA CABRAL AMARAL',
      'EMEF JOSÉ ROQUE (JD. BOA ESPERANÇA)',
      'EMEF SALVADOR ZACHARIAS P. JUNIOR',
      'EMEI JARDIM MINDA',
      'EMEI RESIDENCIAL SÃO SEBASTIÃO II',
      'EMEI VILA REAL (SEBASTIANA DAS DORES)',
      'EMEI JARDIM SANTA AMÉLIA',
      'EMEI NICOLAS THIAGO DOS SANTOS LOFRANI',
      'EMEI VILLAGIO GUIRALDELLI',
      'EMEI TARSILA DO AMARAL',
      'EMEI JARDIM SANTA CLARA DO LAGO II'
    ].sort()
  },
  {
    label: 'FAMÍLIA',
    options: [
      'AVÓ', 'AVÔ', 'IRMÃO(A)', 'MADRASTA', 'MÃE', 'PADRASTO', 'PAI', 'TIA', 'TIO'
    ].sort()
  },
  {
    label: 'SAÚDE',
    options: [
      'CAPS ADULTO', 'CAPS INFANTIL', 'HOSPITAL MUNICIPAL (MÁRIO COVAS)', 'SAMU', 
      'UBS AMANDA', 'UBS BRASIL', 'UBS CENTRAL', 'UBS NOVO ANGULO', 
      'UBS PRIMAVERA', 'UBS SANTA IZABEL', 'UPA AMANDA', 
      'UPA NOVA HORTOLÂNDIA', 'UPA ROSOLÉM'
    ].sort()
  },
  {
    label: 'SEGURANÇA',
    options: [
      'CONSELHO COMUNITÁRIO DE SEGURANÇA', 'GUARDA MUNICIPAL', 
      'POLÍCIA CIVIL', 'POLÍCIA MILITAR'
    ].sort()
  },
  {
    label: 'ÓRGÃOS E NÚCLEOS',
    options: [
      'DAS', 'NAD (NÚCLEO DE AVERIGUAÇÃO DE DENÚNCIA)', 
      'NEM (NÚCLEO EDUCACIONAL MULTIDISCIPLINAR)'
    ].sort()
  },
  {
    label: 'OUTROS',
    options: [
      'DENÚNCIA ESPONTÂNEA', 'DENÚNCIA TELEFÔNICA', 'DISQUE 100', 'JUDICIÁRIO'
    ].sort()
  }
];

export const CANAIS_COMUNICADO_LIST = [
  'ATENDIMENTO PRESENCIAL', 'ATENDIMENTO TELEFÔNICO', 'DISQUE 100', 
  'E-MAIL INSTITUCIONAL', 'RELATÓRIO', 'OFÍCIO', 'OFÍCIO MP', 'OFÍCIO JUDICIÁRIO'
].sort();

export type QueueCategory = 'OFICIO_TECNICO' | 'DENUNCIA_ANONIMA' | 'PRESENCIAL' | 'DIGITAL';

export const getQueueCategory = (origem: string, canal: string): { category: QueueCategory, label: string } => {
  const c = canal.toUpperCase();
  const o = origem.toUpperCase();
  if (c.includes('OFÍCIO') || o.includes('MP') || o.includes('JUDICIÁRIO') || o.includes('DELEGACIA')) {
    return { category: 'OFICIO_TECNICO', label: 'Ofício / Relatório' };
  }
  if (c.includes('100') || o.includes('ANÔNIMA')) {
    return { category: 'DENUNCIA_ANONIMA', label: 'Denúncia / Disque 100' };
  }
  if (c.includes('PRESENCIAL')) {
    return { category: 'PRESENCIAL', label: 'Presencial / Balcão' };
  }
  return { category: 'DIGITAL', label: 'E-mail / Digital' };
};

export const getEffectiveEscala = (dateStr: string, timeStr: string = "08:00"): string[] => {
  if (!dateStr) return [];
  const [hours] = timeStr.split(':').map(Number);
  let dt = new Date(`${dateStr}T12:00:00`);
  if (hours < 8) dt.setDate(dt.getDate() - 1);
  const dayOfWeek = dt.getDay();
  if (dayOfWeek === 6) dt.setDate(dt.getDate() - 1);
  if (dayOfWeek === 0) dt.setDate(dt.getDate() - 2);
  const day = dt.getDate();
  const month = dt.getMonth() + 1;
  const year = dt.getFullYear();
  if (year !== 2026) return ['MILENA', 'SANDRA', 'LEANDRO'];
  if (month === 2) { 
    const fevScale: Record<number, string[]> = {
      1: ['MILENA', 'SANDRA', 'LEANDRO'], 2: ['MIRIAN', 'LUIZA', 'SANDRA'], 3: ['LEANDRO', 'MILENA', 'LUIZA'],
      4: ['SANDRA', 'MIRIAN', 'MILENA'], 5: ['MILENA', 'LEANDRO', 'MIRIAN'], 6: ['LUIZA', 'SANDRA', 'LEANDRO'],
      9: ['LEANDRO', 'MIRIAN', 'MILENA'], 10: ['SANDRA', 'LUIZA', 'MIRIAN'], 11: ['MILENA', 'LEANDRO', 'LUIZA'],
      12: ['LUIZA', 'SANDRA', 'LEANDRO'], 13: ['MIRIAN', 'MILENA', 'SANDRA'], 16: ['SANDRA', 'LEANDRO', 'LUIZA'],
      17: ['MILENA', 'MIRIAN', 'LEANDRO'], 18: ['LUIZA', 'SANDRA', 'MIRIAN'], 19: ['MIRIAN', 'MILENA', 'SANDRA'],
      20: ['LEANDRO', 'LUIZA', 'MILENA'], 23: ['MILENA', 'SANDRA', 'MIRIAN'], 24: ['LUIZA', 'LEANDRO', 'SANDRA'],
      25: ['MIRIAN', 'MILENA', 'LEANDRO'], 26: ['LEANDRO', 'LUIZA', 'MILENA'], 27: ['SANDRA', 'MIRIAN', 'LUIZA']
    };
    return fevScale[day] || ['MILENA', 'SANDRA', 'LEANDRO'];
  }
  return ['LEANDRO', 'LUIZA', 'MILENA']; 
};

export const classifyTurno = (dateStr: string, timeStr: string): 'COMERCIAL' | 'PLANTAO' => {
  if (!dateStr || !timeStr) return 'COMERCIAL';
  const [hours] = timeStr.split(':').map(Number);
  const dt = new Date(dateStr + 'T12:00:00');
  const day = dt.getDay();
  const isWeekend = day === 0 || day === 6;
  const isBusinessHours = hours >= 8 && hours < 17;
  return (isWeekend || !isBusinessHours) ? 'PLANTAO' : 'COMERCIAL';
};

export const BAIRROS = [
  "JARDIM ADELAIDE", "JARDIM AMANDA I", "JARDIM AMANDA II", "JARDIM AMANDA III", 
  "JARDIM AMANDA IV", "JARDIM AMANDA V", "JARDIM BOA ESPERANÇA", "JARDIM BOA VISTA", 
  "JARDIM CAMPOS VERDES", "JARDIM CARMEN CRISTINA", "CENTRO", "CHÁCARAS ASSAY", 
  "CHÁCARAS FAZENDA COELHO", "CHÁCARAS PLANALTO", "CHÁCARAS RECREIO ALVORADA", 
  "JARDIM DAS COLINAS", "PARQUE DOS EUCALIPTOS", "JARDIM FIRENZE", "PARQUE GABRIEL", 
  "JARDIM GOLDEN PARK", "JARDIM GREEN PARK", "PARQUE DO HORTO", "JARDIM INTERLAGOS", 
  "JARDIM MALTA", "JARDIM NOVA ALVORADA", "JARDIM NOVA AMÉRICA", "JARDIM NOVA EUROPA", 
  "JARDIM NOVA HORTOLÂNDIA", "JARDIM NOVO ÂNGULO", "JARDIM NOVO CAMBUÍ", 
  "JARDIM NOSSA SENHORA AUXILIADORA", "JARDIM NOSSA SENHORA DE FÁTIMA", 
  "PARQUE ORTOLÂNDIA", "PARQUE ORESTES ÔNGARO", "PARQUE DOS PINHEIROS", 
  "VILA REAL SANTISTA", "REMANSO CAMPINEIRO", "JARDIM ROSOLÉM", 
  "JARDIM SANTA CLARA DO LAGO I", "JARDIM SANTA CLARA DO LAGO II", 
  "JARDIM SANTA CLARA DO LAGO III", "JARDIM SANTA CLARA DO LAGO IV", 
  "JARDIM SANTA EMÍLIA", "JARDIM SANTA ESMERALDA", "JARDIM SANTA IZABEL", 
  "JARDIM SANTA RITA DE CÁSSIA", "JARDIM SANTA RITA II", "JARDIM SANTIAGO", 
  "JARDIM SANTANA", "JARDIM SÃO BENTO", "JARDIM SÃO CAMILO", "JARDIM SÃO CAMILO II", 
  "JARDIM SÃO FELIPE", "JARDIM SÃO FELIPE II", "VILA SÃO FRANCISCO", 
  "JARDIM SÃO JORGE", "JARDIM SÃO JUDAS TADEU", "JARDIM SÃO LUIZ", 
  "PARQUE SÃO MIGUEL", "VILA SÃO PEDRO", "JARDIM SÃO PEDRO II", 
  "JARDIM SÃO SEBASTIÃO", "JARDIM SUMAREZINHO", "JARDIM TERRAS DE SANTO ANTÔNIO", 
  "VILLAGIO GHIRALDELLI"
].sort();

export const STATUS_LABELS: Record<string, string> = {
  'AGENDAR_REUNIAO_REDE': 'Agendar Reunião de Rede',
  'AGUARDAR_RESPOSTA_EMAIL': 'Aguardar Resposta do Email',
  'AGUARDANDO_ANALISE': 'Aguardando Análise',
  'AGUARDANDO_VALIDACAO': 'Aguardando Validação',
  'ARQUIVADO': 'Arquivado',
  'CONCLUIDO': 'Concluído',
  'EMAIL_RESPONDIDO': 'Email Respondido',
  'EM_PREENCHIMENTO': 'Em Preenchimento (Rascunho)',
  'ENCAMINHAR_NOTICIA_FATO': 'Encaminhar Noticia de Fato',
  'MONITORAMENTO': 'Monitoramento',
  'NAO_LIDO': 'Novo Documento',
  'NOTIFICAR': 'Notificar',
  'OFICIALIZADO': 'Oficializado',
  'OFICIO_RESPONDIDO': 'Ofício Respondido',
  'RESPONDER_EMAIL': 'Responder Email',
  'SOLICITAR_REUNIAO_REDE': 'Solicitar Reunião de Rede',
  'TIPIFICACAO_INCOMPLETA': 'Tipificação Incompleta'
};

export const UNIFIED_GENDER_OPTIONS = ["Masculino (Cisgênero)", "Feminino (Cisgênero)", "Mulher Trans / Homem Trans", "Não-binário / Gênero Fluido", "Outro / Prefere não informar"];

export const AGENTES_VIOLADORES_ESTRUTURA: Record<string, { options: string[] }> = {
  "ESTADO": { options: ["Hospitais", "Escolas", "Postos de Saúde", "Cartórios", "Defensoria", "Judiciário", "Ministério Público", "Polícias", "Creches"] },
  "FAMÍLIA": { options: ["Mãe", "Pai", "Padrasto", "MADRASTA", "Avós", "Irmãos", "Tios", "Parentes", "Responsável Legal"] },
  "SOCIEDADE": { options: ["Vizinhos", "Empresas", "Entidades Religiosas", "Escolas Privadas", "Hospitais Privados"] },
  "PRÓPRIA CONDCTA": { options: ["Atos da própria criança ou adolescente"] }
};

export const MEDIDAS_101_ECA = [
  { id: 'I', label: 'I - Encaminhamento: aos pais ou responsável, mediante termo de responsabilidade.' },
  { id: 'II', label: 'II - Orientação: apoio e acompanhamento temporários.' },
  { id: 'III', label: 'III - Educação: matrícula e frequência obrigatórias em estabelecimento oficial.' },
  { id: 'IV', label: 'IV - Programas: inclusão em serviços e programas oficiais ou comunitários.' },
  { id: 'V', label: 'V - Saúde: requisição de tratamento médico, psicológico ou psiquiátrico.' },
  { id: 'VI', label: 'VI - Tratamento Específico: inclusão em programa para alcoólatras e toxicômanos.' },
  { id: 'VII', label: 'VII - Acolhimento: acolhimento institucional.' }
];

export const MEDIDAS_129_ECA = [
  { id: 'I', label: 'I - Apoio à Família: encaminhamento a serviços e programas oficiais ou comunitários.' },
  { id: 'II', label: 'II - Tratamento de Adicções: auxílio, orientação e tratamento a alcoólatras e toxicômanos.' },
  { id: 'III', label: 'III - Saúde Mental: encaminhamento a tratamento psicológico ou psiquiátrico.' },
  { id: 'IV', label: 'IV - Cursos de Orientação: encaminhamento a cursos ou programas de orientação.' },
  { id: 'V', label: 'V - Obrigação Escolar: matricular o filho e acompanhar sua frequência escolar.' },
  { id: 'VI', label: 'VI - Tratamento Especializado: encaminhar a criança a tratamento especializado.' },
  { id: 'VII', label: 'VII - Advertência: advertência formal registrada em termo.' }
];

export const ATRIBUICOES_136_ECA = [
  { id: 'I', label: 'I - Atender crianças e adolescentes nas hipóteses previstas nos arts. 98 e 105, aplicando as medidas previstas no art. 101, I a VII.' },
  { id: 'II', label: 'II - Atender e aconselhar os pais ou responsável, aplicando as medidas previstas no art. 129, I a VII.' },
  { id: 'III-a', label: 'III-a - Requisitar serviços públicos nas áreas de saúde, education, assistência social, previdência, trabalho e segurança (Lei 15.268/2025).' },
  { id: 'III-b', label: 'III-b - Representar junto à autoridade judiciária nos caches de descumprimento injustificado de suas deliberações.' },
  { id: 'IV', label: 'IV - Encaminhar ao Ministério Público notícia de fato que constitua infração administrativa ou penal contra os direitos da criança ou adolescente.' },
  { id: 'V', label: 'V - Encaminhar à autoridade judiciária os casos de sua competência.' },
  { id: 'VI', label: 'VI - Providenciar a medida estabelecida pela autoridade judiciária para o adolescente autor de ato infracional.' },
  { id: 'VII', label: 'VII - Expedir notificações.' },
  { id: 'VIII', label: 'VIII - Requisitar certidões de nascimento e de óbito de criança ou adolescente, quando necessário.' },
  { id: 'IX', label: 'IX - Assessorar o Poder Executivo local na elaboração da proposta orçamentária.' },
  { id: 'X', label: 'X - Representar, em nome da pessoa e da família, contra a violação dos direitos previstos no art. 204, inciso II, da Constituição.' },
  { id: 'XI', label: 'XI - Representar ao Ministério Público para efeito das ações de perda ou suspensão do poder familiar.' },
  { id: 'XII', label: 'XII - Promover e incentivar ações de divulgação e treinamento para reconhecimento de sintomas de maus-tratos.' },
  { id: 'XIII-XX', label: 'XIII a XX - Lei Henry Borel: Ações articuladas contra violência doméstica e medidas protetivas de urgência.' },
  { id: 'PARAGRAFO_UNICO', label: 'P. Único - Comunicação imediata ao MP em caso de afastamento do convívio familiar.' }
];

export const REDE_HORTOLANDIA = {
  'SAÚDE': {
    'HOSPITAIS': ['Hospital Municipal de Hortolândia (Mário Covas)'],
    'UPAS': ['UPA Nova Hortolândia', 'UPA Rosolém', 'UPA Amanda'],
    'ESPECIALIDADES': ['CAPS Infantil', 'CAPS Adulto', 'NAD (Núcleo de Atendimento às Diferenças)'],
    'UBSS': ['UBS Primavera', 'UBS Brasil', 'UBS Amanda', 'UBS Central', 'UBS Novo Angulo', 'UBS Santa Izabel']
  },
  'ASSISTÊNCIA SOCIAL': {
    'CRAS': ['CRAS Primavera', 'CRAS Jd. Brasil', 'CRAS Amanda', 'CRAS Central', 'CRAS Novo Angulo', 'CRAS Santa Izabel'],
    'CREAS': ['CREAS Central'],
    'OUTROS': ['Centro Pop', 'DAS (Departamento de Assistência Social)']
  },
  'EDUCAÇÃO': {
    'SECRETARIA': ['Secretaria de Educação de Hortolândia'],
    'VAGAS': ['Setor de Vagas / Central de Matrículas']
  },
  'PREVIDÊNCIA': {
    'SERVIÇOS': ['BPC/LOAS', 'Auxílio-Reclusão', 'Pensão por Morte', 'Perícia Médica']
  },
  'TRABALHO': {
    'SERVIÇOS': ['Jovem Aprendiz', 'PETI (Erradicação Trabalho Infantil)', 'Qualificação Profissional']
  },
  'SEGURANÇA': {
    'SERVIÇOS': ['Patrulha Maria da Penha', 'Policiamento Comunitário', 'Registro de Ocorrência']
  }
};

export const SIPIA_HIERARCHY: Record<string, Record<string, string[]>> = {
  "CONVIVÊNCIA FAMILIAR E COMUNITÁRIA": {
    "Privação ou dificuldade de convívio": ["Omissão dever familiar", "Pensão alimentícia", "Impedimento contato pais/familiares", "Falta pais/parentes", "Subtração por familiares", "Falta/precariedade moradia", "Tráfico", "Fuga", "Abandono"],
    "Inadequação do convívio familiar": ["Falta de afeto/zelo/proteção", "Dificuldade estágio adoção", "Ambiente familiar violento", "Favorecimento uso drogas", "Ambiente prejudicial desenvolvimento", "Alienação parental"],
    "Violações à dignidade / negligência": ["Falta apoio emocional/psicológico", "Omissão educação escolar", "Omissão saúde/alimentação/higiene", "Omissão proteção/security"],
    "Ausência de programas (Estado)": ["Inexistência orientação sócio-familiar", "Falta vaga acolhimento", "Inexistência transferência renda", "Falta acolhimento adultos c/ crianças", "Falta vaga abrigo"],
    "Atos atentatórios": ["Desrespeito opinião criança (guarda/adoção)", "Negação filiação", "Indefinição paternidade", "Impedimento contato pais presos", "Impedimento acesso família/comunidade"]
  },
  "VIDA E SAÚDE": {
    "Não atendimento em saúde": ["Falta leitos", "Recusa aborto legal", "Falta atendimento especializado", "Não atendimento gestante", "Não atendimento usuário drogas", "Falta vacinação", "Não atendimento emergencial"],
    "Atendimento inadequado": ["Falta orientação diagnóstica/tratamento", "Cirurgia desnecessária", "Falta precedência", "Extrações dentárias desnecessárias", "Danos procedimentos", "Negligência profissional"],
    "Práticas irregulares": ["Falta prontuário", "Exigência presença pais para atender", "Falta alojamento conjunto nascimento", "Falta não identificação recém-nascido", "Proibição permanência acompanhante", "Não identificação recém-nascido", "Retirada compulsória bebê"],
    "Ausência de ações específicas": ["Falta prevention drogas", "Falta tratamento agressor sexual", "Ausência info epidemias", "Ausência saneamento ambiental/básico"],
    "Prejuízo por action/omissão": ["Falta notificação doença infecto-contagiosa", "Recusa atendimento (filosófico/religioso)", "Omissão socorro", "Condições precárias abrigo/socioeducativo"],
    "Atos atentatórios": ["Ameaça morte", "Uso droga como violência", "Tentativa homicídio", "Tentativa suicídio", "Automutilação", "Extração ilícita órgãos"]
  },
  "EDUCAÇÃO, CULTURA, ESPORTE E LAZER": {
    "Educação Infantil": ["Falta vaga pré-escola/creche", "Falta equipe especializada (0-3 e 3-6 anos)", "Distância casa/creche"],
    "Ensino Fundamental/Médio": ["Falta educação bilíngue", "Falta vaga ensino regular/noturno", "Inexistência escola completa"],
    "Impedimento permanência": ["Constrangimento", "Critérios discriminatórios", "Expulsão indevida", "Punições abusivas", "Transferência compulsória", "Evasão/Infrequência (por violação)"],
    "Falta condições educacionais": ["Ausência merenda", "Faltas professores", "Falta material", "Falta segurança", "Falta atendimento especializado (PCD/Altas habilidades)"],
    "Cultura/Esporte/Lazer": ["Falta manutenção equipamentos", "Inexistência de espaços", "Falta programas públicos", "Impedimento de acesso"]
  },
  "PROFISSIONALIZAÇÃO E PROTEÇÃO NO TRABALHO": {
    "Condições irregulares": ["Trabalho 14/15 anos", "Trabalho doméstico", "Escravidão", "Trabalho infantil", "Desrespeito direitos trabalhistas", "Jornada ilegal", "Trabalho noturno", "Incompatibilidade escolar"],
    "Remuneração/Relação laboral": ["Apropriação resultado trabalho", "Coação física/psicológica", "Trabalho sem remuneração", "Remuneração inadequada"],
    "Capacitação": ["Ausência encaminhamento programas", "Não acesso formação técnica (incluindo PCD e medidas proteção)"]
  },
  "LIBERDADE, RESPEITO E DIGNIDADE": {
    "RestRIções ir e vir": ["Apreensão/Detenção/Confinamento ilegal", "Exílio forçado", "Sequestro", "Recolhimento compulsório", "Impedimento acesso logradouro"],
    "Discriminação": ["Histórico ato infracional", "Raça/etnia", "Gênero", "Características pessoais", "Política/Ideologia", "Intolerância religiosa", "Orientação sexual/Identidade gênero", "Situação acolhimento/socioeducativo"],
    "Negação Cidadania": ["Cerceamento crença", "Violação intimidade", "Exposição imagem", "Omissão registro queixa", "Falta Registro Civil", "Omissão autoridade perante ameaça", "Violência patrimonial"],
    "Violência Psicológica": ["Tortura", "Tratamento cruel", "Humilhação", "Agressão verbal", "Cyberbullying"],
    "Violência Física": ["Supressão alimentação", "Tortura", "Castigo corporal", "Espancamento", "Maus tratos", "Violência letal"],
    "Violência Sexual": ["Estupro", "Exibicionismo", "Assédio", "Abuso (círculo social ou custódia)", "Aliciamento", "Satisfação lascívia"],
    "Exploração Sexual": ["Prostituição", "Pornografia infantil", "Registro/Armazenamento/Divulgação cena sexo"],
    "Atos Ilícitos": ["Corrupção de menores", "Aliciamento tráfico/porte drogas", "Envolvimento grupos armados"]
  }
};
