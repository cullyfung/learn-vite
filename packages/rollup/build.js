const { default: commonjs } = require("@rollup/plugin-commonjs");
const { default: nodeResolve } = require("@rollup/plugin-node-resolve");
const rollup = require("rollup");

const inputOptions = {
  input: "./src/index.js",
  external: [],
  plugins: [nodeResolve(), commonjs()],
};

const outputOptionsList = [
  {
    dir: "dist/es",
    entryFileNames: `[name].[hash].js`,
    chunkFileNames: "chunk-[hash].js",
    assetFileNames: "assets/[name]-[hash][extname]",
    format: "es",
    sourcemap: true,
    globals: {
      lodash: "_",
    },
  },
];

async function build() {
  let bundle;
  let buildFailed = false;
  try {
    bundle = await rollup.rollup(inputOptions);
    for (const outputOptions of outputOptionsList) {
      const { output } = await bundle.generate(outputOptions);

      await bundle.write(outputOptions);
    }
  } catch (err) {
    buildFailed = true;
    console.log(err);
  }

  if (bundle) {
    await bundle.close();
  }

  process.exit(buildFailed ? 1 : 0);
  console.log("finished");
}

build();
