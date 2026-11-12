# Workflow de equipe

## Branches

O repositório usa somente três branches permanentes, com capitalização exata:

| Branch    | Função                                              |
| --------- | --------------------------------------------------- |
| `Dev`     | Desenvolvimento e integração do trabalho da equipe. |
| `Homolog` | Validação funcional e preparação da entrega.        |
| `main`    | Versão aprovada para entrega e futura produção.     |

## Fluxo

`Dev → Homolog → main`

1. Atualize sua cópia com `git switch Dev` e `git pull --ff-only origin Dev`.
2. Desenvolva na `Dev`, em commits pequenos (`feat:`, `fix:`, `docs:`, `chore:`).
3. Antes do push, integre eventuais commits dos colegas e valide a alteração.
4. Envie para `Dev` e abra PR `Dev → Homolog`.
5. Com o CI aprovado, revise com outro integrante e faça merge preservando o histórico (merge commit).
6. Valide o fluxo completo em `Homolog` e abra PR `Homolog → main`.
7. Após aprovação e CI verde, faça merge preservando o histórico.
8. Incorpore os merges de promoção de volta em `Dev` quando necessário; não reescreva o histórico compartilhado.

## Preservação e regras

- O webapp atual é a base das três branches e deve ser preservado durante mudanças de organização.
- Não recrie o projeto com `create-next-app` sobre os arquivos existentes.
- Não use force push ou reset remoto nas branches compartilhadas.
- Não envie alterações diretamente para `Homolog` ou `main` após a consolidação inicial.
- Execute `npm ci`, `npm run lint` e `npm run build` antes de promover alterações.
- Não versione `.env` ou chaves; mantenha somente o exemplo público `.env.example`.
- Combine mudanças no contrato da API com o backend e registre decisões em `docs/`.
- As branches antigas são preservadas por tags `backup/pre-reorganizacao-2026-11-12/<branch>`; tags não são branches de desenvolvimento.
- A exigência de revisão e bloqueio de push deve ser configurada no GitHub por um administrador; este documento não aplica proteção técnica.

## Execução local

```bash
npm ci
cp .env.example .env.local
npm run dev
```

A aplicação já existe. Não é necessário inicializar outro projeto.
