# Manual do Sistema de Gerenciamento de Produção

## 1. Visão Geral

Este documento serve como um guia completo para o Sistema de Gerenciamento de Produção. Ele foi projetado para otimizar o acompanhamento de pedidos de confecção, desde a criação até a entrega, proporcionando uma visão clara e em tempo real de cada etapa do processo.

O sistema foi desenvolvido para ser intuitivo, centralizando informações e facilitando a tomada de decisões para agilizar a produção e melhorar a comunicação com o cliente.

---

## 2. Manual do Usuário

### 2.1. Login

- **Acesso**: A primeira tela é a de login. Insira seu email (`Admin@Uai.com`) e senha (`@Uai2026`) para acessar o sistema.
- **Recuperação de Senha**: Caso esqueça sua senha, utilize o link "Esqueceu a senha?".

### 2.2. Dashboard Principal

O Dashboard é a sua central de comando. Ao entrar no sistema, você visualiza:

- **Ações Rápidas**:
    - **Novo Cliente**: Atalho para cadastrar um novo cliente.
    - **Novo Pedido**: Atalho para a tela de criação de um novo pedido.

- **Cartões de Estatísticas (Kanban)**:
    - Cada cartão representa uma etapa da produção (`Produção Geral`, `Corte`, `Estampagem`, `Separação`, etc.).
    - O número em cada cartão indica a quantidade de pedidos atualmente naquela etapa.
    - Clicar em um cartão leva você diretamente para a página daquela etapa, com a lista de pedidos correspondente.

- **Gráficos de Análise**:
    - **Produção por Responsável**: Um gráfico de barras que mostra a quantidade de pedidos ativos atribuídos a cada funcionário da equipe interna.
    - **Desempenho de Corte**: Um gráfico de pizza que mostra a distribuição de pedidos (histórico completo) entre as diferentes cortadeiras.
    - **Distribuição por Etapa**: Um gráfico de pizza que mostra visualmente quantos pedidos estão em cada etapa do processo produtivo.

- **Tabela de Pedidos Recentes**:
    - Lista os pedidos criados na semana corrente para acesso rápido.
    - Ao clicar no ícone de olho (`Visualizar`), um **pop-up** com os detalhes completos do pedido é exibido, sem a necessidade de sair da tela do dashboard.

### 2.3. Gerenciamento de Pedidos

#### 2.3.1. Tela de Produção Geral (`/dashboard/orders`)

- **Visão**: Esta página lista **todos** os pedidos que estão em etapas de produção ativas (ou seja, que não foram finalizados, entregues ou cancelados).
- **Busca**: Utilize o campo de busca para encontrar pedidos por ID, nome do cliente, responsável, modelo, etapa, etc.
- **Código de Cores das Linhas**:
    - **Azul**: Pedido marcado como **prioridade**.
    - **Vermelho (Forte)**: Pedido com mais de 45 dias em produção (atraso crítico).
    - **Vermelho (Claro)**: Pedido com 30 a 45 dias em produção (atraso).
    - **Amarelo**: Pedido com 15 a 30 dias em produção (atenção).
- **Ações na Linha do Pedido**:
    - **Visualizar (`Ícone de Olho`)**: Abre um **pop-up** com a ficha completa do pedido, incluindo botões para "Imprimir" e "Editar".
    - **Menu (`...`)**:
        - **Editar**: Abre o formulário do pedido no modo de edição.
        - **Imprimir**: Abre a ficha do pedido em uma nova aba, pronta para impressão.
        - **Marcar/Desmarcar Prioridade**: Alterna o status de prioridade do pedido.
        - **Cancelar Pedido**: Move o pedido para a lista de "Cancelados".
        - **Excluir Pedido**: Move o pedido para a lixeira de "Deletados".

#### 2.3.2. Telas de Etapas Específicas (Corte, Estampagem, etc.)

- **Funcionamento**: São similares à tela de "Produção Geral", mas filtram os pedidos para mostrar apenas os que estão na etapa correspondente. As colunas são padronizadas em todas as telas de etapa: `Pedido`, `Cliente`, `Responsável`, `Estampa`, `Data Entrega`, `Dias Prod.`, `Dias na Etapa`, `Layout` e `Ações`.
- **Visualização Rápida**: O botão de visualizar (`Ícone de Olho`) abre um **pop-up** com os detalhes enxutos do pedido, focado nas informações de produção e com a data de entrega destacada na seção "Prazo".
- **Ações Específicas**:
    - **Avançar Etapa (`Ícone de Check`)**: A principal ação nessas telas. Clicar neste botão move o pedido para a próxima etapa do fluxo de produção.
    - **Checklists (Separação e Arremate)**: Em certas etapas, ao clicar em "Avançar", um diálogo de checklist aparecerá. É necessário marcar os itens ou fornecer uma justificativa para prosseguir.
    - **Confirmação de Entrega (Finalizado)**: Na etapa "Finalizado", o botão de avançar abre um diálogo para confirmar os detalhes da entrega, incluindo método, nome do retirante e anexo de comprovantes de pagamento pendente.
    - **Página de Corte**:
        - **Seleção de Cortadeira**: Exige a seleção de uma cortadeira para visualizar os pedidos.
        - **Aba de Reposição**: Contém uma fila dedicada para peças que precisam ser refeitas, garantindo que o time de corte saiba exatamente o que precisa ser reposto.
        - **Aba de Lotes de Facção**: Permite agrupar múltiplos pedidos em um lote para serem enviados a uma facção externa. Você pode criar um lote, selecionar os pedidos manualmente e visualizar os detalhes dos pedidos contidos em cada lote.
    - **Página de Estampagem**:
        - **Registrar Perda**: Permite que o operador registre uma perda de material (ex: peça manchada), movendo o pedido automaticamente para a fila de "Reposição de Corte".

#### 2.3.3. Criar e Editar Pedidos (`/dashboard/orders/new`)

- **Formulário Completo**: A tela é dividida em seções para facilitar o preenchimento:
    - **Informações do Cliente**: Selecione a empresa e o responsável. Os dados de contato são preenchidos automaticamente.
    - **Descrição do Produto**: Detalhes como modelo, material, cor, tipo de estampa, etc.
    - **Grade de Tamanhos**: Insira a quantidade para cada tamanho. O total de peças é calculado automaticamente.
    - **Layout**: Anexe imagens de referência para a produção.
    - **Financeiro e Prazos**: Defina as datas, o valor unitário e as condições de pagamento. O valor total é calculado automaticamente.
    - **Controle Interno**: Atribua a situação inicial, o responsável interno e a cortadeira.
- **Salvar Pedido**: Ao clicar em "Salvar", uma caixa de diálogo pedirá a confirmação para evitar salvamentos acidentais.
- **Edição**: Ao editar, os mesmos campos são apresentados, pré-preenchidos com os dados do pedido.
- **Confirmação de Saída**: Se você tentar sair da página de edição (clicando em "Voltar" ou "Início") com alterações não salvas, um alerta pedirá sua confirmação, prevenindo a perda de dados.

### 2.4. Gerenciamento de Clientes (`/dashboard/customers`)

- **Listagem**: Visualize todos os clientes cadastrados.
- **Busca**: Pesquise clientes por nome, empresa, cidade ou documento.
- **Ações**:
    - **Criar Cliente**: Leva ao formulário de cadastro de novo cliente.
    - **Ver Ficha**: Abre a página de detalhes completos do cliente.
    - **Histórico de Pedidos (Pop-up)**: Abre um pop-up que lista todos os pedidos do cliente. Dentro deste pop-up, você pode clicar para visualizar os detalhes de cada pedido (também em um pop-up), com ações contextuais ("Editar" para pedidos ativos, "Repetir Pedido" para entregues).
    - **Editar**: Abre o formulário para alterar os dados do cliente.
    - **Imprimir**: Imprime a ficha do cliente.
    - **Excluir**: Remove o cliente do sistema após uma confirmação. Use com cuidado.

### 2.5. Perfil do Usuário (`/dashboard/profile`)

- **Gerenciamento da Conta**: Permite visualizar e editar informações pessoais como nome, e-mail e foto do perfil.
- **Segurança**: Inclui um formulário para alteração de senha.
- **Preferências**: Opção para gerenciar notificações do sistema.
- **Histórico de Atividades**: Registra e exibe as ações mais importantes realizadas pelo usuário no sistema, como logins, alterações de etapa de pedidos e criações de novos registros, fornecendo um log para auditoria.

### 2.6. Controle de Estoque (`/dashboard/inventory`)

- **Visão Geral**: Gerencie o estoque de matéria-prima (malhas, tecidos, etc.).
- **Categorias**: O estoque é organizado em abas por categoria (Malha PV, Piquet, Dryfit, etc.).
- **Tabela de Itens**: Cada aba contém uma tabela com os itens daquela categoria, mostrando:
    - Material, Cor, Fornecedor, Quantidade Atual (Kg) e Data da Última Atualização.
- **Ações**:
    - **Registrar Entrada/Saída**: Botões em cada linha para abrir um pop-up e registrar a entrada ou saída de material, atualizando a quantidade em tempo real.
    - **Ver Histórico**: Visualiza o histórico de movimentações de um item específico (a implementar).
    - **Novo Material**: Botão para cadastrar um novo tipo de material no sistema.

### 2.7. Relatórios

O sistema oferece uma seção de relatórios acessível pelo menu do usuário no canto superior direito, projetada para fornecer insights valiosos sobre a operação.

-   **Relatório de Vendas**:
    -   **Funcionalidade**: Consolida as vendas por vendedor (responsável interno) para um determinado mês e ano.
    -   **Visão**: Apresenta um resumo com o total de peças e o valor vendido por cada vendedor. Você pode filtrar para ver os detalhes de um vendedor específico ou de todos. O resumo se adapta à sua seleção.
    -   **Uso**: Ideal para calcular comissões de vendas e analisar o desempenho da equipe comercial.

-   **Relatório de Corte**:
    -   **Funcionalidade**: Agrupa a produção de peças por cortadeira para o período selecionado.
    -   **Visão**: Mostra um resumo de comissão com o total de peças cortadas e o valor total a pagar, que é calculado com base no valor por peça que você pode inserir. A tabela de detalhes mostra os pedidos da cortadeira selecionada no filtro.
    -   **Uso**: Essencial para o fechamento e pagamento das cortadeiras terceirizadas ou internas.

-   **Relatório de Costura**:
    -   **Funcionalidade**: Similar ao de corte, mas focado nas costureiras. Agrupa a produção por costureira para o período.
    -   **Visão**: Apresenta um resumo de comissão por modelo de peça. Para cada costureira, o relatório agrupa as peças por modelo, permitindo que você insira o valor de costura específico para cada tipo de produto (ex: Camiseta vs. Jaqueta) e calcula a comissão total.
    -   **Uso**: Ferramenta precisa para calcular o pagamento de costureiras, levando em conta a complexidade de cada peça.

-   **Relatório de Caixa**:
    -   **Funcionalidade**: Oferece uma visão consolidada das movimentações financeiras (entradas e saídas) para o mês e ano selecionados.
    -   **Visão**: Inclui abas para visualizar o relatório geral (todas as transações), um detalhamento apenas de entradas e outro apenas de saídas. Também apresenta um card específico para o resumo de vendas de uniformes escolares.
    -   **Uso**: Facilita a análise financeira, o fechamento do mês e a conferência do fluxo de caixa.

### 2.8. Fluxo de Caixa Diário (`/dashboard/financial/cash-flow`)
- **Visão Diária**: Permite registrar e visualizar todas as entradas e saídas de um dia específico.
- **Adição Rápida**: Botões de acesso rápido para adicionar uma nova **Entrada** ou **Saída**.
- **Extração com IA**:
    - **Por Voz**: Clique no ícone de microfone e fale os detalhes da transação (ex: "Entrada de 50 reais da venda de uniforme para a Maria"). A IA preencherá os campos do formulário para você.
    - **Por Imagem**: Clique no ícone da câmera para tirar uma foto de um comprovante ou anexe um arquivo (imagem/PDF). A IA analisará o documento e preencherá os campos de descrição, valor e forma de pagamento.
- **Fechamento de Caixa**: Ao final do dia, informe o valor total em dinheiro no campo "Dinheiro" para que o sistema calcule a diferença (sobra ou falta) e mostre o resultado.

### 2.9. Configurações (`/dashboard/settings`)
- **Central de Listas**: Esta página permite gerenciar todas as listas de opções usadas nos formulários do sistema (ex: Modelos de Peça, Materiais, Cores, Tipos de Estampa, etc.).
- **Adicionar, Editar e Excluir**: Você pode adicionar novos itens a qualquer lista, editar os existentes ou removê-los (com uma caixa de diálogo para confirmação).
- **Reordenação (Arrastar e Soltar)**:
    - **Categorias**: Você pode arrastar e soltar as categorias na barra lateral para mudar a ordem em que aparecem.
    - **Itens**: Dentro de cada categoria, você pode arrastar e soltar os itens para definir a ordem de preferência em que eles aparecerão nos menus de seleção (`Select`) ao criar ou editar um pedido.

---

## 3. Guia Técnico e de Desenvolvimento

### 3.1. Tecnologias Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (com App Router) - Um framework React para produção, que oferece renderização no servidor (SSR), geração de sites estáticos (SSG) e uma ótima experiência de desenvolvimento.
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) - Adiciona tipagem estática ao JavaScript, o que ajuda a prevenir bugs e melhora a organização do código.
- **Estilização**:
    - [Tailwind CSS](https://tailwindcss.com/) - Um framework CSS "utility-first" que permite criar designs complexos diretamente no HTML.
    - [ShadCN/UI](https://ui.shadcn.com/) - Uma coleção de componentes de UI reutilizáveis, construídos sobre Tailwind CSS e Radix UI, que servem como base para a interface do sistema.
- **Componentes**:
    - [React](https://react.dev/) - A biblioteca fundamental para a construção da interface de usuário.
    - [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd) - Para a funcionalidade de arrastar e soltar.
- **Ícones**: [Lucide React](https://lucide.dev/) - Uma biblioteca de ícones simples e consistentes.
- **IA Generativa**: [Genkit (Firebase)](https://firebase.google.com/docs/genkit) - Utilizado para a funcionalidade de geração de mensagens de notificação e extração de dados de comprovantes.

### 3.2. Estrutura de Pastas do Projeto

```
/src
├── app/                  # Rotas da aplicação (App Router)
│   ├── dashboard/        # Rotas protegidas do dashboard
│   │   ├── (stages)/     # Pastas para cada etapa da produção (corte, costura, etc.)
│   │   ├── customers/    # Rotas para CRUD de clientes
│   │   ├── orders/       # Rotas para CRUD de pedidos
│   │   ├── profile/      # Rota para o perfil do usuário
│   │   ├── reports/      # Rotas para os relatórios
│   │   ├── inventory/    # Rota para o controle de estoque
│   │   ├── financial/    # Rota para o fluxo de caixa
│   │   └── page.tsx      # Página principal do dashboard
│   ├── layout.tsx        # Layout principal da aplicação
│   └── page.tsx          # Página de login
│
├── components/           # Componentes React reutilizáveis
│   ├── customers/        # Componentes específicos para clientes (ex: customer-form)
│   ├── dashboard/        # Componentes do dashboard (ex: gráficos, stats-card)
│   ├── orders/           # Componentes específicos para pedidos (ex: checklists, order-details-dialog)
│   └── ui/               # Componentes base da UI (Button, Card, etc. - gerados pelo ShadCN)
│
├── lib/                  # Funções utilitárias, tipos e dados mockados
│   ├── mock-data.ts      # Dados de teste para simular um banco de dados
│   ├── types.ts          # Definições de tipos TypeScript para o projeto
│   └── utils.ts          # Funções utilitárias (ex: cn para classes Tailwind)
│
├── ai/                   # Lógica relacionada à Inteligência Artificial com Genkit
│   └── flows/            # Definição dos fluxos de IA
│
└── public/               # Arquivos estáticos (imagens, fontes)
```

### 3.3. Lógica de Negócios e Destaques

- **Simulação de Banco de Dados**: O arquivo `src/lib/mock-data.ts` atua como um banco de dados falso. Toda a "lógica de negócios" (filtrar pedidos, calcular totais dos gráficos) é feita em tempo de execução, manipulando os arrays de objetos neste arquivo.
- **Estado da UI**: O estado é gerenciado localmente em cada componente usando os hooks do React (`useState`, `useEffect`, `useMemo`). Isso mantém os componentes independentes e fáceis de entender.
- **Componentização**: A interface é dividida em pequenos componentes. Por exemplo, a visualização de detalhes de um pedido é centralizada no componente reutilizável `OrderDetailsDialog`, que é usado em várias partes do sistema (Dashboard, tela de Clientes, telas de Etapas).
- **Tipagem Forte**: O uso de TypeScript (`src/lib/types.ts`) garante que os dados passados entre os componentes (como um objeto `Order`) tenham a estrutura esperada, evitando erros comuns em tempo de execução.
- **Estilização Condicional**: A lógica para colorir as linhas da tabela de pedidos com base no tempo de produção ou prioridade está contida em cada componente de página de etapa, demonstrando como aplicar estilos dinamicamente com base nos dados.
- **Rotas Dinâmicas**: O App Router do Next.js é usado para criar páginas dinâmicas, como `/dashboard/orders/[id]`, que exibe os detalhes de um pedido específico com base no ID passado na URL.
