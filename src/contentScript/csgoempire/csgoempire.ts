injectScript(chrome.runtime.getURL('inject/csgoempire-inject.js'), 'body')

function injectScript(file_path: string, tag: string) {
  var node = document.getElementsByTagName(tag)[0]
  var script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', file_path)
  node.appendChild(script)
}

// Add an event listener for the custom event
window.addEventListener('desktop-notification', (event) => {
  // Extract title and message from the event detail
  // @ts-ignore
  const { title, message } = event.detail

  // Send the message to the background scipt.
  chrome.runtime.sendMessage({ type: 'desktop-notification', title, message })
})

// Listen for changes in the DOM.
new MutationObserver((mutations) => {
  mutations.forEach((mutation) => handleMutation(mutation))
}).observe(document.body, {
  childList: true,
  subtree: true,
})

function handleMutation(mutation: MutationRecord) {
  if (mutation.addedNodes.length == 0) return

  mutation.addedNodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) return

    // Check if the node is a trade back button
    let tradeBackButton = node.querySelector(
      '.btn-secondary.pop.stretch.flex.rounded.text-dark-5.mr-lg',
    ) as HTMLElement | null
    if (tradeBackButton) {
      handleAutoSendButton(tradeBackButton)
      return
    }

    let withdrawItemCard = node.querySelector('.item-card') as HTMLElement | null
    if (withdrawItemCard && window.location.pathname === '/withdraw/steam/market') {
      handleWithdrawItemCard(withdrawItemCard)
    }

    // Check if a button got added with the text "Confirm"
    let confirmButton = node.querySelector(
      '.btn-primary.pop.stretch.flex.rounded.text-dark-5',
    ) as HTMLElement | null
    let isOnWithdrawPage: boolean = window.location.pathname === '/withdraw/steam/market'

    if (confirmButton) {
      // Find span > div > span
      let span = confirmButton.querySelector('span > div > span') as HTMLElement | null
      if (span && span.textContent === 'Confirm' && isOnWithdrawPage) {
        confirmButton.onclick = () => window.postMessage({ type: 'buy-selected-items' }, '*')
      }
    }

    let isOnDepositPage: boolean = window.location.pathname === '/deposit/steam'
    let inventoryOptions = node.querySelector('.flex-between.flex.w-full') as HTMLElement | null

    if (isOnDepositPage && inventoryOptions) {
      const paths = ['components/select-all-button.html', 'components/deselect-all-button.html']

      paths.forEach((path) => {
        fetch(chrome.runtime.getURL(path))
          .then((response) => response.text())
          .then((html) => inventoryOptions.insertAdjacentHTML('beforeend', html))
      })
    }
  })
}

function handleAutoSendButton(button: HTMLElement) {
  // Firstly we need to get a reference to the 'Send' button so we can copy its attributes such as the href.
  let parent = button.parentElement as HTMLElement | null
  let sendButton = parent?.querySelector('a') as HTMLElement | null
  if (!sendButton) return

  // Change the back button to auto-send button
  button.classList.replace('btn-secondary', 'btn-primary')
  let span = button.querySelector('span > div > span') as HTMLElement | null
  if (span) span.textContent = 'Insta-send'

  button.onclick = () => {
    // We copy the url from the 'Send' button and append the 'auto' query parameter to it. We also
    // append the current time to the url. We verify the ts in the steam script and ignore the auto parameter
    // if the ts is older than a few seconds. This way the user doesn't accidentally send the item multiple times
    // after navigating back and forth between the trade window.
    let href = `${sendButton.getAttribute('href') as string}&auto=true&ts=${new Date().getTime()}`

    // Send to background script. The background script will open the trade window in a new tab but won't focus it.
    chrome.runtime.sendMessage({ type: 'auto-send', url: href })
  }
}

function handleWithdrawItemCard(card: HTMLElement) {
  // Add click event
  card.onclick = (event) => {
    let isCtrlClick = event.ctrlKey
    let itemID = getItemID(card)
    if (!itemID) {
      console.error('Failed to get item ID for item card', card)
      return
    }

    // Send to inject script
    window.postMessage({ type: 'withdraw-item-card-click', itemID, isCtrlClick }, '*')
  }
}

function getItemID(card: HTMLElement): number | null {
  let moreInfoElement = card.querySelector('a') as HTMLAnchorElement | null
  if (!moreInfoElement) return null

  let href = moreInfoElement.href
  if (!href) return null

  let itemID = href.split('/').pop()
  if (!itemID) return null

  return parseInt(itemID)
}
