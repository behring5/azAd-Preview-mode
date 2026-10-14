/*!
 * azAd Preview Mode v1.0.0
 * https://github.com/behring5/azAd-Preview-mode
 * Christoph Eckert <christoph@behring5.de>
 */
(function () {
	if (window.self !== window.top) {
		return;
	}

	const PREVIEW_CSS = window.AZ_PREVIEW_CSS;
	console.clear();
	console.log('Loading Preview...');
	window.addEventListener(
		'click',
		(event) => {
			event.stopImmediatePropagation();
		},
		true,
	);

	const AD_SIZES = {
		mrec: { w: 300, h: 250 },
		mpu: { w: 300, h: 250 },
		hpa: { w: 300, h: 600 },
		banner: { w: 320, h: 50 },
		superbanner: { w: 728, h: 90 },
		skyscraper: { w: 160, h: 600 },
		billboard: { w: 970, h: 250 },
		int: { w: 0, h: 0 },
	};

	const params = new URLSearchParams(window.location.search);
	params.delete('preview');
	const iframeAdURL = window.location.protocol + '//' + window.location.host + window.location.pathname + '?' + params.toString();
	const adIframe = create('iframe', { id: 'adIframe', src: iframeAdURL, scrolling: 'no', frameborder: '0' });

	const title = document.title;
	const isMobile = window.matchMedia('(max-width: 480px)').matches;
	const urlPreviewValue = getUrlParam('preview');
	const hasDesktopPrefix = typeof urlPreviewValue === 'string' && urlPreviewValue.startsWith('desktop:');
	const device = hasDesktopPrefix ? 'desktop' : 'phone';

	if (isMobile) {
		document.documentElement.innerHTML = htmlSkeleton('mobileWebsiteBody', mobileWebsiteContent());
		document.title = 'PREVIEW - ' + title;
		document.getElementById('adContainer').appendChild(adIframe);
		formatCheck(adIframe);
	} else if (device === 'desktop') {
		document.documentElement.innerHTML = htmlSkeleton('preview previewDesktop', desktopPreviewPage());
		document.title = 'PREVIEW - ' + title;
		const dummyIframe = createDummyIframe('desktopWebsiteBody', desktopWebsiteContent());
		document.getElementById('websiteplaceholder').replaceWith(dummyIframe);
		dummyIframe.contentDocument.getElementById('adContainer').appendChild(adIframe);
		formatCheck(adIframe);
		repositionDesktopAd(adIframe, dummyIframe.contentDocument);
	} else {
		document.documentElement.innerHTML = htmlSkeleton('preview dummyPhone', phonePreviewPage());
		document.title = 'PREVIEW - ' + title;
		const dummyIframe = createDummyIframe('mobileWebsiteBody', mobileWebsiteContent());
		document.getElementById('websiteplaceholder').replaceWith(dummyIframe);
		dummyIframe.contentDocument.getElementById('adContainer').appendChild(adIframe);
		formatCheck(adIframe);
	}

	/////////////////////////////
	/// shared helpers

	function createDummyIframe(bodyClass, content) {
		const iframe = create('iframe', { id: 'dummyWebsite' });
		const html = htmlSkeleton(bodyClass, content);
		iframe.onload = function () {
			if (iframe.contentDocument) {
				iframe.contentDocument.open();
				iframe.contentDocument.write(html);
				iframe.contentDocument.close();
			}
		};
		return iframe;
	}

	function formatCheck(el) {
		const rawSize = getUrlParam('preview');
		const urlSize = typeof rawSize === 'string' && rawSize.includes(':') ? rawSize.split(':')[1] : rawSize;
		if (!urlSize || urlSize == true) {
			el.parentNode.innerHTML = 'missing size in url preview=???';
			return;
		}
		const numericRegex = /(\d+)x(\d+)/;
		const match = urlSize.match(numericRegex);
		if (match) {
			el.setAttribute('style', `width:${match[1]}px;height:${match[2]}px`);
			return;
		}
		const str = urlSize.toLowerCase();
		if (str && str in AD_SIZES) {
			if (str === 'int') {
				el.classList.add('int');
				const btn = create('div', { id: 'close' });
				btn.addEventListener('click', (e) => {
					e.target.remove();
					el.remove();
				});
				el.parentNode.appendChild(btn);
			} else {
				const { w, h } = AD_SIZES[str];
				el.setAttribute('style', `width:${w}px;height:${h}px`);
			}
		} else {
			el.parentNode.innerHTML = 'This size does not exist. Try num values like 300x600';
		}
	}

	function repositionDesktopAd(adIframe, doc) {
		const SIDEBAR_WIDTH = 340;
		let adWidth = 0;

		if (adIframe.style.width) {
			adWidth = parseInt(adIframe.style.width);
		} else {
			const matchedKey = Object.keys(AD_SIZES).find((c) => adIframe.classList.contains(c));
			if (matchedKey) adWidth = AD_SIZES[matchedKey].w;
		}

		if (adWidth > SIDEBAR_WIDTH) {
			doc.getElementById('desktopLayout').classList.add('top-placement');
		}
	}

	function htmlSkeleton(bodyClass, bodyContent) {
		return `
		<html><head>
			<title>Preview</title>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
			<link rel="stylesheet" href="${PREVIEW_CSS}">
		</head><body class="${bodyClass}">${bodyContent}</body></html>`;
	}

	/////////////////////////////
	/// phone preview

	function phonePreviewPage() {
		return `
		<div id="dummyPhone">
			<div id="phoneInner">
				<div id="browserTop" class="browserbars">
					<div id="statusbar">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="#fff" d="M14 4.1v7.7c0 .5-.4.9-.9.9s-.9-.4-.9-.9V4.1c0-.5.4-.9.9-.9.5.1.9.5.9.9zm-3.4 7.8v-6c0-.5-.4-.9-.9-.9s-.8.4-.8.9v6c0 .5.4.9.9.9.4-.1.8-.5.8-.9zM7.1 7.6v4.3c0 .5-.4.9-.9.9s-.9-.4-.9-.9V7.6c0-.5.4-.9.9-.9.6 0 .9.4.9.9zM3.7 9.3v2.6c0 .5-.4.9-.9.9s-.8-.5-.8-.9V9.3c0-.5.4-.9.9-.9s.8.4.8.9z"/></svg>
						<span id="time">${getTime()}</span>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="#fff" d="M14.8 6.1V4.8c0-.7-.6-1.2-1.2-1.2H1.2C.6 3.6 0 4.1 0 4.8v6.4c0 .7.6 1.2 1.2 1.2h12.3c.7 0 1.2-.6 1.2-1.2V9.9H16V6.1h-1.2zm-.6 5.1a.65.65 0 0 1-.6.6H1.2a.65.65 0 0 1-.6-.6V4.7a.65.65 0 0 1 .6-.6h12.4a.65.65 0 0 1 .6.6v6.5zM6.8 4.7H5c-.3 0-.5.3-.5.5v5.5a.47.47 0 0 0 .5.5h1.8a.47.47 0 0 0 .5-.5V5.2c-.1-.2-.3-.5-.5-.5zm-3.1 0H2c-.3 0-.5.3-.5.5v5.5a.47.47 0 0 0 .5.5h1.8a.47.47 0 0 0 .5-.5V5.2c-.1-.2-.3-.5-.6-.5z"/></svg>
					</div>
					<div id="adressbar"></div>
				</div>
				<div id="websiteplaceholder"></div>
				<div id="browserBottom" class="browserbars"></div>
			</div>
		</div>`;
	}

	function mobileWebsiteContent() {
		return `
		<div id="mobileHeader">
			<div class="brand-logo"></div>
			<div class="mobile-menu-button"><div></div><div></div><div></div></div>
		</div>
		<div id="adContainer"></div>
		${articlePlaceholder(45)}`;
	}

	/////////////////////////////
	/// desktop preview

	function desktopPreviewPage() {
		return `<div id="websiteplaceholder"></div>`;
	}

	function desktopWebsiteContent() {
		return `
		<div id="desktopHeader">
			<div class="brand-logo"></div>
			<nav class="desktop-nav">
				<div></div><div></div><div></div><div></div>
			</nav>
		</div>
		<div id="desktopLayout">
			<main id="desktopArticle">${articlePlaceholder(60)}</main>
			<aside id="adContainer"></aside>
		</div>`;
	}

	/////////////////////////////
	/// shared content helpers

	function articlePlaceholder(n) {
		const randomWidth = () => ~~(Math.random() * 20) + 60;
		let string = '';
		for (let i = 0; i < n; i++) {
			string += `<div class="article"><div></div>
				<div class="lines">
					<div></div><div></div><div></div>
					<div style="width:${randomWidth()}%"></div>
					<div style="width:${randomWidth()}%"></div>
				</div></div>`;
		}
		return string;
	}

	function getTime() {
		const now = new Date();
		return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
	}
})();
