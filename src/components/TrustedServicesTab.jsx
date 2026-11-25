import { useEffect, useMemo, useState } from 'react';

const extrairIniciais = (nome = '') => {
  const partes = nome.replace(/["']/g, '').trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0] || ''}${partes[partes.length - 1][0] || ''}`.toUpperCase();
};

const criarAvatarSVG = (nome) => {
  const iniciais = extrairIniciais(nome) || 'MS';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#A126F5"/>
          <stop offset="100%" stop-color="#2A1447"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="80" fill="url(#g)"/>
      <circle cx="80" cy="80" r="72" fill="none" stroke="#FFBF24" stroke-opacity="0.65" stroke-width="3"/>
      <text x="80" y="94" fill="#FFF1D5" font-family="sans-serif" font-size="48" font-weight="900" text-anchor="middle">${iniciais}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export default function TrustedServicesTab({
  refreshKey = 0,
  busca = '',
  onMudarBusca,
  onNotify,
}) {
  const [serviceiros, setServiceiros] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    fetch('/api/serviceiros')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (ativo) setServiceiros(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (ativo) setServiceiros([]);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [refreshKey]);

  const serviceirosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return serviceiros;
    return serviceiros.filter(
      (s) =>
        String(s.nome || '').toLowerCase().includes(termo) ||
        String(s.servidor || '').toLowerCase().includes(termo) ||
        String(s.especialidade || '').toLowerCase().includes(termo)
    );
  }, [serviceiros, busca]);

  const abrirWhatsApp = (srv) => {
    const msg = encodeURIComponent(
      `Olá ${srv.nome}! Vim pela aba Serviceiro de Confiança da Milla Store e gostaria de um orçamento no servidor ${srv.servidor}.`
    );
    window.open(`https://wa.me/${srv.whatsapp}?text=${msg}`, '_blank', 'noopener,noreferrer');
    onNotify?.(`Abrindo WhatsApp de ${srv.nome} (${srv.servidor})`);
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-[#A126F5]/35 bg-gradient-to-r from-[#23103A] via-[#190E27] to-[#100919] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFBF24]/40 bg-[#FFBF24]/15 px-3 py-1 text-[11px] font-extrabold text-[#FFBF24]">
            <i className="fa-solid fa-certificate" />
            Selo Oficial Milla Store
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black text-[#FFF1D5]">
            Serviceiros de Confiança
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#DBADFF]/80 max-w-2xl">
            Profissionais verificados pela Milla Store para Quests Endgame, Bosses, Bestiary e
            Leveling. Fale diretamente com o responsável do seu servidor.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#DBADFF]/60" />
          <input
            type="text"
            value={busca}
            onChange={(e) => onMudarBusca?.(e.target.value)}
            placeholder="Filtrar por nome ou servidor..."
            className="dark-input w-full rounded-xl py-2.5 pl-9 pr-4 text-xs"
          />
        </div>
      </div>

      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-56 animate-pulse rounded-2xl border border-[#DBADFF]/10 bg-[#190E27]/60"
            />
          ))}
        </div>
      ) : serviceirosFiltrados.length === 0 ? (
        <div className="rounded-3xl border border-[#DBADFF]/15 bg-[#190E27]/70 p-10 text-center text-sm text-[#DBADFF]/75">
          {busca.trim()
            ? `Nenhum serviceiro encontrado para "${busca}".`
            : 'Nenhum serviceiro cadastrado no momento.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {serviceirosFiltrados.map((srv) => (
            <div
              key={srv.id}
              className="flex flex-col justify-between rounded-2xl border border-[#DBADFF]/15 bg-[#190E27]/90 p-5 hover:border-[#FFBF24]/50 hover:shadow-[0_0_25px_rgba(161,38,245,0.18)] transition"
            >
              <div>
                <div className="flex items-center gap-3.5">
                  <img
                    src={srv.avatar_url || criarAvatarSVG(srv.nome)}
                    alt={srv.nome}
                    className="h-14 w-14 shrink-0 rounded-full border-2 border-[#FFBF24]/70 object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-[#FFF1D5]">{srv.nome}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md border border-[#A126F5]/40 bg-[#A126F5]/20 px-2 py-0.5 text-[10px] font-bold text-[#DBADFF]">
                        {srv.servidor}
                      </span>
                      {srv.verificado !== false && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-[#FFBF24]/45 bg-[#FFBF24]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#FFBF24]">
                          <i className="fa-solid fa-circle-check text-[10px]" />
                          Verificado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-[#DBADFF]/80 leading-relaxed">
                  {srv.especialidade}
                </p>

                <div className="mt-3 flex items-center justify-between rounded-xl border border-[#DBADFF]/10 bg-[#100919]/80 px-3 py-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#FFF1D5]">
                    <i className="fa-solid fa-phone text-[#FFBF24]" />
                    {srv.telefone}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FFBF24]">
                    <i className="fa-solid fa-star" />
                    {Number(srv.avaliacoes || 0)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DBADFF]/10">
                <button
                  type="button"
                  onClick={() => abrirWhatsApp(srv)}
                  className="btn-gold-primary flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp text-sm" />
                  <span>Chamar no WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
