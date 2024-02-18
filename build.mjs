#!/usr/bin/env zx

// import "zx/globals";
import * as fs from "fs";

const tsconfigPath = "./pyright/packages/pyright-internal/tsconfig.json";
const packagePath = "./pyright/packages/pyright-internal/package.json";

const tsconfig = require(tsconfigPath);
const packageJson = require(packagePath);

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
await $`mv out/src ../../../dist`;
cd("../../../");

const date = await $`date '+%Y%m%d'`;
packageJson.name = "@zzzen/pyright-internal";
packageJson.repository = "github:Zzzen/pyright-packager"
packageJson.version = `1.2.0-dev.${date.stdout.trim()}`;
packageJson.private = false;

fs.writeFileSync("package.json", JSON.stringify(packageJson, undefined, 2));
