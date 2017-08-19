'use strict'

function await_async (fn) {
  if (typeof fn !== 'function' && fn.constructor.name !== 'GeneratorFunction') {
    throw new Error('The given function must be a generator function')
  }

  return () => {
    let args = Array.from(arguments)
    return new Promise((resolve, reject) => {
      const generator = fn.call(this, args)

      let next = (err, value) => {
        let state = null
        try {
          if (err) {
            state = generator.throw(err)
          } else {
            state = generator.next(value)
          }
        } catch (err) {
          state = { value: Promise.reject(err), done: true }
        }

        if (state.done) {
          resolve(state.value)
          return
        }

        Promise.resolve(state.value)
          .then(res => next(null, res))
          .catch(err => next(err))
      }

      next()
    })
  }
}

module.exports = await_async