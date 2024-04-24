import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  background: {
    service_worker: 'src/background/background.ts',
  },
  content_scripts: [
    {
      matches: ['https://steamcommunity.com/tradeoffer/new/*'],
      js: ['src/contentScript/steam.ts'],
      run_at: 'document_end',
    },
    {
      matches: [
        'https://*.csgoempire.gg/*',
        'https://*.csgoempire.tv/*',
        'https://*.csgoempiretr.com/*',
        'https://*.csgoempire88.com/*',
        'https://*.csgoempire.cam/*',
        'https://*.csgoempirev2.com/*',
        'https://*.csgoempire.io/*',
        'https://*.csgoempire.info/*',
        'https://*.csgoempire.vip/*',
        'https://*.csgoempire.fun/*',
        'https://*.csgoempire.biz/*',
        'https://*.csgoempire.vegas/*',
        'https://*.csgoempire.link/*',
        'https://*.csgoempire.com/*',
      ],
      js: ['src/contentScript/csgoempire.ts'],
      run_at: 'document_end',
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        'img/logo-16.png',
        'img/logo-34.png',
        'img/logo-48.png',
        'img/logo-128.png',
        'inject/csgoempire-inject.js',
        'inject/steam-inject.js'
      ],
      matches: [
        'https://*.csgoempire.gg/*',
        'https://*.csgoempire.tv/*',
        'https://*.csgoempiretr.com/*',
        'https://*.csgoempire88.com/*',
        'https://*.csgoempire.cam/*',
        'https://*.csgoempirev2.com/*',
        'https://*.csgoempire.io/*',
        'https://*.csgoempire.info/*',
        'https://*.csgoempire.vip/*',
        'https://*.csgoempire.fun/*',
        'https://*.csgoempire.biz/*',
        'https://*.csgoempire.vegas/*',
        'https://*.csgoempire.link/*',
        'https://*.csgoempire.com/*',
      ],
    },
  ],
  permissions: ['notifications'],
})
