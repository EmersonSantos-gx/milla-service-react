const BASE = import.meta.env.BASE_URL || '/';

export const CONFIG = {
  nome: 'Milla Service',
  slogan: 'Quests, Bosses e Serviços no Tibia com segurança, agilidade e confiança.',
  cidade: 'Maceió — AL',
  whatsapp: '5582993643044',
  whatsappExibicao: '(82) 9 9364-3044',
  telefone: '+5582993643044',
  instagram: 'https://instagram.com/@',
  fotoUrl: `${BASE}assets/perfil.png`,
  backgroundUrl: `${BASE}assets/background1.png`,
  devLogoUrl: `${BASE}assets/gxdev-logo.png`,
  devSiteUrl: 'https://www.gxdev.space/',
  cnpj: '',
  githubPagesUrl: 'https://millaservice.github.io/',

  // Vitrine Tecnológica de Coberturas (Bento Grid 2x2)
  servicos: [
    {
      numero: '01',
      titulo: 'Quests&Acessos',
      descricao: 'Missões e desbloqueio de novas áreas.',
      icone: 'fa-solid fa-scroll',
      corIcone: 'text-cyan-300',
      mensagemZap:
        'Olá Milla! Tenho interesse em *Quests & Acessos* no Tibia. Pode me passar os valores?',
    },
    {
      numero: '02',
      titulo: 'Service de Bosses',
      descricao: 'Serviços sob medida.',
      icone: 'fa-solid fa-dragon',
      corIcone: 'text-violet-300',
      mensagemZap:
        'Olá Milla! Quero consultar valores para *Service de Bosses* no Tibia.',
    },
    {
      numero: '03',
      titulo: 'Level Up',
      descricao: 'Evolução de personagem.',
      icone: 'fa-solid fa-bolt',
      corIcone: 'text-cyan-300',
      mensagemZap:
        'Olá Milla! Gostaria de um orçamento para *Level Up* no Tibia.',
    },
    {
      numero: '04',
      titulo: 'Bestiary&Charms',
      descricao: 'Bestiário e pontos de Charm.',
      icone: 'fa-solid fa-gem',
      corIcone: 'text-violet-300',
      mensagemZap:
        'Olá Milla! Quero cotar *Bestiary & Charms* para meu personagem.',
    },
  ],

  // Avaliações de Clientes (Bento Grid 2x3 — 6 cards editáveis)
  avaliacoes: [
    {
      nome: 'Emerson S.',
      personagem: 'Garotiin Magic',
      servidor: 'Jadebra',
      level: 590,
      estrelas: 5,
      descricao:
        'Dedicação e atenção aos detalhes. Serviço de Level Up concluído com excelência.',
    },
    {
      nome: 'Lucas S.',
      personagem: 'Aurelius EK',
      servidor: 'Kalibra',
      level: 640,
      estrelas: 5,
      descricao:
        'Service de Uplevel em PT4x super rápido, entregou até acima da XP combinada.',
    },
    {
      nome: 'Thiago R.',
      personagem: 'Sniper Kael',
      servidor: 'Bona',
      level: 890,
      estrelas: 5,
      descricao:
        'Atendimento direto com a Milla, sempre mandando atualização de cada etapa.',
    },
    {
      nome: 'Bruno C.',
      personagem: 'Valkor Blade',
      servidor: 'Gentebra',
      level: 520,
      estrelas: 5,
      descricao:
        'Fiz pacote de Bestiary e Charms. Char seguro, organizado e sem nenhuma dor de cabeça.',
    },
    {
      nome: 'Matheus F.',
      personagem: 'Riven Archer',
      servidor: 'Inabra',
      level: 715,
      estrelas: 5,
      descricao:
        'Bosses diários e Rotten Blood concluídos com maestria. Recomendo de olhos fechados!',
    },
    {
      nome: 'Diego A.',
      personagem: 'Kronos Shield',
      servidor: 'Descubra',
      level: 950,
      estrelas: 5,
      descricao:
        'Já é o terceiro serviço que contrato. Pontualidade impecável e confiança total.',

      sobre: {
      titulo: 'Sobre a Milla',
      subtitulo: 'Experiência, transparência e segurança no Tibia',
      bio: 'Atuo com services no Tibia focada em entregar cada etapa com organização, pontualidade e total respeito à sua conta. Todo o processo é combinado antes de começar, com atualizações constantes direto no WhatsApp.',
      destaques: [
      {
        icone: 'fa-solid fa-shield-halved',
        cor: 'text-cyan-300',
        titulo: 'Conta Protegida',
        texto: 'Procedimento seguro e combinado previamente em cada serviço.',
      },
      {
        icone: 'fa-solid fa-clock',
        cor: 'text-violet-300',
        titulo: 'Pontualidade',
        texto: 'Prazos claros e acompanhamento passo a passo até a entrega.',
      },
      {
        icone: 'fa-solid fa-comments',
        cor: 'text-cyan-300',
        titulo: 'Atendimento Direto',
        texto: 'Sem intermediários: você fala diretamente comigo no WhatsApp.',
      },
    ],
  },
    },
  ],
};
