# kontroll ![TypeScript](https://img.shields.io/badge/♡-%23007ACC.svg?logo=typescript&logoColor=white)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]
[![Bundlejs][bundlejs-src]][bundlejs-href]

**kontroll** ("control") is a tiny, dead-simple package for function behavior controls like debounce, countdown, throttle (limit).

## Features

- **100% coverage!**
- **Self-explained**: for real, every functions and options have TSDoc comments to explain their behavior plus examples at a **hover** *(based on your IDE)*, apart from the already intuitive logic path.
  - [![jsDocs.io][jsDocs-src]][jsDocs-href]
- **Clearable**: you can stop pending timers by calling the returned clearer function or use the `clear(key)` function.
- **Promise aware**: avoid duplicated call if your promise haven't settled.

## Usage

### Install package:
```sh
# npm
npm install kontroll

# yarn
yarn add kontroll

# pnpm (recommended)
pnpm install kontroll
```

### Import and use:

```js
// This package exports ESM only.
import {
  clear,
  countdown, // Can be understand as throttle no leading (execute at end of throttle instead of lead)
  debounce,
  getInstance,
  throttle,
} from 'kontroll'

const doSum = (...numbers) => console.log(numbers.reduce((acc, cur) => acc + cur, 0))
const createDoSum = (...numbers) => () => doSum(numbers)

const clearCountdown = countdown(1000, createDoSum(1, 2), { key: 'defined', replace: false })
const clearDebounce = debounce(1000, createDoSum(3, 4), { key: 34, leading: false })
const resetThrottle = throttle(1000, createDoSum(5, 6), { trailing: false })

const debounceInstance = getInstance(34) // { timer: Timeout, callback: <fn>, finishing: false }
```

## **Notice**

### `key` behavior

Kontroll follows a key-first strategy, as long as things share the same key, they share the same timer.

If a `options.key` is not present, key are taken as `callback.toString()`.

*While `kontroll` supports a key-less usage, its recommended to set your key for production code, for better performance and expected behavior.*

The following cases are debounced as their callback body is the same:
```js
// * Case 1, (arrow) function with unchanged/variable-only body
debounce(1000, () => console.log(variable))

// * Case 2, callback / function returned by a function
const sumOneTwo = createDoSum(1, 2)
debounce(1000, sumOneTwo) // All this
debounce(1000, createDoSum(3, 4)) // 3 lines are
debounce(1000, createDoSum(5, 6)) // same key
```

Be notice, for something like
```js
debounce(1000, () => console.log('hi'))
debounce(1000, () => console.log('hello'))
```
The automated key are different for the two calls (because they have different callback body), so they are timed separately.

In you wish them to have the same timer, you can manually set `options.key` like: `debounce(1000, () => {}, { key: 'KEY' })`

Note: the storage to check the key is set globally, if you use `kontroll` in your library, you should prefix the key with your package name.

## Releasing

Releases are version-first and manual:

1. Go to **Actions → Release → Run workflow** on GitHub.
2. Enter the version to ship, without a leading `v` (e.g. `1.3.0`), and run it. Enable **dry-run** to stop before pushing, releasing and publishing.

The workflow validates the version against `package.json`, lints/type-checks/tests with `pnpm run check`, builds, then lets [changelogen](https://github.com/unjs/changelogen) bump `package.json`, write `CHANGELOG.md`, commit and tag `v<version>`. It pushes the commit and tag, creates the GitHub release from the generated changelog section, and publishes to npm with provenance over OIDC trusted publishing.

**A pushed tag publishes nothing** — this workflow is the only publish path. One-time setup: publish the package once by hand (npm only lets you configure a trusted publisher for a package that already exists), then add this repository and the `release.yml` workflow as a trusted publisher on npmjs.com.

Locally, `pnpm run release:check 1.3.0` validates a version against `package.json`, and `pnpm run release:preview` prints the changelog the next release would get.

## License

[MIT](./LICENSE) License © 2024 [NamesMT](https://github.com/NamesMT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/kontroll?labelColor=18181B&color=F0DB4F
[npm-version-href]: https://npmjs.com/package/kontroll
[npm-downloads-src]: https://img.shields.io/npm/dm/kontroll?labelColor=18181B&color=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/kontroll
[codecov-src]: https://img.shields.io/codecov/c/gh/namesmt/kontroll/main?labelColor=18181B&color=F0DB4F
[codecov-href]: https://codecov.io/gh/namesmt/kontroll
[license-src]: https://img.shields.io/github/license/namesmt/kontroll.svg?labelColor=18181B&color=F0DB4F
[license-href]: https://github.com/namesmt/kontroll/blob/main/LICENSE
[bundlejs-src]: https://img.shields.io/bundlejs/size/kontroll?labelColor=18181B&color=F0DB4F
[bundlejs-href]: https://bundlejs.com/?q=kontroll
[jsDocs-src]: https://img.shields.io/badge/Check_out-jsDocs.io---?labelColor=18181B&color=F0DB4F
[jsDocs-href]: https://www.jsdocs.io/package/kontroll
