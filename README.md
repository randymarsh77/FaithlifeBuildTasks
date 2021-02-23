# Faithlife.Build Tasks

Contributes VSCode tasks for [Faithlife.Build](https://faithlife.github.io/FaithlifeBuild/) projects.

## Requirements

You need the associated tool to run your bootstrapper script installed and accessible in your PATH.

- `.ps1` will use `pwsh` (macOS and Windows).
- `.sh` will use `sh` (macOS).
- `.cmd` will use `powershell` (Windows).

## Settings

#### Build Flags

Any extra flags to pass with build and package tasks. The setting is a `;` separated list of global or per-project flags. Prefix with `All:` to apply these flags for all projects. Prefix with the workspace folder name to apply these flags for only this workspace. Workspaces can be comma separated and partial matches. Each scope is case insensitive.

Example:

```
All: --no-test ; MyMultiPlatformProject,Other: -p macOS
```

#### NuGet Output

A path to a directory in which to place built NuGet packages. Consider using with [hotreloadnuget](https://www.nuget.org/packages/hotreloadnuget/).

Example (macOS):

```
~/nuget-output
```

#### Custom Build Files

Some projects might have legacy and/or custom configuration as relates to the bootstrapper script(s) and build files.

##### Bootstrapper

You can specify an override to the bootstrapper. If the project has two platform independent scripts, `.sh` and `.cmd` use a pipe separated list contained in brackets of the valid extensions. The "best" match will be chosen based on the platform and tools available. e.g.

```
build.[sh|cmd]
```

##### Tools

The tools directory must contain `Build.csproj` and `Build.cs`. However, if these files aren't in `tools/`, then provide a path override to their location. e.g.

```
tools/Build
```
