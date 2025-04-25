import { mergeConfig, type UserConfig } from "vite";

import { name, devConfig, isDev, prodConfig } from "./vite.config.base";
import { res } from "./utils";

const backgroundConfig: UserConfig = {
  build: {
    lib: {
      entry: res("src", "background", "index.ts"),
      name: `${name}-background`,
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "background.global.js",
        extend: true,
      },
    },
  },
};

export default mergeConfig(isDev ? devConfig : prodConfig, backgroundConfig);
