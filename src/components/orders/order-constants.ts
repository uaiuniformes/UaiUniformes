

import type { ShirtColor } from "@/lib/types";


export const orderModels = [
  'Tradicional',
  'Regata',
  'Polo',
  'Portuguesa',
  'Padre',
  'Esporte',
  'Social',
  'Colete Simples',
  'Colete Dupla Face',
  'Colete Epidemiologia',
  'Jaqueta',
  'Bobojaco',
  'Guarda Pó',
  'Moletom',
  'Jaleco',
  'Pijama Cirurgico',
  'Calça',
  'Macacão',
  'Short',
  'Short Doll',
  'Bermuda',
  'Boné',
  'Touca',
  'Meião',
  'Avental Pescoço',
  'Avental 1/2 Cintura',
  'Avental (Padaria)',
  'Bandeira',
  'Garrafa',
  'Bolsinha',
  'Bolsa de Lona',
  'Mochila',
  'Chapéu Australiano'
];

export const materials = [
  'Malha PV',
  'Malha PP',
  'Piquet',
  'Piquet PV',
  'Dryfit',
  'JumpDry',
  'Polimida Lisa',
  'Poliamida CrepICe',
  'Poliamida Solution',
  'Brim leve',
  'Brim pesado',
  'Terbrim',
  'Tactel Wave',
  'Tactel Soft Plus',
  'Helanca',
  'Oxford',
  'Gabardine',
  'TwoWay',
  'Tricolinne Cannes',
  'Tricolinne Ibiza',
  'Profit',
  'ProfitMIX',
  'Dopfil',
  'Natural Fit',
  'CedroMix',
  'Chimpa',
  'Moletom',
  'Aspem Engomado',
  'Lona',
  'PVC',
  'Napa',
  'Touca',
];

export const shirtColors = [
  'Estampa',
  'Preto',
  'Branco',
  'OffWhite',
  'Palha',
  'Areia Claro',
  'Beje Escola',
  'Marrom',
  'Nevoa',
  'Boing',
  'Chumbo',
  'Mescla Claro',
  'Mescla Escuro',
  'Azul BB',
  'Azul Escola',
  'Azul Turquesa',
  'Azul Royal',
  'Azul Bic',
  'Azul Petroleo',
  'Azul Marinho',
  'Verde BB',
  'Verde cana',
  'Verde',
  'Verde musgo',
  'Uva (Roxo)',
  'Vermelho',
  'Vermelho Coral',
  'Vermelho Rubi',
  'Vermelho Vinho',
  'Amarelo',
  'Amarelo Ouro',
  'Laranja',
  'Laranja Florescente',
  'Rosa BB',
  'Rosa Chiclete',
  'Rosa Pink',
  'Prata',
];

export const cuffColors = [
  'Bainha',
  ...shirtColors
];

export const sleeveColors = [
    ...shirtColors
];

export const collarColors = [
    ...shirtColors
];


export const sleeveTypes = [
  'Curta',
  'Longa',
  'Regata',
  'Regata Nadador',
  'Raglan Curta',
  'Raglan Longa',
  'Raglan Oval Curta',
  'Raglan Oval Longa',
];

export const collarTypes = [
  'Redonda Overlok',
  'Redonda Ribanna',
  'Redonda de Malha',
  'V Transpassada',
  'V Ribanna',
  'V de Malha',
  'Portuguesa',
  'Polo',
  'Polo c/ Listra Dupla',
  'Esportiva',
  'Social',
  'Padre',
  'Capuz',
  'Cano Alto',
];

export const stampTypes = [
  'Lisa',
  'Silk',
  'Silk Digital (DTF)',
  'Policromia',
  'Bordado',
  'Sublimação Parcial A4',
  'Sublimação Parcial A3',
  'Sublimação Total Frente',
  'Sublimação Total Costas',
  'Sublimação Total Mangas',
  'Sublimação Camisa Total',
] as const;

export const additionalItems = [
  'Vivo (Gola)',
  'Vivo (Punho)',
  'Vivo (Bolso)',
  'Vivo (Cava da manga)',
  'Vivo (Recorte)',
  'Vies Adidas (Unica)',
  'Vies Adidas (Dupla)',
  'Vies Adidas (Tripla)',
  'Bolso',
  'Faixa Refletiva',
  'Ziper Ferro',
  'Ziper Jacaré',
  'Punho de Ribana',
  'Punho de Poliester',
  'Punho de Poliester c/ Listra Dupla',
  'Punho de Algodão',
  'Punho de Algodão c/ Listra Dupla',
  'Punho de Malha',
  'Punho Bainha Dupla',
  'Punho Material da Camisa',
  'Recortes (Verificar Layouts)',
  'Bandeira Pregada',
  'Bandeira Bordada',
  'Bandeira DTF',
];

export const paymentMethods = [
    'Dinheiro',
    'Transferencia/ Pix',
    'Cartão',
    'Boleto',
    'Cheque',
] as const;

export const paymentConditions = [
    '3%', '5%', '50%', 'Total',
    '1x', '2x', '3x', '4x', '5x',
    'A Vista',
    '20 dias',
    '30 dias',
    '7, 30 e 60 dias',
    'Sem Entrada',
    'Permuta',
    'Nota',
    'Outro'
];


export const internalResponsibles = [
  'Eduardo',
  'Luciano',
  'Poliana',
  'Gabriel',
  'Larilson',
  'Vendedor',
  'Terceiros',
];


export const orderSituations = [
  'Corte',
  'Reposição de Corte',
  'Estampagem',
  'Separação',
  'Costura',
  'Arremate',
  'Finalizado',
  'Correção',
  'Cancelado',
  'Entregue',
] as const;

export const cutters = [
  'Magda',
  'Cortador Terceirizado',
  'A Laser',
  'Ilma Maria',
];

export const seamstresses = [
    'Fabrica',
    'Elisangela',
    'Flavia',
    'Silvia',
    'Magda',
    'Neyrevone',
    'Rosangela',
    'Ana',
    'Dona Cida',
    'Dona Preta',
    'Terceiros',
];

export const artSeparationStatus = [
    'À Separar',
    'Parcial',
    'Pronta',
] as const;

export const productionTypes = [
    'Eventos/Prioridade',
    'Lisa',
    'Bordados',
    'Sublimações',
    'Silk',
    'Outros',
] as const;

export const separationChecklists: Record<string, string[]> = {
  'Tradicional': ['Separar Frente', 'Separar Costas', 'Separar Mangas', 'Separar Gola'],
  'Regata': ['Separar Frente', 'Separar Costas', 'Separar Debrum (Gola)', 'Separar Debrum (Cava)'],
  'Polo': ['Separar Frente', 'Separar Costas', 'Separar Mangas', 'Separar Gola Polo', 'Separar Carcela'],
  'Portuguesa': ['Separar Frente', 'Separar Costas', 'Separar Mangas', 'Separar Gola Portuguesa', 'Separar Carcela'],
  'Padre': ['Separar Frente', 'Separar Costas', 'Separar Mangas', 'Separar Gola Padre'],
  'Esporte': ['Separar Frente', 'Separar Costas', 'Separar Mangas', 'Separar Gola Esportiva'],
  'Social': ['Separar Frente', 'Separar Costas', 'Separar Mangas', 'Separar Gola Social', 'Separar Carcela', 'Separar Punho'],
  'Colete Simples': ['Separar Frente', 'Separar Costas', 'Separar Gola', 'Separar Ziper/Botões'],
  'Colete Dupla Face': ['Separar Frente (2x)', 'Separar Costas (2x)', 'Separar Gola (2x)', 'Separar Ziper/Botões'],
  'Colete Epidemiologia': ['Separar Frente', 'Separar Costas', 'Separar Gola', 'Separar Ziper/Botões', 'Separar Bolsos'],
  'Jaqueta': ['Separar Frente', 'Separar Costas', 'Separar Mangas', 'Separar Gola', 'Separar Punho', 'Separar Cós', 'Separar Ziper'],
  'Bobojaco': ['Separar Frente', 'Separar Costas', 'Separar Mangas', 'Separar Gola', 'Separar Punho', 'Separar Cós', 'Separar Ziper', 'Separar Forro'],
  'Guarda Pó': ['Separar Frente', 'Separar Costas', 'Separar Mangas', 'Separar Gola', 'Separar Cinto'],
  'Moletom': ['Separar Frente', 'Separar Costas', 'Separar Mangas', 'Separar Capuz', 'Separar Punho', 'Separar Cós', 'Separar Bolso Canguru'],
  'Jaleco': ['Separar Frente', 'Separar Costas', 'Separar Mangas', 'Separar Gola', 'Separar Punho', 'Separar Cinto'],
  'Pijama Cirurgico': ['Separar Blusa', 'Separar Calça', 'Separar Gola', 'Separar Elástico'],
  'Calça': ['Separar Frente', 'Separar Traseiro', 'Separar Cós', 'Separar Elástico/Ziper'],
  'Macacão': ['Separar Corpo', 'Separar Mangas', 'Separar Gola', 'Separar Ziper'],
  'Short': ['Separar Frente', 'Separar Traseiro', 'Separar Cós', 'Separar Elástico'],
  'Short Doll': ['Separar Blusa', 'Separar Short', 'Separar Elástico'],
  'Bermuda': ['Separar Frente', 'Separar Traseiro', 'Separar Cós', 'Separar Elástico/Ziper'],
};

export const modelsWithoutChecklist = [
  'Boné',
  'Touca',
  'Meião',
  'Avental Pescoço',
  'Avental 1/2 Cintura',
  'Avental (Padaria)',
  'Bandeira',
  'Garrafa',
  'Bolsinha',
  'Bolsa de Lona',
  'Mochila',
  'Chapéu Australiano',
];


export const deliveryMethods = [
    'Via Correio',
    'Motoboy',
    'Entrega da Loja',
    'Retirado em Loja',
] as const;
