import { CONFIG } from '../data/config';

export function buildWhatsAppUrl(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${CONFIG.whatsapp}?text=${encoded}`;
}

export function getDirectWhatsAppUrl() {
  return buildWhatsAppUrl(
    'Olá Milla, tudo bem? Vim pelo seu Cartão Digital e gostaria de saber mais sobre os serviços no Tibia.'
  );
}

export function generateSimulatorMessage({ vocation, playerName, level, server, uplevelType }) {
  const nome = playerName.trim();
  const lvl = level.trim() || 'A informar';
  const srv = server.trim() || 'A informar';

  const saudacao = nome
    ? `Olá Milla! Me chamo *${nome}* e gostaria de um orçamento:`
    : 'Olá Milla! Gostaria de um orçamento para meu personagem:';

  return [
    saudacao,
    `⚔️ *Vocação:* ${vocation}`,
    `📈 *Level:* ${lvl}`,
    `🌍 *Servidor:* ${srv}`,
    `🚀 *Tipo de Uplevel:* ${uplevelType}`,
  ].join('\n');
}

export function generateSimulatorPreview({ vocation, playerName, level, server, uplevelType }) {
  const nome = playerName.trim();
  const lvl = level.trim() || '750';
  const srv = server.trim() || 'Jadebra';

  const intro = nome ? `Olá Milla! Me chamo ${nome}.` : 'Olá Milla!';
  return `${intro} Quero orçamento para ${vocation}, Level ${lvl}, Servidor ${srv} (${uplevelType}).`;
}
