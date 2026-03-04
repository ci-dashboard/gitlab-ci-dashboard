import sort from 'semver-sort'
import semverRegex from 'semver-regex'

import {CREATED, MANUAL, SKIPPED} from './status'

export const getParameterByName = (name, url) => {
  if (!url) url = window.location.href
  name = name.replace(/[[]]/g, '\\$&')
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  var results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  const parameter = decodeURIComponent(results[2].replace(/\+/g, ' '))
  if (parameter === 'true') {
    return true
  }
  if (parameter === 'false') {
    return false
  }
  return parameter
}

export const getTopItem = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    return
  }

  let lastValidEntry
  return list.reverse().find((entry) => {
    if ([CREATED, MANUAL, SKIPPED].includes(entry.status)) {
      return false
    }

    if (entry.started_at && !entry.finished_at) {
      return true
    }
    lastValidEntry = entry
  }) || lastValidEntry
}

export const getTopTagName = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    return
  }

  var sortedTags = sort.desc(list.map(function (tag) {
    return tag.name;
  }));

  return sortedTags[0]
}

/**
 * Retry a promise-returning function with exponential backoff
 * @param {Function} fn - Function that returns a promise
 * @param {Number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {Number} delay - Initial delay in milliseconds (default: 1000)
 * @returns {Promise}
 */
export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry on 4xx errors (except 429 rate limit)
      if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
        throw error
      }

      // Don't retry on the last attempt
      if (i === maxRetries - 1) {
        throw error
      }

      // Exponential backoff with jitter
      const backoffDelay = delay * Math.pow(2, i) + Math.random() * 100
      await new Promise(resolve => setTimeout(resolve, backoffDelay))
    }
  }

  throw lastError
}
