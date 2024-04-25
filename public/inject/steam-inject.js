/// This file is injected into the Steam page to interact with the Steam page

/**
 * We override the 'ShowAlertDialog' function that Steam provides so we know if the item was successfully sent or if something went wrong.
 * After we receive this, a message is send to the content script. The content script will also close the window and send the message to the background script.
 * The background script will then use the chrome notification API to show a notification to the user.
 */
function ShowAlertDialog(title, message) {
  window.dispatchEvent(new CustomEvent('desktop-notification', { detail: { title, message } }))
}
