
import path from 'path'
import Promise from 'bluebird'

import electron from '../../electron'
const {app, BrowserWindow, shell, powerSaveBlocker} = electron

import market from '../../util/market'
import url from '../../util/url'
import http_server from '../../util/http-server'
import debug_browser_window from '../../util/debug-browser-window'

import mklog from '../../util/log'
const log = mklog('tasks/launch')

import CaveStore from '../../stores/cave-store'

let self = {
  launch: async function(opts, cave) {
    let game = market.get_entities('games')[cave.game_id]
    let injectPath = path.resolve(__dirname, '..', '..', 'inject', 'game.js')
    let entry_point = path.join(CaveStore.appPath(cave.install_location, opts.id), cave.gamePath)

    log(opts, `entry point: ${entry_point}`)
    let win = new BrowserWindow({
      title: game.title,
      icon: `./static/images/tray/${app.getName()}.png`,
      width: cave.window_size.width,
      height: cave.window_size.height,
      center: true,
      show: true,
      backgroundColor: '#000',
      'title-bar-style': 'hidden',
      useContentSize: true,
      webPreferences: {
        /* don't let web code control the OS */
        nodeIntegration: false,
        /* hook up a few keyboard shortcuts of our own */
        preload: injectPath,
        /* stores cookies etc. in persistent session to save progress */
        partition: `persist:gamesession_${cave.game_id}`
      }
    })

    win.webContents.on('dom-ready', (e) => {
      win.webContents.insertCSS('body {background: #000;}')
    })

    // open dev tools immediately if requested
    if (process.env.IMMEDIATE_NOSE_DIVE === '1') {
      debug_browser_window(`game ${game.title}`, win)
      win.webContents.openDevTools({detach: true})
    }

    // clear menu, cf. https://github.com/itchio/itch/issues/232
    win.setMenu(null)

    // strip 'Electron' from user agent so some web games stop being confused
    let userAgent = win.webContents.getUserAgent()
    userAgent = userAgent.replace(/Electron\/[0-9.]+\s/, '')
    win.webContents.setUserAgent(userAgent)

    // requests to 'itch-internal' are used to
    let internal_filter = {
      urls: ['https://itch-internal/*']
    }
    win.webContents.session.webRequest.onBeforeSendHeaders(internal_filter, (details, callback) => {
      callback({cancel: true})

      let parsed = url.parse(details.url)
      switch (parsed.pathname.replace(/^\//, '')) {
        case 'exit-fullscreen':
          win.setFullScreen(false)
          break
        case 'toggle-fullscreen':
          win.setFullScreen(!win.isFullScreen())
          break
        case 'open-devtools':
          win.webContents.openDevTools({detach: true})
          break
      }
    })

    win.webContents.on('new-window', (e, url) => {
      e.preventDefault()
      shell.openExternal(url)
    })

    // serve files
    let file_root = path.dirname(entry_point)
    let index_name = path.basename(entry_point)

    let server = http_server.create(file_root, {'index': [index_name]})

    let port
    server.on('listening', function () {
      port = server.address().port
      log(opts, `serving game on port ${port}`)

      // don't use the HTTP cache, we already have everything on disk!
      const options = {extraHeaders: 'pragma: no-cache\n'}
      win.loadURL(`http://localhost:${port}`, options)
    })

    const blocker_id = powerSaveBlocker.start('prevent-display-sleep')

    await new Promise((resolve, reject) => {
      win.on('close', () => {
        win.webContents.session.clearCache(resolve)
      })
    })

    powerSaveBlocker.stop(blocker_id)

    log(opts, `shutting down http server on port ${port}`)
    server.close()
  }
}

export default self
