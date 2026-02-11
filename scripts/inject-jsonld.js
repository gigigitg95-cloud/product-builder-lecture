const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'index.html',
    'pages/about.html',
    'pages/guide.html',
    'pages/privacy.html',
    'pages/terms.html'
];

const scriptRegex = /<script\s+type="application\/ld\+json"\s+src="([^"]+)"\s*><\/script>/g;

function inlineJsonLd(htmlPath) {
    const html = fs.readFileSync(htmlPath, 'utf8');

    const updated = html.replace(scriptRegex, (match, src) => {
        const jsonPath = src.startsWith('/')
            ? path.resolve(process.cwd(), src.slice(1))
            : path.resolve(path.dirname(htmlPath), src);
        if (!fs.existsSync(jsonPath)) {
            console.warn(`[inject-jsonld] Missing JSON file: ${jsonPath}`);
            return match;
        }
        const jsonContent = fs.readFileSync(jsonPath, 'utf8').trim();
        return `<script type="application/ld+json">\n${jsonContent}\n</script>`;
    });

    if (updated !== html) {
        fs.writeFileSync(htmlPath, updated, 'utf8');
        console.log(`[inject-jsonld] Updated: ${htmlPath}`);
    } else {
        console.log(`[inject-jsonld] No changes: ${htmlPath}`);
    }
}

htmlFiles.forEach(file => {
    const htmlPath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(htmlPath)) {
        console.warn(`[inject-jsonld] Missing HTML file: ${htmlPath}`);
        return;
    }
    inlineJsonLd(htmlPath);
});
