import { Project } from "ts-morph";

const modelsProject = new Project(),
  modelsFiles = modelsProject.addSourceFilesAtPaths([
    "../server/src/**/*.dto.ts",
    "../server/src/**/dto.ts",
    "../server/src/**/types.ts",
    "../server/src/utils/error/*",
    "../server/src/utils/index.ts",
  ]),
  modelsOut = modelsProject.createSourceFile("./main.ts", "", {
    overwrite: true,
  });
for (const file of modelsFiles) {
  modelsOut.addExportDeclaration({
    moduleSpecifier: `../server/src/${file
      .getFilePath()
      .split("src")[1]
      .slice(1, -3)}`,
  });
}
modelsOut.saveSync();
