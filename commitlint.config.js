// eslint-disable-next-line no-undef
module.exports = {
	extends: ['@commitlint/config-angular'],
	rules: {
		'subject-full-stop': [2, 'always', '.'],
		'scope-empty': [2, 'never'],
		'scope-case': [0],
		'subject-empty': [2, 'never'],
		'header-max-length': [2, 'always', 120],
		'type-enum': [2, 'always', ['chore', 'feat', 'fix', 'perf', 'refactor', 'style', 'test']],
	},
};