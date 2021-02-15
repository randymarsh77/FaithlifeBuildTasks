import { exitCode } from 'process';
import * as vscode from 'vscode';
import { TargetsTaskProvider } from './targets-task-provider';
import { TargetTaskType } from './types';

let targetsTaskProvider: vscode.Disposable | undefined;

export function activate(_context: vscode.ExtensionContext): void {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return;
	}

	targetsTaskProvider = vscode.tasks.registerTaskProvider(
		TargetTaskType,
		new TargetsTaskProvider(workspaceFolders)
	);
}

export function deactivate(): void {
	if (targetsTaskProvider) {
		targetsTaskProvider.dispose();
	}
}
