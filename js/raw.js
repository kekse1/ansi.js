/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/ https://github.com/kekse1/ansi.js/
 * v1.1.0
 */

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

			process.stdin.on('data', process.stdin.__onRawData =
				(_data) => { if(process.escape &&
						_data[0] === 27 ||
						_data[0] === String.fromCharCode(27))
					process.exit(); });

			// _key: { sequence, name, ctrl, meta, shift };
			process.stdin.on('keypress', process.stdin.__onRawKeypress =
				(_string, _key) => process.emit('key', _string, _key));
			
			process.stdin.setRawMode(true);
		}
		else if(process.stdin.isRaw)
		{
			if(process.stdin.__onRawData)
			{
				process.stdin.off('data', process.stdin.__onRawData);
				delete process.stdin.__onRawData;
			}

			if(process.stdin.__onRawKeypress)
			{
				process.stdin.off('keypress', process.stdin.__onRawKeypress);
				delete process.stdin.__onRawKeypress;
			}

			process.stdin.setRawMode(false);
		}

		return _value;
	}});

//
process.__escape = true;

Reflect.defineProperty(process, 'escape', {
	get: () => {
		if(!process.stdin.isRaw) return null;
		return !!process.__escape;
	},
	set: (_value) => {
		if(typeof _value !== 'boolean')
		{
			return process.escape;
		}

		return process.__escape = _value;
	}});

//

