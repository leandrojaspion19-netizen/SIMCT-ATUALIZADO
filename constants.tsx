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

export const SIPIA_HIERARCHY: Record<string, Record<string, string[]>> = {
  "Direito à Vida e à Saúde": {
    "Não atendimento em saúde": [
      "Outros (especificar)",
      "Falta de leitos para internação hospitalar",
      "Recusa na realização do aborto legal",
      "Não atendimento especializado",
      "Não atendimento a gestante",
      "Não atendimento a usuário de droga lícita ou ilícita",
      "Falta de vacinação",
      "Não atendimento emergencial"
    ].sort(),
    "Atendimento inadequado em saúde": [
      "Falta de orientação aos pais/responsáveis quanto ao diagnóstico, estado de saúde, tratamento, conduta e acompanhamento prescrito",
      "Procedimento cirúrgico desnecessário (invasivo ou não)",
      "Falta de precedência no atendimento a criança e adolescente",
      "Extrações odontológicas desnecessárias",
      "Danos Decorrente de Procedimentos executados ou prescritos",
      "Negligência no atendimento pelos profissionais"
    ].sort(),
    "Práticas irregulares em restabelecimento da saúde": [
      "Inexistência ou não preenchimento de prontuário",
      "Exigência da presença dos pais para o atendimento em saúde",
      "Falta de alojamento conjunto no nascimento",
      "Falta de notificação em caso de suspeita ou confirmação de violência",
      "Proibição ou falta de condições de permanência do responsável em internações",
      "Não identificação do recém-nascido e sua mãe",
      "Retirada compulsória de bebê"
    ].sort(),
    "Ausência de ações específicas de saúde pública": [
      "Falta de ações específicas para prevenção ao uso abusivo de drogas lícitas ou ilícitas",
      "Falta de programas ou ações específicas para o tratamento do agressor e/ou abusador sexual",
      "Ausência de informações sobre doenças ou epidemias em curso",
      "Ausência de saneamento ambiental",
      "Ausência de saneamento básico"
    ].sort(),
    "Prejuízo à vida e saúde por ação/omissão": [
      "Falta de notificação de doença infecto-contagiosa",
      "Recusa de atendimento médico por razões filosóficas, ideológicas ou religiosas",
      "Omissão de socorro à criança/adolescente",
      "Condições precárias ou insalubres de instituições destinadas ao abrigamento ou aplicação de medidas socioeducativas"
    ].sort(),
    "Atos atentatórios à vida e à saúde": [
      "Ameaça de morte",
      "Uso de droga lícita ou ilícita (como forma de violência ou negligência)",
      "Tentativa de homicídio",
      "Tentativa de suicídio",
      "Automutilação/Lesão autoprovocada (em contexto de violação de direitos)",
      "Cirurgias com fins ilícitos para extração de órgãos"
    ].sort()
  },
  "Convivência Familiar e Comunitária": {
    "Privação ou dificuldade de convívio": [
      "Omissão injustificada do exercício do dever familiar",
      "Não recebimento de pensão alimentícia",
      "Impedimento de contato com os pais ou outros familiares",
      "Falta dos pais ou parentes",
      "Subtração por familiares",
      "Falta ou precariedade da moradia",
      "Tráfico de crianças e adolescentes",
      "Afastamento do convívio familiar por fuga",
      "Abandono por familiares ou pelos responsáveis"
    ].sort(),
    "Inadequação do convívio familiar": [
      "Falta de afeto, de zelo e de proteção",
      "Dificuldades nas relações familiares durante o estágio de convívio para adoção",
      "Ambiente familiar violento",
      "Favorecimento ao uso de drogas lícitas ou ilícitas no ambiente familiar",
      "Convívio em ambiente familiar que não garanta o desenvolvimento integral da criança ou adolescente",
      "Alienação parental"
    ].sort(),
    "Violações à dignidade / negligence": [
      "Falta de apoio emocional e psicológico",
      "Omissão com a educação escolar e formação intelectual",
      "Omissão no cuidado com a saúde, alimentação e higiene",
      "Omissão de cuidados com a proteção e segurança"
    ].sort(),
    "Ausência de programas e ações (Falta de Suporte Estatal)": [
      "Inexistência de serviço de orientação sócio-familiar",
      "Falta de vaga em serviço de acolhimento institucional ou familiar",
      "Inexistência de programa de transferência de renda",
      "Inexistência de serviço de acolhimento para adultos acompanhados de crianças e/ou adolescentes",
      "Inexistência de serviço de acolhimento para criança e adolescente sob medida protetiva de abrigo"
    ].sort(),
    "Atos atentatórios ao exercício da convivência": [
      "Desconsideração ou desrespeito à opinião ou opção da criança ou adolescente nos casos de guarda, tutela ou adoção",
      "Negação de filiação",
      "Indefinição de paternidade",
      "Impedimento de contato entre pais ou mães privados de liberdade",
      "Impedimento de acesso à família, à comunidade e aos meios de comunicação"
    ].sort()
  },
  "Educação, Cultura, Esporte e Lazer": {
    "Ausência de educação infantil ou oferta inadequada": [
      "Falta de vaga em pré-escola ou entidade equivalente",
      "Falta de equipe especializada para atendimento de crianças de 0 a 3 anos",
      "Falta de equipe especializada para atendimento de crianças de 3 a 6 anos",
      "Falta de pré-escola",
      "Distância física entre casa/creche ou empresa/creche",
      "Falta de creche ou entidade equivalente"
    ].sort(),
    "Inexistência de ensino fundamental ou oferta inadequada": [
      "Falta de oferta de educação intercultural bilíngue",
      "Falta de vaga no ensino fundamental",
      "Falta de oferta ou falta de vaga no ensino fundamental noturno regular ao adolescente",
      "Falta de Escola de Nível Fundamental",
      "Inexistência de ensino fundamental completo",
      "Falta de escola",
      "Falta de oferta ou falta de vaga no ensino noturno regular ao adolescente"
    ].sort(),
    "Inexistência de ensino médio or oferta inadequada": [
      "Falta de vaga no ensino médio",
      "Inexistência de ensino médio completo",
      "Falta de oferta ou falta de vaga no ensino médio noturno regular ao adolescente"
    ].sort(),
    "Impedimento de permanência na escola": [
      "Constrangimento de qualquer espécie",
      "Critérios avaliativos discriminatórios",
      "Expulsão indevida",
      "Punições abusivas",
      "Transferência Compulsória",
      "Evasão escolar (como consequência de violação de direitos)",
      "Infrequência escolar (como consequência de violação de direitos)"
    ].sort(),
    "Falta de condições educacionais adequadas": [
      "Ausência de merenda escolar",
      "Excesso de faltas injustificadas (por parte da escola/professores)",
      "Falta de informações aos pais sobre a frequência do aluno",
      "Falta de material didático",
      "Falta de segurança na escola",
      "Interrupção sistemática do processo de ensino",
      "Falta de atendimento especializado para crianças e adolescentes (com deficiência, altas habilidades, etc.)"
    ].sort(),
    "Inexistência ou impedimento de acesso à cultura, esporte e lazer": [
      "Falta de manutenção nos equipamentos de cultura, esporte e lazer",
      "Inexistência de equipamento para cultura e lazer",
      "Falta de programas ou projetos públicos de cultura, esporte e de lazer",
      "Inexistência de equipamento de esporte e lazer"
    ].sort()
  },
  "Profissionalização e Proteção no Trabalho": {
    "Condições irregulares de trabalho": [
      "Trabalho ilegal do adolescente de 14 e 15 anos",
      "Trabalho doméstico (em condições irregulares)",
      "Trabalho em regime de escravidão",
      "Trabalho infantil",
      "Não observância dos direitos trabalhistas e previdenciários",
      "Jornada de trabalho além do limite legal",
      "Horário de trabalho noturno",
      "Horário de trabalho incompatível com a formação escolar ou profissional"
    ].sort(),
    "Condições impróprias de remuneração e relação laboral": [
      "Apropriação do resultado do trabalho por outra pessoa ou instituição",
      "Coação física ou psicológica ao trabalho",
      "Trabalho sem remuneração",
      "Remuneração inadequada"
    ].sort(),
    "Inexistência ou insuficiência de capacitação profissional": [
      "Ausência de encaminhamento a programa de capacitação profissional a adolescente sujeito a Medidas de Proteção Específicas (MPE)",
      "Não acesso a capacitação ou formação técnica profissional",
      "Impedimento de acesso a capacitação profissional para adolescente portadores de deficiência",
      "Impedimento de acesso a programa de capacitação profissional para adolescente sujeito a Medidas de Proteção Específicas (MPE)"
    ].sort()
  }
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
  "ESTADO": {
    desc: "Ação/omissão de agentes públicos.",
    options: [
      "Ambulatório", "Cartório", "Creche", "Defensoria Pública", "Entidade de Atendimento",
      "Entidade/Organização de Assistência", "Escola", "Hospital", "Instituição de ensino",
      "Instituição de saúde", "Justiça da Infância e da Juventude", "Ministério Público",
      "Pessoa Física (no exercício de função pública)", "Polícia Civil", "Polícia Militar", "Posto de Saúde"
    ].sort()
  },
  "FAMÍLIA": {
    desc: "Ocorre no âmbito familiar.",
    options: [
      "Avós", "Irmãos", "Madrasta", "Mãe", "Outro (familiar não listado)", "Padrasto", "Pai",
      "Parentes de 2º grau", "Parentes de 3º grau ou mais", "Responsável (membro da família)", "Tio/Tia"
    ].sort()
  },
  "SOCIEDADE": {
    desc: "Pessoas físicas ou instituições privadas.",
    options: [
      "Clube / Associação", "Empresa / Empregador / Estabelecimento Comercial", "Entidade (sem fins lucrativos ou privada)",
      "Entidades Religiosas", "Instituição (privada)", "Meios de Comunicação", "ONGs",
      "Pessoal (Pessoa Física não-familiar)", "Outro"
    ].sort()
  },
  "PRÓPRIA CONDUTA": { desc: "Comportamento do próprio adolescente.", options: ["Própria Conduta"] }
};

export const TIPOS_VIOLENCIA: ViolenceType[] = ['FÍSICA', 'PSICOLÓGICA', 'SEXUAL', 'NEGLIGÊNCIA', 'OUTROS'];

export const STATUS_LABELS: Record<string, string> = {
  AGUARDANDO_RESPOSTA: 'Aguardando Resposta', ARQUIVADO: 'Arquivado', NAO_LIDO: 'Documento não lido', NOTICIA_FATO_ENCAMINHADA: 'Notícia de Fato encaminhada', NOTIFICACAO: 'Notificação', NOTIFICACAO_REFERENCIA: 'Notificação/ Referência', OFICIO_RESPONDIDO: 'Ofício Respondido', RESPONDER_OFICIO: 'Responder Ofício', RESPOSTA_ENVIADA: 'Resposta enviada', SOLICITACAO_REDE: 'Solicitação de informação para rede', MONITORAMENTO: 'Monitoramento', SOLICITAR_REUNIAO_REDE: 'Solicitar reunião de rede', EMAIL_ENCAMINHADO: 'E-mail encaminhado', AGUARDANDO_VALIDACAO: 'Aguardando Validação', OFICIALIZADO: 'Oficializado'
};

export const MEDIDAS_PROTECAO_ECA = [
  { artigo: 'Art. 101 - Medidas de Proteção', incisos: ['Art. 101, I', 'Art. 101, II', 'Art. 101, III', 'Art. 101, IV', 'Art. 101, V', 'Art. 101, VI', 'Art. 101, VII'] },
  { artigo: 'Art. 129 - Medidas aos Pais/Responsável', incisos: ['Art. 129, I', 'Art. 129, II', 'Art. 129, III', 'Art. 129, IV', 'Art. 129, V', 'Art. 129, VI', 'Art. 129, VII'] },
  { artigo: 'Art. 136 - Atribuições do CT', incisos: [
    'Art. 136, I', 'Art. 136, II', 'Art. 136, III, a', 'Art. 136, III, b', 
    'Art. 136, IV', 'Art. 136, V', 'Art. 136, VI', 'Art. 136, VII', 'Art. 136, VIII', 'Art. 136, IX', 'Art. 136, X', 
    'Art. 136, XI', 'Art. 136, XII', 'Art. 136, XIII', 'Art. 136, XIV', 'Art. 136, XV', 'Art. 136, XVI', 'Art. 136, XVII', 
    'Art. 136, XVIII', 'Art. 136, XIX', 'Art. 136, XX'
  ] }
];

export const MEDIDAS_ECA_DESCRICAO: Record<string, string> = {
  // Artigo 101
  'Art. 101, I': 'Encaminhamento aos pais ou responsável, mediante termo de responsabilidade.',
  'Art. 101, II': 'Orientação, apoio e acompanhamento temporários.',
  'Art. 101, III': 'Matrícula e freqüência obrigatórias em estabelecimento oficial de ensino fundamental.',
  'Art. 101, IV': 'Inclusão em serviços e programas oficiais ou comunitários de proteção, apoio e promoção da família, da criança e do adolescente.',
  'Art. 101, V': 'Requisição de tratamento médico, psicológico ou psiquiátrico, em regime hospitalar ou ambulatorial, extensivo às famílias, especialmente em vitimização contra a dignidade sexual.',
  'Art. 101, VI': 'Inclusão em programa oficial ou comunitário de auxílio, orientação e tratamento a alcoólatras e toxicômanos.',
  'Art. 101, VII': 'Acolhimento institucional.',
  
  // Artigo 129
  'Art. 129, I': 'Encaminhamento a serviços e programas oficiais ou comunitários de proteção, apoio e promoção da família.',
  'Art. 129, II': 'Inclusão em programa oficial ou comunitário de auxílio, orientação e tratamento a alcoólatras e toxicômanos.',
  'Art. 129, III': 'Encaminhamento a tratamento psicológico ou psiquiátrico.',
  'Art. 129, IV': 'Encaminhamento a cursos ou programas de orientação.',
  'Art. 129, V': 'Obrigação de matricular o filho ou pupilo e acompanhar sua freqüência e aproveitamento escolar.',
  'Art. 129, VI': 'Obrigação de encaminhar a criança ou adolescente a tratamento especializado.',
  'Art. 129, VII': 'Advertência.',
  
  // Artigo 136
  'Art. 136, I': 'Atender crianças e adolescentes nas hipóteses dos arts. 98 e 105, aplicando medidas do art. 101, I a VII.',
  'Art. 136, II': 'Atender e aconselhar pais ou responsável, aplicando medidas do art. 129, I a VII.',
  'Art. 136, III, a': 'Requisitar serviços públicos nas áreas de saúde, educação, assistência social, previdência, trabalho e segurança.',
  'Art. 136, III, b': 'Representar junto à autoridade judiciária nos casos de descumprimento injustificado de suas deliberações.',
  'Art. 136, IV': 'Encaminhar ao Ministério Público notícia de fato que constitua infração administrativa ou penal contra os direitos da criança ou adolescente.',
  'Art. 136, V': 'Encaminhar à autoridade judiciária os casos de sua competência.',
  'Art. 136, VI': 'Providenciar a medida estabelecida pela autoridade judiciária, dentre as previstas no art. 101, de I a VI, para o adolescente autor de ato infracional.',
  'Art. 136, VII': 'Expedir notificações.',
  'Art. 136, VIII': 'Requisitar certidões de nascimento e de óbito de criança ou adolescente quando necessário.',
  'Art. 136, IX': 'Assessorar o Poder Executivo local na elaboração da proposta orçamentária para planos e programas de atendimento dos direitos da criança e do adolescente.',
  'Art. 136, X': 'Representar contra a violação dos direitos previstos no art. 220, § 3º, inciso II, da Constituição Federal.',
  'Art. 136, XI': 'Representar ao MP para perda ou suspensão do poder familiar, após esgotadas as possibilidades de manutenção na família natural.',
  'Art. 136, XII': 'Promover ações de divulgação e treinamento para reconhecimento de sintomas de maus-tratos.',
  'Art. 136, XIII': 'Adotar ações articuladas para identificação da agressão e agilidade no atendimento à vítima de violência doméstica e familiar.',
  'Art. 136, XIV': 'Atender à criança e ao adolescente vítima ou testemunha de violência doméstica e familiar, provendo orientação e aconselhamento.',
  'Art. 136, XV': 'Representar à autoridade judicial ou policial para requerer o afastamento do agressor do lar nos casos de violência doméstica.',
  'Art. 136, XVI': 'Representar à autoridade judicial para requerer a concessão de medida protetiva de urgência.',
  'Art. 136, XVII': 'Representar ao Ministério Público para requerer ação cautelar de antecipação de produção de prova.',
  'Art. 136, XVIII': 'Tomar providências cabíveis ao receber comunicação de ação ou omissão que constitua violência doméstica e familiar.',
  'Art. 136, XIX': 'Receber e encaminhar informações de noticiantes relativas à prática de violência ou tratamento cruel.',
  'Art. 136, XX': 'Representar por medidas cautelares relacionadas à eficácia da proteção de noticiante ou denunciante de crimes de violência doméstica.'
};
