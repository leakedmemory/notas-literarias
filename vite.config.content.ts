import { mergeConfig, type UserConfig } from "vite";
import { IS_DEV, PACKAGE_NAME, res } from "./scripts/utils";
import { devConfig, prodConfig } from "./vite.config.base";

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
