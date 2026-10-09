# Manual do Sistema de Gerenciamento de Produção

## 1. Visão Geral

Este documento serve como um guia completo para o Sistema de Gerenciamento de Produção da Lacort. Ele foi projetado para otimizar o acompanhamento de pedidos de confecção, desde a criação até a entrega, proporcionando uma visão clara e em tempo real de cada etapa do processo.

O sistema foi desenvolvido para ser intuitivo, centralizando informações e facilitando a tomada de decisões para agilizar a produção e melhorar a comunicação com o cliente.

---

## 2. Manual do Usuário

### 2.1. Login

- **Acesso**: A primeira tela é a de login. Insira seu email e senha para acessar o sistema.
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

### 2.3. Gerenciamento de Pedidos

#### 2.3.1. Tela de Produção Geral (`/dashboard/orders`)

- **Visão**: Esta página lista todos os pedidos que estão em etapas de produção ativas (ou seja, que não foram finalizados, entregues ou cancelados).
- **Busca**: Utilize o campo de busca para encontrar pedidos por ID, nome do cliente, responsável, modelo, etapa, etc.
- **Código de Cores das Linhas**:
    - **Azul**: Pedido marcado como **prioridade**.
    - **Vermelho (Forte)**: Pedido com mais de 45 dias em produção (atraso crítico).
    - **Vermelho (Claro)**: Pedido com 30 a 45 dias em produção (atraso).
    - **Amarelo**: Pedido com 15 a 30 dias em produção (atenção).
- **Ações na Linha do Pedido**:
    - **Visualizar (`Ícone de Olho`)**: Abre a ficha completa do pedido com todos os detalhes.
    - **Menu (`...`)**:
        - **Editar**: Abre o formulário do pedido no modo de edição.
        - **Imprimir**: Abre a ficha do pedido em uma nova aba, pronta para impressão.
        - **Marcar/Desmarcar Prioridade**: Alterna o status de prioridade do pedido.
        - **Cancelar Pedido**: Move o pedido para a lista de "Cancelados".
        - **Excluir Pedido**: Remove o pedido da lista principal (ação irreversível).

#### 2.3.2. Telas de Etapas Específicas (Corte, Estampagem, etc.)

- **Funcionamento**: São similares à tela de "Produção Geral", mas filtram os pedidos para mostrar apenas os que estão na etapa correspondente.
- **Ações Específicas**:
    - **Avançar Etapa (`Ícone de Check`)**: A principal ação nessas telas. Clicar neste botão move o pedido para a próxima etapa do fluxo de produção.
    - **Checklists (Separação e Arremate)**: Em certas etapas, ao clicar em "Avançar", um diálogo de checklist aparecerá. É necessário marcar os itens ou fornecer uma justificativa para prosseguir.
    - **Confirmação de Entrega (Finalizado)**: Na etapa "Finalizado", o botão de avançar abre um diálogo para confirmar os detalhes da entrega, incluindo método, nome do retirante e anexo de comprovantes de pagamento pendente.
    - **Seleção de Cortadeira (Corte)**: A página de Corte exige a seleção de uma cortadeira para visualizar os pedidos atribuídos a ela.

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
    - **Editar**: Abre o formulário para alterar os dados do cliente.
    - **Imprimir**: Imprime a ficha do cliente.
    - **Excluir**: Remove o cliente (ação a ser usada com cuidado).

---

## 3. Guia Técnico e de Desenvolvimento

### 3.1. Tecnologias Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (com App Router) - Um framework React para produção, que oferece renderização no servidor (SSR), geração de sites estáticos (SSG) e uma ótima experiência de desenvolvimento.
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) - Adiciona tipagem estática ao JavaScript, o que ajuda a prevenir bugs e melhora a organização do código.
- **Estilização**:
    - [Tailwind CSS](https://tailwindcss.com/) - Um framework CSS "utility-first" que permite criar designs complexos diretamente no HTML.
    - [ShadCN/UI](https://ui.shadcn.com/) - Uma coleção de componentes de UI reutilizáveis, construídos sobre Tailwind CSS e Radix UI, que servem como base para a interface do sistema.
- **Componentes**: [React](https://react.dev/) - A biblioteca fundamental para a construção da interface de usuário.
- **Ícones**: [Lucide React](https://lucide.dev/) - Uma biblioteca de ícones simples e consistentes.
- **IA Generativa**: [Genkit (Firebase)](https://firebase.google.com/docs/genkit) - Utilizado para a funcionalidade de geração de mensagens de notificação via WhatsApp.

### 3.2. Estrutura de Pastas do Projeto

```
/src
├── app/                  # Rotas da aplicação (App Router)
│   ├── dashboard/        # Rotas protegidas do dashboard
│   │   ├── (stages)/     # Pastas para cada etapa da produção (corte, costura, etc.)
│   │   ├── customers/    # Rotas para CRUD de clientes
│   │   ├── orders/       # Rotas para CRUD de pedidos
│   │   └── page.tsx      # Página principal do dashboard
│   ├── layout.tsx        # Layout principal da aplicação
│   └── page.tsx          # Página de login
│
├── components/           # Componentes React reutilizáveis
│   ├── customers/        # Componentes específicos para clientes (ex: customer-form)
│   ├── dashboard/        # Componentes do dashboard (ex: gráficos, stats-card)
│   ├── orders/           # Componentes específicos para pedidos (ex: checklists)
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
- **Componentização**: A interface é dividida em pequenos componentes. Por exemplo, a tabela de pedidos é composta por `OrderRow`, que representa uma única linha, facilitando a manutenção.
- **Tipagem Forte**: O uso de TypeScript (`src/lib/types.ts`) garante que os dados passados entre os componentes (como um objeto `Order`) tenham a estrutura esperada, evitando erros comuns em tempo de execução.
- **Estilização Condicional**: A lógica para colorir as linhas da tabela de pedidos com base no tempo de produção ou prioridade está contida na função `getRowColor()` dentro de cada componente de página de etapa, demonstrando como aplicar estilos dinamicamente com base nos dados.
- **Rotas Dinâmicas**: O App Router do Next.js é usado para criar páginas dinâmicas, como `/dashboard/orders/[id]`, que exibe os detalhes de um pedido específico com base no ID passado na URL.

### 3.4. Controle de Acesso e Permissões

O sistema foi projetado para suportar múltiplos níveis de acesso. A seguir estão os papéis de usuário e suas respectivas permissões planejadas. A implementação de um sistema de autenticação e autorização completo (por exemplo, com Firebase Auth) será necessária para aplicar essas regras de forma segura.

-   **Administrador**:
    -   **Permissão**: Acesso total ao sistema.
    -   **Descrição**: Pode visualizar, criar, editar e excluir todas as informações, incluindo pedidos, clientes e configurações do sistema. Tem acesso a todos os relatórios e pode gerenciar contas de usuário.

-   **Gerente**:
    -   **Permissão**: Acesso total ao sistema.
    -   **Descrição**: Possui as mesmas permissões que o Administrador. É um papel com privilégios elevados para supervisionar todas as operações.

-   **Vendedores**:
    -   **Permissão**: Acesso a todas as etapas de produção e ao cadastro de clientes.
    -   **Descrição**: Podem criar novos clientes e pedidos, acompanhar o status de seus pedidos em todas as etapas (Produção Geral, Corte, Estampagem, etc.), mas não têm acesso a configurações do sistema ou gerenciamento de outros usuários.

-   **Cortadeira**:
    -   **Permissão**: Acesso exclusivo à página "Corte".
    -   **Descrição**: Visualiza apenas a lista de pedidos que estão na etapa de corte e que foram atribuídos a ela. Pode marcar um pedido como concluído para avançá-lo para a próxima etapa, mas não pode visualizar outras partes do sistema.
