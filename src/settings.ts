import * as path from 'path';
import * as vscode from 'vscode';

export interface ISettings {
	commandLine: string;
	flagsForTarget: { [target: string]: string };
	fingerPrintingFiles: {
		bootstrapperScriptPath: string;
		toolsDirectoryPath: string;
		allFiles: string[];
	};
}

export function getSettings(workspace: vscode.WorkspaceFolder): ISettings {
	const buildFlags = getBuildFlags(workspace.name);
	const packageFlags = getPackageFlags();
	const { commandLine, ...fingerPrintingFiles } = getFingerPrintingFiles(
		workspace.uri.fsPath
	);
	return {
		commandLine,
		flagsForTarget: {
			build: buildFlags,
			package: `${buildFlags} ${packageFlags}`.trim(),
		},
		fingerPrintingFiles,
	};
}

function getBuildFlags(workspace: string) {
	const config = vscode.workspace.getConfiguration('Faithlife.Build Tasks');
	const flags = (config.get<string>('BuildFlags') || '')
		.split(';')
		.map((x) => x?.trim())
		.filter((x) => x?.length > 0)
		.map((x) => x.split(':'))
		.flatMap(([scopes, flags]) =>
			scopes.split(',').map((scope) => [scope.toLowerCase(), flags])
		)
		.filter(([scope, _]) => workspace.toLowerCase().startsWith(scope) || scope === 'all')
		.map(([_, flags]) => flags.trim());

	return flags.join(' ');
}

function getPackageFlags() {
	const config = vscode.workspace.getConfiguration('Faithlife.Build Tasks');
	const output = config.get<string>('NugetOutput');
	return output ? `--nuget-output ${output}` : '';
}

function getFingerPrintingFiles(folder: string) {
	const config = vscode.workspace.getConfiguration('Faithlife.Build Tasks');

	const bootstrapperScriptPathOverride = config.get<string>('BootstrapperScriptPath');
	const bootstrapperScriptPath = resolveExtension(
		bootstrapperScriptPathOverride && path.isAbsolute(bootstrapperScriptPathOverride)
			? bootstrapperScriptPathOverride
			: path.join(folder, bootstrapperScriptPathOverride ?? 'build.ps1')
	);

	const toolsDirectoryPathOverride = config.get<string>('ToolsDirectoryPath');
	const toolsDirectoryPath =
		toolsDirectoryPathOverride && path.isAbsolute(toolsDirectoryPathOverride)
			? toolsDirectoryPathOverride
			: path.join(folder, toolsDirectoryPathOverride ?? 'tools');

	const command = bootstrapperScriptPath.endsWith('sh') ? 'sh' : 'pwsh';
	const commandLine = `${command} ${bootstrapperScriptPath}`;

	return {
		commandLine,
		bootstrapperScriptPath,
		toolsDirectoryPath,
		allFiles: [
			bootstrapperScriptPath,
			path.join(toolsDirectoryPath, 'Build.csproj'),
			path.join(toolsDirectoryPath, 'Build.cs'),
		],
	};
}

function resolveExtension(path: string) {
	const extensionExpression = path.split('.').reverse()[0];
	const isMultiTarget =
		extensionExpression.startsWith('[') && extensionExpression.endsWith(']');
	const options = (isMultiTarget &&
		extensionExpression.replace('[', '').replace(']', '').split('|')) || [
		extensionExpression,
	];
	const isWin = process.platform === 'win32';
	const extension = options.filter((x) => x === 'ps1' || isWin === (x !== 'sh'))[0];
	return path.split('.').slice(0, -1).concat(extension).join('.');
}
