import { writeFileSync } from 'node:fs';
import { Project } from 'ts-morph';

import srcPkg from '../package.json';
import destPkg from './package.json';

const modelsProject = new Project(),
	modelsFiles = modelsProject.addSourceFilesAtPaths([
		'../src/**/*.dto.ts',
		'../src/**/dto.ts',
		'../src/**/types.ts',
		'../src/utils/error/*',
		'../src/utils/index.ts',
	]),
	modelsOut = modelsProject.createSourceFile('./main.ts', '', {
		overwrite: true,
	});
for (const file of modelsFiles) {
	modelsOut.addExportDeclaration({
		moduleSpecifier: `../src/${file.getFilePath().split('src')[1].slice(1, -3)}`,
	});
}
modelsOut.saveSync();

const fieldsToCopy: (keyof typeof srcPkg)[] = [
	'description',
	'author',
	'version',
	'private',
	'license',
];

const updated: typeof destPkg = { ...destPkg };

fieldsToCopy.forEach((field) => {
	if (srcPkg[field]) {
		// @ts-expect-error error-free expression
		updated[field as never] = srcPkg[field];
	}
});

updated['name'] = srcPkg['name'] + '-types';

writeFileSync('./package.json', JSON.stringify(updated, null, 2), 'utf-8');
