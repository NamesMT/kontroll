import { setTimeout } from 'node:timers/promises'
import { describe, expect, it } from 'vitest'
import { clear, countdown, debounce, throttle } from '~/index'

describe('basic', async () => {
  let maybeIncreased = 1
  const increase = () => ++maybeIncreased

  // Basic callback test
  it('should countdown', async () => {
    const shadowValue = maybeIncreased
    countdown(100, increase)
    await setTimeout(100)
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  // Basic callback test
  it('should debounce', async () => {
    const shadowValue = maybeIncreased
    debounce(100, increase)
    await setTimeout(100)
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  // Basic callback test
  it('should throttle', async () => {
    const shadowValue = maybeIncreased
    throttle(100, increase)
    await setTimeout(100)
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  // Try to increase but clear the timer using returned clearer
  it('should clearer', async () => {
    const shadowValue = maybeIncreased
    const clearer = countdown(100, increase)
    clearer()
    await setTimeout(100)
    expect(maybeIncreased).toBe(shadowValue)
  })

  // Try to increase but clear the timer using `clear()`
  it('should clear()', async () => {
    const shadowValue = maybeIncreased
    countdown(100, increase)
    clear(increase)
    await setTimeout(100)
    expect(maybeIncreased).toBe(shadowValue)
  })
})

describe('advanced', async () => {
  let maybeIncreased = 1
  const makeIncreaseBy = (num: number) => () => maybeIncreased += num

  it('countdown', async () => {
    const shadowValue = maybeIncreased
    countdown(100, makeIncreaseBy(1)) // countdown +1, timer 100
    await setTimeout(50) // timer 50
    countdown(100, makeIncreaseBy(2)) // drop countdown +2
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(50) // timer 0, done countdown +1
    expect(maybeIncreased).toBe(shadowValue + 1)
  })

  it('countdown replace', async () => {
    const shadowValue = maybeIncreased
    countdown(100, makeIncreaseBy(1)) // countdown +1, timer 100
    await setTimeout(50) // timer 50
    countdown(100, makeIncreaseBy(2), { replace: true }) // replace countdown +2
    expect(maybeIncreased).toBe(shadowValue)

    await setTimeout(50) // timer 0, done countdown +2
    expect(maybeIncreased).toBe(shadowValue + 2)
  })

  it('debounce', async () => {
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

  it('debounce leading', async () => {
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
    const shadowValue = maybeIncreased
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
