import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";

import {
  ensureUserConfig,
  parseEnvText,
  readUserConfig,
  selectDeepSeekEnvironment,
} from "../../desktop/src/config";

describe("desktop config", () => {
  it("parses assignments and ignores comments or invalid lines", () => {
    expect(
      parseEnvText("DEEPSEEK_API_KEY=abc\n# comment\nINVALID\nA = value "),
    ).toEqual({
      DEEPSEEK_API_KEY: "abc",
      A: "value",
    });
  });

  it("keeps only supported DeepSeek variables", () => {
    expect(
      selectDeepSeekEnvironment({
        DEEPSEEK_API_KEY: "key",
        DEEPSEEK_MODEL: "model",
        DEEPSEEK_TIMEOUT_MS: "120000",
        DEEPSEEK_MAX_TOKENS: "8192",
        UNSAFE_VALUE: "ignored",
      }),
    ).toEqual({
      DEEPSEEK_API_KEY: "key",
      DEEPSEEK_MODEL: "model",
      DEEPSEEK_TIMEOUT_MS: "120000",
      DEEPSEEK_MAX_TOKENS: "8192",
    });
  });

  it("creates the user config from the public example without overwriting changes", async () => {
    const root = await mkdtemp(join(tmpdir(), "desktop-config-"));
    const example = join(root, "config.example.env");
    const config = join(root, "user", "config.env");
    await writeFile(example, "DEEPSEEK_API_KEY=replace-with-your-key\n", "utf8");

    await ensureUserConfig(config, example);
    expect(await readFile(config, "utf8")).toContain("replace-with-your-key");

    await writeFile(config, "DEEPSEEK_API_KEY=user-key\n", "utf8");
    await ensureUserConfig(config, example);
    expect(await readUserConfig(config)).toEqual({ DEEPSEEK_API_KEY: "user-key" });
  });
});
