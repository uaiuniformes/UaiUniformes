
export const manualContent = `
# Manual do Sistema de Gerenciamento de Produção

## 1. Visão Geral
Este documento serve como um guia completo para o Sistema de Gerenciamento de Produção da Lacort. Ele foi projetado para otimizar o acompanhamento de pedidos, desde a criação até a entrega, proporcionando uma visão clara e em tempo real de cada etapa do processo.

## 2. Manual do Usuário

### 2.1. Login
- **Acesso**: A primeira tela é a de login. Insira seu email ('Admin@Uai.com') e senha ('@Uai2026') para acessar o sistema.
- **Recuperação de Senha**: Funcionalidade não implementada nesta versão.

### 2.2. Dashboard Principal
O Dashboard é a sua central de comando. Ao entrar no sistema, você visualiza:
- **Ações Rápidas**: Atalhos para 'Novo Cliente' e 'Novo Pedido'.
- **Cartões de Estatísticas (Kanban)**: Cada cartão representa uma etapa da produção (Corte, Estampagem, etc.) e mostra a quantidade de pedidos naquela etapa. Clicar em um cartão leva você para a página da etapa correspondente.
- **Gráficos de Análise**: Gráficos de barras e pizza que mostram a produção por responsável, desempenho de corte e a distribuição de pedidos por etapa.
- **Tabela de Pedidos Recentes**: Lista os pedidos criados na última semana. Clicar no ícone de olho abre um pop-up com os detalhes do pedido.

### 2.3. Gerenciamento de Pedidos

#### 2.3.1. Tela de Produção Geral ('/dashboard/orders')
- **Visão**: Lista todos os pedidos em produção ativa.
- **Código de Cores das Linhas**:
    - **Azul**: Prioridade.
    - **Vermelho (Forte)**: Atraso crítico (+45 dias).
    - **Vermelho (Claro)**: Atraso (30-45 dias).
    - **Amarelo**: Atenção (15-30 dias).
- **Ações**:
    - **Visualizar (Ícone de Olho)**: Abre um pop-up com a ficha do pedido.
    - **Menu ('...')**: Permite Editar, Imprimir, Marcar Prioridade, Cancelar e Excluir (move para a lixeira).

#### 2.3.2. Telas de Etapas Específicas (Corte, Estampagem, etc.)
- **Funcionamento**: São similares à Produção Geral, mas filtradas por etapa.
- **Ações Específicas**:
    - **Avançar Etapa (Ícone de Check)**: Move o pedido para a próxima etapa.
    - **Checklists (Separação e Arremate)**: Exige o preenchimento de um checklist para avançar.
    - **Página de Corte**: Exige a seleção de uma cortadeira. Contém abas para a fila normal, 'Reposição' e 'Lotes de Facção'.
    - **Página de Estampagem**: Permite 'Registrar Perda', que move o pedido para a fila de 'Reposição de Corte'.

#### 2.3.3. Criar e Editar Pedidos ('/dashboard/orders/new')
- **Formulário Completo**: Preencha as informações do cliente, produto, grade de tamanhos, layout, financeiro e controle interno.
- **Salvar**: Um diálogo de confirmação aparece antes de salvar.

### 2.4. Gerenciamento de Clientes ('/dashboard/customers')
- **Listagem e Busca**: Visualize e pesquise todos os clientes.
- **Ações**:
    - **Criar Cliente**: Leva ao formulário de cadastro.
    - **Ver Ficha**: Abre a página de detalhes do cliente.
    - **Histórico de Pedidos (Pop-up)**: Mostra todos os pedidos do cliente em um pop-up.
    - **Editar**: Abre o formulário de edição do cliente.
    - **Excluir**: Remove o cliente do sistema após confirmação.

### 2.5. Perfil do Usuário ('/dashboard/profile')
- **Gerenciamento da Conta**: Permite editar nome, e-mail e foto do perfil.
- **Segurança**: Inclui um formulário para alteração de senha.
- **Histórico de Atividades**: Registra e exibe as ações mais importantes realizadas pelo usuário.

### 2.6. Controle de Estoque ('/dashboard/inventory')
- **Visão Geral**: Gerencie o estoque de matéria-prima (malhas, tecidos, etc.).
- **Categorias**: O estoque é organizado em abas por categoria.
- **Ações**: Botões em cada linha para 'Registrar Entrada/Saída' de material e 'Ver Histórico'.

### 2.7. Relatórios
- **Acesso**: Pelo menu do usuário no canto superior direito.
- **Tipos**:
    - **Vendas**: Consolida as vendas por vendedor para um determinado período.
    - **Corte**: Agrupa a produção de peças por cortadeira.
    - **Costura**: Agrupa a produção por costureira, com cálculo de comissão por modelo de peça.
    - **Caixa**: Visão consolidada das movimentações financeiras.

### 2.8. Fluxo de Caixa Diário ('/dashboard/financial/cash-flow')
- **Visão Diária**: Permite registrar e visualizar todas as entradas e saídas de um dia específico.
- **Adição Rápida com IA**: Permite extrair dados de transação por voz ou por imagem de comprovante.
- **Fechamento de Caixa**: Calcula a diferença (sobra ou falta) do caixa ao final do dia.

### 2.9. Configurações ('/dashboard/settings')
- **Gerenciamento de Listas**: Permite gerenciar as opções usadas nos formulários do sistema (Modelos, Materiais, Cores, etc.).
- **Ações**: Adicionar, editar ou excluir itens das listas.
- **Reordenação (Arrastar e Soltar)**: Permite reordenar tanto as categorias no menu lateral quanto os itens dentro de cada lista para definir a ordem de preferência.

## 3. Controle de Acesso e Permissões
- **Administrador**: Acesso total a todas as funcionalidades do sistema.
- **Gerente**: Acesso total, similar ao Administrador.
- **Vendedores**: Acesso a todas as etapas de produção e ao cadastro de clientes. Podem criar pedidos e clientes, mas não acessam configurações do sistema.
- **Cortadeira**: Acesso exclusivo à página 'Corte', visualizando apenas os pedidos atribuídos a ela. Pode avançar a etapa dos seus pedidos.
`;
