
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
  }
};

export const getEffectiveEscala = (dateStr: string): string[] => {
  if (!dateStr) return [];
  const date = new Date(dateStr + 'T12:00:00');
  const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  const day = date.getDate();
  return ANNUAL_ESCALA[yearMonth]?.[day] || [];
};

export const FERIADOS_HORTOLANDIA = ['01-01', '20-01', '21-04', '01-05', '19-05', '07-09', '12-10', '02-11', '15-11', '20-11', '25-12'];

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

export const SIPIA_HIERARCHY: Record<string, Record<string, string[]>> = {
  "Direito à Vida e à Saúde": {
    "Não atendimento em saúde": [
      "Outros (especificar)", "Falta de leitos para internação hospitalar", "Recusa na realização do aborto legal",
      "Não atendimento especializado", "Não atendimento a gestante", "Não atendimento a usuário de droga",
      "Falta de vacinação", "Não atendimento emergencial"
    ].sort(),
    "Atendimento inadequado em saúde": [
      "Falta de orientação aos pais/responsáveis", "Procedimento cirúrgico desnecessário",
      "Falta de precedência no atendimento", "Extrações odontológicas desnecessárias",
      "Danos Decorrente de Procedimentos", "Negligência no atendimento"
    ].sort(),
    "Atos atentatórios à vida e à saúde": [
      "Ameaça de morte", "Uso de droga (como forma de violência)", "Tentativa de homicídio",
      "Tentativa de suicídio", "Automutilação/Lesão autoprovocada"
    ].sort()
  },
  "Convivência Familiar e Comunitária": {
    "Privação ou dificuldade de convívio": [
      "Omissão injustificada do exercício do dever familiar", "Não recebimento de pensão alimentícia",
      "Impedimento de contato com os pais", "Subtração por familiares", "Falta ou precariedade da moradia",
      "Tráfico de crianças", "Abandono por familiares ou responsáveis"
    ].sort(),
    "Inadequação do convívio familiar": [
      "Falta de afeto, de zelo e de proteção", "Ambiente familiar violento", "Alienação parental"
    ].sort()
  },
  "Educação, Cultura, Esporte e Lazer": {
    "Ausência de educação infantil ou oferta inadequada": [
      "Falta de vaga em pré-escola", "Falta de creche ou entidade equivalente",
      "Distância física entre casa/creche", "Falta de equipe especializada"
    ].sort(),
    "Impedimento de permanência na escola": [
      "Constrangimento de qualquer espécie", "Expulsão indevida", "Punições abusivas",
      "Evasão escolar", "Infrequência escolar"
    ].sort()
  }
};

export const GENDER_LABELS: Record<string, string> = { 'M': 'MASCULINO', 'F': 'FEMININO', 'NB': 'NÃO BINÁRIO', 'T': 'TRANSGÊNERO', 'I': 'INTERSEXO', 'OUTRO': 'OUTRO' };

export const BAIRROS = [
  "Chácara Planalto", "Chácara Recreio Alvorada", "Chácara Reymar", "Chácaras Acaraí", "Chácaras Assay", "Chácaras de Recreio – 2000", "Chácaras Fazenda Coelho", "Chácaras Havaí", "Chácaras Luzitana", "Chácaras Nova Boa Vista", "Chácaras Panaino", "Condomínio Chácara Grota Azul", "Conjunto Habitacional Jardim Primavera", "Jardim Adelaide", "Jardim Aline", "Jardim Amanda I", "Jardim Amanda II", "Jardim Bela Vista", "Jardim Boa Esperança", "Jardim Boa Vista", "Jardim Brasil", "Jardim Campos Verdes", "Jardim Carmen Cristina", "Jardim Conceição", "Jardim das Colinas", "Jardim das Figueiras I", "Jardim das Figueiras II", "Jardim das Laranjeiras", "Jardim das Paineiras", "Jardim do Bosque", "Jardim do Brás", "Jardim do Lago", "Jardim Estefânia", "Jardim Estrela", "Jardim Everest", "Jardim Flamboyant", "Jardim Girassol", "Jardim Golden Park Residence", "Jardim Green Park Residence", "Jardim Interlagos", "Jardim Ipê", "Jardim Lírio", "Jardim Malta", "Jardim Minda", "Jardim Mirante de Sumaré", "Jardim Nossa Senhora Auxiliadora", "Jardim Nossa Senhora da Penha", "Jardim Nossa Senhora de Fátima", "Jardim Nossa Senhora de Lourdes", "Jardim Nova Alvorada", "Jardim Nova América", "Jardim Nova Boa Vista", "Jardim Nova Europa", "Jardim Nova Hortolândia I", "Jardim Nova Hortolândia II", "Jardim Novo Ângulo", "Jardim Novo Cambuí", "Jardim Novo Estrela", "Jardim Novo Horizonte", "Jardim Paulistinha", "Jardim Residencial Firenze", "Jardim Ricardo", "Jardim Rosolém", "Jardim Santa Amélia", "Jardim Santa Cândida", "Jardim Santa Clara do Lago I", "Jardim Santa Clara do Lago II", "Jardim Santa Emília", "Jardim Santa Esmeralda", "Jardim Santa Fé", "Jardim Santa Izabel", "Jardim Santa Luzia", "Jardim Santa Rita de Cássia", "Jardim Santana", "Jardim André", "Jardim Antônio", "Jardim Benedito", "Jardim Bento", "Jardim Camilo", "Jardim Jorge", "Jardim Pedro", "Jardim Sebastião", "Jardim Stella", "Jardim Sumarezinho", "Jardim Terras de Santo Antônio", "Jardim Viagem", "Jardim Villagio Ghiraldelli", "Loteamento Adventista Campineiro", "Loteamento Jardim Vila Verde", "Loteamento Recanto do Sol", "Loteamento Remanso Campineiro", "Núcleo Santa Isabel", "Paraíso Novo Ângulo", "Paraíso Hortolândia", "Parque Bellaville", "Parque do Horto", "Parque dos Pinheiros", "Parque Gabriel", "Parque Horizonte", "Parque Hortolândia", "Parque Odimar", "Parque Orestes Ôngaro", "Parque Ortolândia", "Parque Perón", "Parque Residencial João Luiz", "Parque Residencial Maria de Lourdes", "Parque São Miguel", "Parque Terras de Santa Maria", "Residencial Anauá", "Residencial Jardim de Mônaco", "Residencial Jardim do Jatobá", "Vila América", "Vila Conquista", "Vila Guedes", "Vila Inema", "Vila Real", "Vila Real Continuação", "Vila Real Santista", "Vila São Francisco", "Vila São Pedro", "Villa Flora"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const CANAIS_COMUNICACAO = [
  "Aplicativo de Mensagens",
  "ATENDIMENTO PRESENCIAL",
  "Correspondência/Carta Anônima",
  "Disque 100",
  "Disque Denúncia Local",
  "Documento Formal (Despacho, ATA ou Memorando)",
  "E-mail",
  "Fax",
  "OFICIO",
  "Outros",
  "Ouvidoria",
  "Presencial",
  "Rede Social",
  "RELATORIO",
  "Sítio Eletrônico (Site/Portal/Endereço Eletrônico)",
  "Telefone"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const ORIGENS_CATEGORIZADAS = [
  { label: 'FAMILIARES / RESPONSÁVEIS', options: ['AVÓ', 'AVÔ', 'GENITOR', 'GENITORA', 'IRMÃO', 'RESPONSAVEL LEGAL', 'TIA', 'TIO'].sort() },
  { label: 'CANAIS DIRETOS E DENÚNCIAS', options: ['DENÚNCIA ESPONTÂNEA', 'DENÚNCIA TELEFÔNICA', 'DISQUE 100', 'E-MAIL INSTITUCIONAL', 'NOTIFICAÇÃO', 'SIPIA / WEB'].sort() },
  { label: 'NOTIFICAÇÕES NOMINAIS', options: ['NOTIFICAÇÃO LEANDRO', 'NOTIFICAÇÃO SANDRA', 'NOTIFICAÇÃO MILENA', 'NOTIFICAÇÃO MIRIAN', 'NOTIFICAÇÃO LUIZA'].sort() },
  { label: 'ASSISTÊNCIA SOCIAL', options: ['CRAS AMANDA', 'CRAS ROSOLÉM', 'CRAS NOVO ÂNGULO', 'CRAS JARDIM BRASIL', 'CRAS SANTA CLARA', 'CRAS PRIMAVERA', 'CRAS VILA REAL', 'CREAS', 'CADASTRO ÚNICO', 'BOLSA FAMÍLIA', 'CENTRO DE REFERÊNCIA DA MULHER', 'ACOLHIMENTO MUNICIPAL'].sort() },
  { label: 'JUSTIÇA E SEGURANÇA', options: ['DEFENSORIA PÚBLICA', 'DELEGACIA DA MULHER', 'DELEGACIA DE POLÍCIA', 'FÓRUM / JUDICIÁRIO', 'GCM', 'MINISTÉRIO PÚBLICO', 'POLÍCIA MILITAR', 'VARA DA INFÂNCIA'].sort() },
  { label: 'SAÚDE', options: ['CAPS AD', 'CAPS INFANTIL', 'HOSPITAL MÁRIO COVAS', 'UPA AMANDA', 'UPA ROSOLÉM', 'UBS ADELAIDE', 'UBS AMANDA I', 'UBS AMANDA II', 'UBS FIGUEIRAS', 'UBS MINDA', 'UBS NOVA HORTOLÂNDIA', 'UBS NOVO ÂNGULO', 'UBS ORESTES ONGARO', 'UBS ROSOLÉM', 'UBS SANTA CLARA'].sort() },
  {
    label: 'EDUCAÇÃO - ESCOLA MUNICIPAL',
    options: [
      "Ana José Bodini Januário Dona – EMEF", "Armelinda Espurio da Silva – EMEF", "Bairro Taquara Branca – EMEIEF",
      "Bairro Três Casas – EMEI", "Caio Fernando Gomes Pereira – EMEF", "Centro de Educação Básica do Município",
      "Claudio Roberto Marques – Professor – EMEF", "EMEF Jardim Primavera", "EMEF Salvador Zacharias P. Junior",
      "EMEI Carlos Vilela", "EMEI Jardim Minda", "EMEI Jardim Nossa Senhora Auxiliadora", "EMEI Jardim Nova Europa",
      "EMEI Jardim Santa Clara do Lago I", "EMEI Jardim Santa Clara do Lago II", "EMEI Jardim Santa Emilia",
      "EMEI Jardim Santa Esmeralda", "EMEI Jardim Santiago", "EMEI Jardim São Pedro", "EMEI Tarsila do Amaral",
      "EMEIEF Jardim Santa Amélia Humberto de Amorim Lopes", "EMEIEF José Tenório da Silva", "EMEIEF Luiza Vitória Oliveira Cruz",
      "Emiliano Sanchez – EMEI", "Escola Municipal de Educação Básica Josias da Silva Macedo",
      "Escola Municipal de Educação Infantil Jardim Nossa Senhora de Fátima", "Renato da Costa Lima – EMEF",
      "NEM (NUCLEO EDUCACIONAL MULTIDISCIPLINAR)"
    ].sort()
  },
  {
    label: 'EDUCAÇÃO - ESCOLA ESTADUAL',
    options: [
      "Antonio Zanluchi Professor — Hortolândia-SP", "EE Liomar Freitas Câmara Profa — Hortolândia-SP",
      "Conceição Aparecida Terza Gomes Cardinales — Hortolândia-SP", "Cristiane Chaves Moreira Braga — Hortolândia-SP",
      "Eliseo Marson Professor — Hortolândia-SP", "ETEC de Hortolândia", "Guido Rosolen — Hortolândia-SP",
      "Hedy Madalena Bocchi Professora — Hortolândia-SP", "Honorino Fabbri Doutor — Hortolândia-SP",
      "Jardim Aline — Hortolândia-SP", "Manoel Ignacio da Silva — Hortolândia-SP", "Paulina Rosa Professora — Hortolândia-SP",
      "Paulo Camilo de Camargo — Hortolândia-SP", "Raquel Saes Melhado da Silva — Hortolândia-SP"
    ].sort()
  }
];

export const SUSPEITOS = ['PAI', 'MAE', 'PADRASTO', 'MADRASTA', 'TIOS', 'TERCEIROS', 'DESCONHECIDO'].sort();

export const AGENTES_VIOLADORES_ESTRUTURA: Record<string, { desc: string, options: string[] }> = {
  "ESTADO": {
    desc: "Ação/omissão de agentes públicos.",
    options: [
      "Ambulatório", "Cartório", "Creche", "Defensoria Pública", "Entidade de Atendimento",
      "Escola", "Hospital", "Justiça da Infância e da Juventude", "Ministério Público",
      "Polícia Civil", "Polícia Militar", "Posto de Saúde"
    ].sort()
  },
  "FAMÍLIA": {
    desc: "Ocorre no âmbito familiar.",
    options: [
      "Avós", "Irmãos", "Madrasta", "Mãe", "Padrasto", "Pai", "Parentes de 2º grau", "Responsável Legal", "Tio/Tia"
    ].sort()
  },
  "SOCIEDADE": {
    desc: "Pessoas físicas ou instituições privadas.",
    options: [
      "Clube / Associação", "Empresa / Empregador", "Entidades Religiosas", "Instituição (privada)", "ONGs", "Vizinho"
    ].sort()
  },
  "PRÓPRIA CONDUTA": { desc: "Comportamento do próprio adolescente.", options: ["Própria Conduta"] }
};

export const TIPOS_VIOLENCIA: ViolenceType[] = ['FÍSICA', 'PSICOLÓGICA', 'SEXUAL', 'NEGLIGÊNCIA', 'OUTROS'];

export const STATUS_LABELS: Record<string, string> = {
  NAO_LIDO: 'Documento não lido', NOTIFICACAO: 'Notificação', AGUARDANDO_RESPOSTA: 'Aguardando Resposta', ARQUIVADO: 'Arquivado', MONITORAMENTO: 'Monitoramento', AGUARDANDO_VALIDACAO: 'Aguardando Validação', OFICIALIZADO: 'Oficializado'
};

export const MEDIDAS_PROTECAO_ECA = [
  { artigo: 'Art. 101 - Medidas de Proteção', incisos: ['Art. 101, I', 'Art. 101, II', 'Art. 101, III', 'Art. 101, IV', 'Art. 101, V', 'Art. 101, VI', 'Art. 101, VII'] },
  { artigo: 'Art. 129 - Medidas aos Pais/Responsável', incisos: ['Art. 129, I', 'Art. 129, II', 'Art. 129, III', 'Art. 129, IV', 'Art. 129, V', 'Art. 129, VI', 'Art. 129, VII'] },
  { artigo: 'Art. 136 - Atribuições do CT', incisos: [
    'Art. 136, I', 'Art. 136, II', 'Art. 136, III, a', 'Art. 136, III, b', 
    'Art. 136, IV', 'Art. 136, V', 'Art. 136, VI', 'Art. 136, VII', 
    'Art. 136, VIII', 'Art. 136, IX', 'Art. 136, X', 'Art. 136, XI', 
    'Art. 136, XII', 'Art. 136, XIII', 'Art. 136, XIV', 'Art. 136, XV', 
    'Art. 136, XVI', 'Art. 136, XVII', 'Art. 136, XVIII', 'Art. 136, XIX', 
    'Art. 136, XX', 'Art. 136, Parágrafo Único'
  ] }
];

export const MEDIDAS_ECA_DESCRICAO: Record<string, string> = {
  'Art. 101, I': 'Encaminhamento aos pais ou responsável, mediante termo de responsabilidade;',
  'Art. 101, II': 'Orientação, apoio e acompanhamento temporários;',
  'Art. 101, III': 'Matrícula e freqüência obrigatórias em estabelecimento oficial de ensino fundamental;',
  'Art. 101, IV': 'Inclusão em serviços e programas oficiais ou comunitários de proteção, apoio e promoção da família, da criança e do adolescente; (Lei nº 13.257/2016)',
  'Art. 101, V': 'Requisição de tratamento médico, psicológico ou psiquiátrico, em regime hospitalar ou ambulatorial, extensivo às famílias, se for o caso, especialmente em caso de vitimização em crime contra a dignidade sexual; (Lei nº 15.280/2025)',
  'Art. 101, VI': 'Inclusão em programa oficial ou comunitário de auxílio, orientação e tratamento a alcoólatras e toxicômanos;',
  'Art. 101, VII': 'Acolhimento institucional; (Lei nº 12.010/2009)',
  
  'Art. 129, I': 'Encaminhamento a serviços e programas oficiais ou comunitários de proteção, apoio e promoção da família; (Lei nº 13.257/2016)',
  'Art. 129, II': 'Inclusão em programa oficial ou comunitário de auxílio, orientação e tratamento a alcoólatras e toxicômanos;',
  'Art. 129, III': 'Encaminhamento a tratamento psicológico ou psiquiátrico;',
  'Art. 129, IV': 'Encaminhamento a cursos ou programas de orientação;',
  'Art. 129, V': 'Obrigação de matricular o filho ou pupilo e acompanhar sua freqüência e aproveitamento escolar;',
  'Art. 129, VI': 'Obrigação de encaminhar a criança ou adolescente a tratamento especializado;',
  'Art. 129, VII': 'Advertência;',

  'Art. 136, I': 'atender as crianças e adolescentes nas hipóteses previstas nos arts. 98 e 105, aplicando as medidas previstas no art. 101, I a VII;',
  'Art. 136, II': 'atender e aconselhar os pais ou responsável, aplicando as medidas previstas no art. 129, I a VII;',
  'Art. 136, III, a': 'requisitar serviços públicos nas áreas de saúde, educação, assistência social, previdência, trabalho e segurança; (Redação dada pela Lei nº 15.268, de 2025)',
  'Art. 136, III, b': 'representar junto à autoridade judiciária nos casos de descumprimento injustificado de suas deliberações.',
  'Art. 136, IV': 'encaminhar ao Ministério Público notícia de fato que constitua infração administrativa ou penal contra os direitos da criança ou adolescente;',
  'Art. 136, V': 'encaminhar à autoridade judiciária os casos de sua competência;',
  'Art. 136, VI': 'providenciar a medida estabelecida pela autoridade judiciária, dentre as previstas no art. 101, de I a VI, para o adolescente autor de ato infracional;',
  'Art. 136, VII': 'expedir notificações;',
  'Art. 136, VIII': 'requisitar certidões de nascimento e de óbito de criança ou adolescente quando necessário;',
  'Art. 136, IX': 'assessorar o Poder Executivo local na elaboração da proposta orçamentária para planos e programas de atendimento dos direitos da criança e do adolescente;',
  'Art. 136, X': 'representar, em nome da pessoa e da família, contra a violação dos direitos previstos no art. 220, § 3º, inciso II, da Constituição Federal;',
  'Art. 136, XI': 'representar ao Ministério Público para efeito das ações de perda ou suspensão do poder familiar, após esgotadas as possibilidades de manutenção da criança ou do adolescente junto à família natural. (Redação dada pela Lei nº 12.010, de 2009)',
  'Art. 136, XII': 'promover e incentivar, na comunidade e nos grupos profissionais, ações de divulgação e treinamento para o reconhecimento de sintomas de maus-tratos em crianças e adolescentes. (Incluído pela Lei nº 13.046, de 2014)',
  'Art. 136, XIII': 'adotar, na esfera de sua competência, ações articuladas e efetivas direcionadas à identificação da agressão, à agilidade no atendimento da criança e do adolescente vítima de violência doméstica e familiar e à responsabilização do agressor; (Incluído pela Lei nº 14.344, de 2022)',
  'Art. 136, XIV': 'atender à criança e ao adolescente vítima ou testemunha de violência doméstica e familiar, ou submetido a tratamento cruel ou degradante ou a formas violentas de educação, correção ou disciplina, a seus familiares e a testemunhas, de forma a prover orientação e aconselhamento acerca de seus direitos e dos encaminhamentos necessários; (Incluído pela Lei nº 14.344, de 2022)',
  'Art. 136, XV': 'representar à autoridade judicial ou policial para requerer o afastamento do agressor do lar, do domicílio ou do local de convivência com a vítima nos casos de violência doméstica e familiar contra a criança e o adolescente; (Incluído pela Lei nº 14.344, de 2022)',
  'Art. 136, XVI': 'representar à autoridade judicial para requerer a concessão de medida protetiva de urgência à criança ou ao adolescente vítima ou testemunha de violência doméstica e familiar, bem como a revisão daquelas já concedidas; (Incluído pela Lei nº 14.344, de 2022)',
  'Art. 136, XVII': 'representar ao Ministério Público para requerer a propositura de ação cautelar de antecipação de produção de prova nas causas que envolvam violência contra a criança e o adolescente; (Incluído pela Lei nº 14.344, de 2022)',
  'Art. 136, XVIII': 'tomar as providências cabíveis, na esfera de sua competência, ao receber comunicação de ocorrência de ação ou omissão, praticada em local público ou privado, que constitua violência doméstica e familiar contra a criança e o adolescente; (Incluído pela Lei nº 14.344, de 2022)',
  'Art. 136, XIX': 'receber e encaminhar, quando for o caso, as informações reveladas por noticiantes ou denunciantes relativas à prática de violência, ao uso de tratamento cruel ou degradante ou de formas violentas de educação, correção ou disciplina contra a criança e o adolescente; (Incluído pela Lei nº 14.344, de 2022)',
  'Art. 136, XX': 'representar à autoridade judicial ou ao Ministério Público para requerer a concessão de medidas cautelares direta ou indiretamente relacionada à eficácia da proteção de noticiante ou denunciante de informações de crimes que envolvam violência doméstica e familiar contra a criança e o adolescente. (Incluído pela Lei nº 14.344, de 2022)',
  'Art. 136, Parágrafo Único': 'Se, no exercício de suas atribuições, o Conselho Tutelar entender necessário o afastamento do convívio familiar, comunicará incontinenti o fato ao Ministério Público, prestando-lhe informações sobre os motivos de tal entendimento e as providências tomadas para a orientação, o apoio e a promoção social da família. (Incluído pela Lei nº 12.010, de 2009)'
};

export const PASTAS_ART136_III_A = [
  { 
    area: 'SAÚDE', 
    servicos: [
      'CAPS AD', 'CAPS INFANTIL', 'HOSPITAL MÁRIO COVAS', 'UPA AMANDA', 'UPA ROSOLÉM', 
      'UBS ADELAIDE', 'UBS AMANDA I', 'UBS AMANDA II', 'UBS FIGUEIRAS', 'UBS MINDA', 
      'UBS NOVA HORTOLÂNDIA', 'UBS NOVO ÂNGULO', 'UBS ORESTES ONGARO', 'UBS ROSOLÉM', 
      'UBS SANTA CLARA'
    ].sort() 
  },
  { 
    area: 'EDUCAÇÃO', 
    servicos: [
      "Ana José Bodini Januário Dona – EMEF", "Armelinda Espurio da Silva – EMEF", "Bairro Taquara Branca – EMEIEF",
      "Bairro Três Casas – EMEI", "Caio Fernando Gomes Pereira – EMEF", "Centro de Educação Básica do Município",
      "Claudio Roberto Marques – Professor – EMEF", "EMEF Jardim Primavera", "EMEF Salvador Zacharias P. Junior",
      "EMEI Carlos Vilela", "EMEI Jardim Minda", "EMEI Jardim Nossa Senhora Auxiliadora", "EMEI Jardim Nova Europa",
      "EMEI Jardim Santa Clara do Lago I", "EMEI Jardim Santa Clara do Lago II", "EMEI Jardim Santa Emilia",
      "EMEI Jardim Santa Esmeralda", "EMEI Jardim Santiago", "EMEI Jardim São Pedro", "EMEI Tarsila do Amaral",
      "EMEIEF Jardim Santa Amélia Humberto de Amorim Lopes", "EMEIEF José Tenório da Silva", "EMEIEF Luiza Vitória Oliveira Cruz",
      "Emiliano Sanchez – EMEI", "Escola Municipal de Educação Básica Josias da Silva Macedo",
      "Escola Municipal de Educação Infantil Jardim Nossa Senhora de Fátima", "Renato da Costa Lima – EMEF",
      "NEM (NUCLEO EDUCACIONAL MULTIDISCIPLINAR)",
      "Antonio Zanluchi Professor — Hortolândia-SP", "EE Liomar Freitas Câmara Profa — Hortolândia-SP",
      "Conceição Aparecida Terza Gomes Cardinales — Hortolândia-SP", "Cristiane Chaves Moreira Braga — Hortolândia-SP",
      "Eliseo Marson Professor — Hortolândia-SP", "ETEC de Hortolândia", "Guido Rosolen — Hortolândia-SP",
      "Hedy Madalena Bocchi Professora — Hortolândia-SP", "Honorino Fabbri Doutor — Hortolândia-SP",
      "Jardim Aline — Hortolândia-SP", "Manoel Ignacio da Silva — Hortolândia-SP", "Paulina Rosa Professora — Hortolândia-SP",
      "Paulo Camilo de Camargo — Hortolândia-SP", "Raquel Saes Melhado da Silva — Hortolândia-SP"
    ].sort() 
  },
  { 
    area: 'ASSISTÊNCIA SOCIAL', 
    servicos: [
      'CRAS AMANDA', 'CRAS ROSOLÉM', 'CRAS NOVO ÂNGULO', 'CRAS JARDIM BRASIL', 
      'CRAS SANTA CLARA', 'CRAS PRIMAVERA', 'CRAS VILA REAL', 'CREAS', 
      'CADASTRO ÚNICO', 'BOLSA FAMÍLIA', 'CENTRO DE REFERÊNCIA DA MULHER', 
      'ACOLHIMENTO MUNICIPAL'
    ].sort() 
  },
  { area: 'SEGURANÇA', servicos: ['GCM', 'PM', 'POLÍCIA CIVIL'].sort() }
];
