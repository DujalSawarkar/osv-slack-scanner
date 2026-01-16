#!/usr/bin/env node
/*
  Minimal CLI wrapper.
  We keep this as JS so it works when published without a build step.
  It relies on tsx (already a devDependency here; for publishing you can move it to dependencies).
*/

const { spawnSync } = require("child_process");
const path = require("path");

const entry = path.resolve(__dirname, "cli.ts");
const tsxPkgJson = require.resolve("tsx/package.json");
const tsxCli = path.join(path.dirname(tsxPkgJson), "dist", "cli.cjs");

const result = spawnSync(
  process.execPath,
  [tsxCli, entry, ...process.argv.slice(2)],
  {
    stdio: "inherit",
  }
);

process.exitCode = result.status ?? 1;
