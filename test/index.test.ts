import { setTimeout } from 'node:timers/promises'
import { describe, expect, it } from 'vitest'
import { clear, countdown, debounce, getInstance, throttle } from '~/index'

// TODO: JS timers are not 100% accurate, so the tests sometimes fail because the callback is not executed yet due to exact timing expectation, the tests should be refactor a bit so it won't randomly fail (e.g.: use `await setTimeout(110)` for a 100 ms countdown)

describe.concurrent('basic', async () => {
  // Basic callback tests (using key)
  it('should countdown', async () => {
    let maybeIncreased = 1
    const increase = () => ++maybeIncreased

    const shadowValue = maybeIncreased
    countdown(100, increase, { key: 'basicCountdown' })
    await setTimeout(100)
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  // Basic callback test
  it('should debounce', async () => {
    let maybeIncreased = 1
    const increase = () => ++maybeIncreased

    const shadowValue = maybeIncreased
    debounce(100, increase, { key: 'basicDebounce' })
    await setTimeout(100)
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  // Basic callback test
  it('should throttle', async () => {
    let maybeIncreased = 1
    const increase = () => ++maybeIncreased

    const shadowValue = maybeIncreased
    throttle(100, increase, { key: 'basicThrottle' })
    await setTimeout(100)
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  // Try to increase but clear the timer using returned clearer
  it('should clear using returned clearer', async () => {
    let maybeIncreased = 1
    const increase = () => ++maybeIncreased

    const shadowValue = maybeIncreased
    const clearer = countdown(100, increase, { key: 'clearer' })
    clearer()
    await setTimeout(100)
    expect(maybeIncreased).toBe(shadowValue)
  })

  // Try to increase but clear the timer using `clear()`
  it('should clear() via callback', async () => {
    let maybeIncreased = 1
    const increase = () => ++maybeIncreased

    const shadowValue = maybeIncreased
    countdown(100, increase)
    clear(increase)
    await setTimeout(100)
    expect(maybeIncreased).toBe(shadowValue)
  })

  it('should clear() via key', async () => {
    let maybeIncreased = 1
    const increase = () => ++maybeIncreased

    const shadowValue = maybeIncreased
    countdown(100, increase, { key: 'clear' })
    clear('clear')
    await setTimeout(100)
    expect(maybeIncreased).toBe(shadowValue)
  })

  it('should getInstance - debounce', async () => {
    debounce(1, async () => await setTimeout(100), { key: '1sec' })
    await setTimeout(50)
    expect(getInstance('1sec')).toMatchObject({
      finishing: true,
    })
  })

  it('should getInstance - throttle 1', async () => {
    throttle(1, async () => await setTimeout(100), { key: '1sec t1' })
    await setTimeout(50)
    expect(getInstance('1sec t1')).toMatchObject({
      finishing: true,
    })
  })

  it('should getInstance - throttle 2', async () => {
    throttle(1000, async () => await setTimeout(100), { key: '1sec t2' })
    await setTimeout(50)
    const instance = getInstance('1sec t2')
    expect(instance).toBeDefined()
    expect(instance?.finishing).toBe(undefined)
  })
})

describe('advanced', async () => {
  // Note: the test suite can't be parallelized for now, because of `makeIncreaseBy` key colliding

  it('countdown', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    countdown(100, makeIncreaseBy(1)) // countdown +1, timer 100
    await setTimeout(50) // timer 50
    countdown(100, makeIncreaseBy(2)) // drop countdown +2
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(50) // timer 0, done countdown +1
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  it('countdown replace', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    countdown(100, makeIncreaseBy(1)) // countdown +1, timer 100
    await setTimeout(50) // timer 50
    countdown(100, makeIncreaseBy(2), { replace: true }) // replace countdown +2
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(50) // timer 0, done countdown +2
    expect(maybeIncreased).toBe(shadowValue + 2)
  })

  it('debounce', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    debounce(100, makeIncreaseBy(1)) // bounce +1, timer 100
    await setTimeout(50) // timer 50
    debounce(100, makeIncreaseBy(2)) // reset bounce +2, timer 100
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(50) // timer 50
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(50) // timer 0, done bounce +2
    expect(maybeIncreased).toBe(shadowValue + 2)
  })

  it('debounce - promise aware', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    debounce(100, async () => {
      await setTimeout(300)
      return makeIncreaseBy(1)()
    }) // bounce +1, timer 100 + promise 300
    await setTimeout(50) // timer 50 + promise 300
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(300) // timer 0 + promise 50
    debounce(100, async () => {
      await setTimeout(300)
      return makeIncreaseBy(1)()
    }) // try adding debounce, should be ignored
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(50) // time 0 + promise 0, done bounce +1
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  it('debounce leading', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    debounce(100, makeIncreaseBy(1), { leading: true }) // done lead bounce +1, timer 100
    await setTimeout(50) // timer 50
    debounce(100, makeIncreaseBy(2), { leading: true }) // reset bounce +2, timer 100
    expect(maybeIncreased).toBe(shadowValue + 1)

    await setTimeout(50) // timer 50
    expect(maybeIncreased).toBe(shadowValue + 1)

    await setTimeout(50) // timer 0, done bounce +2
    expect(maybeIncreased).toBe(shadowValue + 1 + 2)
  })

  it('throttle', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    throttle(100, makeIncreaseBy(1)) // done throttle +1, timer 100
    expect(maybeIncreased).toBe(shadowValue + 1)
    await setTimeout(50) // timer 50
    throttle(100, makeIncreaseBy(2)) // drop throttle +2
    expect(maybeIncreased).toBe(shadowValue + 1)

    await setTimeout(50) // timer 0
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  it('throttle trailing', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    expect(maybeIncreased).toBe(shadowValue)
    throttle(100, makeIncreaseBy(1)) // done throttle +1, timer 100
    expect(maybeIncreased).toBe(shadowValue + 1)
    await setTimeout(50) // timer 50
    throttle(100, makeIncreaseBy(2), { trailing: true }) // trail throttle +2
    expect(maybeIncreased).toBe(shadowValue + 1)

    await setTimeout(50) // timer 0, done trail throttle +2, timer 100
    expect(maybeIncreased).toBe(shadowValue + 1 + 2)

    throttle(100, makeIncreaseBy(1)) // drop throttle +1
    expect(maybeIncreased).toBe(shadowValue + 1 + 2)
  })
})
