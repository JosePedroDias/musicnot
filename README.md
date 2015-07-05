# music not

## motivation

article:
<https://medium.com/@alexcouch/how-i-d-redesign-piano-sheet-music-355c4f9012f1>

midi sequencer:
<https://musescore.com>



## Modules:

(parse musicXML)
<https://github.com/saebekassebil/musicjson>

(generate SVG on server-side via snapSVG)
<https://github.com/dodo/node-raphael/blob/master/index.js>

(piano interface + web audio)
<http://stuartmemo.com/qwerty-hancock/>



## mxl  to json

	unzip file
	rename .xml file and remove meta dir
	node index.js (gera out.json)



## musicXML ref

* [attributes](http://www.musicxml.com/tutorial/the-midi-compatible-part/attributes/)
* [pitch](http://www.musicxml.com/tutorial/the-midi-compatible-part/pitch/)
* [duration](http://www.musicxml.com/tutorial/the-midi-compatible-part/duration/)
* [tied notes](http://www.musicxml.com/tutorial/the-midi-compatible-part/tied-notes/)
* [chords](http://www.musicxml.com/tutorial/the-midi-compatible-part/chords/)
* [multi-part music](http://www.musicxml.com/tutorial/the-midi-compatible-part/multi-part-music/)
* [repeats](http://www.musicxml.com/tutorial/the-midi-compatible-part/repeats/)
