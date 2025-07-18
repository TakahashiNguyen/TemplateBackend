import { Project } from 'ts-morph';

const modelsProject = new Project(),
	modelsFiles = modelsProject.addSourceFilesAtPaths([
		'src/**/*.dto.ts',
		'src/**/dto.ts',
		'src/**/types.ts',
		'src/utils/error/*',
		'src/utils/index.ts',
	]),
	modelsOut = modelsProject.createSourceFile('./types/index.ts', '', {
		overwrite: true,
	});
for (const file of modelsFiles) {
	modelsOut.addExportDeclaration({
		moduleSpecifier: `../src/${file.getFilePath().split('src')[1].slice(1, -3)}`,
	});
}
modelsOut.saveSync();
