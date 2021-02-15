/* eslint-disable */
const { exec } = require('shelljs');

const version = process.argv.length >= 4 && process.argv[2] === '--version' && process.argv[3];
if (!version) {
	console.error('You need to pass a version to publish.');
	process.exit(1);
}

if (!process.env.VSCE_PAT) {
	console.error('You need to configure VSCE_PAT.');
	process.exit(1);
}

(async () => {
	try {
		await verifyExec(
			`vsce package`
		);

		await verifyExec(
			`vsce publish ${version}`
		);
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
})();

async function verifyExec(command) {
	const { code } = await exec(command);
	if (code !== 0) {
		process.exit(code);
	}
}