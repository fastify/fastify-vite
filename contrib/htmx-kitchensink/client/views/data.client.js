setupHandlers({
  '#add-button': {
    afterRequest ({ elt }) {
      $('input[name="inputValue"]').value = ''
    }
  }
})

function setupHandlers (selectors) {
  for (const [selector, handlers] of Object.entries(selectors)) {
    const elt = $(selector)
    for (const [event, handler] of Object.entries(handlers)) {
      document.addEventListener(`htmx:${event}`, ({ detail }) => {
        if (detail.elt === elt) {
          handler(detail)
        }
      })
    }
  }
}

function $ (selector) {
  return document.querySelector(selector)
}
