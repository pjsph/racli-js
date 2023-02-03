const prompt = require('prompt');
const colors = require('@colors/colors/safe');
const spawn = require('child_process').spawn;
const execSync = require('child_process').execSync;
const readline = require('readline');
const process = require('process');
const fs = require('fs');

prompt.message = colors.america('raCLI');
prompt.delimiter = ' > ';

prompt.start();

// Listen on Ctrl + P
readline.emitKeypressEvents(process.stdin);
process.stdin.on("keypress", (ch, key) => {
	if(key && key.ctrl && key.name == "p") {
		process.exit(1);
	}
});
process.stdin.setRawMode(true);

const children = []

async function trySpawnSync(cmd, args) {
	try {
		child = spawn(cmd, args);
		child.stdout.on('data', function(chunk) {
			console.log(`${chunk}`);
		});
		child.stderr.on('data', function(chunk) {
			console.log(`${chunk}`);
		});
		child.on('error', function(error) {
			console.log(error);
		});
		process.stdin.on('keypress', (ch, key) => {
			if(key && key.ctrl && key.name == "c") {
				child.kill();
			}
		});
		await new Promise((resolve) => {
			child.on('close', resolve);
		});
	} catch(error) {
		return ""; // avoid error when calling toString()
	}
}

function callback(err, stdout, stderr) {
	if(stderr != undefined) {
		console.log(stderr);
	} else if(stdout != undefined) {
		console.log(stdout);
	}
}

function promptUser() {
	prompt.get([{
		name: 'command',
		description: 'enter a command'
	}], (err, result) => {
		if(result == undefined) {
			
		// Attempt to make the 'keep' command with 'disown' or overwriting the SIGHUP signal, not successful
		// The problem is that the child returned by the 'exec' function is not the process that we want to start, but the bash process
		// that is executing the command
		//
		// The method which consists in stopping the process with 'kill -STOP id' and then resuming it with 'kill -CONT id' doesn't seem
		// to work on all shells, as they don't all resume processes in a detached state
		/*} else if(result.command.startsWith("keep")) {
			const args = result.command.split(" ");
			if(args[0] !== "keep") {
				console.log("I think you meant 'keep'");
			} else if(args.length != 2) {
				console.log("Usage: keep <PID>");
			} else {
				found = false
				for(let i = 0; i < children.length; i++) {
					if(children[i].pid == args[1]) {
						\/*children[i].on('SIGHUP', () => {

						}); *\/
						execSync('disown %' + (i+1), {shell: '/bin/bash'});
						found = true;
						console.log("Program is now fully detached from console");
					}
				}
				if(found == false) {
					console.log("Not child process found with this PID");
				}
			} */

		// Start a program with relative path or absolute path
		} else if(result.command.startsWith("/") || result.command.startsWith(".")) {
			if(result.command.endsWith("!")) {
				let args = result.command.substring(0, result.command.length - 1).split(" ");
				child = spawn(args[0], args.slice(1, args.length));
				// This is not showing the right pid, because 'child' is the bash process that executes the command
				// console.log("Started " + child.pid);
			} else {
				let args = result.command.split(" ");
				trySpawnSync(args[0], args.slice(1, args.length));
			}

		// List all processes
		} else if(result.command.startsWith("lp")) {
			if(result.command === "lp") {
				console.log(tryExecSync('ps jax').toString());
			} else {
				console.log("I think you meant 'lp'");
			}
		
		// Kill, stop or resume a process
		} else if(result.command.startsWith("bing")) {
			const args = result.command.split(" ");
			if(args[0] !== "bing") {
				console.log("I think you meant 'bing'");
			}
			if(args.length === 3) {
				if(args[1] === "-k") {
					console.log(tryExecSync('kill ' + args[2]).toString());
				} else if(args[1] === "-p") {
					console.log(tryExecSync('kill -STOP ' + args[2]).toString());
				} else if(args[1] === "-c") {
					console.log(tryExecSync('kill -CONT ' + args[2]).toString());
				} else {
					console.log("Help: bing [-k | -p | -c] <processId>")
				}
			} else if(args.length === 2) {
				console.log(tryExecSync('kill ' + args[1]).toString());
			}

		// Avoid error when the user types nothing
		} else if(result.command === "") {

		// Finally, we check in PATH for programs to start
		} else {
			//console.log("This is not a racli command nor a valid path to a program. Checking in PATH variable...");

			let background = false;
			if(result.command.endsWith("!")) {
				background = true;
			}

			const cmd = result.command.split(" ")[0];
			const PATH = process.env.PATH;
			const path_arr = PATH.split(":");

			let cmd_path = "";
			for(let i = 0; i < path_arr.length; i++) {
				if(fs.existsSync(path_arr[i] + "/" + cmd)) {
					cmd_path = path_arr[i] + "/" + result.command;
					break;
				}
			}

			if(cmd_path === "") {
				console.log("I couldn't find a program with this name in the PATH variable");
			} else {
				if(background) {
					let args = result.command.substring(0, result.command.length - 1).split(" ");
					child = spawn(args[0], args.slice(1, args.length));
					//console.log("Started " + child.pid);
				} else {
					let args = result.command.split(" ");
					trySpawnSync(args[0], args.slice(1, args.length));
				}
			}
		}
		promptUser();
	});
}

promptUser();
