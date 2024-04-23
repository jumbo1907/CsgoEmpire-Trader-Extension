function updateTradeUrls() {
  //@ts-ignore
  let store = document.getElementById('app')?.__vue_app__?.config?.globalProperties?.$store?.state
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
