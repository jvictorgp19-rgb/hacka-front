# Workflow de Equipe (Hackathon)

## Branches

| Branch | Dono | Função |
|---|---|---|
| `main` | todos (protegida) | Versão final/entrega. Só recebe merge de `homolog-demo`. |
| `homolog-demo` | todos | Versão estável para apresentação/pitch. Só recebe merge de `homolog-dev` testado. |
| `homolog-dev` | todos | Integração contínua: onde as branches pessoais se encontram e são testadas. |
| `joao-sertoriel`, `lana`, `victor`, `thiago` | cada um | Branch pessoal de trabalho. |

## Fluxo

```
joao-sertoriel ─┐
lana ───────────┤
victor ─────────┼─PR→ homolog-dev ─PR→ homolog-demo ─PR→ main
thiago ─────────┘      (integração)     (estável)       (entrega)
```

1. Atualize sua branch: `git pull --rebase origin homolog-dev`.
2. Trabalhe em commits pequenos (Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`).
3. Abra PR da sua branch para `homolog-dev`; peça review de 1 colega (rápido, < 15 min).
4. Com o CI verde, faça **squash merge**.
5. Ao final de cada bloco de entrega, o responsável do turno abre PR `homolog-dev → homolog-demo`, testa o fluxo completo front+back e só então segue para `main`.

## Regras

- Nunca push direto em `main` e `homolog-*`.
- Nunca commitar `.env` ou chaves; use `.env.example`.
- **Contrato primeiro:** front e back combinam o formato JSON (OpenAPI do FastAPI em `/docs`) antes de implementar. Mocks no front destravam o trabalho em paralelo.
- Mudanças de contrato são avisadas no chat e registradas em `docs/`.
- Sempre mantenha o mesmo nome de feature nos dois repos nas mensagens de PR (ex.: `feat(login): ...`).
- Nas últimas horas: congelar `homolog-demo`, apenas hotfix.

## Sugestão de papéis (ajuste conforme a ideação)

- **João** — integração, deploy e DevOps; guardião de `homolog-demo`/`main`.
- **Lana** — UX/UI e páginas no front.
- **Victor** — API, regras de negócio e dados no back.
- **Thiago** — IA/dados/integrações e testes ponta a ponta.
