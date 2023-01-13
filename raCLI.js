const prompt = require('prompt');
const colors = require('@colors/colors/safe');
const exec = require('child_process').exec;

prompt.message = colors.america('raCLI');
prompt.delimiter = ' > ';

prompt.start();

prompt.get([{
	name: 'command',
	description: 'enter a command'
}], (err, result) => {
	if(result.command === 'lp') {
		exec('ps a', (err, stdout, stderr) => {
			console.log(stdout);
		});
	}
});
