declare module "*.wasm" {
  const source: WebAssembly.Module;
  export default source;
}
