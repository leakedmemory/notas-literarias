import { mergeConfig, type UserConfig } from "vite";

import { devConfig, prodConfig } from "./vite.config.base";
import { res, PACKAGE_NAME, IS_DEV } from "./scripts/utils";

const backgroundConfig: UserConfig = {
  build: {
    lib: {
      entry: res("src", "background", "index.ts"),
      name: `${PACKAGE_NAME}-background`,
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

export default mergeConfig(IS_DEV ? devConfig : prodConfig, backgroundConfig);
