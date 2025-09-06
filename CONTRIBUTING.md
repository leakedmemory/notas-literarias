# Contribuindo com Notas Literárias

Obrigado pelo interesse em contribuir com o projeto! Este documento fornece
diretrizes para contribuições.

## Como Contribuir

### Reportando Bugs

- Use o sistema de issues no Codeberg
- Descreva o problema detalhadamente
- Inclua informações sobre seu navegador e sistema operacional
- Se possível, adicione capturas de tela ou passos para reproduzir o problema

### Sugerindo Melhorias

- Abra uma issue com a tag "enhancement"
- Descreva claramente a funcionalidade proposta
- Explique por que seria útil para outros usuários

### Contribuições de Código

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie uma branch** para sua contribuição:
   ```bash
   git checkout -b minha-contribuicao
   ```
4. **Configure o ambiente** de desenvolvimento

## Configuração do Ambiente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS mais recente)
- [pnpm](https://pnpm.io/) para gerenciamento de pacotes
- [web-ext](https://github.com/mozilla/web-ext) (instalado automaticamente)

### Desenvolvimento

```bash
# Instala dependências
pnpm install

# Para Firefox
pnpm dev:firefox

# Para Chromium/Chrome
pnpm dev:chromium
```

**Firefox**: Iniciará o navegador com a extensão carregada e recarregará
automaticamente quando você fizer alterações no código.

**Chromium/Chrome**: O `web-ext` não tem bom suporte para auto-reload em
Chromium. A extensão será carregada automaticamente, mas você precisa
recarregá-la manualmente no terminal, pressionando `R`, após mudanças no código.

## Diretrizes de Código

### Estrutura do Projeto

```
src/
├── background/  # Service worker da extensão
├── content/     # Scripts injetados nas páginas da Amazon
├── shared/      # Utilitários e tipos compartilhados
└── templates/   # Templates HTML para componentes
```

### Comandos Úteis

```bash
pnpm lint:biome    # Corrige problemas de lint do código
pnpm fix:biome     # Corrige problemas de lint e formatação
pnpm fmt           # Corrige formatação do código (biome + prettier)
pnpm fmt:prettier  # Corrige formatação apenas de arquivos de responsabilidade do Prettier
pnpm fmt:biome     # Corrige formatação apenas de arquivos de responsabilidade do Biome
```

## Processo de Contribuição

1. **Faça suas alterações** seguindo as diretrizes acima
2. **Teste** sua contribuição:
   - Teste em Firefox e Chromium
   - Verifique se não quebrou funcionalidades existentes
   - Teste em diferentes páginas da Amazon Brasil
3. **Commit** suas mudanças:
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade"
   ```
4. **Push** para seu fork:
   ```bash
   git push origin minha-contribuicao
   ```
5. **Abra um Pull Request** no repositório principal

### Padrão de Mensagens de Commit

Use o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Formatação, sem mudanças no código
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Tarefas de manutenção

### Exemplos:

```bash
git commit -m "feat: adiciona suporte para avaliações em inglês"
git commit -m "fix: corrige parsing de ISBN em páginas de ebook"
git commit -m "docs: atualiza instruções de instalação"
```

## Testando a Extensão

### Teste Manual

1. Navegue para uma página de livro na Amazon Brasil
2. Verifique se as avaliações do Goodreads aparecem
3. Teste diferentes tipos de livros (físicos, ebooks)
4. Verifique se não há erros no console do navegador

### Páginas de Teste Sugeridas

- Livros populares com muitas avaliações
- Livros sem avaliações no Goodreads
- Produtos que não são livros (para verificar se a extensão não interfere)

## Estrutura de Arquivos Importantes

- `platforms/*/manifest.json` - Manifestos específicos por navegador
- `src/shared/config.ts` - Configurações da extensão
- `src/shared/types.ts` - Tipos TypeScript compartilhados
- `scripts/` - Scripts de build e release
- `biome.json` - Configurações de linting/formatação

## Dúvidas?

- Abra uma issue com a tag "question"
- Entre em contato através das issues do Codeberg

Obrigado por contribuir! 🎉
