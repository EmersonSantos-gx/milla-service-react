import { useState } from 'react';

const SERVIDORES_OPCOES = [
  'Belobra',
  'Jadebra',
  'Sombra',
  'Gentebra',
  'Kalibra',
  'Venebra',
  'Outro',
];

export default function AccountModal({
  isOpen,
  onClose,
  usuarioLogado = null,
  onSalvarUsuario,
  onSair,
  onNotify,
}) {
  const [abaConta, setAbaConta] = useState('cadastro');
  const [formLogin, setFormLogin] = useState({ email: '', senha: '' });
  const [formCadastro, setFormCadastro] = useState({
    nome: '',
    contato: '',
    personagem: '',
    servidor: 'Belobra',
  });

  if (!isOpen) return null;

  const handleCadastro = (e) => {
    e.preventDefault();
    if (!formCadastro.nome.trim()) return;

    const primeiroNome = formCadastro.nome.trim().split(' ')[0];
    onSalvarUsuario?.({
      nome: primeiroNome,
      nomeCompleto: formCadastro.nome.trim(),
      contato: formCadastro.contato.trim(),
      personagem: formCadastro.personagem.trim(),
      servidor: formCadastro.servidor,
    });

    onNotify?.(`Bem-vindo, ${primeiroNome}! Seus dados foram salvos para agilizar o checkout.`);
    onClose?.();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!formLogin.email.trim()) return;

    const nomeExtraido = formLogin.email.split('@')[0];
    onSalvarUsuario?.({
      nome: nomeExtraido.charAt(0).toUpperCase() + nomeExtraido.slice(1),
      contato: formLogin.email.trim(),
      personagem: '',
      servidor: 'Belobra',
    });

    onNotify?.('Login realizado com sucesso!');
    onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-[#FFBF24]/35 bg-[#190E27] p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-user text-[#FFBF24]" />
            <h3 className="text-base font-black text-[#FFF1D5]">Conta Milla Store</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de conta"
            className="text-[#DBADFF] hover:text-[#FFBF24] cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {usuarioLogado ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#DBADFF]/15 bg-[#100919] p-4 text-xs space-y-1.5">
              <p className="text-sm font-black text-[#FFF1D5]">
                {usuarioLogado.nomeCompleto || usuarioLogado.nome}
              </p>
              {usuarioLogado.contato && (
                <p className="text-[#DBADFF]/80">Contato: {usuarioLogado.contato}</p>
              )}
              {usuarioLogado.personagem && (
                <p className="text-[#FFBF24] font-bold">
                  Personagem: {usuarioLogado.personagem} ({usuarioLogado.servidor})
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onSair?.();
                onNotify?.('Você saiu da sua conta.');
                onClose?.();
              }}
              className="btn-gold-secondary w-full rounded-xl py-2.5 text-xs cursor-pointer"
            >
              Sair da Conta
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-[#DBADFF]/15 bg-[#100919] p-1">
              <button
                type="button"
                onClick={() => setAbaConta('cadastro')}
                className={`rounded-lg py-2 text-xs transition cursor-pointer ${
                  abaConta === 'cadastro'
                    ? 'btn-gold-primary'
                    : 'font-bold text-[#DBADFF]/75 hover:text-[#FFBF24]'
                }`}
              >
                Criar Conta
              </button>
              <button
                type="button"
                onClick={() => setAbaConta('login')}
                className={`rounded-lg py-2 text-xs transition cursor-pointer ${
                  abaConta === 'login'
                    ? 'btn-gold-primary'
                    : 'font-bold text-[#DBADFF]/75 hover:text-[#FFBF24]'
                }`}
              >
                Entrar
              </button>
            </div>

            {abaConta === 'login' ? (
              <form key="form-login" onSubmit={handleLogin} className="space-y-3">
                <input
                  type="email"
                  required
                  value={formLogin.email}
                  onChange={(e) => setFormLogin({ ...formLogin, email: e.target.value })}
                  placeholder="Seu e-mail"
                  className="dark-input w-full rounded-xl px-3.5 py-2.5 text-xs"
                />
                <input
                  type="password"
                  required
                  value={formLogin.senha}
                  onChange={(e) => setFormLogin({ ...formLogin, senha: e.target.value })}
                  placeholder="Sua senha"
                  className="dark-input w-full rounded-xl px-3.5 py-2.5 text-xs"
                />
                <button
                  type="submit"
                  className="btn-gold-primary w-full rounded-xl py-3 text-xs cursor-pointer"
                >
                  Entrar
                </button>
              </form>
            ) : (
              <form key="form-cadastro" onSubmit={handleCadastro} className="space-y-3">
                <input
                  type="text"
                  required
                  value={formCadastro.nome}
                  onChange={(e) => setFormCadastro({ ...formCadastro, nome: e.target.value })}
                  placeholder="Nome completo"
                  className="dark-input w-full rounded-xl px-3.5 py-2.5 text-xs"
                />
                <input
                  type="text"
                  required
                  value={formCadastro.contato}
                  onChange={(e) => setFormCadastro({ ...formCadastro, contato: e.target.value })}
                  placeholder="WhatsApp ou E-mail"
                  className="dark-input w-full rounded-xl px-3.5 py-2.5 text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={formCadastro.personagem}
                    onChange={(e) =>
                      setFormCadastro({ ...formCadastro, personagem: e.target.value })
                    }
                    placeholder="Personagem principal"
                    className="dark-input rounded-xl px-3.5 py-2.5 text-xs"
                  />
                  <select
                    value={formCadastro.servidor}
                    onChange={(e) =>
                      setFormCadastro({ ...formCadastro, servidor: e.target.value })
                    }
                    className="dark-input rounded-xl px-3 py-2.5 text-xs"
                  >
                    {SERVIDORES_OPCOES.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn-gold-primary w-full rounded-xl py-3 text-xs cursor-pointer"
                >
                  Criar Cadastro
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
