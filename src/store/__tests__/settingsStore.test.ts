import { describe, expect, it } from "vitest";
import { migrateSettings } from "@/store/settingsStore";

interface LegacyConfig {
  key?: string;
  base?: string;
  baseUrl?: string;
  model?: string;
}

describe("migrateSettings · v1 → v2", () => {
  it("旧 {key, base} 迁移为 {key, baseUrl, model} 并补齐 custom", () => {
    const persisted: Record<string, unknown> = {
      agentApiConfigs: {
        qwen: { key: "sk-old", base: "https://dashscope.example.com/v1" },
        gpt: { key: "sk-gpt", base: "https://api.openai.com/v1" },
      },
    };
    const out = migrateSettings(persisted, 1) as Record<string, unknown>;
    const cfg = out.agentApiConfigs as Record<string, LegacyConfig>;
    expect(cfg.qwen?.key).toBe("sk-old");
    expect(cfg.qwen?.baseUrl).toBe("https://dashscope.example.com/v1");
    expect(cfg.qwen?.model).toBe("qwen-plus");
    expect(cfg.gpt?.baseUrl).toBe("https://api.openai.com/v1");
    expect(cfg.custom).toBeDefined();
  });

  it("已是 v2 时原样返回", () => {
    const persisted: Record<string, unknown> = {
      agentApiConfigs: { qwen: { key: "k", baseUrl: "u", model: "m" } },
    };
    const out = migrateSettings(persisted, 2) as Record<string, unknown>;
    const cfg = out.agentApiConfigs as Record<string, LegacyConfig>;
    expect(cfg.qwen?.baseUrl).toBe("u");
  });
});
