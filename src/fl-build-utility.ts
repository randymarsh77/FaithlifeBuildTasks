import * as path from 'path';
import * as vscode from 'vscode';
import { ISettings } from './settings';
import { TargetTaskType } from './types';

export function getFingerprintingFiles(folder: string) {
	return [
		path.join(folder, 'build.ps1'),
		path.join(folder, 'tools', 'Build.csproj'),
		path.join(folder, 'tools', 'Build.cs'),
	];
}

interface FLBuildTaskDefinition extends vscode.TaskDefinition {
	target: string;
}

export function createTask(
	workspaceFolder: vscode.WorkspaceFolder,
	target: string,
	settings: ISettings
) {
	const kind: FLBuildTaskDefinition = {
		type: TargetTaskType,
		target,
	};
	const flags = settings?.flagsForTarget[target] || '';
	const task = new vscode.Task(
		kind,
		workspaceFolder,
		`${target} ${flags}`.trim(),
		TargetTaskType,
		new vscode.ShellExecution(`pwsh build.ps1 ${target} ${flags}`.trim()),
		[]
	);
	if (isBuildTarget(target)) {
		task.group = vscode.TaskGroup.Build;
	} else if (isTestTarget(target)) {
		task.group = vscode.TaskGroup.Test;
	} else if (isCleanTarget(target)) {
		task.group = vscode.TaskGroup.Clean;
	}

	return task;
}

const buildNames: string[] = ['build', 'package'];
function isBuildTarget(name: string): boolean {
	return isTargetOfType(buildNames, name);
}

const testNames: string[] = ['test'];
function isTestTarget(name: string): boolean {
	return isTargetOfType(testNames, name);
}

const cleanNames: string[] = ['clean'];
function isCleanTarget(name: string): boolean {
	return isTargetOfType(cleanNames, name);
}

function isTargetOfType(types: string[], name: string) {
	for (const t of types) {
		if (name.indexOf(name) !== -1) {
			return true;
		}
	}
	return false;
}
