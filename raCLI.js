const prompt = require('prompt');
const colors = require('@colors/colors/safe');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const readline = require('readline');
const process = require('process');

prompt.message = colors.america('raCLI');
prompt.delimiter = ' > ';

prompt.start();

readline.emitKeypressEvents(process.stdin);
process.stdin.on("keypress", (ch, key) => {
	if(key && key.ctrl && key.name == "p") {
		process.exit(1);
	}
});
process.stdin.setRawMode(true);

const children = []

function promptUser() {
	prompt.get([{
		name: 'command',
		description: 'enter a command'
	}], (err, result) => {
		if(result == undefined) {
			
		} else if(result.command.startsWith("keep")) {
			const args = result.command.split(" ");
			if(args[0] !== "keep") {
				console.log("I think you meant 'keep'");
			} else if(args.length != 2) {
				console.log("Usage: keep <PID>");
			} else {
				found = false
				for(let i = 0; i < children.length; i++) {
					if(children[i].pid == args[1]) {
						/*children[i].on('SIGHUP', () => {

						});*/
						execSync('disown %' + (i+1), {shell: '/bin/bash'});
						found = true;
						console.log("Program is now fully detached from console");
					}
				}
				if(found == false) {
					console.log("Not child process found with this PID");
				}
			}
		} else if(result.command.startsWith("/") || result.command.startsWith(".")) {
			if(result.command.endsWith("!")) {
				child = exec(result.command.substring(0, result.command.length - 1), (err, stdout, stderr) => {
					console.log(stdout);
				});
				children.push(child);
				console.log("Started " + child.pid);
			} else {
				console.log(execSync(result.command).toString());
			}
		//TODO: chercher dans variable PATH
		} else if(result.command.startsWith("lp")) {
			if(result.command === "lp") {
				console.log(execSync('ps jax').toString());
			} else {
				console.log("I think you meant 'lp'");
			}
		} else if(result.command.startsWith("bing")) {
			const args = result.command.split(" ");
			if(args[0] !== "bing") {
				console.log("I think you meant 'bing'");
			}
			if(args.length === 3) {
				if(args[1] === "-k") {
					console.log(execSync('kill ' + args[2]).toString());
				} else if(args[1] === "-p") {
					console.log(execSync('kill -STOP ' + args[2]).toString());
				} else if(args[1] === "-c") {
					console.log(execSync('kill -CONT ' + args[2]).toString());
				}
			} else if(args.length === 2) {
				console.log(execSync('kill ' + args[1]).toString());
			}
		}
		promptUser();
	});
}

promptUser();
