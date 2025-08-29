// ==UserScript==
// @name         mb. SHOW CAA COMMENTS IN REORDER PAGE
// @version      2025.8.29
// @description  Show cover art comments to ease reordering, especially when thumbnails have not been generated yet.
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_SHOW-CAA-COMMENTS-IN-REORDER-PAGE
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_SHOW-CAA-COMMENTS-IN-REORDER-PAGE.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2015-09-09; http://forums.musicbrainz.org/viewtopic.php?pid=31473#p31473
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      /^https?:\/\/((beta|test)\.)?musicbrainz\.(org|eu)\/release\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/(add|reorder)-cover-art/
// @run-at       document-end
// ==/UserScript==
"use strict";
var imageLoaders = document.querySelectorAll("div.thumb-position img[src*='MB/information'][title]");
for (var i = 0; i < imageLoaders.length; i++) {
	var subtitle = document.createElement("div");
	var splitText = imageLoaders[i].getAttribute("title").match(/^([^(]+)?(?: \(([\w\W]+)\))?$/);
	if (splitText) {
		for (var j = 1; j < splitText.length; j++) {
			if (splitText[j]) {
				subtitle.appendChild(document.createElement("div").appendChild(document.createTextNode(splitText[j])).parentNode).style.setProperty("border-top", (j - 1) + "px dashed black");
			}
		}
	}
	imageLoaders[i].parentNode.parentNode.insertBefore(document.createElement("div").appendChild(subtitle).parentNode, imageLoaders[i].parentNode.parentNode.firstChild.nextSibling.nextSibling).style.setProperty("background-color", "#ff6");
	imageLoaders[i].parentNode.parentNode.style.setProperty("height", "165px");
}
