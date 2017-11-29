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
  return list[0]
}