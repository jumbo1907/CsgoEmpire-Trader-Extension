# Unofficial CsgoEmpire Trader Extension

This extension is a tool for traders on CSGOEmpire.com. Currently it is very limited in functionality, but the project will grow over time. It's main purpose is to enhance the trading experience on CSGOEmpire in ways that the site itself is not able to provide.

> This project is not affiliated with CSGOEmpire.com in any way. It is an unofficial extension. Please do not use the on site support for questions or issues related to this extension. Instead, use the [GitHub issues](https://github.com/jumbo1907/CsgoEmpire-Trader-Extension/issues) or contact me directly (discord jumbo1907).

## Features

- Trades are automatically set up with the correct item selected.

## Planned features

- Compare prices with other marketplaces
- Automatically bid on auction after defining a max price
- Hyperlinks to external marketplaces
- Bulk selling of items with prices from external marketplaces
- More to come...

## How it works

A [script](https://github.com/jumbo1907/CsgoEmpire-Trader-Extension/blob/main/public/inject/csgoempire-inject.js) is injected into the CSGOEmpire website. This script loops over the state of deposits and appends the item asset_id to the trade url. When the user clicks on the trade button, the [contentscript](https://github.com/jumbo1907/CsgoEmpire-Trader-Extension/blob/main/src/contentScript/steam.ts) is able to read the asset_id from the url and select the correct item in the trade window. It will also automatically click the "Ready to trade" button and accepts the "Yes, this is a gift" modal. The user will still have to confirm the trade.

## Installation

1. Clone the repository
2. Run `npm install`

- Run `npm run build` to build the extension
- Run `npm run dev` to build the extension and watch for changes
