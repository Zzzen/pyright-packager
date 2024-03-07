#!/usr/bin/env zx

import "npm:zx@7.2.3/globals";
import { parse as parseJson } from "npm:jsonc-parser@3.2.1";
import * as fs from "node:fs";

const tsconfigPath = "./pyright/packages/pyright-internal/tsconfig.json";
const packagePath = "./pyright/packages/pyright-internal/package.json";

const tsconfig = await readJson(tsconfigPath);
const packageJson = await readJson(packagePath);

tsconfig.compilerOptions = Object.assign(tsconfig.compilerOptions, {
  declaration: true,
  preserveConstEnums: true,
});

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, undefined, 2));

cd("pyright");
await $`npm ci`;
cd("./packages/pyright-internal");
await $`npm ci`;
await $`npm run build`;
await $`mv out/packages/pyright-internal/src ../../../dist`;
cd("../../../");

const date = await $`date '+%Y%m%d'`;
packageJson.name = "@zzzen/pyright-internal";
packageJson.repository = "github:Zzzen/pyright-packager";
packageJson.version = `1.2.0-dev.${date.stdout.trim()}`;
packageJson.private = false;

fs.writeFileSync("package.json", JSON.stringify(packageJson, undefined, 2));

/**
 *
 * @param {string} path
 */
async function readJson(path) {
  const content = await Deno.readTextFile(path);
  const errors = [];
  const val = parseJson(content, errors, {
    allowTrailingComma: true,
  });
  if (errors.length > 0) {
    console.error(errors);
    throw new Error(`failed to parse json: ${path}`);
  }
  return val;
}
