
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Logo, LogoIcon } from '@/components/logo';
import { Textarea } from '../ui/textarea';
import { Send, Loader2, Bot } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';
import { answerQuestionFromManual } from '@/ai/flows/answer-question-from-manual';
import { manualContent } from '@/lib/manual';

const faqItems = [
    {
        question: "Como eu crio um novo pedido?",
        answer: "Para criar um novo pedido, clique no botão 'Novo Pedido' no canto superior direito do Dashboard ou acesse a página de 'Produção Geral' e use o botão correspondente. Em seguida, preencha todas as seções do formulário, desde as informações do cliente até os detalhes de pagamento."
    },
    {
        question: "O que significam as cores na tabela de produção?",
        answer: "As cores indicam o nível de atenção que um pedido requer. Azul significa prioridade alta. Amarelo (15-30 dias), vermelho claro (30-45 dias) e vermelho forte (mais de 45 dias) indicam o tempo que o pedido está em produção, sinalizando possíveis atrasos."
    },
    {
        question: "Como eu avanço um pedido de uma etapa para outra?",
        answer: "Dentro de cada página de etapa (Corte, Estampagem, etc.), cada pedido na tabela possui um botão com um ícone de 'check'. Clicar neste botão abrirá uma confirmação para mover o pedido para a próxima etapa do fluxo de produção."
    },
    {
        question: "É possível reativar um pedido cancelado ou excluído?",
        answer: "Sim. Pedidos cancelados podem ser retomados através da página 'Cancelados'. Pedidos excluídos vão para a lixeira ('Deletados') e também podem ser restaurados a partir de lá. A exclusão permanente não é implementada nesta versão."
    },
    {
        question: "Como funciona a página de Configurações?",
        answer: "A página de Configurações permite que você gerencie as listas de opções usadas nos formulários (ex: modelos, cores, materiais). Você pode adicionar, editar, excluir e, o mais importante, reordenar os itens e as categorias arrastando e soltando-os para definir a ordem em que aparecem nos menus de seleção."
    }
];


export function HelpWidget() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [question, setQuestion] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [aiResponse, setAiResponse] = React.useState('');

  const handleAskAssistant = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setAiResponse('');

    try {
      // Mocked user role. In a real app, this would come from the user's session.
      const userRole = 'Administrador'; 
      const result = await answerQuestionFromManual({
        question,
        manual: manualContent,
        userRole,
      });
      setAiResponse(result.answer);
    } catch (error: any) {
        console.error(error);
        const errorMessage = error.message || 'Ocorreu um erro desconhecido.';
        
        if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('model overloaded')) {
             toast({
                title: "Assistente Ocupado",
                description: "O serviço está com alta demanda no momento. Por favor, tente novamente em alguns instantes.",
                variant: "destructive",
             });
        } else {
             toast({
                title: "Erro ao Consultar Assistente",
                description: "Não foi possível obter uma resposta. Verifique sua conexão ou tente novamente mais tarde.",
                variant: "destructive",
             });
        }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAskAssistant();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer overflow-hidden border border-border">
            <LogoIcon className="h-full w-full" />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assistente de Ajuda</DialogTitle>
          <DialogDescription>
            Tire suas dúvidas sobre o sistema ou consulte as perguntas frequentes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
            {/* AI Assistant Section */}
            <div className="space-y-4">
                 <div>
                    <h3 className="text-lg font-semibold">Qual sua dúvida?</h3>
                    <p className="text-sm text-muted-foreground">Descreva o que você precisa saber sobre o sistema.</p>
                 </div>
                 <div className="space-y-2">
                    <Textarea 
                        placeholder="Ex: Como eu faço para editar um pedido que já foi criado?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                    <Button onClick={handleAskAssistant} disabled={isLoading || !question.trim()} className="w-full sm:w-auto">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analisando...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Perguntar ao Assistente
                            </>
                        )}
                    </Button>
                 </div>
                 {aiResponse && (
                    <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle>Resposta do Assistente</AlertTitle>
                        <AlertDescription>
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: aiResponse }} />
                        </AlertDescription>
                    </Alert>
                 )}
            </div>
            
            {/* FAQ Section */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq">
                <AccordionTrigger>Perguntas Frequentes</AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible className="w-full">
                     {faqItems.map((item, index) => (
                        <AccordionItem value={`faq-${index}`} key={index}>
                            <AccordionTrigger className="text-left text-sm py-3">{item.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pl-4 pb-4 border-l-2 ml-2">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                     ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
