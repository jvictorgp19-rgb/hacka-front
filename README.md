# Hacka — Front-end

Interface web da solução do hackathon. **Next.js (App Router) + TypeScript**. Consome a API do repositório [hacka-back](https://github.com/jvictorgp19-rgb/hacka-back).

> Descrição do desafio e da solução: _preencher após a ideação da equipe_.

## Equipe

João (Sertoriel) · Lana · Victor · Thiago

## Estrutura

```
src/
├─ app/          # rotas, layouts e páginas (App Router)
├─ components/ui # componentes visuais reutilizáveis
├─ features/     # módulos por funcionalidade (componentes + hooks + chamadas à API)
├─ hooks/        # hooks compartilhados
├─ lib/          # cliente HTTP, utilitários, constantes
└─ types/        # tipos TypeScript (espelham o contrato da API)
public/          # arquivos estáticos
docs/            # workflow, decisões e contrato da API
```

## Começando

Ainda não há `package.json`. Na primeira vez, um integrante roda (na raiz, mantendo as pastas existentes):

```bash
npx create-next-app@latest . --ts --eslint --app --src-dir --tailwind --use-npm
```

Depois, para todos:

```bash
cp .env.example .env.local
npm install
npm run dev     # http://localhost:3000
```

A URL da API é configurada em `NEXT_PUBLIC_API_URL` (padrão `http://localhost:8000`).

## Branches e workflow

`main` ← `homolog-demo` ← `homolog-dev` ← branches pessoais (`joao-sertoriel`, `lana`, `victor`, `thiago`).
Detalhes em [docs/WORKFLOW.md](docs/WORKFLOW.md).
