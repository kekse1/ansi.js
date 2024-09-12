<img src="https://kekse.biz/github.php?draw&override=github:ansi.js" />

# [`ansi.js`] ANSI Escape Sequences @ JavaScript/node.js

## Index
//**TODO**/

## //**TODO**//
//**TODO**/

## Download
* [Version **v0.0.0**](js/ansi.js) (created **2024-09-12**) [**TODO**!!1]
* [**Polyfill**](js/polyfill.js)

### Polyfill
The [polyfill](js/polyfill.js) is important since I created this project
within another one, where I massively extended the base functions/objects, etc.

Since I'm using this one also there, I decided not to change the sources,
but provide this polyfill here, with only the extensions which are really
necessary here. .. Saves time and space.

## Colors
This is where this project 'began' (after many other attempts, mostyle within my lib.js/v4).

### The beginning
For more comfort, I overrided the `[39m` and `[49m` this way, that they'll not reset the
colors to the regular ones, but to the **last used** colors (except when starting or after
the 'real' reset `[0m`.

This already works, but there is more yet to come..

#### How it works
I'm overridine the regular `.write()` function of the `(Write-)Stream` (which also holds for
the `process.stdio`), so it'll only save the last used color(s) when it's really writing some
data, not only on generating the sequences (see the functions in my `ANSI` class).

If you work with partial data, it's really not difficult: so I'm using a state object within
the streams, so parsing etc. can resume laters (e.g. if your sequences start, but end within
the next chunk(s)).

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

