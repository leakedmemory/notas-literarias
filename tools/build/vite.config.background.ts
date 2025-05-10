import { mergeConfig, type UserConfig } from "vite";

import { devConfig, prodConfig } from "./vite.config.base";
import { res, packageName, isDev } from "./utils";

const backgroundConfig: UserConfig = {
  build: {
    lib: {
      entry: res("src", "background", "index.ts"),
      name: `${packageName}-background`,
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
