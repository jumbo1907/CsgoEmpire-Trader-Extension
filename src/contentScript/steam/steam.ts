function main() {
  // The 'asset_id' query parameter is the asset id of the item that the user wants to sell. This
  // argument is added to the trade url in the
  let assetId = new URLSearchParams(window.location.search).get('asset_id')
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
