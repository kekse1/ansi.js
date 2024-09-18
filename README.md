<img src="https://kekse.biz/github.php?draw&override=github:ansi.js" />

# ANSI Escape Sequences @ JavaScript/node.js

## Index
1. [Introduction](#introduction)
2. [Download](#download)
	* [Polyfill](#polyfill)
3. [Description and Details](#description-and-details)
	* [Colors](#colors)
		* [Where it began](#where-it-began)
		* [How it works](#how-it-works)
		* [`WriteStream`](#writestream)
	* [`String`](#string)
	* [`console`](#console)
4. [References](#references)
5. [Copyright and License](#copyright-and-license)

## Introduction
For your info: this is about **CSI** ANSI escape sequences. For more info
see the [References](#references) below.

## Download
* [Version **v1.1.1**](js/ansi.js) (updated **2024-09-19**)
* [**Polyfill**](js/polyfill.js) (still **TODO**!)

//**TODO**// The _polyfill_ is still missing, but it's on my TODO list.
Either you wait for it, or feel free to create one. ... if you can't wait.

### Polyfill
The [polyfill](js/polyfill.js) is important since I created this project
within another one, where I massively extended the base functions/objects, etc.

## Description and Details
At first, take a look at the `const DEFAULT_*` on top of the file. Kinda configuration.. jfyi.

### Colors
This is where this project 'began' (after many other attempts, mostyle within my
[**`v4`**](https://github.com/kekse1/v4/)/[**`lib.js`**](https://github.com/kekse1/lib.js/)).

#### Where it began
For more comfort, I extended the ANSI sequences by **`[390m`** and **`[490m`** (configurable,
see the constants on top of the file), so It can easily 'reset' the colors (both foreground
and background) back to their **last state**, not only the real 'default colors'; in this
sense: both sequences are originally 'inspired' by the 'reset to default colors' ones, so
**`[39m`** and **`[49m`**.

Just leave the default `const DEFAULT_COLOR_FILTER` set to `true`.

#### How it works
I'm overridine the regular `.write()` function of the `(Write-)Stream` (which also holds for
the `process.stdio`), so it'll only save the last used color(s) when it's really writing some
data, not only on generating the sequences (see the functions in my `ANSI` class).

#### `WriteStream`
Depending on your `const DEFAULT_ALLOW_DISABLE` the code filters out any sequences,
when a stream is not bound to a real terminal (so `!.isTTY`). Useful when logging to files,
like `./test.js >test.log 2>&1`.

### `String`
Here are the most sequences available, so you can (mostly) directly use smth. like
`'test'.bold().debug()`. Additionally these two are also implemented:

* String.prototype.**text**
* String.prototype.**textLength**

Sure, eh? Maybe if you use `printf()` or smth. like padding, they can be very handy.

Corresponding to the `DEFAULT_RESET` (again, on top) any function like `'test'.bold()`
without first/only Boolean argument will decide whether to close it's ANSI function
again after the string.. or rather: if there's no string available (if it's .length is 0),
it assumes you'd like to enable such a style/color for more strings/data to come. Otherwise,
any opened escape sequence will automatically be closed again after the string. ... if, and
only if it's implemented in `String.prototype` - there are some in the `String` itself, btw.

### `console`
At first, I've overrided the default `console.log()` etc., since the newer version of
[**Node.js**](https://nodejs.org/) do some colorization on their own.. but this is
horribly ugly done. And I'm using my own colors for these five default 'streams' now.

Additionally, I implemented the `console.silent` (Boolean) flag. If set (to `true`),
there'll be no such `console` output. You can always use the regular `process.stdio[]`
(here an array of `[ .stdin, .stdout, .stderr ]`), but the regular output like in
`console.log()` is disabled then.

Last but not least, beneath my new `console.eol()` function (optional integer argument)
any `console.*()` can also get only one Integer parameter with the number of newlines
it should print (and only these). In all other cases it's going to use the regular
`util.format()`.

## References
* https://en.m.wikipedia.org/wiki/ANSI_escape_code
* https://xtermjs.org/docs/api/vtfeatures/
* https://vt100.net/docs/vt100-ug/chapter3.html#VT52CUP
* https://invisible-island.net/xterm/ctlseqs/ctlseqs.html

# Copyright and License
The Copyright is [(c) Sebastian Kucharczyk](COPYRIGHT.txt),
and it's licensed under the [MIT](LICENSE.txt) (also known as 'X' or 'X11' license).

<a href="favicon.512px.png" target="_blank">
<img src="favicon.png" alt="Favicon" />
</a>

