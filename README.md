# @zzzen/pyright-internal

Repackaged [pyright-internal](https://github.com/microsoft/pyright/tree/main/packages/pyright-internal) with type declaration enabled.

# Installation

```sh
npm i @zzzen/pyright-internal
```

# Demo

print ast of code

```ts
import { ImportResolver } from "@zzzen/pyright-internal/dist/analyzer/importResolver";
import { printParseNodeType } from "@zzzen/pyright-internal/dist/analyzer/parseTreeUtils";
import { ParseTreeWalker } from "@zzzen/pyright-internal/dist/analyzer/parseTreeWalker";
import { Program } from "@zzzen/pyright-internal/dist/analyzer/program";
import { ConfigOptions } from "@zzzen/pyright-internal/dist/common/configOptions";
import {
  lib,
  sitePackages,
} from "@zzzen/pyright-internal/dist/common/pathConsts";
import {
  combinePaths,
  normalizeSlashes,
} from "@zzzen/pyright-internal/dist/common/pathUtils";
import { ParseNode } from "@zzzen/pyright-internal/dist/parser/parseNodes";
import { PyrightFileSystem } from "@zzzen/pyright-internal/dist/pyrightFileSystem";
import { TestAccessHost } from "@zzzen/pyright-internal/dist/tests/harness/testAccessHost";
import { TestFileSystem } from "@zzzen/pyright-internal/dist/tests/harness/vfs/filesystem";

const FILE_PATH = "/t.py";

const defaultCode = `
def f(a = 1):
  return a
f(1)
`;

// console.log(process.execArgv.join())
const libraryRoot = combinePaths(normalizeSlashes("/"), lib, sitePackages);

const tfs = new TestFileSystem(false, {
  files: {
    [FILE_PATH]: defaultCode,
  },
});

const fs = new PyrightFileSystem(tfs);

const configOptions = new ConfigOptions(normalizeSlashes("/"));
configOptions.typeshedPath = normalizeSlashes(
  "/node_modules/pyright/dist/typeshed-fallback"
);
const importResolver = new ImportResolver(
  fs,
  configOptions,
  new TestAccessHost(fs.getModulePath(), [libraryRoot])
);
const program = new Program(importResolver, configOptions);
program.setTrackedFiles([FILE_PATH]);

while (program.analyze()) {
  // Continue to call analyze until it completes. Since we're not
  // specifying a timeout, it should complete the first time.
}

const sourceFile = program.getSourceFile(FILE_PATH)!;

class PrintWalker extends ParseTreeWalker {
  override visitNode(node: ParseNode) {
    console.log(printParseNodeType(node.nodeType));
    return super.visitNode(node);
  }
}

new PrintWalker().walk(sourceFile.getParseResults()!.parseTree);
```

For more details, checkout [pyright-ast-viewer](https://github.com/Zzzen/pyright-ast-viewer).