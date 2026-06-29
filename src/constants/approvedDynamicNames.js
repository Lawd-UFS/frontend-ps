export const APPROVED_DYNAMIC_NAMES = [
  'Andrews Gabriel Santos Silva',
  'Ane Letícia Ferreira Silva',
  'Anna Julia Matos Lins Santos',
  'Anny Gama Souza',
  'Arthur Nicolas Silva Lima',
  'Brennda Caitano dos Santos',
  'Carlos Daniel Rezende Euzebio',
  'Cauã Franco Ferreira',
  'Cauan Santos Silva',
  'Dean Vinícius Palmeira de Meneses',
  'Eduardo Curcino Monteiro Filho',
  'Ellen Karolliny dos Santos',
  'Ervany Letícia Dórea Carvalhal',
  'Felipe Carvalho',
  'Flávia Silva Gomes',
  'Gabriel Angel dos Santos Sousa',
  'Gabriel Batista Barbosa',
  'Gabriel Santos de Souza',
  'Gustavo Tínel',
  'Gyannine Candeias Gomes dos Santos',
  'Heitor Lima Rolemberg',
  'Isabele de Almeida Nunes',
  'Isabelle Isidório Cêspedes Paes',
  'João Gabriel Carvalho Leal',
  'Júlio Gabriel Alves Monteiro',
  'Larissa Batista dos Santos',
  'Leonardo Maia Correia',
  'Leonardo Quintela Correia Lima',
  'Letícia Stefany Oliveira Santos',
  'Luiz Fernando Donizete Bispo',
  'Maria Fernanda de Jesus Santos',
  'Maria Luíse das Virgens Menezes',
  'Marlon Yezid Marino Ortiz',
  'Mateus Mota Bomfim',
  'Mayze dos Anjos Nunes',
  'Mirela Souza de Jesus',
  'Natália de Araújo Andrade',
  'Pedro Caldas de Souza Lucas Marques',
  'Pedro Guilherme de Farias Souza Almeida',
  'Pedro Henrique Moura Andrade',
  'Pedro Henrique Ribeiro Siqueira',
  'Pedro Paulo Oliveira Barros Souza',
  'Rhuan Pablo Silva Santos',
  'Talita Barbosa da Silva',
  'Tariq Ráriton Alves Santos',
  'Vinícius de Jesus Carmo',
  'Vitor dos Santos Lima',
  'Wemerson da Silva Soares',
  'Yan Rocha de Sá',
  'Ylana Clara Nascimento Lino',
];

export const normalizeName = (name) =>
  (name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

const ORDER_LOOKUP = new Map(
  APPROVED_DYNAMIC_NAMES.map((name, index) => [normalizeName(name), index]),
);

export const getApprovedDynamicOrder = (name) => {
  const key = normalizeName(name);
  return ORDER_LOOKUP.has(key) ? ORDER_LOOKUP.get(key) : -1;
};

export const isApprovedForDynamic = (name) => getApprovedDynamicOrder(name) !== -1;
