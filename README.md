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

### Import:
```js
// This package exports ESM only.
import {
  clear,
  countdown, // Can be understand as throttle no leading (execute at end of throttle instead of lead)
  debounce,
  throttle,
} from 'kontroll'

const doSum = (...numbers) => console.log(numbers.reduce((acc, cur) => acc + cur, 0))
const makeDoSum = (...numbers) => () => doSum(numbers)

const clearCountdown = countdown(1000, makeDoSum(1, 2), { key: 'defined', replace: false })
const clearDebounce = debounce(1000, makeDoSum(3, 4), { key: 34, leading: false })
const resetThrottle = throttle(1000, makeDoSum(5, 6), { trailing: false })
```

## **Notice**
### `key` behavior
Kontroll follows a key-first strategy, as long as things share the same key, they share the same timer.

If a `options.key` is not present, key are taken as `callback.toString()`.

<!-- Explaining the basic for sleep derived beginner :> -->
If you call something like:
```js
// // * Case 1, (arrow) function with unchanged/variable-only body
debounce(1000, () => console.log(variable))


// // * Case 2, declared function
debounce(1000, makeDoSum(1, 2))
// For declared function, it's parameter could be changed and still share the same key.
debounce(1000, makeDoSum(2, 3))
```
multiple times,  
The callback are properly debounced, because they have the same callback body.

But be noticed, for something like:
```js
debounce(1000, () => console.log('hi'))
debounce(1000, () => console.log('hello'))
```
The automated key are different for the two calls (because they have different callback body), so they are timed separately.  
In you wish them to have the same timer, you can manually set `options.key` like: `debounce(1000, () => {}, { key: 'KEY' })`

## License

[MIT](./LICENSE) License © 2023 [NamesMT](https://github.com/NamesMT)

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
