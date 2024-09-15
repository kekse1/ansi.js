<img src="https://kekse.biz/github.php?draw&override=github:ansi.js" />

# ANSI Escape Sequences @ JavaScript/node.js

## Index
1. [Introduction](#introduction)
2. [Download](#download)
    * [Polyfill](#polyfill)
3. [Colors](#colors)
    * [Where it began](#where-it-began)
    * [How it works](#how-it-works)
4. [References](#references)
5. [Copyright and License](#copyright-and-license)

## Introduction
//**TODO**/ ...

## Status
My own version is a bit bigger, but the most parts are available [here](#download).

The _polyfill_ is still missing, but it's on my TODO list. Either you wait for it,
or feel free to create it (even though I'm **not** going to upload your version here).

## Download
* [Version **v1.0.0**](js/ansi.js) (created **2024-09-15**)
* [**Polyfill**](js/polyfill.js) (still **TODO**!)

//**TODO**/

### Polyfill
The [polyfill](js/polyfill.js) is important since I created this project
within another one, where I massively extended the base functions/objects, etc.

## Colors
This is where this project 'began' (after many other attempts, mostyle within my
[**`v4`**](https://github.com/kekse1/v4/)/[**`lib.js`**](https://github.com/kekse1/lib.js/)).

### Where it began
For more comfort, I extended the ANSI sequences by **`[390m`** and **`[490m`** (configurable,
see the constants on top of the file), so It can easily 'reset' the colors (both foreground
and background) back to their **last state**, not only the real 'default colors'; in this
sense: both sequences are originally 'inspired' by the 'reset to default colors' ones, so
**`[39m`** and **`[49m`**.

This already works, but there is more yet to come..

### How it works
I'm overridine the regular `.write()` function of the `(Write-)Stream` (which also holds for
the `process.stdio`), so it'll only save the last used color(s) when it's really writing some
data, not only on generating the sequences (see the functions in my `ANSI` class).

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

