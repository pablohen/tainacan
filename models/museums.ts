import Museum from '../interfaces/Museum';

const Museums: Museum[] = [
  {
    title: 'Major José Levy Sobrinho',
    link: 'https://www.limeira.sp.gov.br/museu',
    url: 'museu/0',
    description:
      'Fruto de uma parceria com a equipe gestora do Projeto Tainacan (ferramenta de código aberto voltada à gestão de acervos culturais desenvolvida pela Universidade Federal de Goiás, Universidade de Brasília e Instituto Brasileiro de Informação em Ciência e Tecnologia com fomento do Instituto Brasileiro de Museus e da Fundação Nacional das Artes – 2014-2019) e com o Centro de Memória-Unicamp, orgulhosamente apresentamos à Limeira e região este espaço virtual de acesso às memórias e identidades plurais construídas por meio da cultura material.',
    api: 'https://www.limeira.sp.gov.br/museu/wp-json/tainacan/v2',
  },
  {
    title: 'Museu Casa da Princesa',
    link: 'http://museusibramgoias.acervos.museus.gov.br/museu-casa-da-princesa/',
    url: 'museu/1',
    description:
      'O Museu Casa da Princesa, foi construído no século XVIII com a função de ser uma casa. Com o passar do tempo, esta residência virou Museu, o único da cidade de Pilar de Goiás. Seu acervo é constituído por 996 peças. As principais coleções deste museu são formadas por utensílios de guerra, numismática, mineração, comunicação, bem como, objetos indígenas e de tortura. Ao todo, serão disponibilizadas ao público 264 moedas.',
    api: 'http://museusibramgoias.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu Casa de Benjamin Constant',
    link: 'http://museucasabenjaminconstant.acervos.museus.gov.br/acervo/',
    url: 'museu/2',
    description:
      'O acervo do Museu foi constituído inicialmente por peças reunidas quando do tombamento do imóvel pelo SPHAN no ano de 1958, além de doações feitas pelo neto de Benjamin Constant, Pery Constant Bevilaqua.  Com a retomada da casa pela União, em 1961, por ocasião do falecimento da filha mais nova de BC, foram encontradas peças de mobiliário que também ficaram sob a guarda do SPHAN. No ano de 1980, com os trabalhos de organização do Museu, foi doado mais um conjunto de objetos que pertenceram a Benjamin Constant e seus familiares por seu neto Pery, para a montagem da exposição e inauguração do Museu em 1982.',
    api: 'http://museucasabenjaminconstant.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu da Inconfidência',
    link: 'http://museudainconfidencia.acervos.museus.gov.br/acervo/',
    url: 'museu/3',
    description:
      'O acervo museológico do MDINC apresenta testemunhos da vida sociocultural mineira dos século XVIII e XIX, relacionados à formação da sociedade brasileira, com relevante conteúdo histórico e artístico, expondo peças de distintas tipologias e, principalmente, obras primas de Aleijadinho, Mestre Athaíde, Vieira Servas, João Nepomuceno, Pallière e tantos outros excepcionais artistas e artífices do período colonial.',
    api: 'http://museudainconfidencia.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu das Bandeiras',
    link: 'http://museusibramgoias.acervos.museus.gov.br/acervo/',
    url: 'museu/4',
    description:
      'O Museu das Bandeiras está sediado no antigo edifício construído para ser utilizado como Câmara e Cadeia construída em 1766 na antiga Vila Boa de Goyaz. Seu acervo museológico é composto por objetos significativos da presença negra, indígena e portuguesa em Goiás. Inicialmente, foi constituído por objetos/documentos do arquivo documental da Delegacia Fiscal do Tesouro Nacional em Goiás e pelo mobiliário já pertencente ao edifício. O acervo é composto por 590 peças, entre eles, objetos de arqueológicos, mobiliário, fragmentos de igrejas, elementos representativos da ocupação bandeirante e da escravidão, arte indígena e originária, arte sacra e os bens integrados do edifício. Nesta etapa estão sendo disponibilizadas 350 peças.',
    api: 'http://museusibramgoias.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu das Missões',
    link: 'http://museudasmissoes.acervos.museus.gov.br/acervo/',
    url: 'museu/5',
    description:
      'O acervo do Museu das Missões é composto por um total de 92 objetos, abrigando uma das mais importantes coleções públicas de esculturas sacras missioneiras em madeira policromada da América do Sul e uma das coleções mais importantes nesse gênero.',
    api: 'http://museudasmissoes.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu de Arqueologia de Itaipu',
    link: 'http://museudearqueologiadeitaipu.museus.gov.br/',
    url: 'museu/6',
    description:
      'Quando o Museu de Arqueologia de Itaipu foi criado em 1977, inaugurou-se a exposição de longa duração “Aspectos da pré-história do litoral do Estado do Rio de Janeiro”. Era uma exposição com abordagem arqueológica, que não retratava a memória mais recente daquela comunidade de pescadores que tanto desejou preservar a região e seus monumentos históricos.',
    api: 'http://museudearqueologiadeitaipu.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu de Arte Sacra da Boa Morte',
    link: 'http://museusibramgoias.acervos.museus.gov.br/museu-casa-da-boa-morte/',
    url: 'museu/7',
    description:
      'O edifício que hoje abriga o Museu de Arte Sacra da Boa Morte, foi criado no século XVIII, e está instalado na Cidade de Goiás. Inicialmente dedicada a Santo Antônio de Pádua (1762), posteriormente, ainda inacabada foi doada à Confraria dos Homens Pardos da Boa Morte. Em 1950 foi tombada pelo na esfera federal e estadual. Em 1968/1969 passou a abrigar o Museu de Arte Sacra da Boa Morte. O acervo de propriedade da Diocese de Goiás é constituído de 1041 peças. No entanto, nesta etapa, disponibilizaremos somente 111 objetos, majoritariamente peças sacras em estilo barroco, produzidas pelo escultor goiano Veiga Valle.',
    api: 'http://museusibramgoias.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu do Diamante',
    link: 'https://museudodiamante.acervos.museus.gov.br/',
    url: 'museu/8',
    description:
      'Com acervo formado por objetos de estilos e tipologias diversas, o Museu do Diamante/Ibram constitui-se importante espaço de informação e memória tanto para a população de Diamantina (MG), quanto para os curiosos visitantes vindos de todas as partes do mundo. Entre estes objetos podemos encontrar indumentária e imaginária sacra, armaria, um vasto acervo de numismática, mineralogia, além de instrumentos utilizados no processo de mineração do ouro e diamante, que juntos compõem o quadro do que foi o processo de formação e ocupação do norte de Minas Gerais.',
    api: 'https://museudodiamante.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu do Ouro',
    link: 'https://museudoouro.acervos.museus.gov.br/acervo/',
    url: 'museu/9',
    description:
      'O acervo museológico do Museu do Ouro começou a ser constituído em meados da década de 1940. Possui peças mobiliário, armaria, porcelanas, imaginária religiosa e objetos relacionados a costumes sociais e práticas de mineração.',
    api: 'https://museudoouro.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu Histórico Nacional',
    link: 'http://mhn.acervos.museus.gov.br/',
    url: 'museu/10',
    description:
      'O Museu Histórico Nacional disponibiliza online parte do seu acervo museológico. Estão disponíveis informações detalhadas de sua pinacoteca, com mais de 500 pinturas, além de coleções de itens tridimensionais em reserva técnica.',
    api: 'http://mhn.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu Regional São João Del Rey',
    link: 'http://museuregionaldesaojoaodelrei.acervos.museus.gov.br/apresentacao-acervo-museologico/',
    url: 'museu/11',
    description:
      'A coleção permanente do Museu Regional é um reflexo da cultura e História de Minas Gerais. Reunido entre 1956 e 1963, seu acervo possui uma variedade significativa de peças, que ilustram o cotidiano mineiro do século XVII ao início do século XX. São 484 obras, em meio a peças do imaginário e mobiliário, pinturas, máquinas, equipamentos de trabalho, instrumentos musicais e meios de transporte. Disposto pelos três andares do prédio, o acervo reúne aspectos políticos, sociais, artísticos e históricos, que compõem, de forma geral, a identidade do povo mineiro e contexto de formação do Estado.',
    api: 'http://museuregionaldesaojoaodelrei.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu Regional Casa dos Ottoni',
    link: 'https://museuregionalcasadosottoni.acervos.museus.gov.br/acervo-museologico',
    url: 'museu/12',
    description:
      'Acervo formado, principalmente, por imagens de arte sacra católica – como imagens de roca que saíam na Procissão de Cinzas e as que pertenceram à demolida igreja de Nossa Senhora da Purificação.',
    api: 'https://museuregionalcasadosottoni.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu Victor Meirelles',
    link: 'http://museuvictormeirelles.acervos.museus.gov.br/',
    url: 'museu/13',
    description:
      'O acervo do Museu Victor Meirelles foi inicialmente formado por um núcleo de 27 obras de arte de Victor Meirelles provenientes do Museu Nacional de Belas Artes no ano de 1951, durante o processo de criação e abertura da Casa Natal de Victor Meirelles, conforme o museu era chamado à época. Ao longo dos anos, o Museu passou a receber por doação de outras instituições e de colecionadores particulares outras obras de arte de Victor Meirelles e de seus professores e alunos, que foram organizadas nessa coleção homônima do pintor.',
    api: 'http://museuvictormeirelles.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu Villa Lobos',
    link: 'http://museuvillalobos.acervos.museus.gov.br/acervo/',
    url: 'museu/14',
    description:
      'O Museu Villa-Lobos é responsável pela coleta, preservação, estudo e divulgação de documentos e objetos que atestam, testemunham e ilustram a vida e a obra de Villa-Lobos e que, pela sua expressão e representatividade, constituem referência na formação da identidade brasileira. Todo esse acervo – composto por partituras, correspondências e documentos textuais, programas de concertos nacionais e estrangeiros, arquivo sonoro, acervo audiovisual e objetos multidimensionais – será disponibilizado aos poucos na Web. A coleção de fotografias é a estreia do Museu Villa-Lobos no projeto Tainacan.',
    api: 'http://museuvillalobos.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu Casa da Hera',
    link: 'http://museucasadahera.acervos.museus.gov.br/acervo/',
    url: 'museu/15',
    description:
      'O acervo do Museu Casa da Hera é melhor compreendido se dividido em duas categorias de maior destaque e relevância: aquela cujas peças compõem o cenário da Casa e a de Indumentária.',
    api: 'http://museucasadahera.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu Casa Histórica de Alcântara',
    link: 'http://museucasahistoricadealcantara.acervos.museus.gov.br/acervo/',
    url: 'museu/16',
    description:
      'O sobrado nº7 que hoje é sede do Museu Casa Histórica de Alcântara atravessou seus quase dois séculos de existência adaptando-se às guinadas da história. Trata-se de parte de um conjunto de três sobrados construídos, segundo relatos de cronistas, no final do século XVIII e início do século XIX.',
    api: 'http://museucasahistoricadealcantara.acervos.museus.gov.br/wp-json/tainacan/v2',
  },
  {
    title:
      'Anais 3º Congresso Internacional Povos Indígenas da América Latina (CIPIAL)',
    link: 'http://www.congressopovosindigenas.net/anais/3o-cipial/',
    url: 'museu/17',
    description:
      'Anais do 3º Congresso Internacional Povos Indígenas da América Latina ISBN 978-65-5080-015-4',
    api: 'http://www.congressopovosindigenas.net/anais/wp-json/tainacan/v2',
  },
  {
    title: 'Casa de Cultura da América Latina (CAL)',
    link: 'http://www.acervocal.unb.br/',
    url: 'museu/18',
    description:
      'A Casa da Cultura da América Latina, do Decanato de Extensão da Universidade de Brasília, foi criada para promover e divulgar a arte e a cultura latino-americana, incentivar e estender o conhecimento acumulado nos centros de pesquisa à sociedade mais ampla. A CAL vem se consolidando como um espaço de pesquisa, preservação e divulgação do patrimônio artístico da Universidade e das expressões culturais latino-americanas. Ao longo dos seus mais de 30 anos de existência, a CAL reuniu um acervo que chega a 2700 itens, parte deles aqui disponíveis para fruição e pesquisa.',
    api: 'http://www.acervocal.unb.br/wp-json/tainacan/v2',
  },
  {
    title: 'COVID-19: Unb em ação',
    link: 'http://repositoriocovid19.unb.br/',
    url: 'museu/19',
    description:
      'niciativas das diferentes áreas de conhecimento da Universidade de Brasília buscam soluções para a crise de saúde, econômica e social que enfrentamos pela frente. Conheça aqui os projetos e produtos gerados pelas ações de pesquisa, inovação, extensão e serviços tecnológicos que estão sendo desenvolvidos pela Universidade de Brasília no esforço de enfrentamento à Covid-19.',
    api: 'http://repositoriocovid19.unb.br/wp-json/tainacan/v2',
  },
  {
    title: 'Memória das Exposições/ Graduação em Museologia',
    link: 'http://www.exposicoesdamuseologia.fci.unb.br/',
    url: 'museu/20',
    description:
      'Espaço experimental de ensino online, propõe disponibilizar produtos desenvolvidos por estudantes e professores, no âmbito do projeto MEMÓRIA DO CURSO DE MUSEOLOGIA DA UnB. Ressalta-se a importância de promover a reflexão sobre a memória institucional, ao mesmo tempo que são produzidas as atividades culturais.',
    api: 'http://www.exposicoesdamuseologia.fci.unb.br/wp-json/tainacan/v2',
  },
  {
    title: 'Sala de Situação da Faculdade de Saúde Coletiva',
    link: 'https://sds.unb.br/',
    url: 'museu/21',
    description:
      'Somos um ambiente para aproximar os estudantes, professores, colaboradores e profissionais de saúde a participarem desse processo de ensino-aprendizagem dos saberes teóricos e práticos de forma multidisciplinar, através da construção de conhecimento coletivo.',
    api: 'https://sds.unb.br/wp-json/tainacan/v2',
  },
  {
    title: 'Repositório de metadados de informação legislativa',
    link: 'https://marianabrandt.com.br/tese/',
    url: 'museu/22',
    description:
      'Este repositório faz parte da pesquisa de doutorado em Ciência da Informação, inserida no Programa de Pós Graduação em Ciência da Informação (PPGCI) da Universidade Estadual Paulista (Unesp), intitulada “Modelagem da Informação Legislativa: Arquitetura da Informação para o processo legislativo brasileiro”, da discente  Mariana Baptista Brandt, orientada pela professora Dra. Silvana Aparecida Borsetti Gregório Vidotti. O repositório foi feito com a ferramenta gratuita Tainacan.',
    api: 'https://marianabrandt.com.br/tese/wp-json/tainacan/v2',
  },
  {
    title: 'MFS Herbário',
    link: 'https://herbariomfs.uepa.br/',
    url: 'museu/23',
    description:
      'O Herbário MFS Profª Drª Marlene Freitas da Silva foi criado em 2011 a partir do projeto “Coleção de frutos, sementes e plântulas amazônicas: conhecimento e valorização do patrimônio genético natural”.',
    api: 'https://herbariomfs.uepa.br/wp-json/tainacan/v2',
  },
  {
    title: 'Coleções do Instituto de Geociências da USP',
    link: 'https://colecoes.igc.usp.br/',
    url: 'museu/24',
    description:
      'Este é um espaço para divulgação de materiais da área das geociências disponíveis no IGc.',
    api: 'https://colecoes.igc.usp.br/wp-json/tainacan/v2',
  },
  // {
  //   title: 'Centro de Cultura da UFG',
  //   link: 'https://tainacan.medialab.ufg.br/cculturalufg/',
  //   url: 'museu/25',
  //   description: 'texto descrevendo o local',
  //   api: 'https://tainacan.medialab.ufg.br/cculturalufg/wp-json/tainacan/v2',
  // },
  // {
  //   title: 'História do Livro e da Leitura em Goiás',
  //   link: 'https://medialab.ufg.br/cafecomleitura/historia-leitura-goias/',
  //   url: 'museu/26',
  //   description: 'texto descrevendo o local',
  //   api: 'https://medialab.ufg.br/cafecomleitura/wp-json/tainacan/v2',
  // },
  {
    title: 'Museu de Antropologia da UFG',
    link: 'https://acervo.museu.ufg.br/',
    url: 'museu/27',
    description:
      'Em 2019, o Conselho Diretor do Museu Antropológico aprovou a criação deste acervo virtual com o objetivo de ampliar a divulgação do nosso trabalho. Esperamos compartilhar um resultado eficiente que contribua para a salvaguarda, divulgação e pesquisa do Patrimônio Cultural Brasileiro e para a valorização da diversidade de nossos povos.',
    api: 'https://acervo.museu.ufg.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museologia Virtual/Graduação em Museologia',
    link: 'https://tainacan.webmuseu.org/',
    url: 'museu/28',
    description:
      'Cidade Palimpséstica apresenta fotografias antigas que contam a história da capital mineira e refletem sobre sua constante reescrita urbana. Travessia é a mostra on-line desenvolvida pelos alunos do Curso de Museologia da UFMG, na disciplina Bibliotecas, Arquivos e Museus Digitais (2019). Teve como inspiração a exposição curricular Cidade Palimpséstica, adotando como ponto de partida o acervo do Laboratório de Fotodocumentação Sylvio de Vasconcellos (LAFODOC/UFMG).',
    api: 'https://tainacan.webmuseu.org/wp-json/tainacan/v2',
  },
  {
    title: 'Coisas Banais',
    link: 'https://museudascoisasbanais.com.br/',
    url: 'museu/29',
    description:
      'O que os objetos, estes companheiros silenciosos, nos dizem? O que eles podem dizer sobre nós mesmos? Os objetos que guardamos, como uma porta de acesso a nossas lembranças, podem ser banais? Afinal, o que é banal? Banal é aquilo que não tem valor?',
    api: 'https://museudascoisasbanais.com.br/acervo/wp-json/tainacan/v2',
  },
  {
    title: 'Ecomuseu Delta do Parnaíba',
    link: 'http://repositoriomude.com.br/',
    url: 'museu/30',
    description:
      'Um repositório com um acervo singular, resultado de estudos e intervenções realizados por docentes e discentes do Programa de Pós-graduação em Artes, Patrimônio e Museologia da Universidade Federal do Piauí, Museu da Vila, em parceria com a Associação de Moradores do Bairro Coqueiro da Praia. Usamos metodologias participativas e colaborativas associadas à história oral, etnografia, fotografia, cinema documental, projetos de natureza ação, materializados em suportes e linguagens diversas, que nos permitem preservar, pesquisar, documentar e comunicar (processo museológico), em uma perspectiva comparada, transdisciplinar, multiprofissional, especificidades das artes, patrimônio cultural e museologia e inovação social,  modos de saber-fazer de comunidades que habitam a Área de Proteção Ambiental Delta do Parnaíba e o vasto território do Estado do Piauí.',
    api: 'http://repositoriomude.com.br/wp-json/tainacan/v2',
  },
  // {
  //   title: 'Acervo Museológico dos Laboratórios do Ensino de Física',
  //   link: 'https://www.ufrgs.br/amlef/en/highlight/',
  //   url: 'museu/31',
  //   description: 'texto descrevendo o local',
  //   api: 'https://www.ufrgs.br/amlef/wp-json/tainacan/v2',
  // },
  {
    title: 'Museologia na UFRGS: trajetórias e memórias',
    link: 'http://memoriamslufrgs.online/tainacan/',
    url: 'museu/32',
    description: 'texto descrevendo o local',
    api: 'http://memoriamslufrgs.online/tainacan/wp-json/tainacan/v2',
  },
  {
    title: 'Pinacoteca Barão de Santo Ângelo',
    link: 'https://www.ufrgs.br/acervopbsa/',
    url: 'museu/33',
    description:
      'Equipamento Cultural do Instituto de Artes da Universidade Federal do Rio Grande do Sul, a Pinacoteca Barão de Santo Ângelo é responsável pela conservação, restauração, ampliação e divulgação do patrimônio artístico e documental do Instituto, bem como pelo intercâmbio com a produção artística contemporânea.',
    api: 'https://www.ufrgs.br/acervopbsa/wp-json/tainacan/v2',
  },
  {
    title: 'Banco de Imagens e Efeitos Visuais',
    link: 'https://www.ufrgs.br/biev/',
    url: 'museu/34',
    description:
      'O Banco de Imagens e Efeitos Visuais/BIEV utiliza tecnologias digitais para construir coleções etnográficas há mais de 20 anos. Aproveite.',
    api: 'https://www.ufrgs.br/biev/wp-json/tainacan/v2',
  },
  {
    title: 'Acervo Museologia UFSC',
    link: 'https://museologia.acervos.ufsc.br/',
    url: 'museu/35',
    description:
      'O curso de Museologia da Universidade Federal de Santa Catarina foi criado em 30 de setembro de 2009, tendo a primeira turma iniciado os estudos no primeiro semestre de 2010. Em 2020, como uma das ações comemorativas de 10 anos do Curso de Museologia da UFSC, disponibilizamos parte do o acervo das Exposições Curriculares. Os acervos aqui apresentadas, integraram as exposições curriculares do Curso de Graduação em Museologia da UFSC. As exposições curriculares foram projetos concebidos e executados pelos alunos do curso em disciplinas obrigatórias da grade curricular.',
    api: 'https://museologia.acervos.ufsc.br/wp-json/tainacan/v2',
  },
  {
    title: 'Espaço NEABI Grajaú',
    link: 'http://200.137.143.98:10203/',
    url: 'museu/36',
    description:
      'Aqui você encontrará exposições (fotografias, imagens, vídeos e outros) produzidas no contexto das atividades do Núcleo de Estudos Afro-brasileiros e Indígenas (NEABI) do Instituto Federal do Maranhão (IFMA) Campus Grajaú. O Espaço NEABI Grajaú visa expressar e preservar no mundo digital projetos de intervenção visual ou audiovisual que sejam propostas dentro das atividades do NEABI Local para divulgação e conscientização de temáticas sociais que sejam de interesse desse Núcleo.',
    api: 'http://200.137.143.98:10203/wp-json/tainacan/v2',
  },
  {
    title:
      'Acervo Digital de Humanização da Rede Humaniza SUS (Ministério da Saúde)',
    link: 'http://redehumanizasus.net/acervo-digital-de-humanizacao/',
    url: 'museu/37',
    description:
      'O Acervo digital de Humanização reúne documentos e registros históricos da humanização no Brasil, dos atores e acontecimentos que fizeram e fazem o movimento HumanizaSUS. Ao acessar o repositório também é possível filtrar sua consulta utilizando a barra de pesquisa à direita, as opções e valores de filtros à esquerda e também selecionando termos clicáveis nas informações de cada item. Aqui nesta página, os itens do acervo estão destacados também de acordo com sua tipologia, o que permite diferentes maneiras de explorar a memória da nossa rede.',
    api: 'http://redehumanizasus.net/wp-json/tainacan/v2',
  },
  {
    title: 'Fundação Nacional das Artes (FUNARTE)',
    link: 'https://www.funarte.gov.br/colecoes/',
    url: 'museu/38',
    description:
      'Criada em 1975, a Fundação Nacional de Artes – Funarte é o órgão do Governo Federal brasileiro cuja missão é promover e incentivar a produção, a prática, o desenvolvimento e a difusão das artes no país. É responsável pelas políticas públicas federais de estímulo à atividade produtiva artística brasileiras; e atua para que a população possa cada vez mais usufruir das artes.',
    api: 'https://www.funarte.gov.br/wp-json/tainacan/v2',
  },
  {
    title: 'Museu do Índio (FUNAI)',
    link: 'https://museudoindio.tainacan.org/',
    url: 'museu/39',
    description:
      'O Museu do Índio abriga um rico acervo etnográfico dos povos indígenas no Brasil. São 20.521 objetos contemporâneos, na sede, expressões da cultura material de aproximadamente 150 povos indígenas que viveram e vivem no território brasileiro.  As peças de uso ritual e cotidiano, feitas dos mais variados materiais como madeira, palha, argila etc., foram obtidas diretamente dos índios por meio de doações e compras a partir de 1947.',
    api: 'https://museudoindio.tainacan.org/wp-json/tainacan/v2',
  },
  {
    title: 'Museu de Arte de Santa Catarina – MASC',
    link: 'https://aplicacoes.fcc.sc.gov.br/wpmasc/',
    url: 'museu/40',
    description:
      'O acervo do MASC está agora disponível para pesquisas online. As obras podem ser encontradas através de diversos critérios de busca, e a imagens são de uso livre para pesquisas acadêmicas e uso não comercial. Abaixo o link de acesso à página inicial do acervo, boa visita!',
    api: 'https://aplicacoes.fcc.sc.gov.br/wpmasc/wp-json/tainacan/v2',
  },
  {
    title: 'Bibliotheca Pública Pelotense',
    link: 'http://museuhistoricobpp.com.br/',
    url: 'museu/41',
    description: 'texto descrevendo o local',
    api: 'http://museuhistoricobpp.com.br/wp-json/tainacan/v2',
  },
  {
    title: 'Biblioteca Digital: Iyengariana',
    link: 'http://iyengariana.org/',
    url: 'museu/42',
    description:
      'Iyengariana é uma biblioteca digital especializada em documentos digitais sobre o método de Yoga criado por B.K.S. Iyengar. O objetivo é agregar conteúdos sobre a metodologia recolhidos de diferentes fontes de informação como forma de facilitar a pesquisa e a disseminação de informações relacionadas ao método.',
    api: 'http://iyengariana.org/wp-json/tainacan/v2',
  },
  {
    title:
      'Biblioteca Dr Alceu Magnanini (Associação Amigos do Parque – Parque Nacional da Tijuca)',
    link: 'http://parquenacionaldatijuca.rio/acervo/biblioteca-alceo-magnanini/',
    url: 'museu/43',
    description:
      'O agrônomo Alceo Magananini é um dos mais respeitados ambientalistas brasileiros, membro do grupo que delimitou a parte sul da Amazônia e um dos organizadores do Código Florestal Brasileiro de 1965. Foi o primeiro diretor do Parque Nacional da Tijuca.',
    api: 'http://parquenacionaldatijuca.rio/acervo/wp-json/tainacan/v2',
  },
  {
    title: 'Centro de Documentação e Memória do Santo Daime – CEDOC',
    link: 'http://acervo.santodaime.org/',
    url: 'museu/44',
    description:
      'Neste ano de 2019, já em contagem regressiva para as comemorações do Centenário do Padrinho Sebastião, está se realizando o antigo sonho do Centro de Documentação e Memória do Santo Daime, que se consolida agora com a reunião física de seu acervo e assumindo o compromisso de zelar e preservar documentos, fotografias, vídeos, áudios e objetos relevantes para a doutrina, sua história e tradições, garantindo seu acesso e perpetuação para as futuras gerações.',
    api: 'http://acervo.santodaime.org/wp-json/tainacan/v2',
  },
  {
    title: 'Escola da Cidade',
    link: 'http://escoladacidade.org/bau/',
    url: 'museu/45',
    description:
      'Baú é um arquivo em permanente construção de todo o conhecimento produzido na Escola da Cidade. Organizado como um programa de estágios do Núcleo de Comunicação da Escola da Cidade, o Baú é um arquivo de documentação audiovisual gerido pelos alunos e tem como objetivo abrir as discussões sobre arquitetura e suas fronteiras urbanas para além dos limites da universidade. Seu objetivo consiste em captar, organizar e publicar de forma clara e envolvente a produção dos cursos e disciplinas, disponibilizando esses materiais numa plataforma aberta de pesquisa e referência, além de oferecer um momento para discussão das questões da visualidade na arquitetura, incentivando produções autorais dos alunos participantes.',
    api: 'http://escoladacidade.org/bau/wp-json/tainacan/v2',
  },
  {
    title: 'Museu das Comunicações e Humanidades – Oi Futuro',
    link: 'https://acervo.oifuturo.org.br/',
    url: 'museu/46',
    description:
      'O Musehum, Museu das Comunicações e Humanidades, é uma evolução do Museu das Telecomunicações, em atividade há 13 anos, que teve suas instalações totalmente remodeladas para contar a história do desenvolvimento tecnológico das comunicações a partir das relações humanas.',
    api: 'https://acervo.oifuturo.org.br/wp-json/tainacan/v2',
  },
  {
    title: 'Repositório do Krav-Maga',
    link: 'http://rep.bukangoiania.com.br/',
    url: 'museu/47',
    description:
      'Este é um repositório de websites de instrutores da BUKAN no Brasil e no mundo.',
    api: 'http://rep.bukangoiania.com.br/wp-json/tainacan/v2',
  },
  {
    title: 'UNIPAC/FUPAC',
    link: 'https://ri.unipac.br/repositorio/',
    url: 'museu/48',
    description: 'texto descrevendo o local',
    api: 'https://ri.unipac.br/repositorio/wp-json/tainacan/v2',
  },
  // {
  //   title: 'Vídeo nas Aldeias',
  //   link: 'https://acervos.net/aldeias/',
  //   url: 'museu/49',
  //   description: 'texto descrevendo o local',
  //   api: 'https://acervos.net/aldeias/wp-json/tainacan/v2',
  // },
  {
    title: 'Centro Espírita Serapião Ribeiro',
    link: 'https://centroespiritaserapiaoribeiro.com/colecoes/',
    url: 'museu/50',
    description:
      'O Centro Espírita Serapião Ribeiro foi fundado em 1963 e constituído como Associação sem fins lucrativos. Atende mensalmente uma média de 1120 pessoas, prestando apoio espiritual e assistencial a gestantes, crianças, adolescentes, jovens, adultos e idosos. ',
    api: 'https://centroespiritaserapiaoribeiro.com/wp-json/tainacan/v2',
  },
  {
    title: 'San Diego State University – Fake news toolkit',
    link: 'https://fakenewstoolkit.sdsu.edu/fake-news-toolkit/',
    url: 'museu/51',
    description:
      'Instructor resources on Misinformation, Disinformation, Fake News, and Propaganda.',
    api: 'https://fakenewstoolkit.sdsu.edu/wp-json/tainacan/v2',
  },
];

export default Museums;
