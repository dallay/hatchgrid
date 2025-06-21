import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Assuming router is next
import pinia from './stores'
import './index.css' // Tailwind CSS

const app = createApp(App)

app.use(pinia)
app.use(router) // Assuming router will be set up

app.mount('#app')
