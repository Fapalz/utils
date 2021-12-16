/**
 * Returns a random string of given length
 * @param {number} i Characters
 * @returns {string}
 */
const randomString = (i) => {
  let rnd = ''
  while (rnd.length < i) rnd += Math.random().toString(36).substring(2)
  return rnd.substring(0, i)
}

const throttle = (fn, threshhold = 250, scope) => {
  let last
  let deferTimer
  // eslint-disable-next-line func-names
  return function (...args) {
    const context = scope || this

    const now = +new Date()
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer)
      deferTimer = setTimeout(() => {
        last = now
        fn.apply(context, args)
      }, threshhold)
    } else {
      last = now
      fn.apply(context, args)
    }
  }
}

/**
 * Return capitalize string
 * @param {string} string
 * @returns {string}
 */
const capitalize = (string) => {
  if (typeof string !== 'string') return ''
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Returns the element is HTMLElement or not
 * @param {HTMLElement} el
 * @returns {Boolean}
 */
const isDomElement = (el) => {
  return !!(el && el.nodeType === 1)
}

/**
 * Returns the element is visible on the viewport or not
 * @param {HTMLElement} el
 * @returns {Boolean}
 */
const isElementVisible = (el) => {
  const rect = el.getBoundingClientRect()
  const windowWidth = window.innerWidth || document.documentElement.clientWidth
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight
  const efp = (x, y) => {
    return document.elementFromPoint(x, y)
  }

  // Return false if it's not in the viewport
  if (
    rect.right < 0 ||
    rect.bottom < 0 ||
    rect.left > windowWidth ||
    rect.top > windowHeight
  )
    return false

  // Return true if any of its four corners are visible
  return (
    el.contains(efp(rect.left, rect.top)) ||
    el.contains(efp(rect.right, rect.top)) ||
    el.contains(efp(rect.right, rect.bottom)) ||
    el.contains(efp(rect.left, rect.bottom))
  )
}

export { randomString, throttle, capitalize, isDomElement, isElementVisible }
