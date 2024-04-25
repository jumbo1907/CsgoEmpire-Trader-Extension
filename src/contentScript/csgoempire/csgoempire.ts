injectScript(chrome.runtime.getURL('inject/csgoempire-inject.js'), 'body')

function injectScript(file_path: string, tag: string) {
  var node = document.getElementsByTagName(tag)[0]
  var script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', file_path)
  node.appendChild(script)
}

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
    let tradeBackButton = node.querySelector('.btn-secondary.pop.stretch.flex.rounded.text-dark-5.mr-lg') as HTMLElement | null
    if (tradeBackButton) {
      handleAutoSendButton(tradeBackButton)
      return
    }
  })

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
}
