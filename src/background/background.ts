chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'desktop-notification':
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'img/logo-128.png',
        title: message.title,
        message: message.message,
      })
      break
    case 'auto-send':
      chrome.tabs.create({ url: message.url, active: false })
      break
    default:
      console.error('Unknown message type', message)
      break
  }
})
