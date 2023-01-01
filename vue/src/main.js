import { createApp } from 'vue'
import { createHead } from "@vueuse/head"
import './style.css'
import App from './App.vue'
import 'flowbite'
const app = createApp(App)
const head = createHead()

app.use(head)

app.mount('#app')
