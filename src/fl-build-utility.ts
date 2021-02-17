import * as vscode from 'vscode';
import { ISettings } from './settings';
import { TargetTaskType } from './types';

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
	const flags = settings.flagsForTarget[target] || '';
	const { commandLine, workingDirectory } = settings;
	const task = new vscode.Task(
		kind,
		workspaceFolder,
		`${target} ${flags}`.trim(),
		TargetTaskType,
		new vscode.ShellExecution(`${commandLine} ${target} ${flags}`.trim(), {
			cwd: workingDirectory,
		}),
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
		if (name.indexOf(t) !== -1) {
			return true;
		}
	}
	return false;
}
