// ==UserScript==
// @name         mb. ALL RELEASE GROUPS
// @version      2024.4.11
// @description  Artist overview page (discography): Show all release groups by default, then you can filter out bootlegs to show only official release groups (instead of the opposite default)
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/mb_ALL-RELEASE-GROUPS
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_ALL-RELEASE-GROUPS.user.js
// @author       jesus2099
// @contributor  Naja Melan’s “Always show all releases on Musicbrainz v1.0” https://web.archive.org/web/20131104205707/userscripts.org/scripts/show/9456
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2019-01-03
// @icon         data:image/gif;base64,R0lGODlhEAAQAMIDAAAAAIAAAP8AAP///////////////////yH5BAEKAAQALAAAAAAQABAAAAMuSLrc/jA+QBUFM2iqA2ZAMAiCNpafFZAs64Fr66aqjGbtC4WkHoU+SUVCLBohCQA7
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        none
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==
"use strict";
var str_GUID = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
var mb_host = "(beta|test)\.musicbrainz\.org";
document.addEventListener("mousedown", function(event) {
	var element = event.target || event.srcElement;
	if (element && element.nodeType == Node.ELEMENT_NODE) {
		if (element.tagName != "A") {
			element = getParent(element, "a");
		}
		if (element && element.tagName == "A" && !element.classList.contains("jesus2099-bypass-mb_ALL-RELEASE-GROUPS")) {
			process(element);
		}
	}
});
function process(anchor) {
	var HREF = anchor.getAttribute("href");
	if (HREF && (location.host.match(new RegExp("^" + mb_host + "$")) || HREF.match(new RegExp("//" + mb_host + "/")))) {
		var newHref = prefer(HREF);
		if (newHref) {
			anchor.setAttribute("href", newHref);
			anchor.style.setProperty("background-color", "#cfc");
			anchor.style.setProperty("color", "#606");
			anchor.style.setProperty("text-decoration", "line-through");
			var tooltip = anchor.getAttribute("title") || "";
			if (tooltip) {
				tooltip += "\n";
			}
			anchor.setAttribute("title", tooltip + "old: " + HREF + "\nnew: " + newHref);
		}
	}
}
function prefer(URL) {
	var newUrl = URL;
	var urlMatch = URL.trim().match(new RegExp("^(.*)?(/artist/" + str_GUID + ")(\\?.*)?(#.*)?$"));
	if (urlMatch) {
		var query = urlMatch[3] || "";
		if (!query.match(/all=/)) {
			query = addQueryParameters(query, "all=1");
		}
		newUrl = (urlMatch[1] ? urlMatch[1] : "") + urlMatch[2] + query + (urlMatch[4] ? urlMatch[4] : "");
	}
	return (newUrl && newUrl != URL ? newUrl : null);
}
function addQueryParameters(query, parameters) {
	return query + (query.match(/\?/) ? "&" : "?") + parameters;
}
