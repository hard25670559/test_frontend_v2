import axios from 'axios'

export default defineNuxtPlugin(() => {
  const instance = axios.create({
    baseURL: process.env.BASE_URL || '',
    headers: { 'Content-Type': 'application/json' },
  })

  return {
    provide: {
      axios: instance,
    },
  }
})
