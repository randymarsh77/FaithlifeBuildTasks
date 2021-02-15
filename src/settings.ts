import * as vscode from 'vscode';

export interface ISettings {
	flagsForTarget: { [target: string]: string };
}

export function getSettings(workspace: string): ISettings {
	const buildFlags = getBuildFlags(workspace);
	const packageFlags = getPackageFlags(workspace);
	return {
		flagsForTarget: {
			build: buildFlags,
			package: `${buildFlags} ${packageFlags}`.trim(),
		},
	};
}

function getBuildFlags(workspace: string) {
	const config = vscode.workspace.getConfiguration('Faithlife.Build Tasks');
	const flags = (config.get<string>('BuildFlags') || '')
		.split(';')
		.map((x) => x.trim())
		.filter((x) => x.startsWith(workspace) || x.startsWith('All'))
		.map((x) => x.replace(`${workspace}:`, '').replace('All:', '').trim());

	return flags.join(' ');
}

function getPackageFlags(workspace: string) {
	const config = vscode.workspace.getConfiguration('Faithlife.Build Tasks');
	const output = config.get<string>('NugetOutput');
	return output ? `--nuget-output ${output}` : '';
}
