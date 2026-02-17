
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

// DIRETRIZ 46.1: Lista oficial para Rodízio Alfabético de Referência
// Ordem: LEANDRO -> LUIZA -> MILENA -> MIRIAN -> SANDRA
export const RODIZIO_ALFABETICO = ['LEANDRO', 'LUIZA', 'MILENA', 'MIRIAN', 'SANDRA'];

export const REDE_HORTOLANDIA = {
  "ASSISTÊNCIA SOCIAL": {
    "CRAS (Proteção Básica)": [
      "CRAS Primavera", "CRAS Jd. Brasil", "CRAS Amanda", "CRAS Central", "CRAS Novo Angulo", "CRAS Santa Izabel"
    ],
    "Especializada / Gestão": [
      "CREAS (Centro de Referência Especializado)", "DAS (Departamento de Assistência Social)", "NAD (Núcleo de Atendimento às Diferenças)", "Centro Pop (População de Rua)"
    ]
  },
  "SAÚDE": {
    "Hospitalar / Urgência": [
      "Hospital Municipal de Hortolândia (Mário Covas)", "UPA Nova Hortolândia", "UPA Rosolém", "UPA Amanda"
    ],
    "Especializada / Básica": [
      "CAPS Infantil", "CAPS Adulto", "UBS Adelaide", "UBS Amanda", "UBS Novo Angulo", "UBS Rosolém", "UBS Santa Clara", "UBS Santiago"
    ]
  },
  "EDUCAÇÃO": {
    "Gestão": [
      "Secretaria de Educação de Hortolândia", "Setor de Vagas / Central de Matrículas"
    ],
    "Unidades": [
      "EMEF Profª Marleciene Priscila Presta Bonfim", "EMEF Villagio", "EMEI Amanda", "EMEI Primavera"
    ]
  },
  "PREVIDÊNCIA / TRABALHO": {
    "Órgãos": [
      "INSS Hortolândia", "PAT (Posto de Atendimento ao Trabalhador)", "Banco do Povo"
    ]
  },
  "SEGURANÇA": {
    "Policiamento": [
      "Guarda Municipal de Hortolândia", "Polícia Militar (3º Cia)", "Delegacia de Polícia / DDM"
    ]
  }
};

export const getEffectiveEscala = (dateStr: string): string[] => {
  if (!dateStr) return [];
  const date = new Date(dateStr + 'T12:00:00');
  
  // Limite da DIRETRIZ 44.4: Rejeitar superior a 17/02/2026
  const limitDate = new Date('2026-02-17T23:59:59');
  if (date > limitDate) return [];

  // Ciclo fixo de 5 nomes para gerar o trio da Imediata
  const cycleList = ['MILENA', 'SANDRA', 'LEANDRO', 'MIRIAN', 'LUIZA'];
  const refDate = new Date('2026-02-17T12:00:00');
  const diffTime = date.getTime() - refDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
  const offset = ((diffDays % 5) + 5) % 5;
  
  // DIRETRIZ 44.1: Retorna o Trio Escala
  const p1 = cycleList[offset];
  const p2 = cycleList[(offset + 1) % 5];
  const p3 = cycleList[(offset + 2) % 5];
  
  return [p1, p2, p3];
};

export const ORIGENS_CATEGORIZADAS = [
  { label: 'EDUCAÇÃO', options: ['Escola Municipal', 'Escola Estadual', 'Escola Particular', 'Creche'] },
  { label: 'SAÚDE', options: ['UBS', 'UPA', 'Hospital Municipal', 'SAMU'] },
  { label: 'JUSTIÇA', options: ['Ministério Público', 'Poder Judiciário', 'Delegacia (DDM)', 'Delegacia Comum'] },
  { label: 'SOCIAL', options: ['CRAS', 'CREAS', 'Conselho Tutelar II', 'Acolhimento'] },
  { label: 'OUTROS', options: ['Denúncia Anônima', 'Disque 100', 'Email Institucional', 'Outros'] }
];

export const BAIRROS = [
  "CHÁCARAS ACAUÃ", "CHÁCARAS ASSAÍ", "CHÁCARAS BELA VISTA", "CHÁCARAS COELHO", "CHÁCARAS FAZENDA COELHO", "CHÁCARAS RECREIO 2000", "CHÁCARAS SÃO BENTO", "CHÁCARAS SÃO JORGE", "CHÁCARAS SÃO SEBASTIÃO", "JARDIM ADELAIDE", "JARDIM AFONSO", "JARDIM ALVORADA", "JARDIM AMANDA I", "JARDIM AMANDA II", "JARDIM AMANDA III", "JARDIM AMARYLIS", "JARDIM AUGUSTO", "JARDIM BELA VISTA", "JARDIM BENTO PRATA", "JARDIM BOM RETIRO", "JARDIM BRASIL", "JARDIM CALAMARE", "JARDIM CAMPINA GRANDE", "JARDIM CANAÃ", "JARDIM CARMONA", "JARDIM CENTRAL", "JARDIM CONCEIÇÃO", "JARDIM DAS COLINAS", "JARDIM DIAS", "JARDIM DO BOSQUE", "JARDIM ESTRELA", "JARDIM EUROPA", "JARDIM GIRASSOL", "JARDIM GOUVEIA", "JARDIM GREEN PARK", "JARDIM HORIZONTE", "JARDIM HORTOLÂNDIA", "JARDIM INTERLAGOS", "JARDIM IPANEMA", "JARDIM ITATINGA", "JARDIM LUZITANO", "JARDIM MARGARIDA", "JARDIM MARIANA", "JARDIM MELLO AYRES", "JARDIM MORADA DO SOL", "JARDIM NARCISA", "JARDIM NOSSA SENHORA AUXILIADORA", "JARDIM NOSSA SENHORA DE FÁTIMA", "JARDIM NOVA ALVORADA", "JARDIM NOVA EUROPA", "JARDIM NOVA HORTOLÂNDIA", "JARDIM NOVO ÂNGULO", "JARDIM NOVO CAMBUI", "JARDIM PANORAMA", "JARDIM PINHEIROS", "JARDIM PLANALTO", "JARDIM PRIMAVERA", "JARDIM RECANTO DO SOL", "JARDIM REMANSO CAMPINEIRO", "JARDIM RESIDENCIAL DO BOSQUE", "JARDIM ROSA E SILVA", "JARDIM ROSA DE SARON", "JARDIM ROSOLÉM", "JARDIM SANTA AMÉLIA", "JARDIM SANTA CLARA", "JARDIM SANTA EMÍLIA", "JARDIM SANTA ESMERALDA", "JARDIM SANTA IZABEL", "JARDIM SANTA LUZIA", "JARDIM SANTA RITA", "JARDIM SANTANA", "JARDIM SANTO ANDRE", "JARDIM SANTO ANTONIO", "JARDIM SÃO BENTO", "JARDIM SÃO CAETANO", "JARDIM SÃO FELIPE", "JARDIM SÃO JORGE", "JARDIM SÃO LUIZ", "JARDIM SÃO MANOEL", "JARDIM SÃO MIGUEL", "JARDIM SÃO PEDRO", "JARDIM SÃO SEBASTIÃO", "JARDIM SÃO VICENTE", "JARDIM SUMAREZINHO", "JARDIM TERRA ROSSA", "JARDIM VILLAGIO ESPERANÇA", "PARQUE DO HORTO", "PARQUE DOS PINHEIROS", "PARQUE GABRIEL", "PARQUE ORTOLÂNDIA", "PARQUE RESIDENCIAL AMANDA", "PARQUE SANTO ANDRE", "RESIDENCIAL FLAMBOYANT", "RESIDENCIAL GOLDEN PARK", "VILA REAL", "VILA REAL CONTINUAÇÃO", "PQ. DOS BANDEIRANTES", "JD. TERRA BRANCA", "JD. SÃO FRANCISCO", "JD. SANTA FE", "JD. NOSSA SENHORA DA PIEDADE", "JD. MARCIA", "JD. LIVIA", "JD. FLAMBOYANT", "JD. ELDORADO", "JD. EDSON", "JD. DAS PALMEIRAS", "CHÁCARAS SÃO LUIZ", "CHÁCARAS RECREIO ALVORADA", "PQ. SÃO SEBASTIÃO", "PQ. SANTA FE", "PQ. RESIDENCIAL ROSOLÉM", "VILA SÃO PEDRO", "VILA SÃO JORGE", "VILA GOMES", "RECANTO DO SOL II", "RECANTO DO SOL I", "PQ. DOS JACARANDÁS", "PQ. DAS ROSAS", "PQ. DAS FLORES", "PQ. DAS ACACIAS", "LOTEAMENTO REMANSO", "LOTEAMENTO RECANTO DAS ÁGUAS", "JD. VITÓRIA", "JD. UNIVERSITÁRIO", "JD. SÃO TARCÍSIO", "JD. SÃO RAMON", "JD. SÃO PAULO", "JD. SÃO JOÃO", "JD. SANTA MARIA", "JD. SANTA LOURDES", "JD. SANTA HELENA", "JD. REGINA", "JD. NOVO HORIZONTE", "JD. NOVA AMÉRICA", "JD. MONTREAL", "JD. MONTE CARLO", "JD. MIRIAM", "JD. MARAJOARA", "JD. MADALENA", "JD. LUZIÂNIA", "JD. LOURDES", "JD. IPÊ", "JD. INDUSTRIAL", "JD. IBIRAPUERA", "JD. GURANI", "JD. GOIÁS", "JD. FIRENZE", "JD. ESPERANÇA", "JD. DOM BOSCO", "JD. COLINA", "JD. BOA ESPERANÇA"
].sort();

export const CANAIS_COMUNICACAO = [
  'DISQUE 100', 'EMAIL INSTITUCIONAL', 'PRESENCIAL', 'OFÍCIO MP', 'OFÍCIO JUDICIÁRIO', 'SISTEMA INTEGRADO'
];

export const STATUS_LABELS: Record<string, string> = {
  'NAO_LIDO': 'Novo Documento',
  'NOTIFICACAO': 'Notificação Gerada',
  'NOTIFICACAO_REFERENCIA': 'Notificação de Referência',
  'NOTICIA_FATO_ENCAMINHADA': 'Notícia de Fato',
  'AGUARDANDO_RESPOSTA': 'Aguardando Resposta',
  'RESPONDER_OFICIO': 'Responder Ofício',
  'OFICIO_RESPONDIDO': 'Ofício Respondido',
  'SOLICITACAO_REDE': 'Solicitação à Rede',
  'RESPOSTA_ENVIADA': 'Resposta Enviada',
  'ARQUIVADO': 'Arquivado',
  'MONITORAMENTO': 'Em Monitoramento',
  'SOLICITAR_REUNIAO_REDE': 'Reunião de Rede',
  'EMAIL_ENCAMINHADO': 'E-mail Encaminhado',
  'EM_PREENCHIMENTO': 'Em Preenchimento (Rascunho)',
  'AGUARDANDO_VALIDACAO': 'Aguardando Validação',
  'OFICIALIZADO': 'Oficializado',
  'CONCLUIDO': 'Concluído'
};

export const UNIFIED_GENDER_OPTIONS = [
  "Masculino (Cisgênero)",
  "Feminino (Cisgênero)",
  "Mulher Trans / Homem Trans",
  "Não-binário / Gênero Fluido",
  "Outro / Prefere não informar"
];

export const AGENTES_VIOLADORES_ESTRUTURA: Record<string, { options: string[] }> = {
  "ESTADO": { options: ["Hospitais", "Escolas", "Postos de Saúde", "Cartórios", "Defensoria", "Judiciário", "Ministério Público", "Polícias", "Creches"] },
  "FAMÍLIA": { options: ["Mãe", "Pai", "Padrasto", "Madrasta", "Avós", "Irmãos", "Tios", "Parentes", "Responsável Legal"] },
  "SOCIEDADE": { options: ["Vizinhos", "Empresas", "Meios de Comunicação", "Entidades Religiosas", "Clubes", "Escolas Privadas", "Hospitais Privados"] },
  "PRÓPRIA CONDUTA": { options: ["Atos da própria criança ou adolescente"] }
};

export const MEDIDAS_PROTECAO_ECA = [
  { artigo: 'Art. 101', incisos: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'] },
  { artigo: 'Art. 129', incisos: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] }
];

export const MEDIDAS_ECA_DESCRICAO: Record<string, string> = {
  'I': 'Encaminhamento aos pais ou responsável, mediante termo de responsabilidade',
  'II': 'Orientação, apoio e acompanhamento temporários',
  'III': 'Matrícula e frequência obrigatórias em estabelecimento oficial de ensino fundamental',
  'IV': 'Inclusão em serviços e programas oficiais ou comunitários de proteção, apoio e promoção da família, da criança e do adolescente',
  'V': 'Requisição de tratamento médico, psicológico ou psiquiátrico, em regime hospitalar ou ambulatorial',
  'VI': 'Inclusão em programa oficial ou comunitário de auxílio, orientação e tratamento a alcoólatras e toxicômanos',
  'VII': 'Acolhimento institucional',
  'VIII': 'Inclusão em programa de acolhimento familiar',
  'IX': 'Colocação em família substituta',
  'Art. 129, I': 'Encaminhamento a programa oficial ou comunitário de proteção à família',
  'Art. 129, II': 'Inclusão em programa oficial ou comunitário de auxílio, orientação e tratamento a alcoólatras e toxicômanos',
  'Art. 129, III': 'Encaminhamento a tratamento psicológico ou psiquiátrico',
  'Art. 129, IV': 'Encaminhamento a cursos ou programas de orientação',
  'Art. 129, V': 'Obrigação de matricular o filho ou enteado e acompanhar sua frequência e aproveitamento escolar',
  'Art. 129, VI': 'Obrigação de encaminhar a criança ou adolescente a tratamento especializado',
  'Art. 129, VII': 'Advertência',
  'Art. 129, VIII': 'Perda da guarda',
  'Art. 129, IX': 'Destituição da tutela',
  'Art. 129, X': 'Suspensão ou destituição do poder familiar'
};

export const SIPIA_HIERARCHY: Record<string, Record<string, string[]>> = {
  "CONVIVÊNCIA FAMILIAR E COMUNITÁRIA": {
    "Privação ou dificuldade de convívio": ["Omissão dever familiar", "Pensão alimentícia", "Impedimento contato pais/familiares", "Falta pais/parentes", "Subtração por familiares", "Falta/precariedade moradia", "Tráfico", "Fuga", "Abandono"].sort(),
    "Inadequação do convívio familiar": ["Falta de afeto/zelo/proteção", "Dificuldade estágio adoção", "Ambiente familiar violento", "Favorecimento uso drogas", "Ambiente prejudicial desenvolvimento", "Alienação parental"].sort(),
    "Violações à dignidade / negligência": ["Falta apoio emocional/psicológico", "Omissão educação escolar", "Omissão saúde/alimentação/higiene", "Omissão proteção/segurança"].sort(),
    "Ausência de programas (State)": ["Inexistência orientação sócio-familiar", "Falta vaga acolhimento", "Inexistência transferência renda", "Falta acolhimento adultos c/ crianças", "Falta vaga abrigo"].sort(),
    "Atos atentatórios": ["Desrespeito opinião criança (guarda/adoção)", "Negação filiação", "Indefinição paternidade", "Impedimento contato pais presos", "Impedimento acesso família/comunidade"].sort()
  },
  "VIDA E SAÚDE": {
    "Não atendimento em saúde": ["Falta leitos", "Recusa aborto legal", "Falta atendimento especializado", "Não atendimento gestante", "Não atendimento usuário drogas", "Falta vacinação", "Não atendimento emergencial"].sort(),
    "Atendimento inadequado": ["Falta orientação diagnóstica/tratamento", "Cirurgia desnecessária", "Falta precedência", "Extrações dentárias desnecessárias", "Danos procedimentos", "Negligência profissional"].sort(),
    "Práticas irregulares": ["Falta prontuário", "Exigência presença pais para atender", "Falta alojamento conjunto nascimento", "Falta notificação suspeita violência", "Proibição permanência acompanhante", "Não identificação recém-nascido", "Retirada compulsória bebê"].sort(),
    "Ausência de ações específicas": ["Falta prevenção drogas", "Falta tratamento agressor sexual", "Ausência info epidemias", "Ausência saneamento ambiental/básico"].sort(),
    "Prejuízo por ação/omissão": ["Falta notificação profissional", "Recusa atendimento (filosófico/religioso)", "Omissão socorro", "Condições precárias abrigo/socioeducativo"].sort(),
    "Atos atentatórios": ["Ameaça morte", "Uso droga como violência", "Tentativa homicídio", "Tentativa suicídio", "Automutilação", "Extração ilícita órgãos"].sort()
  },
  "EDUCAÇÃO, CULTURA, ESPORTE E LAZER": {
    "Educação Infantil": ["Falta vaga pré-escola/creche", "Falta equipe especializada (0-3 e 3-6 anos)", "Distância casa/creche"].sort(),
    "Ensino Fundamental/Médio": ["Falta educação bilíngue", "Falta vaga ensino regular/noturno", "Inexistência escola completa"].sort(),
    "Impedimento permanência": ["Constrangimento", "Critérios discriminatórios", "Expulsão indevida", "Punições abusivas", "Transferência compulsória", "Evasão/Infrequência (por violação)"].sort(),
    "Falta condições educacionais": ["Ausência merenda", "Faltas professores", "Falta info frequência aos pais", "Falta material", "Falta segurança", "Falta atendimento especializado (PCD/Altas habilidades)"].sort(),
    "Cultura/Esporte/Lazer": ["Falta manutenção equipamentos", "Inexistência de espaços", "Falta programas públicos", "Impedimento de acesso"].sort()
  },
  "PROFISSIONALIZAÇÃO E PROTEÇÃO NO TRABALHO": {
    "Condições irregulares": ["Trabalo 14/15 anos", "Trabalho doméstico", "Escravidão", "Trabalho infantil", "Desrespeito direitos trabalhistas", "Jornada ilegal", "Trabalho noturno", "Incompatibilidade escolar"].sort(),
    "Remuneração/Relação laboral": ["Apropriação resultado trabalho", "Coação física/psicológica", "Trabalho sem remuneração", "Remuneração inadequada"].sort(),
    "Capacitação": ["Ausência encaminhamento programas", "Não acesso formação técnica (incluindo PCD e medidas proteção)"].sort()
  },
  "LIBERDADE, RESPEITO E DIGNIDADE": {
    "Restrições ir e vir": ["Apreensão/Detenção/Confinamento ilegal", "Exílio forçado", "Sequestro", "Recolhimento compulsório", "Impedimento acesso logradouro"].sort(),
    "Discriminação": ["Histórico ato infracional", "Raça/etnia", "Gênero", "Características pessoais", "Política/Ideologia", "Intolerância religiosa", "Orientation sexual/Identidade gênero", "Situação acolhimento/socioeducativo"].sort(),
    "Negação Cidadania": ["Cerceamento crença", "Violação intimidade", "Exposição imagem", "Omissão registro queixa", "Falta Registro Civil", "Omissão autoridade perante ameaça", "Violência patrimonial"].sort(),
    "Violência Psicolográfica": ["Tortura", "Tratamento cruel", "Humilhação", "Agressão verbal", "Cyberbullying"].sort(),
    "Violência Física": ["Supressão alimentação", "Tortura", "Castigo corporal", "Espancamento", "Maus tratos", "Violência letal"].sort(),
    "Violência Sexual": ["Estupro", "Exibicionismo", "Assédio", "Abuso (círculo social or custódia)", "Aliciamento", "Satisfação lascívia"].sort(),
    "Exploração Sexual": ["Prostituição", "Pornografia infantil", "Registro/Armazenamento/Divulgação cena sexo"].sort(),
    "Atos Ilícitos": ["Corrupção de menores", "Aliciamento tráfico/porte drogas", "Envolvimento grupos armados"].sort()
  }
};
