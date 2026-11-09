const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');

let settings = {};
let configurationResource;
let provider;
const vscode = {
    workspace: {
        getConfiguration(section, resource) {
            assert.equal(section, 'thriftFormatter');
            configurationResource = resource;
            const values = { patchRequired: true, patchSeparator: true, indent: 4,
                alignByAssign: false, alignByField: false, ...settings };
            return { get: (key, fallback) => values[key] ?? fallback };
        },
    },
    window: { showInformationMessage() {}, showErrorMessage(message) { throw new Error(message); } },
    commands: { registerCommand: () => ({ dispose() {} }) },
    languages: { registerDocumentFormattingEditProvider(language, value) {
        assert.equal(language, 'thrift');
        provider = value;
        return { dispose() {} };
    } },
    Range: class { constructor(...positions) { this.positions = positions; } },
    TextEdit: { replace: (range, newText) => ({ range, newText }) },
};
const originalLoad = Module._load;
let extension;
try {
    Module._load = function (request, ...args) {
        return request === 'vscode' ? vscode : originalLoad.call(this, request, ...args);
    };
    extension = require('../dist/web/extension.js');
} finally {
    Module._load = originalLoad;
}

const document = content => ({
    uri: { scheme: 'file', path: '/workspace/example.thrift' },
    lineCount: content.split('\n').length,
    getText: () => content,
});

test('configuration is a resource-scoped boolean, disabled by default', () => {
    const setting = require('../package.json').contributes.configuration.properties['thriftFormatter.separateBaseFields'];
    assert.equal(setting.type, 'boolean');
    assert.equal(setting.scope, 'resource');
    assert.equal(setting.default, false);
});

test('extension keeps existing output by default', () => {
    settings = {};
    const [out, edit] = extension.editDocument(document('struct Example {1: string Name,255: base.Base Base}'));
    assert.equal(out, 'struct Example {\n    1: required string Name,\n    255: required base.Base Base,\n}');
    assert.equal(edit.newText, out);
});

test('document setting enables actual bundled formatter behavior', () => {
    settings = { separateBaseFields: true };
    const doc = document('struct Example {\n1: string Name,\n// Metadata\n255: base.BaseResp BaseResp\n}');
    const [out, edit] = extension.editDocument(doc);
    assert.equal(out, 'struct Example {\n    1: required string Name,\n\n    // Metadata\n    255: required base.BaseResp BaseResp,\n}');
    assert.equal(configurationResource, doc.uri);
    assert.equal(edit.newText, out);
    assert.deepEqual(extension.editDocument(document(out)), ['', undefined]);
});

test('enabled setting does not add a gap for an only field', () => {
    settings = { separateBaseFields: true };
    assert.equal(extension.editDocument(document('struct Example {255: BaseResp BaseResp}'))[0],
        'struct Example {\n    255: required BaseResp BaseResp,\n}');
});

test('formatting provider returns a text edit with the setting enabled', () => {
    const context = { subscriptions: [] };
    extension.activate(context);
    settings = { separateBaseFields: true };
    const edits = provider.provideDocumentFormattingEdits(document('struct Example {1: i32 ID,255: Base Base}'));
    assert.equal(edits.length, 1);
    assert.ok(edits[0].range instanceof vscode.Range);
    assert.ok(edits[0].newText.includes('\n\n    255: required Base Base,'));
});

test('empty and already formatted documents produce no edits', () => {
    settings = {};
    assert.deepEqual(extension.editDocument(document('')), ['', undefined]);
    assert.deepEqual(extension.editDocument(document('struct Empty {\n}')), ['', undefined]);
});
