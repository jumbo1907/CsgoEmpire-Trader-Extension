chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // We receive this message from steams content script.
  if (message.type === 'ShowAlertDialog') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'img/logo-128.png',
      title: message.title,
      message: message.message,
    })
  }
})