export type Lang = 'en' | 'pt'

const strings = {
  en: {
    // IntentionScreen
    title: 'Quantum I Ching',
    subtitle: 'A quantum oracle',
    intentionPlaceholder: 'Hold your question in mind',
    beginButton: 'Begin',

    // CastingScreen
    lineNames: ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'],
    lineLabel: (name: string) => `${name} line`,
    hexagramComplete: 'Hexagram complete',
    castLine: (n: number) => `Cast line ${n}`,
    revealReading: 'Reveal reading',
    consultingQuantum: 'Consulting the quantum...',
    lineValues: {
      6: 'old yin ──×──',
      7: 'young yang ────',
      8: 'young yin ── ──',
      9: 'old yang ────○',
    } as Record<number, string>,

    // ReadingScreen
    hexagramLabel: (n: number) => `Hexagram ${n}`,
    movingLines: 'Moving lines',
    line: (n: number) => `Line ${n}`,
    oracleSpeaking: 'The oracle is speaking...',
    theJudgment: 'The Judgment',
    theImage: 'The Image',
    castAgain: 'Cast again',
    oracleSilent: 'The oracle fell silent. Please try again.',

    // Wilhelm source note
    wilhelmNote: 'Wilhelm translation — original English',

    // Info overlay
    aboutTitle: 'About this oracle',
    aboutP1: 'Quantum I Ching uses the traditional three-coin method of divination, but replaces physical coins with quantum randomness sourced from photon detection hardware at the LfD Laboratory in Germany (ID Quantique). Each coin flip is derived from a single bit of a genuine quantum random number — not a mathematical simulation.',
    aboutP2: 'Three coins are cast per line, six lines build the hexagram from the bottom up. A coin summing to 6 or 9 becomes a moving line — the seed of transformation — and generates a second, changing hexagram. The interpretation draws on the Richard Wilhelm translation of the I Ching (1950), the canonical Western edition.',
    coinMethodTitle: 'The coin method',
    coinMethod: [
      ['6 — old yin ──×──', 'Three tails. A moving line — yin transforming into yang.'],
      ['7 — young yang ────', 'Two tails, one heads. Stable yang line.'],
      ['8 — young yin ── ──', 'One tails, two heads. Stable yin line.'],
      ['9 — old yang ────○', 'Three heads. A moving line — yang transforming into yin.'],
    ] as [string, string][],
    sourcesTitle: 'Sources',
    sourceLfD: 'LfD Laboratory — Quantum Random Number Generation (ID Quantique hardware)',
    sourceWilhelm: 'Richard Wilhelm — I Ching or Book of Changes (1950)',
  },

  pt: {
    // IntentionScreen
    title: 'I Ching Quântico',
    subtitle: 'Um oráculo quântico',
    intentionPlaceholder: 'Mantenha sua pergunta em mente',
    beginButton: 'Começar',

    // CastingScreen
    lineNames: ['Primeira', 'Segunda', 'Terceira', 'Quarta', 'Quinta', 'Sexta'],
    lineLabel: (name: string) => `${name} linha`,
    hexagramComplete: 'Hexagrama completo',
    castLine: (n: number) => `Lançar linha ${n}`,
    revealReading: 'Revelar leitura',
    consultingQuantum: 'Consultando o quântico...',
    lineValues: {
      6: 'yin velho ──×──',
      7: 'yang jovem ────',
      8: 'yin jovem ── ──',
      9: 'yang velho ────○',
    } as Record<number, string>,

    // ReadingScreen
    hexagramLabel: (n: number) => `Hexagrama ${n}`,
    movingLines: 'Linhas em movimento',
    line: (n: number) => `Linha ${n}`,
    oracleSpeaking: 'O oráculo está falando...',
    theJudgment: 'O Julgamento',
    theImage: 'A Imagem',
    castAgain: 'Lançar novamente',
    oracleSilent: 'O oráculo silenciou. Por favor, tente novamente.',

    // Wilhelm source note
    wilhelmNote: 'Tradução de Wilhelm — versão em português',

    // Info overlay
    aboutTitle: 'Sobre este oráculo',
    aboutP1: 'O I Ching Quântico utiliza o método tradicional dos três trigramas, mas substitui as moedas físicas por aleatoriedade quântica proveniente de hardware de detecção de fótons no Laboratório LfD na Alemanha (ID Quantique). Cada lançamento de moeda é derivado de um único bit de um número quântico genuinamente aleatório — não uma simulação matemática.',
    aboutP2: 'Três moedas são lançadas por linha, seis linhas constroem o hexagrama de baixo para cima. Uma soma de 6 ou 9 torna-se uma linha em movimento — a semente da transformação — e gera um segundo hexagrama em mudança. A interpretação baseia-se na tradução de Richard Wilhelm do I Ching (1950), a edição ocidental canônica.',
    coinMethodTitle: 'O método das moedas',
    coinMethod: [
      ['6 — yin velho ──×──', 'Três coroas. Linha em movimento — yin transformando-se em yang.'],
      ['7 — yang jovem ────', 'Duas coroas, uma cara. Linha yang estável.'],
      ['8 — yin jovem ── ──', 'Uma coroa, duas caras. Linha yin estável.'],
      ['9 — yang velho ────○', 'Três caras. Linha em movimento — yang transformando-se em yin.'],
    ] as [string, string][],
    sourcesTitle: 'Fontes',
    sourceLfD: 'Laboratório LfD — Geração de Números Aleatórios Quânticos (hardware ID Quantique)',
    sourceWilhelm: 'Richard Wilhelm — I Ching ou o Livro das Mutações (1950)',
  },
}

export default strings

export function detectLang(): Lang {
  const lang = navigator.language || ''
  return lang.startsWith('pt') ? 'pt' : 'en'
}

// Portuguese hexagram names (canonical translations)
export const ptHexagramNames: Record<number, string> = {
  1: 'O Criativo',
  2: 'O Receptivo',
  3: 'Dificuldade Inicial',
  4: 'Imaturidade Juvenil',
  5: 'A Espera',
  6: 'O Conflito',
  7: 'O Exército',
  8: 'A União',
  9: 'O Poder Domesticador do Pequeno',
  10: 'O Caminhar',
  11: 'A Paz',
  12: 'O Estancamento',
  13: 'Comunhão com os Homens',
  14: 'A Possessão em Grande Medida',
  15: 'A Modéstia',
  16: 'O Entusiasmo',
  17: 'O Seguimento',
  18: 'O Trabalho sobre o que Foi Corrompido',
  19: 'A Aproximação',
  20: 'A Contemplação',
  21: 'Morder e Mastigar',
  22: 'A Graça',
  23: 'A Desintegração',
  24: 'O Retorno',
  25: 'A Inocência',
  26: 'O Poder Domesticador do Grande',
  27: 'Os Cantos da Boca',
  28: 'A Preponderância do Grande',
  29: 'O Abismal',
  30: 'O Aderente',
  31: 'A Influência',
  32: 'A Duração',
  33: 'A Retirada',
  34: 'O Poder do Grande',
  35: 'O Progresso',
  36: 'O Escurecimento da Luz',
  37: 'A Família',
  38: 'A Oposição',
  39: 'O Obstáculo',
  40: 'A Libertação',
  41: 'A Diminuição',
  42: 'O Aumento',
  43: 'A Determinação',
  44: 'O Vir ao Encontro',
  45: 'A Reunião',
  46: 'O Impulso para o Alto',
  47: 'A Opressão',
  48: 'O Poço',
  49: 'A Revolução',
  50: 'O Caldeirão',
  51: 'O Trovão',
  52: 'O Aquietamento',
  53: 'O Desenvolvimento',
  54: 'A Jovem que se Casa',
  55: 'A Abundância',
  56: 'O Viajante',
  57: 'O Suave',
  58: 'A Alegria',
  59: 'A Dispersão',
  60: 'A Limitação',
  61: 'A Verdade Interior',
  62: 'A Preponderância do Pequeno',
  63: 'Depois da Consumação',
  64: 'Antes da Consumação',
}

export function hexagramName(hex: number, lang: Lang): string {
  if (lang === 'pt') return ptHexagramNames[hex] ?? ''
  return ''
}
