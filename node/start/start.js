var run_docker = false;
const pty = require('pty.js');
const readline = require('readline');
const chokidar = require('chokidar');
const log4js = require('log4js');
const WaitTime = process.env['WaitTime'] || '1000';
var wait_time = parseInt(WaitTime);
const init_command =  '/usr/sbin/chroot /host bash';
var face_container_name =  process.env['FACE_CONTAINER_NAME'] || 'eyecool-ubuntu_';
var match_container_name =  process.env['MATCH_CONTAINER_NAME'] || 'eyecool-ubuntu_';
var snapshot_container_name =  process.env['SNAPSHOT_CONTAINER_NAME'] || 'eyecool-ubuntu_';
var golang_container_name =  process.env['GOLANG_CONTAINERNAME'] || 'eyecool-ubuntu_';
var node_container_name =  process.env['NODE_CONTAINER_NAME'] || 'eyecool-ubuntu_';
var level =  process.env['LEVEL'] || 'release';
var rtsp_urls =  process.env['RTSPURLS'] || '';
var axisUrl =  process.env['AXISURL'] || '';
var zenithUrl =  process.env['ZENITH_URL'] || '';
log4js.configure({
    appenders: {
        everything: {
            type: 'dateFile',
            filename: 'all-logs.log',
            pattern: '.yyyy-MM-dd-hh-mm',
            compress: true,
            keepFileExt: true,
            daysToKeep: 5,
	        layout: {
	            type: 'messagePassThrough'
	        }
        }
    },
    categories: {
    default:
        {
            appenders:
            ['everything'],
            level: 'debug'
        }
    }
});
const logger = log4js.getLogger();
const start_commands_obj = {
	['face']: {
		docker: 'docker exec -it ' + face_container_name + level,
		cmd: '/cpp/1face_start.sh', 
		ok: 'listening on 0.0.0.0:50052', 
		watch: '/cpp', 
		suffix: '1face_start.sh|face_server',
		log: true
	},
	['match']: {
		docker: 'docker exec -it ' + match_container_name + level,
		cmd: '/cpp/2match_start.sh', 
		ok: 'listening on 0.0.0.0:50051', 
		watch: '/cpp', 
		suffix: '2match_start.sh|face_match_server',
		log: true
	},
	['library']: {
		docker: 'docker exec -it ' + golang_container_name + level,
		cmd: '/golang/start.sh', 
		ok: 'Press CTRL+C to shut down.',
		watch: '/golang', 
		suffix: 'start.sh|main',
		log: true
	},
	['snapshot']: {
		docker: 'docker exec -it ' + snapshot_container_name + level,
		cmd: '/cpp/3snapshot_start.sh', 
		ok: 'listening on 0.0.0.0:50050', 
		watch: '/cpp', 
		suffix: '3snapshot_start.sh|snapshot',
		log: true
	},
	['forward']: {
		docker: 'docker exec -it ' + snapshot_container_name + level,
		cmd: '/cpp/4forward_start.sh', 
		ok: 'listening on 0.0.0.0:50000', 
		watch: '/cpp', 
		suffix: '4forward_start.sh|forward',
		log: false
	},
	['face_app']: {
		docker: 'docker exec -it ' + node_container_name + level,
		cmd: '/node/face.sh', 
		ok: 'listening on *:6101', 
		watch: '/node/face', 
		suffix: '.js|face.sh',
		log: true
	},
	['cmbc']: {
		docker: 'docker exec -it ' + node_container_name + level,
		cmd: '/node/cmbc.sh', 
		ok: 'listening on *:3101', 
		watch: '/node/cmbc', 
		suffix: '.js|cmbc.sh',
		log: true
	},
	['cmbc_agent']: {
		docker: 'docker exec -it ' + node_container_name + level,
		cmd: '/node/cmbc_agent.sh', 
		ok: 'listening on *:3101', 
		watch: '/node/cmbc_agent', 
		suffix: '.js|cmbc_agent.sh',
		log: true
	},
	['webvideo']: {
		docker: 'docker exec -it ' + node_container_name + level,
		cmd: '/node/rtsp.sh', 
		ok: 'Stream mapping:', 
		watch: '/node/rtsp', 
		suffix: '.js|rtsp.sh',
		log: true
	},
	['face-api']: {
		docker: 'docker exec -it ' + node_container_name + level,
		cmd: '/node/face-api.sh', 
		ok: 'listening on *:50052', 
		watch: '/node/face-api.js/examples/examples-nodejs/face_grpc2.js', 
		suffix: '.js|face-api.sh',
		log: true
	},
	['match-api']: {
		docker: 'docker exec -it ' + node_container_name + level,
		cmd: '/node/match-api.sh', 
		ok: 'listening on *:50052', 
		watch: '/node/face-api.js/examples/examples-nodejs/match_grpc2.js', 
		suffix: '.js|match-api.sh',
		log: true
	}
};
const start_dependencies = {
	match: ['snapshot'],
};
var start_commands_list;
if(axisUrl != '') {
	start_commands_list = [
		['face-api'], ['match-api', 'library', 'cmbc']
	];
} else {
	start_commands_list = [
		['face-api'], ['match-api', 'library']
	];
}
if(rtsp_urls != '' && zenithUrl != '') {
	start_commands_list[start_commands_list.length] = ['snapshot'];
	start_commands_list[start_commands_list.length] = ['face_app', 'forward'];
} else if(rtsp_urls == '' && zenithUrl != '') {
	start_commands_list[start_commands_list.length] = ['snapshot'];
} else if(rtsp_urls != '' && zenithUrl == '') {
	start_commands_list[start_commands_list.length] = ['snapshot'];
	start_commands_list[start_commands_list.length] = ['face_app'];
}
//start_commands_list[start_commands_list.length] = ['face-api'];
//start_commands_list[start_commands_list.length] = ['match-api'];
const completer = (line) => {
  const completions = 'help error exit quit q'.split(' ');
  const hits = completions.filter((c) => c.startsWith(line));
  return [hits.length ? hits : completions, line];
}
const rl = readline.createInterface({
	input : process.stdin,
	output : process.stdout,
	completer : completer
});
rl.setPrompt('\033[1;32;47mroot@98980fce1e01\033[0m:~# ');
rl.on('pause', () => {
});
rl.on('resume', () => {
});
rl.on('SIGCONT', () => {
	console.log('SIGCONT');
});
var isEndsWith = function(str, suffix){
	var suffixs = suffix.split('|');
	for(var s in suffixs) {
		if(str.endsWith(suffixs[s])) {
			return true;
		}
	}
	return false;
};
var ends1 = ['231b5b6d20', '2320', '2420', '0d0a'];
var ends2 = ['231b5b6d20', '2320', '2420'];
var endsWith1 = function(data) {
	let _data = new Buffer(data).toString('hex');
	for(let end in ends1) {
		if(_data.length > end.length) {
			var _end = _data.substring(_data.length - end.length, _data.length);
			if(_end == end) {
				return true;
			}
		}
	}
	return false;
};
var endsWith2 = function(data) {
	let _data = new Buffer(data).toString('hex');
	for(let end in ends2) {
		if(_data.length > end.length) {
			var _end = _data.substring(_data.length - end.length, _data.length);
			if(_end == end) {
				return true;
			}
		}
	}
	return false;
};
var runCmd = (init_cmd, docker_cmd, start_cmd, start_cmd_ok, start_watch_path, start_watch_suffix, group_id, index, resolve, reject, log) => {
	let run_cmd = null;
	if(run_docker) {
		run_cmd = docker_cmd + ' ' + start_cmd;
	} else {
		run_cmd = start_cmd;
	}
	let commands = [];
	let term = pty.spawn('bash', [], {
		name : 'xterm-color',
		cols : 1000,
		rows : 1000,
		cwd : process.env.HOME,
		env : process.env
	});
	term.kill = true;
	let open_watch = false;
	let watcher = null;
	if(start_watch_path !== undefined && start_watch_path != '') {
		console.log('\033[40m\033[1;36m watch path \033[0m[' + group_id + ', ' + index + ']:' + start_watch_path);
		watcher = chokidar.watch(start_watch_path, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
			if(open_watch)  {
				console.log('\033[40m\033[1;36m watch path \033[0m[' + group_id + ', ' + index + ']:' + open_watch + ' ' + event + ' ' + path);
				if(start_watch_path === undefined || start_watch_path == '' || isEndsWith(path, start_watch_suffix)) {
					setTimeout(() => {
						console.log('\033[40m\033[1;31m source update restart \033[0m[' + group_id + ', ' + index + ']');
						term.kill = false;
						try {
							term.end('\x03\rsleep 5;exit\r');
							if(watcher != null) {
								watcher.close();
								watcher = null;
							}
						} catch (e) {
							if(reject !== undefined) {
								if(watcher != null) {
									watcher.close();
									watcher = null;
								}
								reject(index);
							}
						}
					}, wait_time);
				}
			}
		});
	}
	let line = '';
	let stopTimer = null;
	term.on('data', (data) => {
		line += data;
		if (data.endsWith('\r\n') || data.endsWith('$ ') || data.endsWith('# ')) {
			if(line != commands[commands.length-1] + '\r\n') {
				if(log) {
					process.stdout.write(line);
				}
				if(stopTimer != null) {
					clearTimeout(stopTimer);
					stopTimer = null;
				}
				if(start_cmd_ok !== undefined && start_cmd_ok != '' && line.endsWith(start_cmd_ok + '\r\n')) {
					console.log('\033[40m\033[1;32m start ok \033[0m[' + group_id + ', ' + index + ']:' + run_cmd);
					setTimeout(() => {
						open_watch = true;
						if(resolve !== undefined) {
							resolve(index);
						}
					}, wait_time);
				}
			}
			if(data.endsWith('$ ') || data.endsWith('# ')) {
				if(commands[commands.length - 1] == init_cmd) {
					console.log('\033[40m\033[1;31m in \033[0m' + init_cmd);
					try {
						commands[commands.length] = run_cmd;
						term.write(run_cmd + '\r');
						console.log('\033[40m\033[1;31m run \033[0m[' + group_id + ', ' + index + ']:' + run_cmd);
					} catch (e) {
						console.log('\033[40m\033[1;33m err \033[0m[' + group_id + ', ' + index + ']:' + e.toString());
						if(level != 'release' && term.kill) {
							console.log('\033[40m\033[1;31m killall \033[0m');
							process.exit(0);
						}
						if(reject !== undefined) {
							stopTimer = setTimeout(() => {
								if(reject !== undefined) {
									if(watcher != null) {
										watcher.close();
										watcher = null;
									}
									reject(index);
								}
							}, wait_time);
						}
					}
				} else {
					console.log('\033[40m\033[1;31m back \033[0m[' + group_id + ', ' + index + ']:' + commands[commands.length -1]);
					if(level != 'release' && term.kill) {
						console.log('\033[40m\033[1;31m killall \033[0m');
						process.exit(0);
					}
					if(reject !== undefined) {
						stopTimer = setTimeout(() => {
							if(reject !== undefined) {
								if(watcher != null) {
									watcher.close();
									watcher = null;
								}
								reject(index);
							}
						}, wait_time);
					}
				}
			}
			line = '';
		}
	});
	commands[commands.length] = init_cmd;
	if(run_docker) {
		term.write(init_cmd + '\r');
	} else {
		term.write('\r');
	}
	return term;
};
var itrms_group = {};
var itrms_start = {};
var runCommandGroup = (start_commands, group_id) => {
	console.log('\033[40m\033[1;35m runCommandGroup \033[0m[' + group_id + ']');
	itrms_group[group_id] = [];
	let count = start_commands.length;
	let startTimer = null;
	let resolve = (index) => {
		itrms_start[group_id + "_" + index] = true;
		if(index + 1 < count) {
			let start_command = start_commands_obj[start_commands[index + 1]];
			if(startTimer != null) {
				clearTimeout(startTimer);
				startTimer == null;
			}
			startTimer = setTimeout(() => {
				console.log('\033[40m\033[1;34m continue start \033[0m[' + group_id + ', ' + (index + 1) + ']:' + start_command.cmd);
				itrms_group[group_id][index + 1] = runCmd(init_command, start_command.docker, start_command.cmd, start_command.ok, start_command.watch, start_command.suffix, group_id, index + 1, resolve, reject, start_command.log);
			}, wait_time);
		}
	}
	let reject = (index) => {
		itrms_start[group_id + "_" + index] = false;
		for(let i = index + 1; i < count; i++) {
			if(itrms_group[group_id][i] !== undefined) {
				let start_command = start_commands_obj[start_commands[i]];
				if(itrms_group[group_id][i] != null) {
					console.log('\r\n\033[40m\033[1;31m auto stop \033[0m[' + group_id + ', ' + i + ']:' + start_command.cmd);
					itrms_group[group_id][i].kill=false;
					itrms_group[group_id][i].end('\x03\rsleep 5;exit\r');
					itrms_group[group_id][i] = null;
				}
			}
		}
		if(index == 0 || (index > 0 && itrms_start[group_id + "_" + (index - 1)])) {
			let start_command = start_commands_obj[start_commands[index]];
			console.log('\033[40m\033[1;34m delayed start \033[0m[' + group_id + ', ' + index + ']:' + start_command.cmd);
			if(startTimer != null) {
				clearTimeout(startTimer);
				startTimer == null;
			}
			startTimer = setTimeout(() => {
				console.log('\033[40m\033[1;34m restart \033[0m[' + group_id + ', ' + index + ']:' + start_command.cmd);
				itrms_group[group_id][index] = runCmd(init_command, start_command.docker, start_command.cmd, start_command.ok, start_command.watch, start_command.suffix, group_id, index, resolve, reject, start_command.log);
			}, wait_time);
		}
	}
	if(count > 0) {
		let start_command = start_commands_obj[start_commands[0]];
		console.log('\033[40m\033[1;34m start \033[0m[' + group_id + ', 0]:' + start_command.cmd);
		itrms_group[group_id][0] = runCmd(init_command, start_command.docker, start_command.cmd, start_command.ok, start_command.watch, start_command.suffix, group_id, 0, resolve, reject, start_command.log);
	}
};
for(group_id in start_commands_list) {
	let start_commands = start_commands_list[group_id];
	setTimeout(() => {
		runCommandGroup(start_commands, group_id);
	}, group_id * 1000);
}
rl.on('SIGINT', () => {
	rl.question('', (answer) => {
		if (answer.match(/^y(es)?$/i)) {
			for(var group_id in itrms_group) {
				for(let i = 0; i < itrms_group[group_id].length; i++) {
					if(itrms_group[group_id][i] !== undefined && itrms_group[group_id][i] != null) {
						console.log('\033[40m\033[1;31m stop \033[0m[' + group_id + ', ' + i + ']');
						itrms_group[group_id][i].end('\x03\rsleep 5;exit\r');
						itrms_group[group_id][i] = null;
					}
				}
			}
			console.log('\033[40m\033[1;31m killall \033[0m');
			process.exit(0);
		} else {
			for(let group_id in itrms_group) {
				for(let i = 0; i < itrms_group[group_id].length; i++) {
					if(itrms_group[group_id][i] !== undefined && itrms_group[group_id][i] != null) {
						console.log('\033[40m\033[1;31m stop \033[0m[' + group_id + ', ' + i + ']');
						itrms_group[group_id][i].end('\x03\rsleep 5;exit\r');
						itrms_group[group_id][i] = null;
					}
				}
			}
		}
	});
});
rl.on('line', (input) => {
	for(let group_id in itrms_group) {
		for(let i = 0; i < itrms_group[group_id].length; i++) {
			if(itrms_group[group_id][i] !== undefined && itrms_group[group_id][i] != null) {
				itrms_group[group_id][i].write(input + '\r');
			}
		}
	}
});