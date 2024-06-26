# Unofficial CsgoEmpire Trader Extension
[![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/idbobdadgcifckdedkdppkmifmcppbek?label=Chrome%20Rating&style=flat&logo=google)](https://chromewebstore.google.com/detail/unoffical-csgoempire-trad/idbobdadgcifckdedkdppkmifmcppbek)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/idbobdadgcifckdedkdppkmifmcppbek?label=Chrome%20Users&style=flat&logo=google)](https://chromewebstore.google.com/detail/unoffical-csgoempire-trad/idbobdadgcifckdedkdppkmifmcppbek)

This extension is a tool for traders on CSGOEmpire.com. Currently it is very limited in functionality, but the project will grow over time. It's main purpose is to enhance the trading experience on CSGOEmpire in ways that the site itself is not able to provide.

> This project is not affiliated with CSGOEmpire.com in any way. It is an unofficial extension. Please do not use the on site support for questions or issues related to this extension. Instead, use the [GitHub issues](https://github.com/jumbo1907/CsgoEmpire-Trader-Extension/issues) or contact me directly (discord jumbo1907).

Currently the extension only works if the language is set to ENG. This is because the extension relies on the text of the website to determine the state of certain components. This will be fixed in the future.

## Features

- Trades are automatically set up with the correct item selected. [showcase](https://www.youtube.com/watch?v=ArWSiCZ4bJU)
- Trades are sent instantly in a single click. [showcase](https://www.youtube.com/watch?v=C9F-EHJCkyA)
- Withdraw multiple items at once. [showcase](https://www.youtube.com/watch?v=EWiaYUxLpM0)
- Select all & deselect all buttons on the deposit page. [showcase](https://imgur.com/a/FRTKzo5)

## Planned features

- Compare prices with other marketplaces
- Automatically bid on auction after defining a max price
- Hyperlinks to external marketplaces
- Bulk selling of items with prices from external marketplaces
- More to come...

## How it works

### Trade setup

A [script](https://github.com/jumbo1907/CsgoEmpire-Trader-Extension/blob/main/public/inject/csgoempire-inject.js) is injected into the CSGOEmpire website. This script loops over the state of deposits and appends the item asset_id to the trade url. When the user clicks on the trade button, the [contentscript](https://github.com/jumbo1907/CsgoEmpire-Trader-Extension/blob/main/src/contentScript/steam.ts) is able to read the asset_id from the url and select the correct item in the trade window. It will also automatically click the "Ready to trade" button and accepts the "Yes, this is a gift" modal. The user will still have to confirm the trade.

### Instant item send

The instant item sent is built on top of the trade setup. We add some extra data to the trade url to determine if the user wants to send the item instantly. If so, we also click the send item button and override the 'ShowAlertDialog' function Steam uses. Once we notice the function being used, it gets sent to the content script which will close the tab and send the message to the background script. The background script will then send a notification to the user.

### Bulk withdraw

When ctrl clicking item cards on the withdraw page, the item will be added to a list. When the user clicks the "Buy n Items" button, all items in the list will be bought with a small delay in between. This is to prevent the server from blocking the requests. If the server returns an error, the user will get notified. The withdraw request requires a normal token, which the extension requests before withdrawing the items.

## Installation

1. Clone the repository
2. Run `npm install`

- Run `npm run build` to build the extension
- Run `npm run dev` to build the extension and watch for changes
