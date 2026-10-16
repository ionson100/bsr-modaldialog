const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const cjsBundle = path.resolve(root, pkg.main);
const esmBundle = path.resolve(root, pkg.module);
const types = path.resolve(root, pkg.types);

test('the build output exists', () => {
    assert.ok(fs.existsSync(cjsBundle), pkg.main + ' must exist (run the build)');
    assert.ok(fs.existsSync(esmBundle), pkg.module + ' must exist');
    assert.ok(fs.existsSync(types), pkg.types + ' must exist');
    assert.ok(fs.existsSync(path.resolve(root, 'dist/index.css')), 'dist/index.css must exist');
});

test('react and react-dom are external - the package must not ship a second React', () => {
    for (const bundle of [cjsBundle, esmBundle]) {
        const source = fs.readFileSync(bundle, 'utf8');
        // a bundled React build is ~1mb and contains these markers
        assert.ok(
            !source.includes('react_development') && !source.includes('reactDomClient_production'),
            path.basename(bundle) + ' must not contain a bundled copy of React',
        );
        assert.ok(
            fs.statSync(bundle).size < 100 * 1024,
            path.basename(bundle) + ' must stay a small library bundle',
        );
    }

    assert.match(fs.readFileSync(cjsBundle, 'utf8'), /require\("react"\)/);
    assert.match(fs.readFileSync(esmBundle, 'utf8'), /from"react"/);
});

test('the css deep import of the consumers is still resolvable', () => {
    // audio_map_80/client does: import "bsr-modaldialog/dist/index.css"
    const resolved = require.resolve('bsr-modaldialog/dist/index.css', {paths: [root]});
    assert.equal(path.resolve(resolved), path.resolve(root, 'dist/index.css'));
    assert.ok(pkg.exports['./dist/index.css'], 'the exports map must expose dist/index.css');
});

test('the package is resolvable by its own name (exports map works)', () => {
    const resolved = require.resolve('bsr-modaldialog', {paths: [root]});
    assert.equal(path.resolve(resolved), cjsBundle);
});

test('the public api of the previous version is unchanged', () => {
    const exported = require(cjsBundle);
    assert.deepEqual(
        Object.keys(exported).sort(),
        ['BaseBodyDialog', 'ModalDialog', 'ShowBsrDialog'],
    );

    const declaration = fs.readFileSync(types, 'utf8');
    for (const name of ['ParamsDialog', 'ResolvePromise', 'ShowBsrDialog', 'BaseBodyDialog', 'ModalDialog']) {
        assert.ok(declaration.includes(name), `the types must declare ${name}`);
    }
});

test('nothing depends on react-scripts anymore', () => {
    const all = {...pkg.dependencies, ...pkg.devDependencies};
    assert.ok(!all['react-scripts'], 'react-scripts pulled ~1400 unused packages and most of the audit findings');
    assert.ok(!pkg.private, 'a published package must not be marked as private');
});
