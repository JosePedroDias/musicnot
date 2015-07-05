https://medium.com/@alexcouch/how-i-d-redesign-piano-sheet-music-355c4f9012f1

https://musescore.com



Modules:

https://github.com/danigb/music-parser
https://github.com/ripieno/musicxml-interfaces
https://github.com/saebekassebil/musicjson
https://github.com/dodo/node-raphael/blob/master/index.js


.mxl ->
unzip file
rename .xml file and remove meta dir
node index.js (gera out.json)
echo 'song=' > out.js
cat out.json >> out.js

python -m SimpleHTTPServer 5555 &



song['score-partwise']['part'].measure[idx]
attributes
	clef = [{line:'2',sign:'G'},{line:'4',sign:'F'}]
	divisions = 4
	key = {mode:'major',fifths:'1'}
	staves = 2
	beat-type: 4
	beats: 4
	note []:
		duration:4
		pitch: {octave:3, step:G}
		staff: 1
		stem: up
		type: quarter
		voice: 1

