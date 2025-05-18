# Changelog

Todas as principais mudanças deste projeto serão documentadas neste arquivo. Veja [conventional commits](https://www.conventionalcommits.org/) para as diretrizes de commit.

## [0.5.0](https://codeberg.org/notas-literarias/notas-literarias/compare/v0.4.0..v0.5.0) - 2025-05-18

### Recursos

- **(firefox)** adiciona id para extensão e web-ext linting - ([9162b87](https://codeberg.org/notas-literarias/notas-literarias/commit/9162b87a990d3c098753ea2d3571563023af1251)) - leaked memory
- adiciona suporte para navegadores chromium - ([4fcc4f4](https://codeberg.org/notas-literarias/notas-literarias/commit/4fcc4f4762ea454369394ed7043a582900bcc102)) - leaked memory
- cria ícone para extensão - ([2368aa8](https://codeberg.org/notas-literarias/notas-literarias/commit/2368aa8e393d15627602334e565aa6423901f600)) - leaked memory
- melhora logging - ([b265415](https://codeberg.org/notas-literarias/notas-literarias/commit/b265415fd48ec287846f1b04fdf1d21a45ea61bb)) - leaked memory
- adiciona funcionalidade de abrir repositório ao clicar no ícone da extensão - ([0f84b1e](https://codeberg.org/notas-literarias/notas-literarias/commit/0f84b1e7d0add273059c7bb338b379988f740c1c)) - leaked memory
- implementa sistema de empacotamento - ([9ef722e](https://codeberg.org/notas-literarias/notas-literarias/commit/9ef722ec99ec8b8d8014893d7f1eed9d451040d4)) - leaked memory
- adiciona ícones adicionais para a página de gerenciamento de extensões - ([51bca1f](https://codeberg.org/notas-literarias/notas-literarias/commit/51bca1fd2883161da90994e2a7b2ccf044b56a07)) - leaked memory

### Correções de Bugs

- **(popover)** adiciona persistência em hover ao popover - ([74e2d31](https://codeberg.org/notas-literarias/notas-literarias/commit/74e2d3196c3d221568836b6d0ba966699928e4d6)) - leaked memory
- **(popover)** mantém popover no local correto mesmo com scroll - ([b309b32](https://codeberg.org/notas-literarias/notas-literarias/commit/b309b32262fafb2a9a305aa423d0ed2e662cdfaa)) - leaked memory

### Refatorações

- **(logger)** cria função para pegar o tempo atual já formatado - ([ef45f1f](https://codeberg.org/notas-literarias/notas-literarias/commit/ef45f1ff027b53a3d02db68e74ef2c80d82a892c)) - leaked memory
- **(popover)** melhora organização do componente - ([3f92b4a](https://codeberg.org/notas-literarias/notas-literarias/commit/3f92b4ac97dd86919120529ce8d094dfa72ba16b)) - leaked memory
- move css do spinner para arquivo próprio - ([69c4a34](https://codeberg.org/notas-literarias/notas-literarias/commit/69c4a349a48dd42d43d9630793117204d5d291f3)) - leaked memory
- elimina duplicação de código e melhora arquitetura da extensão - ([e406d94](https://codeberg.org/notas-literarias/notas-literarias/commit/e406d9477b9684570e94b8ea45b3ec16dde174b9)) - leaked memory
- reorganiza estrutura de diretórios do projeto - ([add721b](https://codeberg.org/notas-literarias/notas-literarias/commit/add721b6e2c5beecc3c0ec1432456058a4f9a902)) - leaked memory
- remove código de seletores de elemento - ([01a45cc](https://codeberg.org/notas-literarias/notas-literarias/commit/01a45cc257eafc19122e17c3df162a57052f2d6c)) - leaked memory

### Documentação

- atualiza changelog - ([9565057](https://codeberg.org/notas-literarias/notas-literarias/commit/9565057a696ed53f96dd5ccb8b8a15d1bde1918a)) - leaked memory

### Tarefas Diversas

- desativa log verboso do web-ext - ([e57aadb](https://codeberg.org/notas-literarias/notas-literarias/commit/e57aadb44ee12060346f875317bec80fb90a29d7)) - leaked memory
- migra repositório para codeberg - ([986b7c1](https://codeberg.org/notas-literarias/notas-literarias/commit/986b7c15a06f92e1fbdd680e0b1279918a275bcd)) - leaked memory
- atualiza dependências - ([31e3b96](https://codeberg.org/notas-literarias/notas-literarias/commit/31e3b96c13738a9e9ae55986d304fcf3cacf88e1)) - leaked memory
- altera script do cliff - ([2d60aa2](https://codeberg.org/notas-literarias/notas-literarias/commit/2d60aa2de772d674108ed201d1cbd734bd89784b)) - leaked memory
- aumenta versão para 0.5.0 - ([604ed31](https://codeberg.org/notas-literarias/notas-literarias/commit/604ed31d1af39a4662f4390fcc6337722c8e0c5e)) - leaked memory

## [0.4.0](https://codeberg.org/notas-literarias/notas-literarias/compare/v0.3.0..v0.4.0) - 2025-05-10

### Recursos

- adiciona popover - ([bb25b83](https://codeberg.org/notas-literarias/notas-literarias/commit/bb25b834e1dd1971ef6b831a5ad2de6be3c92d50)) - Lohan Yrvine
- adiciona spinner durante requisição para goodreads - ([cacee5b](https://codeberg.org/notas-literarias/notas-literarias/commit/cacee5b59e68f33e163e5cf8de00d9c1bab8176b)) - Lohan Yrvine
- adiciona HH:mm:ss timestamp nos logs - ([d391b2c](https://codeberg.org/notas-literarias/notas-literarias/commit/d391b2caa01f47051df8f7de0a714daa3e73146f)) - Lohan Yrvine
- configura plugin AutoImport para webextension-polyfill - ([3c081ab](https://codeberg.org/notas-literarias/notas-literarias/commit/3c081abfa8839ae9ef30cb721f7d16d430f94cbf)) - leaked memory

### Refatorações

- **(logger)** troca console.log por console.debug no método pretty - ([dec75b0](https://codeberg.org/notas-literarias/notas-literarias/commit/dec75b083e2e12db19c15a5229f2e3cba6160679)) - leaked memory
- separa `content.ts` em múltiplos arquivos - ([959dacd](https://codeberg.org/notas-literarias/notas-literarias/commit/959dacd82f6ac48855904532789dfcbaf222185c)) - Lohan Yrvine
- transforma parser em simples funções ao invés de uma classe - ([5adf8ee](https://codeberg.org/notas-literarias/notas-literarias/commit/5adf8eefc5710685050d1db8c525419427b703b9)) - Lohan Yrvine
- altera bookratings para notasliterarias - ([03dfb15](https://codeberg.org/notas-literarias/notas-literarias/commit/03dfb15c156c8b240f796486f196f8754eabc2d0)) - Lohan Yrvine
- reestrutura projeto - ([a8c11e1](https://codeberg.org/notas-literarias/notas-literarias/commit/a8c11e1c33d4eaf832d97ccc21747c3a44888b80)) - leaked memory

### Documentação

- cria changelog - ([85080fd](https://codeberg.org/notas-literarias/notas-literarias/commit/85080fdac825161807d1670c463edad066ea7268)) - Lohan Yrvine

### Tarefas Diversas

- **(deps)** atualiza dependências - ([f32aa27](https://codeberg.org/notas-literarias/notas-literarias/commit/f32aa27c521f892f9b26aa53821112157e6bf517)) - leaked memory
- **(tsconfig)** remove declaração de `include` - ([8296537](https://codeberg.org/notas-literarias/notas-literarias/commit/8296537efe3b7d7c24f2afa41b561ad9a4404dbf)) - leaked memory
- atualiza dependências - ([7c0e676](https://codeberg.org/notas-literarias/notas-literarias/commit/7c0e6764f5e839bfb223b0e79f2c957ee45bf0e4)) - Lohan Yrvine
- remove flag de correção automática do typos - ([769f0c4](https://codeberg.org/notas-literarias/notas-literarias/commit/769f0c4d397a47e9dc628d7756d11e5e06501479)) - Lohan Yrvine
- adiciona script `set-hooks` em package.json - ([11c7e04](https://codeberg.org/notas-literarias/notas-literarias/commit/11c7e043e1ed21b6bd75992276f73b033a3e5ef1)) - Lohan Yrvine
- adiciona extensão de arquivo `.mjs` em hook lint-and-format - ([d7fca58](https://codeberg.org/notas-literarias/notas-literarias/commit/d7fca580d1838fe6ad42e974fd7eba9508b7fd64)) - leaked memory
- renomeia arquivo de configuração do cliff - ([d6d676a](https://codeberg.org/notas-literarias/notas-literarias/commit/d6d676ae8cf1294ae1a7ab9ed5d4e3c3365848f9)) - leaked memory
- aumenta versão da extensão nos manifestos - ([9226381](https://codeberg.org/notas-literarias/notas-literarias/commit/92263811b1dcb7bed8c215bc555b710f956e699f)) - leaked memory

### Build

- migra de webpack para vite - ([bb00b15](https://codeberg.org/notas-literarias/notas-literarias/commit/bb00b157a0ffb18d544501fd5442d22ecfc8bd5b)) - Lohan Yrvine
- organiza melhor estrutura do sistema de build - ([f20b852](https://codeberg.org/notas-literarias/notas-literarias/commit/f20b852060d79b6fcc190a1b4879005d36b87039)) - leaked memory

## [0.3.0](https://codeberg.org/notas-literarias/notas-literarias/compare/v0.2.0..v0.3.0) - 2025-03-09

### Recursos

- adiciona suporte para estrelas normais e minis - ([4405153](https://codeberg.org/notas-literarias/notas-literarias/commit/440515395403832a81576c4e34f6f427699877d7)) - Lohan Yrvine

### Correções de Bugs

- remove css customizado desnecessário - ([e7c0fd6](https://codeberg.org/notas-literarias/notas-literarias/commit/e7c0fd60ee57c3886d9e88269abd513eb988c201)) - Lohan Yrvine

### Refatorações

- torna campo `name` opcional - ([87c8e33](https://codeberg.org/notas-literarias/notas-literarias/commit/87c8e338f9625f4713105c6b0fbc84373dee5ff0)) - Lohan Yrvine
- remove código para futuro suporte de outros sites - ([d8f15a1](https://codeberg.org/notas-literarias/notas-literarias/commit/d8f15a17ddd7c0a0ca56acfd737ec01c9fdcb59c)) - Lohan Yrvine

### Tarefas Diversas

- melhora organização dos scripts - ([0a6b4cb](https://codeberg.org/notas-literarias/notas-literarias/commit/0a6b4cba669be361603a6880b88b2c6c64df63d2)) - Lohan Yrvine
- aumenta versão da extensão no manifesto - ([407fc8b](https://codeberg.org/notas-literarias/notas-literarias/commit/407fc8b5ceaa45b0eceabeac7ff494f21816c733)) - Lohan Yrvine

## [0.2.0](https://codeberg.org/notas-literarias/notas-literarias/compare/v0.1.0..v0.2.0) - 2025-01-18

### Recursos

- display goodreads' rating on kindle e-books - ([d71b3ec](https://codeberg.org/notas-literarias/notas-literarias/commit/d71b3ecfe9efe8c3042401fd84c4bfbebaf89748)) - Lohan Yrvine

### Correções de Bugs

- log level of some error messages - ([7467dd4](https://codeberg.org/notas-literarias/notas-literarias/commit/7467dd4f7fa328b3fe3920da2420a7aab0c04adb)) - Lohan Yrvine
- use of 'star' instead of 'star-mini' - ([58f9fe3](https://codeberg.org/notas-literarias/notas-literarias/commit/58f9fe3d3eadd6d70d2736b9e5759b32a7d5605e)) - Lohan Yrvine
- get book's code even when more than one code format in present - ([19b15fc](https://codeberg.org/notas-literarias/notas-literarias/commit/19b15fcc9c2046f11b59e4e31fa8173194d36ba3)) - Lohan Yrvine

### Refatorações

- use an inteface instead of functions to parse - ([42e8ad7](https://codeberg.org/notas-literarias/notas-literarias/commit/42e8ad7f50cf9fe5b64e11e7fc1b8bc078509a13)) - Lohan Yrvine
- split `insertBookRatingElement` into smaller functions - ([75e0708](https://codeberg.org/notas-literarias/notas-literarias/commit/75e07088935df72808addbbae59f02ead77ae87a)) - Lohan Yrvine
- change messages' string literals to enums - ([aa3deff](https://codeberg.org/notas-literarias/notas-literarias/commit/aa3deff3210694f633cb1805c123107449c7b65d)) - Lohan Yrvine

### Tarefas Diversas

- disable enum initializer requirement - ([40632c0](https://codeberg.org/notas-literarias/notas-literarias/commit/40632c046a7ec525c4403a3b89225d4ce2207743)) - Lohan Yrvine
- update license's year - ([fecb7ce](https://codeberg.org/notas-literarias/notas-literarias/commit/fecb7ce9c48f4bea15974b7e2fd3120b7ac443d8)) - Lohan Yrvine

## [0.1.0] - 2024-12-17

### Recursos

- get ASIN and ISBN codes from the page - ([b21ad9a](https://codeberg.org/notas-literarias/notas-literarias/commit/b21ad9ab75637a5c9e9f45dc7af6821420774bb3)) - Lohan Yrvine
- logger - ([0209c55](https://codeberg.org/notas-literarias/notas-literarias/commit/0209c5557e6ba2d39d66c3f6b5d01c142a6a1193)) - Lohan Yrvine
- add webpack bundler and polyfill browser api - ([a0a1c27](https://codeberg.org/notas-literarias/notas-literarias/commit/a0a1c27b9b86d4e95e4a49003276b2292e17cf11)) - Lohan Yrvine
- get goodreads rating by isbn - ([46ff166](https://codeberg.org/notas-literarias/notas-literarias/commit/46ff16612b2fb1ea83f4b050b1ce4bcca6a23156)) - Lohan Yrvine
- incomplete rating insertion on product page - ([47e6925](https://codeberg.org/notas-literarias/notas-literarias/commit/47e6925c4147fda42ce192c864bd38b53309fc7a)) - Lohan Yrvine
- get full review from goodreads - ([e37540e](https://codeberg.org/notas-literarias/notas-literarias/commit/e37540e5bcacd40b892c83c4e478ac27a07fdb7c)) - Lohan Yrvine
- change review count to goodreads' one - ([5ed08d3](https://codeberg.org/notas-literarias/notas-literarias/commit/5ed08d36d8af7fdf856d1cbe3c5d48ccbc88d3ac)) - Lohan Yrvine
- use `any` in logger functions - ([2471c5f](https://codeberg.org/notas-literarias/notas-literarias/commit/2471c5f6ddc6e04cdf17dd4be3d7c6fa4117f1cf)) - Lohan Yrvine
- add pretty object logging - ([372b6a0](https://codeberg.org/notas-literarias/notas-literarias/commit/372b6a03dad87736fee208e1ff26fc5f58302b25)) - Lohan Yrvine
- improve product's code capture - ([8ddb939](https://codeberg.org/notas-literarias/notas-literarias/commit/8ddb9391c8a8ed7c0576cc01679bcdbb3254df76)) - Lohan Yrvine

### Correções de Bugs

- product logs outside a product page - ([0256d37](https://codeberg.org/notas-literarias/notas-literarias/commit/0256d3778d195297ac8344b5862913518d038563)) - Lohan Yrvine
- throw errors on elements not being found - ([ee4001f](https://codeberg.org/notas-literarias/notas-literarias/commit/ee4001f953295ecbd8c6e087a922a74fb1433e12)) - Lohan Yrvine
- remove unsupported domains - ([c70883f](https://codeberg.org/notas-literarias/notas-literarias/commit/c70883fc4a1a47cd546396c911ae913482f33142)) - Lohan Yrvine
- small adjustments - ([1ead87c](https://codeberg.org/notas-literarias/notas-literarias/commit/1ead87c1670bfa1f698d6f21a385fce495af341b)) - Lohan Yrvine

### Refatorações

- move logger to its own file - ([15b3c98](https://codeberg.org/notas-literarias/notas-literarias/commit/15b3c984899d8a991e895da887a2b21f7cebf741)) - Lohan Yrvine
- use `module.exports` in logger file - ([467e5f4](https://codeberg.org/notas-literarias/notas-literarias/commit/467e5f423eda1e4de93e35f00f5c1e75b0c1ae3e)) - Lohan Yrvine
- remove `productDetails` from global scope - ([79fc42c](https://codeberg.org/notas-literarias/notas-literarias/commit/79fc42ca8d9435c0bb0b096e06d01e232e80175a)) - Lohan Yrvine
- move codebase to typescript - ([1277f10](https://codeberg.org/notas-literarias/notas-literarias/commit/1277f10e065ca15a1be53165683d0f2ab710caea)) - Lohan Yrvine
- move messages definitions to `.d.ts` file - ([2f03f04](https://codeberg.org/notas-literarias/notas-literarias/commit/2f03f04e792605d5f2c3c8dd0a1749d93d6a38dc)) - Lohan Yrvine

### Documentação

- add jsdoc annotations - ([b320c17](https://codeberg.org/notas-literarias/notas-literarias/commit/b320c17e7483f3b22d5f3ec27aac75139da8d40a)) - Lohan Yrvine

### Tarefas Diversas

- add lefthook config - ([c664e6d](https://codeberg.org/notas-literarias/notas-literarias/commit/c664e6da4d8d100b090e465b52fd19b46a8bf645)) - Lohan Yrvine
- add possibly all amazon current regions - ([6261847](https://codeberg.org/notas-literarias/notas-literarias/commit/6261847f5b9d41ab668833aeeee36237e3c0f02b)) - Lohan Yrvine
- change lefthook pre-commit command name - ([b7ec228](https://codeberg.org/notas-literarias/notas-literarias/commit/b7ec2280b6c2078de18f18132b326ce2e55a46cf)) - Lohan Yrvine
- use `module.exports` in prettier configs - ([69b277d](https://codeberg.org/notas-literarias/notas-literarias/commit/69b277d1ae7e3ab6d0d477067e008a7919e5e4f5)) - Lohan Yrvine
- add `typos` pre-commit command - ([da6baee](https://codeberg.org/notas-literarias/notas-literarias/commit/da6baeebf8e74bb9d6e7e76b752cc8e1ea76b585)) - Lohan Yrvine
- remove `build` pre-commit command - ([5ae6845](https://codeberg.org/notas-literarias/notas-literarias/commit/5ae684540caddab72bb0d73bb1d248e9ba6e55ba)) - Lohan Yrvine
- update dependencies - ([eff8d2b](https://codeberg.org/notas-literarias/notas-literarias/commit/eff8d2ba9e08183dd64c17f9a52ea79d1f9ea769)) - Lohan Yrvine

<!-- gerado por git-cliff -->
