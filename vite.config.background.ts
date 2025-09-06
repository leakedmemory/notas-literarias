import { mergeConfig, type UserConfig } from "vite";
import { IS_DEV, PACKAGE_NAME, res } from "./scripts/utils";
import { devConfig, prodConfig } from "./vite.config.base";

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
