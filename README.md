# thrift-formatter

A Thrift file formatter extention

use https://github.com/zhdaniel/thrift-fmt-ts (fork of https://github.com/thrift-labs/thrift-fmt-ts)

(a typescript implement of https://github.com/thrift-labs/thrift-fmt )

unfortunately, it was created with a typo extension name "thirft-formater"

## Features

1. keeping the comments
2. align the tail comment of struct/enum
3. align by field's each part in struct/enum/union/exception
4. or align by field's assgin part in struct/enum/union/exception
5. patch the missed list separator
6. pathc the missed 'required' in field
7. optionally separate common `Base` / `BaseResp` fields from business fields

## Requirements

## Extension Settings

1. `thriftFormatter.patchRequired` boolean, default `true`

if `true` will patch the miss `required` for field in struct or others.

2. `thriftFormatter.patchSeparator` boolean, default `true`

if `true` will patch the miss `,` for field in struct or others, will remove the `,` at function tail in service

3. `thriftFormatter.indent` number, default `4`

the space indent for field in struct or enum and function in service.

4. `thriftFormatter.alignByAssign` boolean, default `false`

if `true`, will align by field's assgin ('=') part, support field in struct or others.

5. `thriftFormatter.assignAlign` boolean, default `false`

if `true`, will align by field's each part, support field in struct or others.

if `true`, will ingore the `alignByAssign` option

6. `thriftFormatter.separateBaseFields` boolean, default `false`

When enabled, struct fields matching `Base Base` or `BaseResp BaseResp`
(including qualified types such as `base.Base`) get one blank line before them.
Leading comments stay with their field; first or only fields get no leading
blank line. The rule does not depend on the struct name or field ID.

```json
{
  "thriftFormatter.separateBaseFields": true
}
```

## Local development

This checkout installs the modified TypeScript formatter directly from
`github:zhdaniel/thrift-fmt-ts#main`, which includes the optional Base separator
and the Git installation build hook. npm builds the formatter during
installation; no adjacent local checkout is needed.

```bash
npm install
npm run test-node
npm run package-web
```

The formatter is bundled into the extension and needs no Python runtime or
Git access when the installed extension formats a file.

## Known Issues

see [#issues](https://github.com/thrift-labs/thrift-fmt-vscode/issues)

## Release Notes

see [CHANGELOG.md](https://github.com/thrift-labs/thrift-fmt-vscode/blob/main/CHANGELOG.md) and [vscode Page](https://marketplace.visualstudio.com/items?itemName=alingse.thirft-formatter)
