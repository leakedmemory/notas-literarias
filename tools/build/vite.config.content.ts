import { mergeConfig, type UserConfig } from "vite";

import {
  name,
  devConfig,
  isDev,
  prodConfig,
  targetBrowser,
} from "./vite.config.base";
import { copyManifest } from "./plugins";
import { res } from "./utils";

const contentConfig: UserConfig = {
  plugins: [copyManifest(targetBrowser)],
  build: {
    lib: {
      entry: res("src", "content", "index.ts"),
      name: `${name}-content`,
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
