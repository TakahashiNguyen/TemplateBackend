import {
	ExportedDeclarations,
	InterfaceDeclaration,
	Project,
	SourceFile,
	ts,
	VariableDeclarationKind,
} from 'ts-morph';

const IKeysProj = new Project(),
	IKeysFiles = IKeysProj.addSourceFilesAtPaths('src/**/*.ts'),
	IKeysOut = IKeysProj.createSourceFile('./src/models.ts', '', {
		overwrite: true,
	});
function createKeys(node: InterfaceDeclaration, sourceFile: SourceFile) {
	function getInterface(node: any): string[] {
		if (node.getKind() !== ts.SyntaxKind.InterfaceDeclaration) return [];

		const extendedTypes = node
				.getExtends()
				.map((expr) => sourceFile.getInterface(expr.getExpression().getText())),
			extendedInterfaces: string[] = node
				.getProperties()
				.map((i) => i.getName());

		for (const extendedType of extendedTypes)
			extendedInterfaces.push(...getInterface(extendedType));

		return extendedInterfaces.filter(
			(item, index) => extendedInterfaces.indexOf(item) === index,
		);
	}

	const allKeys = getInterface(node).sort((a, b) => a.localeCompare(b));
	IKeysOut.addVariableStatement({
		isExported: true,
		declarationKind: VariableDeclarationKind.Const,
		declarations: [
			{
				name: `${node.getName()}Keys`,
				initializer: (writer) =>
					writer.write(`${JSON.stringify(allKeys)} as const`),
			},
		],
	});
}
for (const file of IKeysFiles) {
	if (/(build.ts|types.ts|models.ts)/.test(file.getBaseName())) continue;

	for (const intfce of file.getInterfaces()) createKeys(intfce, file);
}
IKeysOut.saveSync();

const modelsProject = new Project(),
	modelsFiles = modelsProject.addSourceFilesAtPaths([
		'src/**/*model*.ts',
		'src/utils/utils.ts',
	]),
	modelsOut = modelsProject.createSourceFile('./src/types.ts', '', {
		overwrite: true,
	});
for (const file of modelsFiles) {
	const exportNames: string[] = [];
	const exportDeclarations: ExportedDeclarations[] = [];
	for (const [exportName, declarations] of file.getExportedDeclarations()) {
		exportNames.push(exportName);
		exportDeclarations.push(...declarations);
	}

	if (exportNames.length) {
		modelsOut.addExportDeclaration({
			namedExports: exportNames,
			moduleSpecifier: `./${file.getFilePath().split('src')[1].slice(1, -3)}`,
		});
	}
}
modelsOut.saveSync();
