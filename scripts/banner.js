const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;
const repo = pkg.repository.url;
const author = typeof pkg.author === 'object' ? `${pkg.author.name} <${pkg.author.email}>` : pkg.author;

// Sync version in package-lock.json
const lockPath = 'package-lock.json';
if (fs.existsSync(lockPath)) {
	const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
	lock.version = version;
	if (lock.packages?.['']) lock.packages[''].version = version;
	fs.writeFileSync(lockPath, JSON.stringify(lock, null, '\t') + '\n');
	console.log(`✔ package-lock.json → v${version}`);
}

// Prepend banner to source and output files
const title = 'azAd Preview Mode';
const files = ['src/azPreview.js', 'dist/azPreview.min.js', 'dist/azPreview.css', 'dist/azPreview.min.css'];

files.forEach((filePath) => {
	const banner = `/*!\n * ${title} v${version}\n * ${repo}\n * ${author}\n */\n`;
	let content = fs.readFileSync(filePath, 'utf8');
	while (content.startsWith('/*!')) content = content.replace(/^\/\*![\s\S]*?\*\/\n/, '');
	fs.writeFileSync(filePath, banner + content);
	console.log(`✔ banner → ${filePath}`);
});
