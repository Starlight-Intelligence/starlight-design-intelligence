import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    server: { deps: { inline: ["@starlight/living-design"] } },
    include: ["tests/*.spec.ts", "tests/*.spec.tsx"],
    maxWorkers: 1,
    fileParallelism: false,
  },
});
