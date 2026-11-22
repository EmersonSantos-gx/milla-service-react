import { CONFIG } from '../data/config';

export function downloadVCard() {
  const vcardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${CONFIG.nome}`,
    `ORG:${CONFIG.nome}`,
    'TITLE:Quests, Bosses e Serviços no Tibia',
    `TEL;TYPE=CELL,VOICE,WHATSAPP:${CONFIG.telefone}`,
    'ADR;TYPE=WORK:;;Maceió;AL;;Brasil',
    `URL:${CONFIG.githubPagesUrl}`,
    `NOTE:${CONFIG.slogan} | ${CONFIG.cidade}`,
    'END:VCARD',
  ];

  const blob = new Blob([vcardLines.join('\r\n')], {
    type: 'text/vcard;charset=utf-8',
  });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'Milla-Service.vcf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
}
