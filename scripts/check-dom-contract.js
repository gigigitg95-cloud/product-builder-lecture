const fs = require('fs');
const path = require('path');

const contractPath = path.join(__dirname, '..', 'docs', 'dom-contract.json');

function resolveHtmlPath() {
  const cliArg = process.argv[2];
  const candidates = cliArg
    ? [cliArg]
    : [
        './index.html',
        './public/index.html',
        './dist/index.html',
        './build/index.html',
        './src/index.html',
        './pages/index.html',
      ];

  const attempted = candidates.map((p) => path.resolve(process.cwd(), p));
  const found = attempted.find((p) => fs.existsSync(p));
  if (!found) {
    console.error('No HTML file found. Tried these paths:');
    attempted.forEach((p) => console.error(`- ${p}`));
    process.exit(1);
  }
  return { path: found, attempted };
}

function resolveJsPath() {
  const candidates = ['./js/app.js', './src/app.js', './app.js'];
  const attempted = candidates.map((p) => path.resolve(process.cwd(), p));
  const found = attempted.find((p) => fs.existsSync(p));
  if (!found) {
    console.warn('WARNING: JS source not found. Tried these paths:');
    attempted.forEach((p) => console.warn(`- ${p}`));
    return null;
  }
  return found;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function unique(arr) {
  return Array.from(new Set(arr));
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractClassTokens(html) {
  const tokens = [];
  const classAttrRegex = /class\\s*=\\s*(?:"([^"]*)"|'([^']*)')/gi;
  let match;
  while ((match = classAttrRegex.exec(html)) !== null) {
    const raw = match[1] ?? match[2] ?? '';
    const parts = raw.split(/\\s+/).filter(Boolean);
    tokens.push(...parts);
  }
  return unique(tokens);
}

function extractIncludePaths(html) {
  const paths = [];
  const includeRegex = /\bdata-include\s*=\s*(['"])(.*?)\1/gi;
  let match;
  while ((match = includeRegex.exec(html)) !== null) {
    const raw = match[2];
    if (raw) paths.push(raw);
  }
  return unique(paths);
}

function checkMissing(required, presentSet, label) {
  const missing = required.filter((item) => !presentSet.has(item));
  if (missing.length > 0) {
    console.error(`${label} missing: ${missing.join(', ')}`);
  }
  return missing.length === 0;
}

function main() {
  const contract = JSON.parse(readText(contractPath));
  const htmlInfo = resolveHtmlPath();
  const indexHtml = readText(htmlInfo.path);
  if (indexHtml.length < 500) {
    console.error(
      `HTML seems too short (${indexHtml.length} chars). Check file: ${htmlInfo.path}`
    );
    process.exit(1);
  }
  console.log(`Using HTML: ${htmlInfo.path} (${indexHtml.length} chars)`);

  const includePaths = extractIncludePaths(indexHtml);
  const repoRoot = path.dirname(htmlInfo.path);
  const includeContents = [];
  const loadedIncludes = [];
  for (const rel of includePaths) {
    const abs = path.resolve(repoRoot, rel);
    if (fs.existsSync(abs)) {
      const content = readText(abs);
      includeContents.push(content);
      loadedIncludes.push({ path: abs, size: content.length });
    } else {
      console.warn(`WARNING: include file not found: ${abs}`);
    }
  }
  if (loadedIncludes.length > 0) {
    console.log('Loaded includes:');
    loadedIncludes.forEach((i) =>
      console.log(`- ${i.path} (${i.size} chars)`)
    );
  } else {
    console.log('Loaded includes: none');
  }

  const html = [indexHtml, ...includeContents].join('\n');
  console.log(
    `Sanity: has id="language-btn"? ${html.includes('id="language-btn"')}`
  );
  console.log(`Sanity: has data-include? ${html.includes('data-include')}`);

  const requiredIds = contract.required_ids || [];
  const requiredClasses = contract.required_classes || [];
  const requiredDataAttributes = contract.required_data_attributes || [];
  const runtimeClasses = contract.runtime_classes || [];

  const idPresent = new Set();
  for (const id of requiredIds) {
    const idEsc = escapeRegExp(id);
    const idRegex = new RegExp(
      String.raw`\bid\s*=\s*(['"])${idEsc}\1`,
      'i'
    );
    if (idRegex.test(html)) {
      idPresent.add(id);
    }
  }

  const dataAttrPresent = new Set();
  for (const attr of requiredDataAttributes) {
    const aEsc = escapeRegExp(attr);
    const dataRegex = new RegExp(String.raw`\b${aEsc}\s*=`, 'i');
    if (dataRegex.test(html)) {
      dataAttrPresent.add(attr);
    }
  }

  const matchedClasses = new Set();
  for (const cls of requiredClasses) {
    const cEsc = escapeRegExp(cls);
    const classRegex = new RegExp(
      String.raw`\bclass\s*=\s*(['"])(?:[^'"]*\s)?${cEsc}(?:\s[^'"]*)?\1`,
      'i'
    );
    if (classRegex.test(html)) {
      matchedClasses.add(cls);
    }
  }
  const matchedAttrs = new Set(
    requiredDataAttributes.filter((attr) => dataAttrPresent.has(attr))
  );

  let ok = true;
  console.log('Static contract:');
  const idsOk = checkMissing(requiredIds, idPresent, 'IDs');
  const classesOk = checkMissing(requiredClasses, matchedClasses, 'Classes');
  const attrsOk = checkMissing(
    requiredDataAttributes,
    matchedAttrs,
    'Data attributes'
  );
  ok = idsOk && classesOk && attrsOk;
  console.log(
    `Matched IDs: ${idPresent.size}/${requiredIds.length}, ` +
      `Classes: ${matchedClasses.size}/${requiredClasses.length}, ` +
      `Attrs: ${matchedAttrs.size}/${requiredDataAttributes.length}`
  );

  let runtimeOk = true;
  if (runtimeClasses.length > 0) {
    console.log('Runtime contract:');
    const jsPath = resolveJsPath();
    if (jsPath) {
      const jsSource = readText(jsPath);
      const runtimePresent = new Set();
      for (const cls of runtimeClasses) {
        const cEsc = escapeRegExp(cls);
        const re = new RegExp(String.raw`(['"\`])\.?${cEsc}\1`, 'i');
        if (re.test(jsSource)) {
          runtimePresent.add(cls);
        }
      }
      runtimeOk = checkMissing(runtimeClasses, runtimePresent, 'Runtime classes');
      console.log(
        `Matched runtime classes: ${runtimePresent.size}/${runtimeClasses.length}`
      );
    } else {
      console.log(
        `Runtime contract: skipped (JS not found) 0/${runtimeClasses.length}`
      );
    }
  }

  const selectorMatch = /class\s*=\s*(['"])(?:[^'"]*\s)?language-selector(?:\s[^'"]*)?\1/i.exec(
    html
  );
  const selectorOpenIndex = selectorMatch ? selectorMatch.index : -1;
  let windowStart = selectorOpenIndex;
  let windowEnd = -1;
  if (windowStart !== -1) {
    const closeIndex = html.indexOf('</div>', windowStart);
    if (closeIndex !== -1) {
      windowEnd = closeIndex + '</div>'.length + 1000;
    } else {
      windowEnd = windowStart + 50000;
    }
  }
  const windowHtml =
    windowStart === -1 ? '' : html.slice(windowStart, windowEnd);
  const dropdownInWindow = /id\s*=\s*(?:"language-dropdown"|'language-dropdown')/i.test(
    windowHtml
  );
  if (selectorOpenIndex === -1 || !dropdownInWindow) {
    const windowSize =
      windowStart === -1 || windowEnd === -1 ? 0 : windowEnd - windowStart;
    const dropdownAnywhere =
      /id\s*=\s*(?:"language-dropdown"|'language-dropdown')/i.test(html);
    console.error(
      `Nesting rule failed: #language-dropdown must be inside .language-selector (window ${windowSize} chars, dropdown anywhere: ${dropdownAnywhere})`
    );
    ok = false;
  }

  if (!ok || !runtimeOk) {
    const debugId = 'language-btn';
    const debugIdEsc = escapeRegExp(debugId);
    const debugIdRe = new RegExp(
      String.raw`\bid\s*=\s*(['"])${debugIdEsc}\1`,
      'i'
    );
    console.error(
      `Debug ID regex: ${debugIdRe.source} -> ${debugIdRe.test(html)}`
    );
    const debugAttr = 'data-include';
    const debugAttrEsc = escapeRegExp(debugAttr);
    const debugAttrRe = new RegExp(String.raw`\b${debugAttrEsc}\s*=`, 'i');
    console.error(
      `Debug attr regex: ${debugAttrRe.source} -> ${debugAttrRe.test(html)}`
    );
    process.exit(1);
  }

  console.log('DOM CONTRACT PASS');
}

main();

// Example commands:
// node scripts/check-dom-contract.js
// node scripts/check-dom-contract.js public/index.html
