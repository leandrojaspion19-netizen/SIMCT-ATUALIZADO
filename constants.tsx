
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

export const RODIZIO_ALFABETICO = ['LEANDRO', 'LUIZA', 'MILENA', 'MIRIAN', 'SANDRA'];

/* Added missing origin categories */
export const ORIGENS_CATEGORIZADAS = [
  {
    label: 'REDE DE PROTEÇÃO',
    options: ['ESCOLAS', 'HOSPITAIS', 'POSTOS DE SAÚDE', 'CRAS', 'CREAS', 'CONSELHO TUTELAR (OUTROS)']
  },
  {
    label: 'ÓRGÃOS JUDICIAIS',
    options: ['MINISTÉRIO PÚBLICO', 'PODER JUDICIÁRIO', 'DELEGACIA DE POLÍCIA']
  },
  {
    label: 'DENÚNCIAS',
    options: ['DISQUE 100', 'DENÚNCIA ESPONTÂNEA', 'DENÚNCIA ANÔNIMA']
  }
];

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

export const BAIRROS = ["CHÁCARAS ACAUÃ", "JARDIM ADELAIDE", "JARDIM AMANDA I", "JARDIM AMANDA II", "JARDIM AMANDA III", "JARDIM BRASIL", "JARDIM CENTRAL", "JARDIM NOVO ÂNGULO", "JARDIM PRIMAVERA", "JARDIM ROSOLÉM", "JARDIM SANTA CLARA", "JARDIM SANTA IZABEL", "VILA REAL"].sort();

export const CANAIS_COMUNICACAO = ['DISQUE 100', 'EMAIL INSTITUCIONAL', 'PRESENCIAL', 'OFÍCIO MP', 'OFÍCIO JUDICIÁRIO', 'SISTEMA INTEGRADO'];

export const STATUS_LABELS: Record<string, string> = {
  'NAO_LIDO': 'Novo Documento',
  'EM_PREENCHIMENTO': 'Em Preenchimento (Rascunho)',
  'AGUARDANDO_VALIDACAO': 'Aguardando Validação',
  'OFICIALIZADO': 'Oficializado',
  'CONCLUIDO': 'Concluído',
  'TIPIFICACAO_INCOMPLETA': 'Tipificação Incompleta',
  'AGUARDANDO_ANALISE': 'Aguardando Análise'
};

export const UNIFIED_GENDER_OPTIONS = ["Masculino (Cisgênero)", "Feminino (Cisgênero)", "Mulher Trans / Homem Trans", "Não-binário / Gênero Fluido", "Outro / Prefere não informar"];

export const AGENTES_VIOLADORES_ESTRUTURA: Record<string, { options: string[] }> = {
  "ESTADO": { options: ["Hospitais", "Escolas", "Postos de Saúde", "Cartórios", "Defensoria", "Judiciário", "Ministério Público", "Polícias", "Creches"] },
  "FAMÍLIA": { options: ["Mãe", "Pai", "Padrasto", "Madrasta", "Avós", "Irmãos", "Tios", "Parentes", "Responsável Legal"] },
  "SOCIEDADE": { options: ["Vizinhos", "Empresas", "Entidades Religiosas", "Escolas Privadas", "Hospitais Privados"] },
  "PRÓPRIA CONDUTA": { options: ["Atos da própria criança ou adolescente"] }
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
  { id: 'I', label: 'I - Atender Crianças/Adolescentes: (Arts. 98 e 105).' },
  { id: 'II', label: 'II - Atender/Aconselhar Pais: (Art. 129).' },
  { id: 'III-a', label: 'III - Promover Execução: (a) Requisitar serviços de saúde, educação, assistência social.' },
  { id: 'III-b', label: 'III - Representar por descumprimento injustificado de deliberações.' },
  { id: 'IV/V', label: 'IV/V - Encaminhamentos: Notícia de fato ao MP ou autoridade judiciária.' },
  { id: 'VII', label: 'VII - Notificações: Expedir notificações oficiais.' },
  { id: 'VIII', label: 'VIII - Certidões: Requisitar certidões de nascimento/óbito.' },
  { id: 'XI', label: 'XI - Poder Familiar: Representar para perda/suspensão do poder familiar.' },
  { id: 'XIII-XX', label: 'XIII a XX - Lei Henry Borel: Medidas protetivas de urgência.' }
];

/* Added missing network map */
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
  }
};

// DIRETRIZ 16: TABELA EXAUSTIVA DE VIOLAÇÕES
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
    "Prejuízo por ação/omissão": ["Falta notificação doença infecto-contagiosa", "Recusa atendimento (filosófico/religioso)", "Omissão socorro", "Condições precárias abrigo/socioeducativo"],
    "Atos atentatórios": ["Ameaça morte", "Uso droga como violência", "Tentativa homicídio", "Tentativa suicídio", "Automutilação", "Extração ilícita órgãos"]
  },
  "EDUCAÇÃO, CULTURA, ESPORTE E LAZER": {
    "Educação Infantil": ["Falta vaga pré-escola/creche", "Falta equipe especializada (0-3 e 3-6 anos)", "Distância casa/creche"],
    "Ensino Fundamental/Médio": ["Falta educação bilíngue", "Falta vaga ensino regular/noturno", "Inexistência escola completa"],
    "Impedimento permanência": ["Constrangimento", "Critérios discriminatórios", "Expulsão indevida", "Punições abusivas", "Transferência compulsória", "Evasão/Infrequência (por violação)"],
    "Falta condições educacionais": ["Ausência merenda", "Faltas professores", "Falta info frequência aos pais", "Falta material", "Falta segurança", "Falta atendimento especializado (PCD/Altas habilidades)"],
    "Cultura/Esporte/Lazer": ["Falta manutenção equipamentos", "Inexistência de espaços", "Falta programas públicos", "Impedimento de acesso"]
  },
  "PROFISSIONALIZAÇÃO E PROTEÇÃO NO TRABALHO": {
    "Condições irregulares": ["Trabalho 14/15 anos", "Trabalho doméstico", "Escravidão", "Trabalho infantil", "Desrespeito direitos trabalhistas", "Jornada ilegal", "Trabalho noturno", "Incompatibilidade escolar"],
    "Remuneração/Relação laboral": ["Apropriação resultado trabalho", "Coação física/psicológica", "Trabalho sem remuneração", "Remuneração inadequada"],
    "Capacitação": ["Ausência encaminhamento programas", "Não acesso formação técnica (incluindo PCD e medidas proteção)"]
  },
  "LIBERDADE, RESPEITO E DIGNIDADE": {
    "Restrições ir e vir": ["Apreensão/Detenção/Confinamento ilegal", "Exílio forçado", "Sequestro", "Recolhimento compulsório", "Impedimento acesso logradouro"],
    "Discriminação": ["Histórico ato infracional", "Raça/etnia", "Gênero", "Características pessoais", "Política/Ideologia", "Intolerância religiosa", "Orientação sexual/Identidade gênero", "Situação acolhimento/socioeducativo"],
    "Negação Cidadania": ["Cerceamento crença", "Violação intimidade", "Exposição imagem", "Omissão registro queixa", "Falta Registro Civil", "Omissão autoridade perante ameaça", "Violência patrimonial"],
    "Violência Psicológica": ["Tortura", "Tratamento cruel", "Humilhação", "Agressão verbal", "Cyberbullying"],
    "Violência Física": ["Supressão alimentação", "Tortura", "Castigo corporal", "Espancamento", "Maus tratos", "Violência letal"],
    "Violência Sexual": ["Estupro", "Exibicionismo", "Assédio", "Abuso (círculo social ou custódia)", "Aliciamento", "Satisfação lascívia"],
    "Exploração Sexual": ["Prostituição", "Pornografia infantil", "Registro/Armazenamento/Divulgação cena sexo"],
    "Atos Ilícitos": ["Corrupção de menores", "Aliciamento tráfico/porte drogas", "Envolvimento grupos armados"]
  }
};
