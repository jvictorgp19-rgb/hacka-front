'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  CalendarDays,
  Calculator,
  ChartNoAxesCombined,
  ChevronDown,
  Files,
  FileText,
  History,
  Menu,
  MessageSquare,
  Moon,
  PanelLeftClose,
  ShieldCheck,
  Sprout,
  Sun,
  X,
} from 'lucide-react';
import { WorkspaceProvider, useWorkspace } from '@/features/workspace/context';
import { useConversationHistory } from '@/features/history/use-conversations';
import DemoGuide from './DemoGuide';
import { PERSONAS_NOMINAIS } from '@/features/identity/personas';
const navigation = [
  { href: '/', label: 'Conversas', icon: MessageSquare },
  { href: '/acervo/', label: 'Acervo', icon: Files },
  { href: '/analises/', label: 'Análises', icon: ChartNoAxesCombined },
  { href: '/prazos/', label: 'Prazos', icon: CalendarDays },
  { href: '/resumos/', label: 'Resumos executivos', icon: FileText },
  { href: '/simuladores/', label: 'Simuladores', icon: Calculator },
  { href: '/historico/', label: 'Histórico', icon: History },
  { href: '/administracao/', label: 'Curadoria', icon: ShieldCheck },
];
function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { conversations } = useConversationHistory();
  const router = useRouter();
  const { gateway, context, setContext, source, openSource, loading, error, reload, identity } =
    useWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [contrast, setContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        setTheme(localStorage.getItem('raiziq.theme') || 'light');
      } catch {
        /* preference storage unavailable */
      }
    });
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.contrast = String(contrast);
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [theme, contrast, fontSize]);
  useEffect(() => {
    if (source && !dialog.current?.open) dialog.current?.showModal();
    if (!source) dialog.current?.close();
  }, [source]);
  const current =
    navigation.find((n) => n.href === pathname || n.href.slice(0, -1) === pathname) ||
    navigation[0];
  const mode = gateway?.mode || (process.env.NEXT_PUBLIC_DATA_MODE === 'api' ? 'api' : 'demo');
  return (
    <div className={`workspace ${collapsed ? 'is-collapsed' : ''}`}>
      <a className="skip-link" href="#workspace-main">
        Ir para conteúdo
      </a>
      {mobileOpen && (
        <button
          className="mobile-overlay"
          aria-label="Fechar navegação"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Navegação principal"
      >
        <Link href="/" className="brand" aria-label="BBTS Zero Click, início">
          <span className="brand-symbol">
            <Sprout size={22} />
          </span>
          <span className="nav-label">
            BBTS<span className="brand-divider">|</span>
            <span className="brand-iq">Zero Click</span>
            <small>Inteligência empresarial</small>
          </span>
        </Link>
        <button
          className="new-conversation nav-label"
          onClick={() => {
            window.dispatchEvent(new Event('raiziq:new-conversation'));
            router.push('/');
          }}
        >
          Nova consulta <span>+</span>
        </button>
        <div className="nav-section nav-label">SEU WORKSPACE</div>
        <nav>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-current={current.href === item.href ? 'page' : undefined}
              className={`nav-item ${current.href === item.href ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={19} />
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="recent-conversations nav-label">
          <div className="nav-section">RECENTES</div>
          {conversations.slice(0, 3).map((chat) => (
            <Link
              key={chat.id}
              href={'/?conversation=' + encodeURIComponent(chat.id)}
              title={chat.title}
              onClick={() => setMobileOpen(false)}
            >
              {chat.title}
            </Link>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="workspace-note nav-label">
            <span className="live-dot" />
            {mode === 'demo' ? 'Acervo sintético ACME' : 'Serviço corporativo'}
            <p>
              {mode === 'demo'
                ? 'Demonstração independente. Suas ações são salvas neste navegador.'
                : 'Dados e permissões fornecidos pela API externa.'}
            </p>
          </div>
          <button
            className="nav-item collapse-control"
            aria-label={collapsed ? 'Expandir navegação' : 'Recolher navegação'}
            onClick={() => setCollapsed(!collapsed)}
          >
            <PanelLeftClose size={18} />
            <span className="nav-label">Recolher menu</span>
          </button>
        </div>
      </aside>
      <div className="workspace-content">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir navegação"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="breadcrumb">Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{current.label}</strong>
          </div>
          <div className="topbar-actions">
            <span className="mode-badge">
              <span className="live-dot" />
              {mode === 'demo' ? 'Demo local' : 'API externa'}
            </span>
            <button
              className="icon-button"
              title="Alternar tema"
              aria-label="Alternar tema"
              onClick={() => {
                const value = theme === 'dark' ? 'light' : 'dark';
                setTheme(value);
                try {
                  localStorage.setItem('raiziq.theme', value);
                } catch {
                  /* state still changes */
                }
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <DemoGuide />
            <details className="accessibility">
              <summary aria-label="Acessibilidade">Aa</summary>
              <div className="accessibility-options">
                <button onClick={() => setFontSize((n) => Math.min(22, n + 2))}>
                  Aumentar texto
                </button>
                <button onClick={() => setFontSize((n) => Math.max(16, n - 2))}>
                  Reduzir texto
                </button>
                <button onClick={() => setContrast(!contrast)}>
                  Alto contraste: {contrast ? 'ativo' : 'inativo'}
                </button>
              </div>
            </details>
            {mode === 'demo' ? (
              <label className="persona-select">
                <span className="avatar">{context.persona.slice(0, 2).toUpperCase()}</span>
                <select
                  aria-label="Persona de demonstração"
                  value={context.persona}
                  onChange={(e) => setContext({ ...context, persona: e.target.value })}
                >
                  {PERSONAS_NOMINAIS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} />
              </label>
            ) : (
              <span>{identity?.name || 'Sessão API'}</span>
            )}
          </div>
        </header>
        <main id="workspace-main" className="workspace-main">
          {loading ? (
            <div role="status" className="empty-state">
              Carregando workspace…
            </div>
          ) : error ? (
            <div role="alert" className="error-panel">
              <h1>Não foi possível carregar os dados</h1>
              <p>{error}</p>
              <button className="primary-button" onClick={reload}>
                Tentar novamente
              </button>
              <p>
                Modo API mantém erros visíveis e não usa dados de demonstração como substitutos.
              </p>
            </div>
          ) : (
            children
          )}
        </main>
        <footer className="workspace-footer">
          <span>
            BBTS | Zero Click <span className="footer-dot">·</span> Desafio 2 / Ctrl + Alt +
            Business
          </span>
          <span>Em caso de divergência, prevalece o documento oficial.</span>
        </footer>
      </div>
      <dialog
        ref={dialog}
        className="source-panel"
        aria-labelledby="source-panel-title"
        onCancel={() => openSource(null)}
        onClose={() => openSource(null)}
      >
        {source && (
          <>
            <header>
              <span className="eyebrow">FUNDAMENTAÇÃO</span>
              <button
                className="icon-button"
                aria-label="Fechar fonte"
                onClick={() => openSource(null)}
              >
                <X size={20} />
              </button>
            </header>
            <h2 id="source-panel-title">{source.codigo}</h2>
            <p className="source-subtitle">{source.titulo}</p>
            <div className="source-tags">
              <span className="tag">v{source.versao}</span>
              <span className="tag">{source.status}</span>
            </div>
            <h3>{source.item}</h3>
            <blockquote>{source.trecho}</blockquote>
            <p className="muted">
              {source.page
                ? `Página ${source.page}, conferida no PDF.`
                : 'Página não informada pela fonte.'}{' '}
              O PDF abre sem realce automático.
            </p>
            {source.url ? (
              <a
                className="primary-button"
                href={source.url + (source.page ? `#page=${source.page}` : '')}
                target="_blank"
                rel="noreferrer"
              >
                Abrir documento <ArrowUpRight size={16} />
              </a>
            ) : (
              <p className="notice">
                Arquivo indisponível ou dependente de autorização. Nenhum link alternativo foi
                criado.
              </p>
            )}
          </>
        )}
      </dialog>
    </div>
  );
}
export default function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <Shell>{children}</Shell>
    </WorkspaceProvider>
  );
}
