/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/ https://github.com/kekse1/ansi.js/
 * v1.3.2
 */

//
//<Esc>, <Ctrl>+<C>, <Ctrl>+<D>; .. BUT should be partially handled by yourself!!
const DEFAULT_ESCAPE = false;
const DEFAULT_ECHO = false; // if true, maybe <Backspace> etc. won't work that right..
const DEFAULT_HIDE = false; // hide cursor

//
// TODO / .. die MAUS-funktionalitaet wollte ich eher GARNED (hier).. eh?!?
// sonst siehe alte 'lib.js'. ... ^_^
//

//
import readline from 'node:readline';
readline.emitKeypressEvents(process.stdin);

//
const raw = global.raw = {};
export default raw;

//
Reflect.defineProperty(process, 'raw', {
	get: () => process.stdin.isRaw,
	set: (_value) => {
		if(typeof _value !== 'boolean')
		{
			return process.raw;
		}
		else if(_value)
		{
			if(process.stdin.isRaw)
			{
				return _value;
			}

			// _key: { sequence, name, ctrl, meta, shift };
			process.stdin.on('keypress', process.stdin.__onRawKeypress =
				(_string, _key) => { if(process.escape) {
						if(_key.ctrl) { if(_key.name === 'c' || _key.name === 'd') {
							process.hide = false; process.exit(int(process.exitCode) ? process.exitCode : 255); }}
						else if(_key === 'escape') { process.hide = false; process.exit(int(process.exitCode) ? process.exitCode : 0); }}
					if(process.echo) process.stdin.write(_string);
					process.emit('key', _string, _key); });
			
			process.stdin.setRawMode(true);
			process.hide = !!process.hide;
		}
		else if(process.stdin.isRaw)
		{
			if(process.stdin.__onRawKeypress)
			{
				process.stdin.off('keypress', process.stdin.__onRawKeypress);
				delete process.stdin.__onRawKeypress;
			}

			process.stdin.setRawMode(false);
			process.hide = false;
		}

		return _value;
	}});

//
process.__escape = DEFAULT_ESCAPE;
process.__echo = DEFAULT_ECHO;
process.__hide = DEFAULT_HIDE;

Reflect.defineProperty(process, 'escape', {
	get: () => {
		if(!process.stdin.isRaw) return null;
		return !!process.__escape;
	},
	set: (_value) => {
		if(typeof _value === 'boolean')
		{
			process.__escape = _value;
		}

		if(!process.stdin.isRaw)
		{
			return null;
		}

		return process.__escape;
	}});

Reflect.defineProperty(process, 'echo', {
	get: () => {
		if(!process.stdin.isRaw) return null;
		return !!process.__echo;
	},
	set: (_value) => {
		if(typeof _value === 'boolean')
		{
			process.__echo = _value;
		}

		if(!process.stdin.isRaw)
		{
			return null;
		}

		return process.__echo;
	}});

Reflect.defineProperty(process, 'hide', {
	get: () => !!process.__hide,
	set: (_value) => {
		if(typeof _value !== 'boolean')
		{
			return process.__hide;
		}
		else if(_value)
		{
			process.stdin.write(String.hide());
		}
		else
		{
			process.stdin.write(String.show());
		}
		
		return process.__hide = _value;
	}});

//

