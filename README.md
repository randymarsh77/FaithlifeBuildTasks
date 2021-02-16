# Faithlife.Build Tasks

Contributes VSCode tasks for [Faithlife.Build](https://faithlife.github.io/FaithlifeBuild/) projects.

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
