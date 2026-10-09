
// Feriados Nacionais Fixos do Brasil
export const brazilianHolidays = [
    // Ano Novo
    { date: new Date(new Date().getFullYear(), 0, 1), name: "Confraternização Universal" },
    // Tiradentes
    { date: new Date(new Date().getFullYear(), 3, 21), name: "Tiradentes" },
    // Dia do Trabalho
    { date: new Date(new Date().getFullYear(), 4, 1), name: "Dia do Trabalho" },
    // Independência do Brasil
    { date: new Date(new Date().getFullYear(), 8, 7), name: "Independência do Brasil" },
    // Nossa Senhora Aparecida
    { date: new Date(new Date().getFullYear(), 9, 12), name: "Nossa Senhora Aparecida" },
    // Finados
    { date: new Date(new Date().getFullYear(), 10, 2), name: "Finados" },
    // Proclamação da República
    { date: new Date(new Date().getFullYear(), 10, 15), name: "Proclamação da República" },
    // Natal
    { date: new Date(new Date().getFullYear(), 11, 25), name: "Natal" }
];

// Feriados móveis como Carnaval e Corpus Christi são mais complexos de calcular
// e não foram adicionados para simplicidade.
