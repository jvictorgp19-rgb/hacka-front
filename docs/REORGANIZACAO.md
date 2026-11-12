# Reorganização e preservação do webapp

## Base consolidada

A consolidação reúne o histórico da `main`, a proposta exclusiva de `joao-sertoriel`
e o webapp completo da `lana`, com merges que mantêm os commits originais.
As branches `Dev`, `Homolog` e `main` partem da mesma base consolidada.

Os arquivos de aplicação, configurações de execução, dependências, lockfile,
imagens e PDFs da `lana` são mantidos byte a byte. As alterações de organização
se limitam ao README, gitignore, documentação e workflow de CI.
A estrutura inicial e o arquivo de exemplo de ambiente também são mantidos.

O responsável informou que o webapp ainda não estava publicado em hospedagem externa.
Nenhum recurso de hospedagem foi excluído ou reconfigurado.

## Pontas anteriores

| Branch anterior  | Commit preservado                          | Tag de backup                                        |
| ---------------- | ------------------------------------------ | ---------------------------------------------------- |
| `homolog-demo`   | `534085c91eef4d5579742d2be458746f83d2c632` | `backup/pre-reorganizacao-2026-11-12/homolog-demo`   |
| `homolog-dev`    | `534085c91eef4d5579742d2be458746f83d2c632` | `backup/pre-reorganizacao-2026-11-12/homolog-dev`    |
| `joao-sertoriel` | `98d5556ffe1fee870a888bcfdf5c671a490c26d8` | `backup/pre-reorganizacao-2026-11-12/joao-sertoriel` |
| `lana`           | `80f0f4e612b2c6c5df3567aa1dd1b82e66dcf2d5` | `backup/pre-reorganizacao-2026-11-12/lana`           |
| `main`           | `07720dd65ac04dc18f906e3c944fe7a55f662fab` | `backup/pre-reorganizacao-2026-11-12/main`           |
| `thiago`         | `534085c91eef4d5579742d2be458746f83d2c632` | `backup/pre-reorganizacao-2026-11-12/thiago`         |
| `victor`         | `534085c91eef4d5579742d2be458746f83d2c632` | `backup/pre-reorganizacao-2026-11-12/victor`         |

As tags devem ser publicadas e verificadas antes da remoção das branches antigas.
Foi criado também um bundle completo fora do repositório, no diretório de
artefatos desta conversa (`repo-backup/hacka-front-before.bundle`).

## Recuperação

Para inspecionar o webapp anterior sem mudar branches:

```bash
git show backup/pre-reorganizacao-2026-11-12/lana:package.json
```

Para recuperar uma branch antiga em caso de necessidade:

```bash
git switch -c recuperacao-lana backup/pre-reorganizacao-2026-11-12/lana
```

Essa recuperação cria uma quarta branch temporária; não é parte do fluxo normal.
As versões anteriores dos READMEs e as demais revisões permanecem no histórico.

## Limites de validação

A verificação de preservação compara os objetos Git de todos os arquivos da `lana`,
exceto README e gitignore, com a base consolidada; verifica também que cada ponta
antiga é ancestral das três branches novas. Isso confirma preservação do conteúdo
e do histórico, mas não substitui lint, build e validação funcional do webapp.
