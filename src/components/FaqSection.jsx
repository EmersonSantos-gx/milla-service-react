import { useState } from 'react';

const PERGUNTAS = [
  {
    pergunta: 'Qual o prazo de entrega das Tibia Coins?',
    resposta:
      'Pagamentos via PIX são aprovados na hora e a entrega é feita em poucos minutos durante o horário de atendimento. Assim que o pagamento é confirmado, você também pode acompanhar ou chamar no WhatsApp.',
  },
  {
    pergunta: 'Qual a diferença entre pagar por PIX ou Cartão?',
    resposta:
      'No PIX a liberação é instantânea pelo Mercado Pago. No Cartão de Crédito ou Débito, o envio das Tibia Coins acontece assim que o Mercado Pago conclui a análise e aprova o pagamento.',
  },
  {
    pergunta: 'É seguro? Preciso informar minha senha do Tibia?',
    resposta:
      'Nunca pedimos senha ou dados da sua conta. Para enviar as Tibia Coins, precisamos apenas do nome exato do seu personagem (e servidor) no momento do pedido.',
  },
  {
    pergunta: 'Como as Tibia Coins chegam no meu personagem?',
    resposta:
      'O envio é feito diretamente pelo sistema oficial de transferência de Tibia Coins dentro do jogo, caindo direto na sua conta sem precisar estar online no momento.',
  },
  {
    pergunta: 'E se eu digitar o nome do personagem errado?',
    resposta:
      'Antes de finalizar, confira bem a ortografia do personagem. Se notar algum erro logo após o pagamento, chame imediatamente no WhatsApp com o número do pedido para corrigirmos antes do envio.',
  },
];

export default function FaqSection() {
  const [aberta, setAberta] = useState(0);

  const alternar = (index) => {
    setAberta((prev) => (prev === index ? null : index));
  };

  return (
    <section className="glass-card rounded-3xl border border-white/10 p-5 text-left">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300">
          <i className="fa-solid fa-circle-question text-sm" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Dúvidas Frequentes</h2>
          <p className="text-xs text-slate-400">
            Tudo o que você precisa saber antes de comprar
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {PERGUNTAS.map((item, index) => {
          const isOpen = aberta === index;
          return (
            <div
              key={item.pergunta}
              className={`rounded-2xl border transition ${
                isOpen
                  ? 'border-cyan-400/30 bg-slate-950/80'
                  : 'border-white/10 bg-slate-950/45 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => alternar(index)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-semibold text-white">
                  {item.pergunta}
                </span>
                <i
                  className={`fa-solid fa-chevron-down text-xs text-cyan-300 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-white/5 px-4 pb-3.5 pt-2.5 text-xs leading-relaxed text-slate-300">
                  {item.resposta}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}