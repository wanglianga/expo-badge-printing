import './app.css'
import App from './App.svelte'
import { storage } from './lib/storage.js'

storage.initDefaults()

const app = new App({
  target: document.body
})

export default app
