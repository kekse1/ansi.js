/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/ https://github.com/kekse1/ansi.js/
 * v1.8.1
 */

//
const DEFAULT_ANSI = true;
const DEFAULT_THROW = true;
const DEFAULT_COLORS = true;
const DEFAULT_RESET = null;
const DEFAULT_COLOR_FILTER = true;
const DEFAULT_ALLOW_DISABLE = true;
const DEFAULT_REPLACE_TABS = 4;

//
const DEFAULT_INFO = [ 173, 234, 68 ];
const DEFAULT_WARN = [ 232, 226, 37 ];
const DEFAULT_ERROR = [ 252, 131, 38 ];
const DEFAULT_DEBUG = [ 150, 180, 200 ];

//
const DEFAULT_RESET_FOREGROUND = '[390m';
const DEFAULT_RESET_BACKGROUND = '[490m';

//
import util from 'node:util';

//
const ESC = String.fromCharCode(27);

//
class ANSI
{
	//
	//todo/w/ state like parse()?!
	//
	static filter(_string)
	{
		var result = '';
		var state = -1;
		var byte;

		for(var i = 0; i < _string.length; ++i)
		{
			//
			byte = _string.charCodeAt(i);

			//
			if(state > -1) switch(state)
			{
				case 0:
					if(byte >= 48 && byte <= 63)
					{
						continue;
					}
					else if(byte >= 32 && byte <= 47)
					{
						state = 1;
						continue;
					}
					else
					{
						state = -1;
						continue; //TODO/sollte das nicht weg hier!?
					}
					break;
				case 1:
					if(byte >= 32 && byte <= 47)
					{
						continue;
					}
					else if(byte >= 64 && byte <= 126)
					{
						state = -1;
						continue;
					}
					else
					{
						state = -1;
						continue; //TODO/sollte das nicht weg hier!?
					}
					break;
			}
			
			if(state === -1)
			{
				if(byte === 27 && _string[i + 1] === '[')
				{
					state = 0;
					++i;
				}
				else
				{
					result += _string[i];
				}
			}
		}

		return result;
	}

	static get parse()
	{
		return this.parseCSI;
	}
	
	// 
	// For Control Sequence Introducer, or CSI, commands,
	// the ESC [ (written as \e[ or \033[ in several programming
	// languages) is followed by any number (including none) of
	// "parameter bytes" in the range 0x30–0x3F (ASCII 0–9:;<=>?),
	// then by any number of "intermediate bytes" in the range
	// 0x20–0x2F (ASCII space and !"#$%&'()*+,-./), then finally by a
	// single "final byte" in the range 0x40–0x7E (ASCII @A–Z[\]^_`a–z{|}~).
	// 
	// <ESC>'['		1
	// (48)-(63)		n	parameter bytes
	// (32)-(47)		n	intermediate bytes
	// (64)-(126)		1	final byte
	// 
	static parseCSI(_data)
	{
		//
		if(Reflect.is(_data, 'Uint8Array') || Reflect.is(_data, 'Buffer'))
		{
			_data = ANSI.toString(_data);
		}
		else if(Array.isArray(_data))
		{
			return _data;
		}
		else if(!string(_data, true))
		{
			return null;
		}
		
		//
		const result = [];
		var sub = '';
		var byte;
		
		//
		const assemble = (_result, _ansi = false) => {
			var result = '';
			
			for(var i = 0; i < _result.length; ++i)
			{
				if(string(_result[i], true))
				{
					result += _result[i];
				}
				else if(_ansi)
				{
					result += _result[i].data;
				}
			}
			
			return result;
		};

		Reflect.defineProperty(result, 'text', {
			enumerable: true, get: function()
			{
				return assemble(this, false);
			}
		});
		
		Reflect.defineProperty(result, 'data', {
			enumerable: true, get: function()
			{
				return assemble(this, true);
			}
		});
		
		Reflect.defineProperty(result, 'textArray', {
			enumerable: true, get: function()
			{
				return ANSI.toArray(assemble(this, false));
			}
		});
		
		Reflect.defineProperty(result, 'dataArray', {
			enumerable: true, get: function()
			{
				return ANSI.toArray(assemble(this, true));
			}
		});

		//	
		const state = Object.null({
			buffer: '',
			readyState: -1,
			item: null
		});

		//
		const createItem = (_offset) => Object.null({
			offset: _offset,
			data: '',
			parameter: '',
			intermediate: '',
			final: ''
		});

		//
		for(var i = 0, j = 0; i < _data.length; ++i)
		{
			byte = _data.charCodeAt(i);
			
			if(state.readyState === -1)
			{
				if(byte === 27 && _data[i + 1] === '[')
				{
					if(state.buffer.length > 0)
					{
						result[j++] = state.buffer;
					}
					
					state.buffer = String.fromCharCode(27) + _data[++i];
					state.readyState = 0;
					state.item = createItem(i);
				}
				else
				{
					state.buffer += _data[i];
				}
			}
			else
			{
				state.buffer += _data[i];
				
				switch(state.readyState)
				{
					case 0:
						if(byte >= 48 && byte <= 63)
						{
							state.item.parameter += _data[i];
						}
						else if(byte >= 32 && byte <= 47)
						{
							state.readyState = 1;
							state.item.intermediate += _data[i];
						}
						else
						{
							if(byte >= 64 && byte <= 126)
							{
								state.item.final = _data[i];
								state.item.data = state.buffer;
								result[j++] = state.item;
							}
							else if(state.buffer.length > 0)
							{
								result[j++] = state.buffer;
							}
							
							state.buffer = '';
							state.readyState = -1;
							state.item = null;
						}
						break;
					case 1:
						if(byte >= 32 && byte <= 47)
						{
							state.item.intermediate += _data[i];
						}
						else
						{
							if(byte >= 64 && byte <= 126)
							{
								state.item.final = _data[i];
								state.item.data = state.buffer;
								result[j++] = state.item;
							}
							else
							{
								result[j++] = state.buffer;
							}

							state.buffer = '';
							state.readyState = -1;
							state.item = null;
						}

						break;
				}
			}
		}
		
		//
		if(state.buffer.length > 0)
		{
			result.push(state.buffer);
		}

		//
		return result;
	}

	//
	// TODO / I *think* atm the 3/4 bit colors are not fully supported, ..
	// ... since they've some alternative escape sequence syntax'. ...?
	//
	static colorFilter(_data, _carrier)
	{
		//
		if(!_carrier)
		{
			throw new Error('Missing _carrier argument (for the state(s))!');
		}

		//
		var result = '';
		const parsed = (Array.isArray(_data) ? _data : ANSI.parse(_data));
		
		//
		const state = _carrier.__ansi = Object.null({
			foreground: [],
			background: []
		}, _carrier.__ansi);
		
		//
		const getBackground = () => {
			if(state.background[1]) return state.background[1];
			return (ESC + '[39m');
		};
		
		const getForeground = () => {
			if(state.foreground[1]) return state.foreground[1];
			return (ESC + '[49m');
		};
		
		const setBackground = (_seq) => {
			state.background.unshift(_seq);
			state.background.length = 2;
		};
		
		const setForeground = (_seq) => {
			state.foreground.unshift(_seq);
			state.foreground.length = 2;
		};
		
		const resetBackground = () => {
			state.background.length = 0;
		};
		
		const resetForeground = () => {
			state.foreground.length = 0;
		};
		
		//
		for(var i = 0; i < parsed.length; ++i)
		{
			if(string(parsed[i], true))
			{
				result += parsed[i];
			}
			else if(parsed[i].data.startsWith(ESC + '[0m'))
			{
				resetForeground();
				resetBackground();
			}
			else if(parsed[i].data.startsWith(ESC + DEFAULT_RESET_FOREGROUND))
			{
				parsed[i].data = getForeground();
			}
			else if(parsed[i].data.startsWith(ESC + DEFAULT_RESET_BACKGROUND))
			{
				parsed[i].data = getBackground();
			}
			else if(parsed[i].data.startsWith(ESC + '[39m'))
			{
				setForeground(parsed[i].data);
			}
			else if(parsed[i].data.startsWith(ESC + '[49m'))
			{
				setBackground(parsed[i].data);
			}
			else if(parsed[i].data.startsWith(ESC + '[38;'))
			{
				setForeground(parsed[i].data);
			}
			else if(parsed[i].data.startsWith(ESC + '[48;'))
			{
				setBackground(parsed[i].data);
			}
		}
		
		return parsed.data;
	}
	
	//
	static toArray(_data, _throw = DEFAULT_THROW)
	{
		if(Reflect.is(_data, 'Uint8Array'))
		{
			return _data;
		}
		else if(Reflect.is(_data, 'Buffer'))
		{
			return Uint8Array.from(_data);
		}
		else if(!string(_data, true))
		{
			if(_throw)
			{
				throw new Error('Invalid argument');
			}
			
			return null;
		}
		
		const result = new Uint8Array(_data.length);
		
		for(var i = 0; i < _data.length; ++i)
		{
			result[i] = _data.charCodeAt(i);
		}
		
		return result;
	}
	
	static toString(_data, _throw = DEFAULT_THROW)
	{
		if(string(_data, true))
		{
			return _data;
		}
		else if(Reflect.is(_data, 'Buffer'))
		{
			_data = Uint8Array.from(_data);
		}
		else if(!Reflect.is(_data, 'Uint8Array'))
		{
			if(_throw)
			{
				throw new Error('Invalid argument');
			}

			return null;
		}
		
		var result = '';
		
		for(var i = 0; i < _data.length; ++i)
		{
			result += String.fromCharCode(_data[i]);
		}
		
		return result;
	}

	static replaceTabs(_data, _spaces = DEFAULT_REPLACE_TABS)
	{
		if(!string(_spaces, false))
		{
			if(!int(_spaces) || _spaces < 1)
			{
				return _data;
			}

			_spaces = ' '.repeat(_spaces);
		}

		if(Array.isArray(_data))
		{
			for(var i = 0; i < _data.length; ++i)
			{
				if(string(_data[i], false))
				{
					_data[i] = _data[i].replaceAll('\t', _spaces);
				}
			}

			return _data;
		}
		
		const isString = string(_data, true);
		var result = '';

		if(isString) for(var i = 0; i < _data.length; ++i)
		{
			if(_data[i] === '\t')
			{
				result += _spaces;
			}
			else
			{
				result += _data[i];
			}
		}
		else for(var i = 0; i < _data.length; ++i)
		{
			if(_data[i] === 9)
			{
				result += _spaces;
			}
			else
			{
				result += String.fromCharCode(_data[i]);
			}
		}

		return (isString ? result : ANSI.toArray(result));
	}
}

export default ANSI;

//
if(typeof global.ANSI === 'undefined')
{
	//
	global.ANSI = ANSI;
	global.ANSI.enabled = DEFAULT_ANSI;
	
	//
	Reflect.defineProperty(String.prototype, 'text', { get: function()
	{
		return ANSI.filter(this.valueOf());
	}});
	
	Reflect.defineProperty(String.prototype, 'textLength', { get: function()
	{
		return ANSI.filter(this.valueOf()).length;
	}});

	Reflect.defineProperty(String.prototype, 'pad', { value: function(_length, _string, _ansi = true)
	{
		if(!int(_length))
		{
			throw new Error('Invalid _length argument (expecting an Integer)');
		}
		else if(_length === 0)
		{
			return this.valueOf();
		}
		else if(!string(_string, false))
		{
			_string = ' ';
		}

		const negative = (_length < 0); // '-' = padEnd(); '+' = padStart();
		const length = Math.abs(_length);
		const textLength = (_ansi ? this.textLength : this.length);
		const padLength = (_ansi ? _string.textLength : _string.length);
		const diff = (length - textLength);

		if(diff <= 0)
		{
			return this.valueOf();
		}

		var pad = ''; while((_ansi ? pad.textLength : pad.length) < diff)
		{
			pad += _string;
		}

		if(negative)
		{
			return (this.valueOf() + pad);
		}

		return (pad + this.valueOf());
	}});

	//
	Reflect.defineProperty(process, 'stdio', { get: () => {
		const result = [
			process.stdin,
			process.stdout,
			process.stderr ];
		result.stdin = process.stdin;
		result.stdout = process.stdout;
		result.stderr = process.stderr;
		return result;
	}});

	//
	const getStateCarrier = (_stream) => {
		switch(_stream.fd)
		{
			case 0: case 1: case 2:
				return process;
			default:
				return _stream;
		}};

	const _write = process.stdout.__proto__.write;

	//
	process.stdout.__proto__.write = function(_chunk, _encoding, _callback, ... _args)
	{
		const parsed = ANSI.parseCSI(_chunk, getStateCarrier(this));
		var result;
		
		if(!global.ANSI.enabled)
		{
			result = parsed.text;
		}
		else if(DEFAULT_ALLOW_DISABLE && !this.isTTY)
		{
			result = parsed.text;
		}
		else
		{
			result = parsed.data;
			
			if(DEFAULT_COLOR_FILTER)
			{
				//1st param can also be a string/uint8array/..!
				result = ANSI.colorFilter(parsed, getStateCarrier(this));
			}
		}

		if(DEFAULT_REPLACE_TABS)
		{
			result = ANSI.replaceTabs(result, DEFAULT_REPLACE_TABS);
		}
	
		if(!string(_chunk, true))
		{
			result = ANSI.toArray(result);
		}

		return _write.call(this, result, _encoding, _callback, ... _args);
	}

	process.stdout.__proto__.resetAnsiState = function()
	{
		const result = getStateCarrier(this);
		delete result.__ansi; return result;
	}
	
	process.stdout.__proto__.getAnsiState = function()
	{
		const carrier = getStateCarrier(this);
		return (carrier.__ansi || null);
	}

	//
	Reflect.defineProperty(String, 'TAB', { get: () => {
		if(int(DEFAULT_REPLACE_TABS) && DEFAULT_REPLACE_TABS > 0)
		{
			return ' '.repeat(DEFAULT_REPLACE_TABS);
		}

		if(string(DEFAULT_REPLACE_TABS, true))
		{
			return DEFAULT_REPLACE_TABS;
		}

		return null;
	}});

	//
	Reflect.defineProperty(console, 'ansi', {
		get: () => !!global.ANSI.enabled,
		set: (_value) => {
			if(!bool(_value)) return !!global.ANSI.enabled;
			return global.ANSI.enabled = _value; }});
	Reflect.defineProperty(process, 'ansi', {
		get: () => !!global.ANSI.enabled,
		set: (_value) => {
			if(!bool(_value)) return !!global.ANSI.enabled;
			return global.ANSI.enabled = _value; }});

	//
}

//
if(typeof global.ANSI.String === 'undefined')
{
	//
	global.ANSI.String = String;
	
	//
	Reflect.defineProperty(String, 'defaultFG', { value: () => (ESC + '[39m') });
	Reflect.defineProperty(String, 'defaultBG', { value: () => (ESC + '[49m') });
	
	Reflect.defineProperty(String.prototype, 'defaultFG', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return (`${String.defaultFG()}${this.valueOf()}` +
			(_reset ? ESC + DEFAULT_RESET_FOREGROUND : ''));
	}});
	
	Reflect.defineProperty(String.prototype, 'defaultBG', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return (`${String.defaultBG()}${this.valueOf()}` +
			(_reset ? ESC + DEFAULT_RESET_BACKGROUND : ''));
	}});

	Reflect.defineProperty(String, 'resetFG', { value: () => ('').resetFG() });
	Reflect.defineProperty(String, 'resetBG', { value: () => ('').resetBG() });
	
	Reflect.defineProperty(String.prototype, 'resetFG', { value: function()
	{
		return `${ESC}${DEFAULT_RESET_FOREGROUND}${this.valueOf()}`;
	}});
	
	Reflect.defineProperty(String.prototype, 'resetBG', { value: function()
	{
		return `${ESC}${DEFAULT_RESET_BACKGROUND}${this.valueOf()}`;
	}});

	Reflect.defineProperty(String.prototype, 'fg', { value: function(_red, _green, _blue, _reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return (`${ESC}[38;2;${_red};${_green};${_blue}m${this.valueOf()}` +
			(_reset ? ESC + DEFAULT_RESET_FOREGROUND : ''));
	}});

	Reflect.defineProperty(String.prototype, 'bg', { value: function(_red, _green, _blue, _reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return (`${ESC}[48;2;${_red};${_green};${_blue}m${this.valueOf()}` +
			(_reset ? ESC + DEFAULT_RESET_BACKGROUND : ''));
	}});

	Reflect.defineProperty(String, 'none', { value: () => (ESC + '[0m') });

	Reflect.defineProperty(String.prototype, 'none', { value: function()
	{
		return `${ESC}[0m${this.valueOf()}`;
	}});

	Reflect.defineProperty(String.prototype, 'bold', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return `${ESC}[1m${this.valueOf()}` +
			(_reset ? `${ESC}[22m` : '');
	}});

	Reflect.defineProperty(String.prototype, 'faint', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return `${ESC}[2m${this.valueOf()}` +
			(_reset ? `${ESC}[22m` : '');
	}});

	Reflect.defineProperty(String.prototype, 'italic', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return `${ESC}[3m${this.valueOf()}` +
			(_reset ? `${ESC}[23m` : '');
	}});

	Reflect.defineProperty(String.prototype, 'underline', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return `${ESC}[4m${this.valueOf()}` +
			(_reset ? `${ESC}[24m` : '');
	}});

	Reflect.defineProperty(String.prototype, 'blink', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return `${ESC}[5m${this.valueOf()}` +
			(_reset ? `${ESC}[25m` : '');
	}});

	Reflect.defineProperty(String.prototype, 'inverse', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return `${ESC}[7m${this.valueOf()}` +
			(_reset ? `${ESC}[27m` : '');
	}});

	Reflect.defineProperty(String.prototype, 'hidden', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return `${ESC}[8m${this.valueOf()}` +
			(_reset ? `${ESC}[28m` : '');
	}});

	Reflect.defineProperty(String.prototype, 'strike', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return `${ESC}[9m${this.valueOf()}` +
			(_reset ? `${ESC}[29m` : '');
	}});

	Reflect.defineProperty(String.prototype, 'log', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return `${ESC}[39m${this.valueOf()}`;
	}});

	Reflect.defineProperty(String.prototype, 'info', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return this.fg(... DEFAULT_INFO, _reset);
	}});

	Reflect.defineProperty(String.prototype, 'warn', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return this.fg(... DEFAULT_WARN, _reset);
	}});

	Reflect.defineProperty(String.prototype, 'error', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return this.fg(... DEFAULT_ERROR, _reset);
	}});

	Reflect.defineProperty(String.prototype, 'debug', { value: function(_reset = DEFAULT_RESET)
	{
		if(!bool(_reset)) _reset = (this.length > 0);
		return this.fg(... DEFAULT_DEBUG, _reset);
	}});

	Reflect.defineProperty(String.prototype, 'red', { value: String.prototype.error });
	Reflect.defineProperty(String.prototype, 'orange', { value: String.prototype.error });
	Reflect.defineProperty(String.prototype, 'green', { value: String.prototype.info });
	Reflect.defineProperty(String.prototype, 'blue', { value: String.prototype.debug });
	Reflect.defineProperty(String.prototype, 'yellow', { value: String.prototype.warn });

	Reflect.defineProperty(String, 'on', { value: () => {
		return `${ESC}[?5h`;
	}});

	Reflect.defineProperty(String, 'off', { value: () => {
		return `${ESC}[?5l`;
	}});

	Reflect.defineProperty(String, 'up', { value: (_lines = 1) => {
		return `${ESC}[${_lines}A`;
	}});

	Reflect.defineProperty(String, 'down', { value: (_lines = 1) => {
		return `${ESC}[${_lines}B`;
	}});

	Reflect.defineProperty(String, 'left', { value: (_columns = 1) => {
		return `${ESC}[${_columns}D`;
	}});

	Reflect.defineProperty(String, 'right', { value: (_columns = 1) => {
		return `${ESC}[${_columns}C`;
	}});

	Reflect.defineProperty(String, 'move', { value: (_column = 1, _line = 1) => {
		const tty = console.getTTY(true); if(!tty) return '';
		if(int(_line)) _line = (Math.getIndex(_line, tty.rows) + 1); else _line = null;
		_column = (Math.getIndex(_column, tty.columns) + 1);
		if(_line === null) return `${ESC}[${_column}G`;
		return `${ESC}[${_line};${_column}H${ESC}[${_line};${_column}f`;
	}});

	Reflect.defineProperty(String, 'home', { value: () => {
		return `${ESC}[H`;
	}});

	Reflect.defineProperty(String, 'save', { value: () => {
		return `${ESC}[s`;
	}});

	Reflect.defineProperty(String, 'load', { value: () => {
		return `${ESC}[u`;
	}});

	Reflect.defineProperty(String, 'show', { value: () => {
		return `${ESC}[?25h`;
	}});

	Reflect.defineProperty(String, 'hide', { value: () => {
		return `${ESC}[?25l`;
	}});

	Reflect.defineProperty(String, 'saveScreen', { value: () => {
		return `${ESC}[?47h`;
	}});

	Reflect.defineProperty(String, 'loadScreen', { value: () => {
		return `${ESC}[?47l`;
	}});

	Reflect.defineProperty(String, 'clearLine', { value: () => {
		return `${ESC}[2K`;
	}});

	Reflect.defineProperty(String, 'clearScreen', { value: () => {
		return `${ESC}[2J`;
	}});

	Reflect.defineProperty(String, 'clearBuffer', { value: () => {
		return `${ESC}[3J`;
	}});

	Reflect.defineProperty(String, 'clearAfter', { value: () => {
		return `${ESC}[0J`;
	}});

	Reflect.defineProperty(String, 'clearBefore', { value: () => {
		return `${ESC}[1J`;
	}});

	Reflect.defineProperty(String, 'clearLineAfter', { value: () => {
		return `${ESC}[0K`;
	}});

	Reflect.defineProperty(String, 'clearLineBefore', { value: () => {
		return `${ESC}[1K`;
	}});

}

//
// I really don't like that `Node.js`' console output functions:
//
// 	(a) write colored output by themselves
// 	(b) also don't encode 'em properly (it's not the whole message)
//
// If you don't want (default) colors at all, disable them by the `const`
// on top of this file. If you'd like to adapt them, see my String(.prototype)
// extensions above.
//
if(typeof global.ANSI.Console === 'undefined')
{
	//
	global.ANSI.Console = console;

	//
	console.__cursorSave = false;
	console.__cursorLoad = false;

	Reflect.defineProperty(console, 'load', { value: (_force = false) => {
		if(!console.__cursorSave && !_force) return false;
		const stream = console.getTTY(true);
		stream._write(String.load());
		return console.__cursorLoad = true;
	}});

	Reflect.defineProperty(console, 'save', { value: () => {
		const stream = console.getTTY(true);
		if(!stream) return false;
		stream._write(String.save());
		return console.__cursorSave = true;
	}});

	//
	Reflect.defineProperty(console, 'silent', {
		get: () => {
			if(bool(global.SILENT))
			{
				return global.SILENT;
			}

			return false;
		},
		set: (_value) => {
			if(bool(_value))
			{
				return global.SILENT = _value;
			}

			return console.silent;
		}
	});

	//
	console.__flash = false;

	Reflect.defineProperty(console, 'flash', {
		get: () => { const stream = console.getTTY(true);
			if(!stream) return console.__flash = false;
			return !!console.__flash; },
		set: (_value) => {
			if(!bool(_value))
			{
				return console.flash;
			}

			const stream = console.getTTY(true);

			if(!stream)
			{
				return console.__flash = false;
			}
			else if(_value)
			{
				stream._write(String.on());
			}
			else
			{
				stream._write(String.off());
			}

			return console.__flash = _value;
		}});
	
	//
	const consoleOutput = (_stream, _args) => {
		if(console.silent && !_stream.isUpperCase)
		{
			return 0;
		}
		else
		{
			_stream = _stream.toLowerCase();
		}

		var result;
		
		if(_args.length === 1 && int(_args[0]))
		{
			result = eol(_args[0] - 1);
		}
		else
		{
			result = util.format(... _args);
		}
		
		if(DEFAULT_COLORS)
		{
			result = result[_stream](true);
		}
		
		switch(_stream)
		{
			case 'log':
			case 'info':
			case 'debug':
				_stream = process.stdout;
				break;
			case 'warn':
			case 'error':
				_stream = process.stderr;
				break;
		}
		
		result = ESC + '[0m' + result + ESC + '[0m' + EOL;
		return _stream.write(result);
	};
	
	//
	console.eol = (_count = 1) => consoleOutput('log', [ _count ]);
	console.log = (... _args) => consoleOutput('log', _args);
	console.info = (... _args) => consoleOutput('info', _args);
	console.warn = (... _args) => consoleOutput('warn', _args);
	console.error = (... _args) => consoleOutput('error', _args);
	console.debug = (... _args) => consoleOutput('debug', _args);
	//
	console._eol = (_count = 1) => consoleOutput('LOG', [ _count ]);
	console._log = (... _args) => consoleOutput('LOG', _args);
	console._info = (... _args) => consoleOutput('INFO', _args);
	console._warn = (... _args) => consoleOutput('WARN', _args);
	console._error = (... _args) => consoleOutput('ERROR', _args);
	console._debug = (... _args) => consoleOutput('DEBUG', _args);

	//

}

//

