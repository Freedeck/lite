
import { translatePage } from "../../shared/localization.js";
import contextual from "./lib/ctxl.js";
universal.ctx = contextual;

document.body.appendChild(contextual.createViewContainer());
document.body.querySelector(contextual.view_container).style.display = 'none';


HTMLElement.prototype.setHTML = function (html) {
	this.innerHTML = html;
};

universal.listenFor("init", () => {
	const login = document.createElement("li");
	login.id = "constat";
	document.querySelector("#sidebar > ul").appendChild(login);
});

document.onkeydown = (ev) => universal.uiSounds.playSound("int_type");

const pages = ["library", "plugins", "marketplace", "settings", "prompts", "setup", "customtheme"];
for(const page of pages) contextual.addView(page);

const sidebarEle = document.createElement("div");
sidebarEle.id = "sidebar";
const sidebarUl = document.createElement("ul");
sidebarEle.appendChild(sidebarUl);
let sidebar = [];
universal.reloadRight = () => {
	universal.flags.reload();
	sidebar = [
		{ Tiles: "index.html" },
		{ Library: "library.html" },
		{ Marketplace: "marketplace.html" },
		{ Settings: "settings.html" },
	];
	if(universal.flags.isEnabled("connect-tab")) {
		sidebar.push({ Connect: "/new-connect.html?id=Companion&new_ip=true" })
	}
	if(universal.load("has_setup") === "false") {
		sidebar = [
			{ "Setup": "setup.html" },
			{ "Pair Device": "prompts.html" },
		]
	}
	if(universal.load("cte") === "true")
		sidebar.push({'Themer': 'customtheme.html'});
	if(universal.flags.isEnabled("recompile-tab"))
		sidebar.push({'Recompile': '+universal.send(universal.events.default.recompile)'})
	sidebarUl.setHTML(
		`<li style="font-size: .6em; background: none; margin: 0 auto;">
		<span style="display:flex;align-items:center;">
		<img src="/common/icons/fd.png" width="75" height="75" alt="Freedeck" />

		</span>
		</li>`,
	);
	for (const itm of sidebar) {
		const name = Object.keys(itm)[0];
		const val = itm[name];
		const page = pages.find((p) => val.includes(p)) || val;
		if (val.startsWith("+")) {
			const ele = document.createElement("li");
			ele.setHTML(`<a data-i18n-key="sidebar.${name}" onclick="${val.substring(1)}">${name}</a>`);
			sidebarUl.appendChild(ele);
			break;
		}
		const ele = document.createElement("li");
		ele.setAttribute("hovereffect", "yes");
		ele.setHTML(`<a data-i18n-key="sidebar.${name}" onclick="universal.vopen('${page}')">${name}</a>`);
		sidebarUl.appendChild(ele);
	}
	translatePage(sidebarUl);
}

universal.reloadRight();
universal.vclose = () => {
	const view_container = document.querySelector(universal.ctx.view_container);
	setAnim(view_container, "view-out 0.5s");
	setTimeout(() => {
		setDisplay(view_container, "none");
	}, 500);
}

universal.vopen = (v) => {
	if(universal.load("has_setup") === "false") return;
	universal.uiSounds.playSound("sidebar");
	const view_container = document.querySelector(universal.ctx.view_container);
	const leftSidebar = document.querySelector(".sidebar");

	if(view_container == null) return;

	if (!pages.includes(v)) {
		if(leftSidebar.style.display === 'none') document.querySelector(".toggle-sidebar button").click();
		setAnim(view_container, "view-out 0.5s");
		setTimeout(() => {
			setDisplay(view_container, "none");
		}, 500);
		if (v.startsWith("/")) window.location.href = v;
		return;
	}

	setDisplay(view_container, "block");
	if(leftSidebar.style.display === 'flex') document.querySelector(".toggle-sidebar button").click();
	universal.ctx.destructiveView(v);
	setAnim(view_container, "view-in 0.5s");
	setTimeout(() => {
		translatePage(view_container);
	},250);
};

function setDisplay(ele, val) {
	if(ele) ele.style.display = val;
}

function setAnim(ele, val) {
	if(ele) ele.style.animation = val;
}

document.body.appendChild(sidebarEle);
