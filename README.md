# music not



## motivation

article:
<https://medium.com/@alexcouch/how-i-d-redesign-piano-sheet-music-355c4f9012f1>

I loved the article and got the idea of implementing such visualization in SVG based on a given sound sheet.
I had already processed MIDI files before and it is very hard. This time I tried with MusicXML, which gave much
better results because it's more of a human-friendly format, storing both MIDI information and score layout info.

Used the [musescore sheetmusic database](https://musescore.com/sheetmusic) to fetch some simple and recognizable songs.

I ended up parsing the MusicXML file to a simpler format and playing it back naively with WebAudio.
Kinda works in a modular way, though it relies on setInterval so far O:)

Now for the score rendering part: I managed to summarize the most relevant features of MusicXML for this task -
it may not work for very complex songs though.

It focuses on a part of the song (in MIDI/MusicXML terms this means one instrument/track).
For now it is choosing the first one but the user can choose which one.

Further improvements:

* attempt to elect which notes to play with the left and right hands.
For now this feature is relying on voice segmentation (first voice in measure is left, remaining are right).

* (nice to have) summarize note durations/height with a criteria to reduce score height

* (nice to have) segment score in pages



## musicXML ref

* [attributes](http://www.musicxml.com/tutorial/the-midi-compatible-part/attributes/)
* [pitch](http://www.musicxml.com/tutorial/the-midi-compatible-part/pitch/)
* [duration](http://www.musicxml.com/tutorial/the-midi-compatible-part/duration/)
* [tied notes](http://www.musicxml.com/tutorial/the-midi-compatible-part/tied-notes/)
* [chords](http://www.musicxml.com/tutorial/the-midi-compatible-part/chords/)
* [multi-part music](http://www.musicxml.com/tutorial/the-midi-compatible-part/multi-part-music/)
* [repeats](http://www.musicxml.com/tutorial/the-midi-compatible-part/repeats/)
* [multi-part music 2](http://www.musicxml.com/tutorial/notation-basics/multi-part-music-2/)



## notes

Piano range is A0=27.50Hz to C8=4186Hz

Guitar strings are E2=82.41Hz, A2=110Hz, D3=146.8Hz, G3=196Hz, B3=246.9Hz, E4=329.6Hz

Bass strings are (5th string) B0=30.87Hz, (4th string) E1=41.20Hz, A1=55Hz, D2=73.42Hz, G2=98Hz

parts stand for different instruments/players, running side by side in the score sheet

voices in the same measure use the same instrument, are implicitly in the same part and stand for different sequences im parallel



## JS files

- `common.js` - some code user several times
- `getMusicXMLFromInput.js` - reads file from user. supports both XML and MXL zipped MusicXML files. returns XML document on cb
- `saveSVG.js` - creates data URI from SVG on the page. downloads it via A element which is created and clicked
- `generator.js` - generates sounds using webaudio
- `parseSong.js` - parse relevant song structure from XML document
- `playSong.js` - plays the chosen song based on parsed song structure and using generators above 
- `renderSong.js` - renders visual representation for the music score with SVG based on parsed song structure


## results so far

* [index](http://josepedrodias.github.io/musicnot/index.html)
* [guitar](http://josepedrodias.github.io/musicnot/guitar.html)



## roadmap

- [x] support for MusicXML file reading, both directly (xml) and zip (mxl)
- [x] parsing of relevant song data from MusicXML
- [x] using generator to play a song (just the selected part, first voice)
- [x] SVG visualization of a part based on song data
- [x] example displaying local musicxml files to simplify demo for new users
- [x] save SVG/print support
- [x] request user to choose which part to render
- [ ] filter out measures with no info for the chosen part!
- [ ] smart criteria for clustering notes between left/right hand
- [ ] support for multiple voices playback
