// ==UserScript==
// @name         voicepublisher. TURBO BOOST
// @version      2023.4.21
// @description  Download audio folders as zip files; Double click to open call details; Nice call details copy paste with layout
// @namespace    https://github.com/jesus2099/konami-command
// @supportURL   https://github.com/jesus2099/konami-command/labels/voicepublisher_TURBO-BOOST
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/voicepublisher_TURBO-BOOST.user.js
// @author       jesus2099
// @licence      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/
// @licence      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @since        2022-05-16
// @require      https://github.com/jesus2099/konami-command/raw/de88f870c0e6c633e02f32695e32c4f50329fc3e/lib/SUPER.js?version=2022.3.24.224
// @grant        GM_download
// @match        *://*.voicepublisher.net/*
// @run-at       document-ready
// ==/UserScript==
"use strict";

var userjs = GM_info.script.name.replace(/\.\s/, "_").replace(/\s/g, "-");

// PREVENT XHR BROWSING
// Force normal browsing with pages unload and load as before. Maybe just a temporary work-around for lost filters bug ticket 110337, and user script loading issues #762
document.addEventListener("click", function (event) {
	if (event.target.matches("a[href]")) {
		event.preventDefault();
		event.target.style.setProperty("text-decoration", "overline wavy");
		location.assign(event.target.getAttribute("href"));
	}
});

/* global I18n */ // eslint no-undef exception

// Work-around Call History change app crash bug
if (location.pathname == "/calls") {
	var selected_application = document.querySelector("#select2-chosen-1");
	if (selected_application) {
		// STEP 1: Save last clicked application, in case crash happens
		self.addEventListener("beforeunload", function (event) {
			localStorage.setItem(userjs + "_last_application", selected_application.textContent);
		});
		// STEP 3: Detect crash flag and handle post-crash
		if (localStorage.getItem(userjs + "_call_history_crash") === "1") {
			localStorage.removeItem(userjs + "_call_history_crash");
			replaceChildren(document.createTextNode(localStorage.getItem(userjs + "_last_application")), selected_application);
			selected_application.parentNode.style.setProperty("background-color", "#fcf");
			selected_application.parentNode.style.setProperty("text-decoration", "underline dotted");
			selected_application.setAttribute("title", GM_info.script.name + " retaliated from Call History change app crash bug");
		}
	} else {
		// STEP 2: Detect crash, flag and go back
		if (
			document.body.childNodes.length === 1
			&& document.querySelectorAll("body > div.dialog > div > h1").length === 1
			&& document.querySelectorAll("body > div.dialog > div + p").length === 1
		) {
			localStorage.setItem(userjs + "_call_history_crash", "1");
			history.back();
		}
	}
}

var texts = {
	copy: {en: "Copy", fr: "Copier"},
	download: {en: "Download ", fr: "Télécharger "},
};
var app;
if (location.pathname.match(/\/audio_folders\/\d+\/audios/)) {
	// inside an application audio folder
	app = document.querySelector("div.sidebar ul.tree > li.active > a[aria-current='page']");
	app = {
		id: app.getAttribute("href").match(/audio_folders\/(\d+)\/audios/)[1],
		name: app.textContent.trim()
	};
	var toolbox = document.querySelector("div#content-sidebar div.title-bar ul.toolbox li.dropdowns_right");
	var ExportAllButton = toolbox.querySelector("a.btn[href$='export_all']");
	var DLButton = createTag("a", {a: {class: "btn btn-default"}, s: {backgroundColor: "#fcf"}, e: {click: function(event) {
		download(app.id, app.name);
	}}}, [texts.download[I18n.lang], createTag("b", {s: {color: "black", background: "#fdf", padding: "0 4px"}}, app.name), ".zip"]);
	if (ExportAllButton) {
		toolbox.replaceChild(DLButton, ExportAllButton);
	} else {
		toolbox.appendChild(DLButton);
	}
} else if (location.pathname == "/audio_folders") {
	// on the list of application audio folders
	setInterval(function() {
		for (
			var audioFolderPencils = document.querySelectorAll("div#main_frame table#audio_folders_table > tbody > tr > td.actions > a[href$='/edit']"), p = 0;
			p < audioFolderPencils.length; p++
		) {
			if (!audioFolderPencils[p].parentNode.querySelector("a." + userjs + "_export")) {
				app = audioFolderPencils[p].parentNode.closest("tr").querySelector("a[href$='/audios']");
				audioFolderPencils[p].parentNode.insertBefore(
					createTag("a", {a: {title: texts.download[I18n.lang] + app.textContent.trim() + ".zip", class: userjs + "_export"}, e: {click: function(event) {
						app = event.target.closest("tr").querySelector("a[href$='/audios']");
						download(app.getAttribute("href").match(/\d+/)[0], app.textContent.trim());
					}}}, createTag("span", {a: {class: "glyphicon glyphicon-share-alt"}, s: {backgroundColor: "#fcf"}})),
					audioFolderPencils[p]
				);
			}
		}
	}, 500);
} else if (location.pathname == "/calls") {
	// double click call to open call details
	waitForElement("table#big_data_listings_call_history_listings_table > tbody", function(calls) {
		calls.addEventListener("dblclick", function(event) {
			event.target.closest("tr").querySelector("td.actions i").click();
		});
	});
	// allow call details nice copy with layout for pasting in document or e-mail
	waitForElement("div#callDetailsModal div.modal-footer", function(element) {
		element.appendChild(createTag("button", {a: {class: "btn btn-info"}, e: {click: function (event) {
			var call_details = document.querySelector("div#callDetailsModal");
			if (call_details) {
				var call_information = call_details.querySelector("fieldset.call_information");
				if (!call_information.classList.contains(GM_info.script.author)) {
					var information_labels = call_details.querySelectorAll("fieldset.call_information div.group > label + span");
					for (var l = 0; l < information_labels.length; l++) {
						information_labels[l].insertBefore(document.createTextNode("\u00a0: "), information_labels[l].firstChild);
					}
					var route_items = call_details.querySelectorAll("fieldset.call_route > div > span.item");
					for (var i = 0; i < route_items.length; i++) {
						route_items[i].firstChild.replaceChild(document.createTextNode(route_items[i].firstChild.textContent.replace(/[:\s]*$/, "")), route_items[i].firstChild.firstChild);
						route_items[i].firstChild.nextSibling.insertBefore(document.createTextNode("\u00a0: "), route_items[i].firstChild.nextSibling.firstChild);
						route_items[i].appendChild(createTag("br"));
					}
					call_information.classList.add(GM_info.script.author);
				}
			}
			getSelection().selectAllChildren(document.querySelector("div#callDetailsModal"));
			document.execCommand("copy");
			getSelection().removeAllRanges();
		}}}, texts.copy[I18n.lang]));
	});
}
function download(appID, appName) {
	downloading();
	GM_download({
		url: "/audio_folders/" + appID + "/audios/export_all",
		name: appName + ".zip",
		onload: downloading
	});
}
function downloading(event) {
	if (event) {
		// callback when loading ends
		document.body.removeChild(document.querySelector("div#" + userjs + "_loading"));
	} else {
		// manual call when loading starts
		document.body.appendChild(createTag("div", {a: {id: userjs + "_loading"}}, [
			createTag("div", {
				s: {position: "fixed", background: "#303", opacity: ".2", top: "0px", left: "0px", width: "100%", height: "100%", zIndex: "77"}
			}),
			createTag("div", {
				a: {class: "dataTables_processing "},
				s: {position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textShadow: "0 0 8px white", zIndex: "100"}
			}, I18n.dataTables.language.loadingRecords)
		]));
	}
}
