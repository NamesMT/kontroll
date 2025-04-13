type Fn<T = void> = () => T
type FnWithArgs<T = void> = (...args: any) => T

export interface KontrollStore {
  [x: PropertyKey]: {
    timer: ReturnType<typeof setTimeout>
    callback: Fn<any | Promise<any>>
    trailing?: [FnWithArgs, ...any]
    finishing?: boolean
  }
}
const keyStore: KontrollStore = {}

export function clear(callback: Fn): void
export function clear(key: keyof KontrollStore): void
export function clear(keyable: Fn | keyof KontrollStore) {
  const key = typeof keyable === 'function' ? keyable.toString() : keyable
  if (keyStore[key]) {
    clearTimeout(keyStore[key].timer)
    delete keyStore[key]
  }
}

export type KontrollClearer = Fn
function createClearFn(key: keyof KontrollStore): KontrollClearer {
  return () => { clear(key) }
}

async function finish(key: keyof KontrollStore) {
  if (keyStore[key]) {
    keyStore[key].finishing = true

    const trailing = keyStore[key].trailing

    await keyStore[key].callback()
    clear(key)

    if (trailing)
      trailing[0](...trailing.slice(1))
  }
}

function createTimeout(ms: number, callback: Fn, key: keyof KontrollStore) {
  if (keyStore[key]?.finishing)
    return createClearFn(key)

  const timer = setTimeout(
    () => { finish(key) },
    ms,
  )

  keyStore[key] = {
    timer,
    callback,
  }

  return createClearFn(key)
}

// TODO: do .toString() have big performance overhead?, maybe implements a WeakMap?
export interface KontrollBaseOptions {
  /**
   * Specify a known key if needed
   * @default string // .toString() of the inputted callback
   */
  key?: keyof KontrollStore
}

export interface KontrollCountdownOptions extends KontrollBaseOptions {
  /**
   * Replaces the current timed callback
   * @default false
   */
  replace?: boolean
}
/**
 * Countdown for a period of ms then execute the first/replaced callback, based on `options.replace`.
 * 
 * Calls while the timer haven't finished are dropped.
 * 
 * ---
 * 
 * Example
 * ```
 * countdown(1000, doSum(1), { key: 'eg' })
 * // 500ms passed
 * countdown(1000, doSum(2))
 * // 500ms passed
 * // Result: 1
 * ```
 * 
 * ---
 * 
 * Example with `options.replace=true`:
 * ```
 * countdown(1000, doSum(1))
 * // 500ms passed
 * countdown(1000, doSum(2), { replace: true })
 * // 500ms passed
 * // Result: 2
 * ```
 */
export function countdown(ms: number, callback: Fn, { key = callback.toString(), replace }: KontrollCountdownOptions = {}) {
  if (keyStore[key]) {
    if (replace)
      keyStore[key].callback = callback

    return createClearFn(key)
  }

  return createTimeout(ms, callback, key)
}

export interface KontrollDebounceOptions extends KontrollBaseOptions {
  /**
   * Avoiding initial wait for first call
   * @default false
   */
  leading?: boolean
}
/**
 * Creates a timer that will execute the callback upon finish, calls while the timer haven't finished recreates the timer.
 * 
 * If `options.leading`, execute callback immediately for initial call.
 * 
 * ---
 * 
 * Example:
 * ```
 * debounce(1000, doSum(1))
 * // 500ms passed
 * debounce(1000, doSum(2))
 * // 1000ms passed
 * // Result: 2
 * ```
 * 
 * ---
 * 
 * Example with `options.leading`:
 * ```
 * debounce(1000, doSum(1), { leading: true })
 * // Result: 1
 * // 500ms passed
 * debounce(1000, doSum(2), { leading: true }) // leading doesn't matter anymore in this timer scope
 * // 500ms passed
 * debounce(1000, doSum(3))
 * // 1000ms passed
 * // Result: 3
 * ```
 */
export function debounce(ms: number, callback: Fn, { key = callback.toString(), leading }: KontrollDebounceOptions = {}) {
  if (keyStore[key] && !keyStore[key].finishing) { clear(key) }
  else {
    // if no pending call and leading: true, execute function immediately
    if (leading)
      return throttle(ms, callback, { key })
  }

  return createTimeout(ms, callback, key)
}

export interface KontrollThrottleOptions extends KontrollBaseOptions {
  /**
   * Perform additional execution with last received arguments
   * @default false
   */
  trailing?: boolean
}
/**
 * Executes the callback, and bypass any subsequent calls for a period of ms.
 * 
 * Calls while the timer haven't finished are dropped.
 * 
 * If `options.trailing` and calls while the timer haven't finished are received,
 * 
 * an additional execution with last received arguments is performed.
 * 
 * ---
 * 
 * Example:
 * ```
 * throttle(1000, doSum(1))
 * // Result: 1
 * // 500ms passed
 * throttle(1000, doSum(2))
 * // 9999ms passed
 * // (Nothing)
 * ```
 * 
 * ---
 * 
 * Example with `options.trailing`:
 * ```
 * throttle(1000, doSum(1))
 * // Result: 1
 * // 500ms passed
 * throttle(1000, doSum(2), { trailing: true })
 * // 500ms passed
 * // Result: 2
 * // A timer is also created, so calls after that are still dropped:
 * throttle(1000, doSum(3))
 * // 9999ms passed
 * // (Nothing)
 * ```
 * 
 */
export function throttle(ms: number, callback: Fn, { key = callback.toString(), trailing }: KontrollThrottleOptions = {}) {
  if (keyStore[key]) {
    if (trailing)
      keyStore[key].trailing = [throttle, ms, callback, { key }]

    return createClearFn(key)
  }

  callback()

  return createTimeout(ms, () => { }, key)
}
