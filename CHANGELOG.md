# Changelog

Todas as principais mudanças deste projeto serão documentadas neste arquivo.
Veja [conventional commits](https://www.conventionalcommits.org/) para as
diretrizes de commit.

---

## [0.3.0](https://github.com/leakedmemory/notas-literarias/compare/v0.2.0..v0.3.0) - 2025-03-09

### Recursos

- adiciona suporte para estrelas normais e minis -
  ([4405153](https://github.com/leakedmemory/notas-literarias/commit/440515395403832a81576c4e34f6f427699877d7)) -
  Lohan Yrvine

### Correções de Bugs

- remove css customizado desnecessário -
  ([e7c0fd6](https://github.com/leakedmemory/notas-literarias/commit/e7c0fd60ee57c3886d9e88269abd513eb988c201)) -
  Lohan Yrvine

### Refatorações

- torna campo `name` opcional -
  ([87c8e33](https://github.com/leakedmemory/notas-literarias/commit/87c8e338f9625f4713105c6b0fbc84373dee5ff0)) -
  Lohan Yrvine
- remove código para futuro suporte de outros sites -
  ([d8f15a1](https://github.com/leakedmemory/notas-literarias/commit/d8f15a17ddd7c0a0ca56acfd737ec01c9fdcb59c)) -
  Lohan Yrvine

### Tarefas Diversas

- melhora organização dos scripts -
  ([0a6b4cb](https://github.com/leakedmemory/notas-literarias/commit/0a6b4cba669be361603a6880b88b2c6c64df63d2)) -
  Lohan Yrvine
- aumenta versão da extensão no manifesto -
  ([407fc8b](https://github.com/leakedmemory/notas-literarias/commit/407fc8b5ceaa45b0eceabeac7ff494f21816c733)) -
  Lohan Yrvine

---

## [0.2.0](https://github.com/leakedmemory/notas-literarias/compare/v0.1.0..v0.2.0) - 2025-01-18

### Recursos

- display goodreads' rating on kindle e-books -
  ([d71b3ec](https://github.com/leakedmemory/notas-literarias/commit/d71b3ecfe9efe8c3042401fd84c4bfbebaf89748)) -
  Lohan Yrvine

### Correções de Bugs

- log level of some error messages -
  ([7467dd4](https://github.com/leakedmemory/notas-literarias/commit/7467dd4f7fa328b3fe3920da2420a7aab0c04adb)) -
  Lohan Yrvine
- use of 'star' instead of 'star-mini' -
  ([58f9fe3](https://github.com/leakedmemory/notas-literarias/commit/58f9fe3d3eadd6d70d2736b9e5759b32a7d5605e)) -
  Lohan Yrvine
- get book's code even when more than one code format in present -
  ([19b15fc](https://github.com/leakedmemory/notas-literarias/commit/19b15fcc9c2046f11b59e4e31fa8173194d36ba3)) -
  Lohan Yrvine

### Refatorações

- use an interface instead of functions to parse -
  ([42e8ad7](https://github.com/leakedmemory/notas-literarias/commit/42e8ad7f50cf9fe5b64e11e7fc1b8bc078509a13)) -
  Lohan Yrvine
- split `insertBookRatingElement` into smaller functions -
  ([75e0708](https://github.com/leakedmemory/notas-literarias/commit/75e07088935df72808addbbae59f02ead77ae87a)) -
  Lohan Yrvine
- change messages' string literals to enums -
  ([aa3deff](https://github.com/leakedmemory/notas-literarias/commit/aa3deff3210694f633cb1805c123107449c7b65d)) -
  Lohan Yrvine

### Tarefas Diversas

- disable enum initializer requirement -
  ([40632c0](https://github.com/leakedmemory/notas-literarias/commit/40632c046a7ec525c4403a3b89225d4ce2207743)) -
  Lohan Yrvine
- update license's year -
  ([fecb7ce](https://github.com/leakedmemory/notas-literarias/commit/fecb7ce9c48f4bea15974b7e2fd3120b7ac443d8)) -
  Lohan Yrvine

---

## [0.1.0] - 2024-12-17

### Recursos

- get ASIN and ISBN codes from the page -
  ([b21ad9a](https://github.com/leakedmemory/notas-literarias/commit/b21ad9ab75637a5c9e9f45dc7af6821420774bb3)) -
  Lohan Yrvine
- logger -
  ([0209c55](https://github.com/leakedmemory/notas-literarias/commit/0209c5557e6ba2d39d66c3f6b5d01c142a6a1193)) -
  Lohan Yrvine
- add webpack bundler and polyfill browser api -
  ([a0a1c27](https://github.com/leakedmemory/notas-literarias/commit/a0a1c27b9b86d4e95e4a49003276b2292e17cf11)) -
  Lohan Yrvine
- get goodreads rating by isbn -
  ([46ff166](https://github.com/leakedmemory/notas-literarias/commit/46ff16612b2fb1ea83f4b050b1ce4bcca6a23156)) -
  Lohan Yrvine
- incomplete rating insertion on product page -
  ([47e6925](https://github.com/leakedmemory/notas-literarias/commit/47e6925c4147fda42ce192c864bd38b53309fc7a)) -
  Lohan Yrvine
- get full review from goodreads -
  ([e37540e](https://github.com/leakedmemory/notas-literarias/commit/e37540e5bcacd40b892c83c4e478ac27a07fdb7c)) -
  Lohan Yrvine
- change review count to goodreads' one -
  ([5ed08d3](https://github.com/leakedmemory/notas-literarias/commit/5ed08d36d8af7fdf856d1cbe3c5d48ccbc88d3ac)) -
  Lohan Yrvine
- use `any` in logger functions -
  ([2471c5f](https://github.com/leakedmemory/notas-literarias/commit/2471c5f6ddc6e04cdf17dd4be3d7c6fa4117f1cf)) -
  Lohan Yrvine
- add pretty object logging -
  ([372b6a0](https://github.com/leakedmemory/notas-literarias/commit/372b6a03dad87736fee208e1ff26fc5f58302b25)) -
  Lohan Yrvine
- improve product's code capture -
  ([8ddb939](https://github.com/leakedmemory/notas-literarias/commit/8ddb9391c8a8ed7c0576cc01679bcdbb3254df76)) -
  Lohan Yrvine

### Correções de Bugs

- product logs outside a product page -
  ([0256d37](https://github.com/leakedmemory/notas-literarias/commit/0256d3778d195297ac8344b5862913518d038563)) -
  Lohan Yrvine
- throw errors on elements not being found -
  ([ee4001f](https://github.com/leakedmemory/notas-literarias/commit/ee4001f953295ecbd8c6e087a922a74fb1433e12)) -
  Lohan Yrvine
- remove unsupported domains -
  ([c70883f](https://github.com/leakedmemory/notas-literarias/commit/c70883fc4a1a47cd546396c911ae913482f33142)) -
  Lohan Yrvine
- small adjustments -
  ([1ead87c](https://github.com/leakedmemory/notas-literarias/commit/1ead87c1670bfa1f698d6f21a385fce495af341b)) -
  Lohan Yrvine

### Refatorações

- move logger to its own file -
  ([15b3c98](https://github.com/leakedmemory/notas-literarias/commit/15b3c984899d8a991e895da887a2b21f7cebf741)) -
  Lohan Yrvine
- use `module.exports` in logger file -
  ([467e5f4](https://github.com/leakedmemory/notas-literarias/commit/467e5f423eda1e4de93e35f00f5c1e75b0c1ae3e)) -
  Lohan Yrvine
- remove `productDetails` from global scope -
  ([79fc42c](https://github.com/leakedmemory/notas-literarias/commit/79fc42ca8d9435c0bb0b096e06d01e232e80175a)) -
  Lohan Yrvine
- move codebase to typescript -
  ([1277f10](https://github.com/leakedmemory/notas-literarias/commit/1277f10e065ca15a1be53165683d0f2ab710caea)) -
  Lohan Yrvine
- move messages definitions to `.d.ts` file -
  ([2f03f04](https://github.com/leakedmemory/notas-literarias/commit/2f03f04e792605d5f2c3c8dd0a1749d93d6a38dc)) -
  Lohan Yrvine

### Documentação

- add jsdoc annotations -
  ([b320c17](https://github.com/leakedmemory/notas-literarias/commit/b320c17e7483f3b22d5f3ec27aac75139da8d40a)) -
  Lohan Yrvine

### Tarefas Diversas

- add lefthook config -
  ([c664e6d](https://github.com/leakedmemory/notas-literarias/commit/c664e6da4d8d100b090e465b52fd19b46a8bf645)) -
  Lohan Yrvine
- add possibly all amazon current regions -
  ([6261847](https://github.com/leakedmemory/notas-literarias/commit/6261847f5b9d41ab668833aeeee36237e3c0f02b)) -
  Lohan Yrvine
- change lefthook pre-commit command name -
  ([b7ec228](https://github.com/leakedmemory/notas-literarias/commit/b7ec2280b6c2078de18f18132b326ce2e55a46cf)) -
  Lohan Yrvine
- use `module.exports` in prettier configs -
  ([69b277d](https://github.com/leakedmemory/notas-literarias/commit/69b277d1ae7e3ab6d0d477067e008a7919e5e4f5)) -
  Lohan Yrvine
- add `typos` pre-commit command -
  ([da6baee](https://github.com/leakedmemory/notas-literarias/commit/da6baeebf8e74bb9d6e7e76b752cc8e1ea76b585)) -
  Lohan Yrvine
- remove `build` pre-commit command -
  ([5ae6845](https://github.com/leakedmemory/notas-literarias/commit/5ae684540caddab72bb0d73bb1d248e9ba6e55ba)) -
  Lohan Yrvine
- update dependencies -
  ([eff8d2b](https://github.com/leakedmemory/notas-literarias/commit/eff8d2ba9e08183dd64c17f9a52ea79d1f9ea769)) -
  Lohan Yrvine

<!-- gerado por git-cliff -->
