## Usage

1. Make sure you have rust (https://www.rust-lang.org/tools/install) and wasm-pack (https://rustwasm.github.io/wasm-pack/installer/) installed

2. run

```sh
wasm-pack build --target web
```

3. copy the `pkg` folder to `app/wasm`

## Run tests

1. test

```zsh
wasm-pack test --node
```
