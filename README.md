# music not

## motivation

article:
<https://medium.com/@alexcouch/how-i-d-redesign-piano-sheet-music-355c4f9012f1>

midi sequencer:
<https://musescore.com>



## Modules:

### parse musicXML
<https://github.com/saebekassebil/musicjson>

### generate SVG on server-side via snapSVG  
<https://github.com/dodo/node-raphael/blob/master/index.js>

###piano interface + web audio
<http://stuartmemo.com/qwerty-hancock/>  
<http://loov.github.io/jsfx/music.html> <http://loov.github.io/jsfx/jsmusic.js>

### render
<http://www.alphatab.net/>  
<http://www.vexflow.com/>

### play
<https://github.com/oampo/Audiolet>

### compute
<https://github.com/saebekassebil/teoria>  
<http://www.seventhstring.com/resources/notefrequencies.html>


## mxl to json

	unzip file
	rename .xml file and remove meta dir
	node musicxml2json.js file.xml



## musicXML ref

* [attributes](http://www.musicxml.com/tutorial/the-midi-compatible-part/attributes/)
* [pitch](http://www.musicxml.com/tutorial/the-midi-compatible-part/pitch/)
* [duration](http://www.musicxml.com/tutorial/the-midi-compatible-part/duration/)
* [tied notes](http://www.musicxml.com/tutorial/the-midi-compatible-part/tied-notes/)
* [chords](http://www.musicxml.com/tutorial/the-midi-compatible-part/chords/)
* [multi-part music](http://www.musicxml.com/tutorial/the-midi-compatible-part/multi-part-music/)
* [repeats](http://www.musicxml.com/tutorial/the-midi-compatible-part/repeats/)



## notes

Piano range is A0=27.50Hz to C8=4186Hz

Guitar strings are E2=82.41Hz, A2=110Hz, D3=146.8Hz, G3=196Hz, B3=246.9Hz, E4=329.6Hz

Bass strings are (5th string) B0=30.87Hz, (4th string) E1=41.20Hz, A1=55Hz, D2=73.42Hz, G2=98Hz




## TODO

- [ ] initial svg render based on song
- [ ] backup support? (may not be required)
- [ ] using generator to play a song (at least just one voice)
