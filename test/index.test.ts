import { setTimeout } from 'node:timers/promises'
import { describe, expect, it } from 'vitest'
import { clear, countdown, debounce, getInstance, throttle } from '~/index'

// Note: JS timers are not 100% accurate, so the tests use generous wait margins
// (e.g. `await setTimeout(110)` for a 100 ms countdown) and unique keys per test
// to keep them isolated and avoid random failures.

describe.concurrent('basic', async () => {
  // Basic callback tests (using key)
  it('should countdown', async () => {
    let maybeIncreased = 1
    const increase = () => ++maybeIncreased

    const shadowValue = maybeIncreased
    countdown(100, increase, { key: 'basicCountdown' })
    await setTimeout(110)
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  // Basic callback test
  it('should debounce', async () => {
    let maybeIncreased = 1
    const increase = () => ++maybeIncreased

    const shadowValue = maybeIncreased
    debounce(100, increase, { key: 'basicDebounce' })
    await setTimeout(110)
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  // Basic callback test
  it('should throttle', async () => {
    let maybeIncreased = 1
    const increase = () => ++maybeIncreased

    const shadowValue = maybeIncreased
    throttle(100, increase, { key: 'basicThrottle' })
    await setTimeout(110)
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

describe('advanced', () => {
  // Each test uses a unique explicit `key` so timers are isolated from one another,
  // and waits use generous margins so the (imprecise) JS timers always settle reliably.

  it('countdown', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    countdown(100, makeIncreaseBy(1), { key: 'advanced-countdown' }) // countdown +1, timer 100
    await setTimeout(40) // timer 40
    countdown(100, makeIncreaseBy(2), { key: 'advanced-countdown' }) // drop countdown +2
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(120) // timer done, countdown +1
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  it('countdown replace', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    countdown(100, makeIncreaseBy(1), { key: 'advanced-countdown-replace' }) // countdown +1, timer 100
    await setTimeout(40) // timer 40
    countdown(100, makeIncreaseBy(2), { key: 'advanced-countdown-replace', replace: true }) // replace countdown +2
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(120) // timer done, countdown +2
    expect(maybeIncreased).toBe(shadowValue + 2)
  })

  it('debounce', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    debounce(100, makeIncreaseBy(1), { key: 'advanced-debounce' }) // bounce +1, timer 100
    await setTimeout(40) // timer 40
    debounce(100, makeIncreaseBy(2), { key: 'advanced-debounce' }) // reset bounce +2, timer 100
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(60) // timer 60 (still before the reset timer)
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(80) // timer done, bounce +2
    expect(maybeIncreased).toBe(shadowValue + 2)
  })

  it('debounce - promise aware', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    debounce(100, async () => {
      await setTimeout(300)
      return makeIncreaseBy(1)()
    }, { key: 'advanced-debounce-promise' }) // bounce +1, timer 100 + promise 300
    await setTimeout(40) // timer 40 + promise 300
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(120) // timer fired, promise still pending
    debounce(100, async () => {
      await setTimeout(300)
      return makeIncreaseBy(1)()
    }, { key: 'advanced-debounce-promise' }) // try adding debounce, should be ignored
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(340) // promise settled, done bounce +1
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  it('debounce leading', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    debounce(100, makeIncreaseBy(1), { key: 'advanced-debounce-leading', leading: true }) // done lead bounce +1, timer 100
    await setTimeout(40) // timer 40
    debounce(100, makeIncreaseBy(2), { key: 'advanced-debounce-leading', leading: true }) // reset bounce +2, timer 100
    expect(maybeIncreased).toBe(shadowValue + 1)

    await setTimeout(60) // timer 60 (still before the reset timer)
    expect(maybeIncreased).toBe(shadowValue + 1)

    await setTimeout(80) // timer done, done bounce +2
    expect(maybeIncreased).toBe(shadowValue + 1 + 2)
  })

  it('throttle', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    throttle(100, makeIncreaseBy(1), { key: 'advanced-throttle' }) // done throttle +1, timer 100
    expect(maybeIncreased).toBe(shadowValue + 1)
    await setTimeout(40) // timer 40
    throttle(100, makeIncreaseBy(2), { key: 'advanced-throttle' }) // drop throttle +2
    expect(maybeIncreased).toBe(shadowValue + 1)

    await setTimeout(120) // timer done
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  it('throttle trailing', async () => {
    let maybeIncreased = 1
    const makeIncreaseBy = (num: number) => () => maybeIncreased += num

    const shadowValue = maybeIncreased
    expect(maybeIncreased).toBe(shadowValue)
    throttle(100, makeIncreaseBy(1), { key: 'advanced-throttle-trailing' }) // done throttle +1, timer 100
    expect(maybeIncreased).toBe(shadowValue + 1)
    await setTimeout(40) // timer 40
    throttle(100, makeIncreaseBy(2), { key: 'advanced-throttle-trailing', trailing: true }) // trail throttle +2
    expect(maybeIncreased).toBe(shadowValue + 1)

    await setTimeout(120) // timer done, done trail throttle +2, timer 100
    expect(maybeIncreased).toBe(shadowValue + 1 + 2)

    throttle(100, makeIncreaseBy(1), { key: 'advanced-throttle-trailing' }) // drop throttle +1
    expect(maybeIncreased).toBe(shadowValue + 1 + 2)
  })
})
