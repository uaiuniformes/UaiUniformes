import type { Order, Customer } from './types';

export function buildWhatsAppMessage(order: Order, customer: Customer): string {
  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 ? 'Bom dia' : hour >= 12 && hour < 18 ? 'Boa tarde' : 'Boa noite';
  const clientName = customer.responsible || customer.companyName || 'Cliente';

  // 7 etapas do checklist do cliente:
  // 1. Layout, Tamanhos e Pagamento
  // 2. Compra do Material
  // 3. Corte
  // 4. Estampa
  // 5. Costura
  // 6. Embalar
  // 7. Entrega Disponivel

  type StepKey = 'layout' | 'material' | 'corte' | 'estampa' | 'costura' | 'embalar' | 'entrega';
  const steps: { key: StepKey; label: string }[] = [
    { key: 'layout', label: 'Layout, Tamanhos e Pagamento' },
    { key: 'material', label: 'Compra do Material' },
    { key: 'corte', label: 'Corte' },
    { key: 'estampa', label: 'Estampa' },
    { key: 'costura', label: 'Costura' },
    { key: 'embalar', label: 'Embalar' },
    { key: 'entrega', label: 'Entrega Disponivel' },
  ];

  // Identificar o índice da etapa ativa (0 a 6) ou 7 se concluído
  let activeIndex = 2; // Padrão: Corte
  let currentStatusText = 'Fila de Corte';
  let nextStepText = 'Estampagem';

  switch (order.stage) {
    case 'Separação':
      activeIndex = 0;
      currentStatusText = 'Aprovação de Layout & Separação';
      nextStepText = 'Compra do Material';
      break;

    case 'Corte':
      activeIndex = 2;
      currentStatusText = 'Fila de Corte';
      nextStepText = 'Estampagem';
      break;

    case 'Reposição de Corte':
      activeIndex = 2;
      currentStatusText = 'Reposição de Corte';
      nextStepText = 'Estampagem';
      break;

    case 'Estampagem':
      activeIndex = 3;
      currentStatusText = 'Fila de Estampagem';
      nextStepText = 'Costura';
      break;

    case 'Costura':
      activeIndex = 4;
      currentStatusText = 'Em Costura';
      nextStepText = 'Embalar';
      break;

    case 'Arremate':
      activeIndex = 5;
      currentStatusText = 'Arremate e Embalagem';
      nextStepText = 'Entrega Disponível';
      break;

    case 'Finalizado':
      activeIndex = 6;
      currentStatusText = 'Pronto para Retirada / Envio';
      nextStepText = 'Entrega ao Cliente';
      break;

    case 'Entregue':
      activeIndex = 7;
      currentStatusText = 'Pedido Entregue';
      nextStepText = 'Pedido Concluído com Sucesso';
      break;

    case 'Correção':
      activeIndex = 3;
      currentStatusText = 'Fila de Ajuste / Correção';
      nextStepText = 'Costura';
      break;

    case 'Cancelado':
      activeIndex = -1;
      currentStatusText = 'Pedido Cancelado';
      nextStepText = 'Entre em contato com nossa equipe';
      break;

    default:
      activeIndex = 2;
      currentStatusText = 'Em Produção';
      nextStepText = 'Próxima etapa';
  }

  const stepLines = steps.map((s, idx) => {
    let mark = '';
    if (activeIndex === 7) {
      mark = '✅';
    } else if (activeIndex === -1) {
      mark = '';
    } else if (idx < activeIndex) {
      mark = '✅';
    } else if (idx === activeIndex) {
      mark = '➡️';
    } else {
      mark = '';
    }
    return `* ${s.label}${mark ? ' ' + mark : ''}`;
  });

  const lines = [
    `${greeting}, ${clientName} tudo bem com você?`,
    `Atualização sobre seu pedido:`,
    ...stepLines,
    ``,
    `*Atualmente:* ${currentStatusText}`,
    `*Proximo passo:* ${nextStepText}`,
    ``,
    `Contendo novas noticias, passo aqui pra você. Qualquer dúvida, estamos à disposição!`
  ];

  return lines.join('\n');
}

export function openWhatsApp(phone: string, message: string): boolean {
  const cleanPhone = phone?.replace(/\D/g, '') || '';
  if (!cleanPhone) {
    return false;
  }
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
  return true;
}
