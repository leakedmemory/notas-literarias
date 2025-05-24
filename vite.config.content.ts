import { mergeConfig, type UserConfig } from "vite";

import { devConfig, prodConfig } from "./vite.config.base";
import { res, PACKAGE_NAME, IS_DEV, TARGET } from "./scripts/utils";

const contentConfig: UserConfig = {
  build: {
    lib: {
      entry: res("src", "content", "index.ts"),
      name: `${PACKAGE_NAME}-content`,
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

export default mergeConfig(IS_DEV ? devConfig : prodConfig, contentConfig);
