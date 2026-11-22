# Milla Service — Cartão Digital (React + JavaScript)

Projeto modularizado em **React + Vite + Tailwind CSS**, convertido a partir do cartão digital HTML original da **Milla Service**.

## Como rodar localmente

```bash
npm install
npm run dev
```

## Build para produção (Vercel / GitHub Pages)

```bash
npm run build
```

## Estrutura de pastas

- `public/assets/` — Imagens extraídas do HTML original (`avatar.png`, `background.png`, `gxdev-logo.png`).
- `src/data/config.js` — Dados centralizados (perfil, WhatsApp, serviços e avaliações).
- `src/utils/` — Helpers para links do WhatsApp e geração do vCard (`.vcf`).
- `src/components/` — Componentes React organizados por seção da página.
