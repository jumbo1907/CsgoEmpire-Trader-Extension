let selectedItemsCopy = []

// Receive events from content script
window.addEventListener(
  'message',
  function (event) {
    if (event.source !== window) return

    console.log('Received event from content script', event.data)
    switch (event.data.type) {
      case 'withdraw-item-card-click':
        handleWithdrawItemClick(event.data)
        break
      case 'buy-selected-items':
        handleBuySelectedItems()
        break
      default:
        break
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

async function handleBuySelectedItems() {
  const store = getStore()

  if (!store) return

  const selectedItems = [...store?.trades?.selectedItems] || []

  // If there are no selected items or only one selected item, return.
  // Vanilla CSGOEmpire will handle this.
  if (selectedItems.length <= 1) {
    return
  }

  
  store.trades.selectedItems = []
  selectedItemsCopy = []

  const tokenResponse = await getSecurityToken()
  if (!tokenResponse.success) {
    console.error('Failed to get security token')

    window.dispatchEvent(
      new CustomEvent('desktop-notification', {
        detail: {
          title: 'Failed to get security token',
          message: tokenResponse.message || 'An error occurred',
        },
      }),
    )
    return
  }

  const token = tokenResponse.token

  // Loop over selected items and buy them
  for (let item of selectedItems) {
    if (isAuction(item)) {
      continue
    }

    const itemID = item.id
    const coinValue = item.market_value

    withdrawItem(itemID, coinValue, token)
      .then((withdrawResponse) => {
        if (!withdrawResponse.success) {
          window.dispatchEvent(
            new CustomEvent('desktop-notification', {
              detail: {
                title: `Failed to withdraw item ${itemID}`,
                message: withdrawResponse.message || 'An error occurred',
              },
            }),
          )

          return
        }

        console.log(`Successfully withdrew item ${itemID}`)
      })
      .catch((error) => {
        window.dispatchEvent(
          new CustomEvent('desktop-notification', {
            detail: {
              title: `Failed to withdraw item ${itemID}`,
              message: error.message || 'An error occurred',
            },
          }),
        )
      })

    // Wait 250ms
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
}

async function withdrawItem(itemID, coinValue, token) {
  const url = `https://${window.location.hostname}/api/v2/trading/deposit/${itemID}/withdraw`
  let response = await fetch(url, {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en-BE;q=0.9,en;q=0.8,nl-BE;q=0.7,nl;q=0.6',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      priority: 'u=1, i',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-empire-device-identifier': localStorage.getItem('csgoempire:security:uuid'),
      'x-env-class': 'blue',
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: JSON.stringify({
      security_token: token,
      coin_value: coinValue,
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  })

  let data = await response.json()
  return data
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

async function getSecurityToken() {
  let url = `https://${window.location.hostname}/api/v2/user/security/token`

  let response = await fetch(url, {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en-BE;q=0.9,en;q=0.8,nl-BE;q=0.7,nl;q=0.6',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      pragma: 'no-cache',
      priority: 'u=1, i',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-empire-device-identifier': localStorage.getItem('csgoempire:security:uuid'),
      'x-env-class': 'blue',
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: JSON.stringify({
      code: '0000',
      uuid: localStorage.getItem('csgoempire:security:uuid'),
    }),
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
  })

  let data = await response.json()
  return data
}

// Loop over all trades and update trade URLs with asset ID
function updateTradeUrls() {
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
