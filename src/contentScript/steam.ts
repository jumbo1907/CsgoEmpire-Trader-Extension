let assetId = new URLSearchParams(window.location.search).get('asset_id')
let ts = new URLSearchParams(window.location.search).get('ts')
let auto = new URLSearchParams(window.location.search).get('auto') === 'true' && isTsValid(ts)

// Check if the ts is valid; Current ts is valid if it is less than 3 seconds old
function isTsValid(ts: string | null) {
  if (!ts) return false
  let now = new Date().getTime()
  let tsTime = Number(ts)
  return now - tsTime < 3000
}

if (auto && assetId) {
  var node = document.getElementsByTagName('body')[0]
  var script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', chrome.runtime.getURL('inject/steam-inject.js'))
  node.appendChild(script)
}

// Add an event listener for the custom event
window.addEventListener('ShowAlertDialog', (event) => {
  // Extract title and message from the event detail
  // @ts-ignore
  const { title, message } = event.detail

  // Send the message to the background scipt.
  chrome.runtime.sendMessage({ type: 'ShowAlertDialog', title, message })

  // Close the trade window
  window.close()
})

function main() {
  // The 'asset_id' query parameter is the asset id of the item that the user wants to sell. This
  // argument is added to the trade url in the
  if (!assetId || isNaN(Number(assetId))) return

  // A flag to indicate if the item has been clicked. If we click the item multiple times, the
  // item will be moved back to the inventory.
  let clicked = false

  // Create a new MutationObserver to listen for changes in the DOM
  let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Ignore the mutation if no nodes were added or if the item has already been clicked
      if (clicked || mutation.addedNodes.length == 0) return

      // Find the item element in the DOM and double click it.
      let itemElement = document.querySelector<HTMLElement>(`#item730_2_${assetId}`)
      if (itemElement) {
        clicked = true
        observer.disconnect()

        doubleClickElement(itemElement)

        // Click the 'Ready to trade' checkbox.
        document.querySelector<HTMLElement>('#notready_tradechanged_message')?.click()

        // Click the 'Yes, this is a gift' checkbox.
        document.querySelector<HTMLElement>('.btn_green_steamui.btn_medium')?.click()

        // Click the 'Make offer' button. Only if the 'auto' query parameter is true
        if (auto) document.querySelector<HTMLElement>('.trade_confirmbtn')?.click()
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

function doubleClickElement(element: HTMLElement) {
  // Create a new MouseEvent for a double click
  var event = new MouseEvent('dblclick', {
    bubbles: true,
    cancelable: true,
    view: window,
  })

  // Dispatch the double click event on the element
  element.dispatchEvent(event)
}

main()
