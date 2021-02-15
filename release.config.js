// eslint-disable-next-line no-undef
module.exports = {
	branches: ['master'],
	tagFormat: 'faithlifebuildtasks@${version}',
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		[
			'@semantic-release/exec',
			{
				publishCmd: 'node publish.js --version ${nextRelease.version}',
			},
		],
	],
};