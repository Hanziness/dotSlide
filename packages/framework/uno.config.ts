import {
  defineConfig,
  presetIcons,
  presetWind4,
  transformerCompileClass,
} from "unocss";

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: false,
      },
    }),
    presetIcons(),
  ],

  transformers: [
    transformerCompileClass({
      layer: "dotslide",
      classPrefix: "ds-",
    }),
  ],
});
