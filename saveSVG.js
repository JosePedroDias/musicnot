function saveSVG(linkLabel, ctnEl) {
    'use strict';

    var svgEl = document.querySelector('svg');
    svgEl.setAttribute('version', '1.1');
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    var markup = svgEl.outerHTML;
    var b64 = btoa(markup);

    var aEl = document.createElement('a');
    //aEl.appendChild( document.createTextNode(linkLabel) );
    aEl.setAttribute('download', linkLabel + '.svg');
    aEl.href = 'data:image/svg+xml;base64,\n' + b64;
    ctnEl.appendChild(aEl);
    aEl.click();
}
