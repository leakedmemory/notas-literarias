import { mergeConfig, type UserConfig } from "vite";

import { devConfig, prodConfig } from "./vite.config.base";
import { res, packageName, isDev, target } from "./utils";

const contentConfig: UserConfig = {
  build: {
    lib: {
      entry: res("src", "content", "index.ts"),
      name: `${packageName}-content`,
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "content.global.js",
        extend: true,
      },
    },
  },
};

export default mergeConfig(isDev ? devConfig : prodConfig, contentConfig);
