let selectedItemsCopy = []

// Receive events from content script
window.addEventListener(
  'message',
  function (event) {
    if (event.source !== window) return

    if (event.data.type === 'withdraw-item-card-click') {
      handleWithdrawItemClick(event.data)
    }
  },
  false,
)

function isAuction(item) {
  return item && (item.auction_ends_at ?? 0) > Date.now() / 1000
}

function handleWithdrawItemClick(data) {
  const { itemID, isCtrlClick } = data
  const store = getStore()

  const selectedItems = store?.trades?.selectedItems || []
  const selectedItemIDs = selectedItems.map((item) => item.id)
  const selectedItem = selectedItems.find((item) => item.id === itemID)
  const isSelect = selectedItemIDs.includes(itemID)

  if (isCtrlClick && !(isSelect && isAuction(selectedItem))) {
    handleCtrlClick(isSelect, itemID, store)
  } else {
    // Clear the copy as the user is not holding Ctrl
    selectedItemsCopy = []
  }

  selectedItemsCopy = [...store.trades.selectedItems]

  // Remove duplicates from copy
  selectedItemsCopy = selectedItemsCopy.filter(
    (item, index, self) => self.findIndex((t) => t.id === item.id) === index,
  )

  // Remove auction items from copy
  selectedItemsCopy = selectedItemsCopy.filter((item) => !isAuction(item))
}

function handleCtrlClick(isSelect, itemID, store) {
  console.log({
    isSelect,
    itemID,
    store,
  })
  if (isSelect) {
    selectedItemsCopy.forEach((item) => store.trades.selectedItems.push(item))
  } else {
    store.trades.selectedItems = store.trades.selectedItems.filter((item) => item.id !== itemID)
  }
}

function getStore() {
  return document.getElementById('app')?.__vue_app__?.config.globalProperties.$store.state
}

// Loop over all trades and update trade URLs with asset ID
function updateTradeUrls() {
  //@ts-ignore
  let store = getStore()
  if (!store) return

  let trades = store.trades?.trades || {}

  for (let key in trades) {
    if (!key.includes('deposit')) continue

    let trade = trades[key]
    if (!trade) continue

    // We only want to update trade URLs trade in the sending state.
    if (trade.status !== 3) continue

    let tradeUrl = trade.metadata.trade_url
    let assetId = trade.item.asset_id

    // If trade URL or asset ID is missing. Shouldn't happen, but just in case.
    if (!tradeUrl || !assetId) continue

    // If trade URL already has asset ID
    if (tradeUrl.includes('asset_id')) continue

    // Update trade URL with asset ID; This way the content script on the Steam trade page can knows what asset ID to look for.
    trade.metadata.trade_url = tradeUrl + `&asset_id=${assetId}`
  }
}

// Run this function every second
setInterval(updateTradeUrls, 1000)
