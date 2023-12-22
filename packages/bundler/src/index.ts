import { Bundle } from 'magic-string';

export function build(options: BuildOptions) {
  const bundle = new Bundle({
    entry: options.input
  });

  return bundle.build().then(() => {
    return {
      generate: () => bundle.render()
    };
  });
}
