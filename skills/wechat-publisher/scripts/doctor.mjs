#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const checks = [];

checks.push(checkCommand("node", ["--version"]));
checks.push(checkCommand("npm", ["--version"]));
checks.push(checkCommand("wechat-renderer", ["--version"]));
checks.push(checkCommand("wechat-publisher", ["--version"]));

const configPath = path.resolve("wechat-publisher.config.json");
checks.push(await checkConfig(configPath));

console.log(JSON.stringify(checks, null, 2));

function checkCommand(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: false,
  });
  return {
    check: command,
    ok: result.status === 0,
    value: result.status === 0 ? result.stdout.trim() : null,
    message: result.status === 0 ? "ok" : `${command} is not available.`,
  };
}

async function checkConfig(filePath) {
  try {
    await access(filePath, constants.R_OK);
    const parsed = JSON.parse(await readFile(filePath, "utf8"));
    return {
      check: "publisher-config",
      ok: true,
      value: filePath,
      tokenMode: parsed.wechat?.tokenMode ?? null,
      hasAppId: Boolean(parsed.wechat?.appId),
      hasAppSecret: Boolean(parsed.wechat?.appSecret),
      hasCenterUrl: Boolean(parsed.center?.url),
      hasCenterAccount: Boolean(parsed.center?.account),
      hasCenterApiKey: Boolean(parsed.center?.apiKey),
      message: "ok",
    };
  } catch {
    return {
      check: "publisher-config",
      ok: false,
      value: filePath,
      message: "Config not found. Run wechat-publisher init first before creating a real draft.",
    };
  }
}
