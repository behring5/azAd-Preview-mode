/*!
 * azAd Boilerplate v2.0.1
 * https://github.com/behring5/azad-boilerplate
 * Christoph Eckert <christoph@behring5.de>
 */
/////////////////////////////
// Clickout functionality
document.addEventListener('DOMContentLoaded', function onDOMReady() {
	const urlClickTag = getUrlParam('clicktag');
	if (typeof urlClickTag === 'string' && urlClickTag !== '') {
		clickTag = urlClickTag;
		azLog({ success: 'clicktag found in URL: ' + clickTag });
	} else if (typeof clickTag !== 'undefined' && clickTag !== '') {
		// azLog({ success: 'hardcoded clickTag found: ' + clickTag });
		azLog({ info: 'hardcoded clickTag found. will be overwritten when ad is served with ?clicktag=[ENCODED_CLICKURL]' });
	} else {
		azLog({ warning: 'no click URL found. Call the ad with ?clicktag=[ENCODED_CLICKURL]' });
		return;
	}

	const ids = typeof clickElementIds !== 'undefined' ? clickElementIds : [];
	if (ids.length > 0) {
		ids.forEach((id) => {
			const el = document.getElementById(id);
			if (el) {
				el.style.cursor = 'pointer';
				el.addEventListener('click', (e) => {
					e.stopPropagation();
					window.open(clickTag, '_blank');
				});
			} else {
				azLog({ error: `clickable element with id "${id}" not found` });
			}
		});
	} else {
		azLog({ info: 'no clickable elements defined — full body is clickable' });
		document.body.style.cursor = 'pointer';
		document.body.addEventListener('click', () => window.open(clickTag, '_blank'));
	}
});

/////////////////////////////
/// get URL query parameter (true = key found, but no value)
function getUrlParam(string) {
	const val = new URLSearchParams(window.location.search).get(string);
	if (val === null) return;
	if (val === '') return true;
	try {
		return decodeURIComponent(val);
	} catch (e) {
		return val;
	}
}

/////////////////////////////
/// ad tag Generator
document.addEventListener('keydown', function (event) {
	if (event.key === 'F10') {
		event.preventDefault();
		generateAzTag();
	}
});

function generateAzTag() {
	if (document.getElementById('az-tag-overlay')) return;
	// prettier-ignore
	const adScript = `<script>
    var azAd = {
        src: '${window.location.origin + window.location.pathname}',
        clickurl: '[UNENCODED_CLICKMACRO]',
        width: '[CREATIVE_WIDTH]',
        height: '[CREATIVE_HEIGHT]',
    };

    var el = document.createElement('iframe');
    el.src = azAd.src + '?clicktag=' + encodeURIComponent(azAd.clickurl);
    el.style.cssText = 'width:' + azAd.width + ';height:' + azAd.height + ';border:0;display:block;';
    el.setAttribute('scrolling', 'no');
    el.setAttribute('allowfullscreen', '');
    document.write('<style>body,html{width:100%;height:100%;padding:0;margin:0}</style>');
    document.body.appendChild(el);
<\/script>`;

	const overlay = create('div', {
		id: 'az-tag-overlay',
		style: 'position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;',
	});
	const codeblock = create('textarea', {
		spellcheck: 'false',
		readonly: 'true',
		style: 'z-index:999999;width:80%;height:350px;padding:30px;border-radius:20px;box-shadow:0 0 80px -50px #000;resize:vertical;font-family:monospace;font-size:14px;',
	});
	codeblock.value = adScript;
	overlay.appendChild(codeblock);
	document.documentElement.appendChild(overlay);
	// codeblock.select();

	const close = () => overlay.remove();
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) close();
	});
	document.addEventListener(
		'keydown',
		(e) => {
			if (e.key === 'Escape') close();
		},
		{ once: true },
	);
}

/////////////////////////////
/// handy function to create DOM elements
function create(type, settingsObj) {
	if (!type) return null;
	const el = document.createElement(type);
	if (settingsObj) {
		for (const [key, value] of Object.entries(settingsObj)) {
			if (value != null) {
				if (key === 'content') {
					el.innerHTML = value;
				} else {
					el.setAttribute(key, value);
				}
			}
		}
	}
	return el;
}

/////////////////////////////
/// function to load trackingpixel
function track(pxlUrl, eventname) {
	if (!pxlUrl) return;
	const url = pxlUrl.includes('[timestamp]') ? pxlUrl.replace('[timestamp]', Date.now()) : pxlUrl;
	new Image().src = url;
	azLog({ success: `Event: ${eventname || ''} ${url}` });
}

/////////////////////////////
/// custom console.log function for custom azAd logs
function azLog(obj) {
	const levels = {
		error: { badge: 'red', bg: '#f8d7da', text: '#ff0000' },
		warning: { badge: 'orange', bg: '#f8d7da', text: '#ff8400' },
		info: { badge: '#007bff', bg: '#cce5ff', text: '#007bff' },
		success: { badge: '#00af28', bg: '#d4edda', text: '#00af28' },
	};
	const caller = new Error().stack?.split('\n')[2]?.trim() ?? '';
	const level = Object.keys(levels).find((k) => k in obj);
	if (!level) {
		console.log(obj);
		return;
	}
	const { badge, bg, text } = levels[level];
	console.log(
		`%cAZ%c${level.charAt(0).toUpperCase() + level.slice(1)}`,
		`background:${badge};border-radius:2px 0 0 2px;padding:0 3px;font-weight:bold;color:#fff;`,
		`background:${bg};color:${text};border-radius:0 2px 2px 0;padding:0 3px;font-weight:bold;`,
		obj[level],
		`\n${caller}`,
	);
}

/////////////////////////////
/// removing .preload class, when everything is loaded to avoid visible init keyframe animations
window.addEventListener('load', () => document.documentElement.classList.remove('preload'));

/////////////////////////////
/// Prevent touchmove event from bubbling into parent document when ad is loaded in an iframe.
document.body.addEventListener(
	'touchmove',
	function (event) {
		event.preventDefault();
	},
	{ passive: false },
);

/////////////////////////////
// Preview Mode
if (getUrlParam('preview')) {
	const AZ_VERSION = '2.0.1';
	// window.AZ_PREVIEW_CSS = `https://cdn.jsdelivr.net/gh/behring5/azad-boilerplate@${AZ_VERSION}/tools/preview-mode/azPreview.min.css`;
	// const previewSrc = `https://cdn.jsdelivr.net/gh/behring5/azad-boilerplate@${AZ_VERSION}/tools/preview-mode/azPreview.min.js`;
	window.AZ_PREVIEW_CSS = '../dist/azPreview.min.css'; // dev mode
	const previewSrc = '../dist/azPreview.min.js'; // dev mode
	const script = document.createElement('script');
	script.src = previewSrc;
	script.async = false;
	document.head.appendChild(script);
}
