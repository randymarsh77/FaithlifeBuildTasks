import * as vscode from 'vscode';
import { getFingerprintingFiles, createTask } from './fl-build-utility';
import { getSettings } from './settings';
import { existsAsync, execAsync } from './utility';

export class TargetsTaskProvider implements vscode.TaskProvider, vscode.Disposable {
	private targetsPromise: Thenable<vscode.Task[]> | undefined = undefined;
	private disposables: vscode.Disposable[] = [];

	constructor(workspaceFolders: readonly vscode.WorkspaceFolder[]) {
		this.disposables = workspaceFolders
			.flatMap((x) => getFingerprintingFiles(x.uri.fsPath))
			.reduce((acc, v) => {
				const watcher = vscode.workspace.createFileSystemWatcher(v);
				watcher.onDidChange(() => (this.targetsPromise = undefined));
				watcher.onDidCreate(() => (this.targetsPromise = undefined));
				watcher.onDidDelete(() => (this.targetsPromise = undefined));
				return [...acc, watcher];
			}, [] as vscode.Disposable[]);
	}

	public dispose() {
		this.disposables.forEach((x) => x.dispose());
	}

	public provideTasks(): Thenable<vscode.Task[]> | undefined {
		if (!this.targetsPromise) {
			this.targetsPromise = getTargets();
		}
		return this.targetsPromise;
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		return undefined;
	}
}

let _channel: vscode.OutputChannel;
function getOutputChannel(): vscode.OutputChannel {
	if (!_channel) {
		_channel = vscode.window.createOutputChannel('Faithlife.Build Auto Detection');
	}
	return _channel;
}

async function getTargets(): Promise<vscode.Task[]> {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	const result: vscode.Task[] = [];
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return result;
	}

	for (const workspaceFolder of workspaceFolders) {
		const folderString = workspaceFolder.uri.fsPath;
		if (!folderString) {
			continue;
		}
		const allFilesExists = getFingerprintingFiles(folderString).map(existsAsync);
		if (!(await Promise.all(allFilesExists))) {
			continue;
		}

		const settings = getSettings(workspaceFolder.name);
		const commandLine = `pwsh build.ps1`;
		try {
			const { stdout, stderr } = await execAsync(commandLine, { cwd: folderString });
			if (stderr && stderr.length > 0) {
				getOutputChannel().appendLine(stderr);
				getOutputChannel().show(true);
			}
			if (stdout) {
				const { targets } = stdout.split(/\r{0,1}\n/).reduce(
					(acc, v) => {
						const { targets, reachedTargets } = acc;
						if (reachedTargets) {
							const target = v
								.split(' ')
								.map((x) => x.trim())
								.filter((x) => x.length > 0)[0];
							if (!target) {
								return acc;
							}
							return {
								reachedTargets,
								targets: [...targets, target],
							};
						}
						if (v.includes('Targets:')) {
							return { ...acc, reachedTargets: true };
						}
						return acc;
					},
					{ targets: [] as string[], reachedTargets: false }
				);
				for (const target of targets) {
					const task = createTask(workspaceFolder, target, settings);
					result.push(task);
				}
			}
		} catch (err) {
			const channel = getOutputChannel();
			if (err.stderr) {
				channel.appendLine(err.stderr);
			}
			if (err.stdout) {
				channel.appendLine(err.stdout);
			}
			channel.appendLine('Auto detecting Faithlife.Build targets failed.');
			channel.show(true);
		}
	}
	return result;
}
