# Notas Literárias

Uma extensão de navegador que mostra as avaliações e notas do Goodreads quando
você está navegando por livros na Amazon Brasil, ajudando você a tomar decisões
mais informadas sobre suas compras.

> **Repositório Principal**: Este projeto é hospedado no
> [Codeberg](https://codeberg.org/leakedmemory/notas-literarias). As versões no
> GitHub e GitLab são apenas mirrors para maior acessibilidade.

## Funcionalidades

- **Detecção automática**: Identifica automaticamente páginas de livros na
  Amazon Brasil
- **Avaliações do Goodreads**: Mostra nota média, número de avaliações e
  distribuição de estrelas
- **Link direto**: Acesso rápido à página completa do livro no Goodreads
- **Cross-browser**: Funciona no Firefox e navegadores baseados em Chromium
  (Chrome, Edge, Opera)
- **Suporte a múltiplos formatos**: ISBN-13 e códigos ASIN da Amazon
- **Interface limpa**: Design discreto que se integra naturalmente à página da
  Amazon

## Instalação

### Loja de Extensões (Recomendado)

A maneira mais fácil de instalar é através da loja oficial de extensões do seu
navegador:

_Links para as lojas serão adicionados aqui_

### Instalação Manual

Se preferir instalar manualmente ou a extensão ainda não estiver disponível na
loja:

#### Firefox

1. Baixe o arquivo assinado `.xpi` da página de releases
2. Abra o Firefox e vá em `about:addons`
3. Clique na engrenagem e selecione "Instalar extensão de arquivo..."
4. Selecione o arquivo baixado

#### Chrome/Chromium/Edge

1. Baixe o arquivo `.zip` da página de releases
2. Extraia o arquivo ZIP
3. Abra `chrome://extensions/` (ou `edge://extensions/`)
4. Ative o "Modo de desenvolvedor"
5. Clique em "Carregar sem compactação" e selecione a pasta extraída

## Como Usar

1. **Navegue normalmente** pela Amazon Brasil
2. **Entre em uma página de livro**
3. **Um spinner irá aparecer** enquanto a extensão coleta as informações
4. **Veja as avaliações** do Goodreads aparecerem ao lado dos detalhes do
   produto

A extensão funciona automaticamente --- não há necessidade de configuração
adicional!

## Demonstração

<!-- TODO: Adicionar screenshots mostrando:
- Página da Amazon sem a extensão
- Página da Amazon com as avaliações do Goodreads visíveis
- Exemplo do popover com mais detalhes
-->

_Screenshots serão adicionados em breve_

## Perguntas Frequentes (FAQ)

### **A extensão funciona em quais sites?**

Apenas na Amazon Brasil e não interfere em outros sites.

### **Por que algumas páginas não mostram avaliações?**

Na sua maioria das vezes é devido o produto não ser um livro. Se for um livro e
a extensão não conseguir obter avalições do Goodreads pode ser pelos seguintes
motivos:

- O livro não existe no banco de dados do Goodreads
- Problemas temporários de conexão com o Goodreads
- Bug na extensão que pode ser reportado em Issues

### **A extensão coleta meus dados pessoais?**

Não. A extensão apenas:

- Lê informações da página da Amazon (título, ISBN, ASIN)
- Consulta dados do Goodreads lendo o as informações da página do livro (não faz
  uso de API diretamente)
- Não armazena nem envia informações pessoais

### **Por que preciso de permissões para Goodreads?**

A extensão precisa acessar o Goodreads para buscar as avaliações dos livros.
Todas as consultas são feitas anonimamente usando apenas códigos ISBN ou ASIN.

### **A extensão funciona em modo incógnito/privado?**

Sim, mas você pode precisar ativar essa opção nas configurações de extensões do
seu navegador.

## Build

### Pré-requisitos

- **Node.js** LTS ou mais recente
- **pnpm** 10.15+

### Configuração do Ambiente

```bash
# Clone o repositório
git clone https://codeberg.org/leakedmemory/notas-literarias.git
cd notas-literarias

# Instale as dependências
pnpm install
```

### Comandos de Build

```bash
# Build para Firefox e Chromium
pnpm build

# Build apenas para Firefox
pnpm build:firefox

# Build apenas para Chromium
pnpm build:chromium

# Criar pacotes distribuíveis (.xpi para Firefox, .zip para Chromium)
pnpm pack
```

### Estrutura do Build

Os arquivos de build são gerados em:

- `dist/prod/firefox/` - Build do Firefox
- `dist/prod/chromium/` - Build do Chromium
- `dist/prod/*.xpi` - Pacote Firefox (após `pnpm pack`)
- `dist/prod/*.zip` - Pacote Chromium (após `pnpm pack`)

## Problemas e Sugestões

Encontrou um bug ou tem uma ideia para melhorar a extensão?

1. Verifique se já não existe uma issue similar
2. Crie uma nova issue usando nossos templates:
   - **Bug Report** para problemas
   - **Feature Request** para sugestões de melhorias

## Contribuições

Quer contribuir com o projeto? Que legal!

Leia nosso [guia de contribuição](./CONTRIBUTING.md) para saber como:

- Configurar o ambiente de desenvolvimento
- Entender a estrutura do código
- Submeter pull requests
- Seguir nossos padrões de código

## Licença

Este projeto está licenciado sob a [Licença MIT](./LICENSE).

---

**Aviso Legal**: Este projeto não é afiliado à Amazon ou ao Goodreads. É um
projeto independente criado para melhorar a experiência de compra de livros.
