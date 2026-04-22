import FotoGuardiaoGateway from '../assets/bosses/guardiao-gateway.jpg';
import FotoLordeCSS from '../assets/bosses/lorde-css.jpg';
import FotoMestrePonteiros from '../assets/bosses/mestre-ponteiros.jpg';

export const BOSSES = [
  {
    id: 'prof-back',
    name: 'Mestre dos Ponteiros',
    role: 'Back-end Specialist',
    max_hp: 5000,
    current_hp: 5000,
    image: FotoMestrePonteiros,
    status_msg: 'Alocando memória no Heap...',
    weakness: 'devops'
  },
  {
    id: 'prof-front',
    name: 'Lorde do CSS', 
    role: 'Front-end Architect',
    max_hp: 3500,
    current_hp: 3500,
    image: FotoLordeCSS,
    status_msg: 'Ajustando Z-Index da Realidade...',
    weakness: 'front-end'
  },
  {
    id: 'prof-infra',
    name: 'Guardião do Gateway',
    role: 'DevOps & Cloud Master',
    max_hp: 7000,
    current_hp: 7000,
    image: FotoGuardiaoGateway,
    status_msg: 'Derrubando a Pipeline de Produção...',
    weakness: 'devops'
  }
];

export const INCIDENTS_POOL = [
  {
    type: 'RAPID_CLICK',
    title: '🔥 MEMORY LEAK!',
    description: 'O servidor está fritando! Clique 15 vezes para liberar o Garbage Collector!',
    target_class: 'back-end',
    solution: '15'
  },
  {
    type: 'SEQUENCE',
    title: '🔑 SSH BREACH',
    description: 'Tentativa de invasão! Digite a sequência de firewall: 1-3-2',
    target_class: 'security',
    solution: '1-3-2'
  },
  {
    type: 'PUZZLE',
    title: '🐛 UI BUG',
    description: 'O layout quebrou no Safari! Digite FLEX para centralizar a div.',
    target_class: 'front-end',
    solution: 'FLEX'
  },
  {
    type: 'SEQUENCE',
    title: '⚡ LATENCY SPIKE',
    description: 'O Cloudflare caiu! Reinicie os nós: 2-2-1',
    target_class: 'devops',
    solution: '2-2-1'
  }
];

export const RANKING_MOCK = [
  { nickname: 'Paulo_Dev', class: 'back-end', total_damage: 2500, incidents_solved: 4 },
  { nickname: 'Rafaele_QA', class: 'qa', total_damage: 1200, incidents_solved: 6 },
  { nickname: 'Douglas_Ops', class: 'devops', total_damage: 1800, incidents_solved: 3 },
  { nickname: 'Richard_Sec', class: 'security', total_damage: 1500, incidents_solved: 5 },
  { nickname: 'Vanessa_SI', class: 'devops', total_damage: 900, incidents_solved: 2 },
];