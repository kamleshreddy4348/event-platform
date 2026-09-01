import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const client = axios.create({ baseURL: BASE_URL })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventhub_token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 on an authenticated request means the token is invalid or expired
    // (login/register themselves also 401 on bad credentials, so only react
    // when we actually had a token attached).
    const hadToken = Boolean(error.config?.headers?.Authorization)
    if (error.response?.status === 401 && hadToken) {
      window.dispatchEvent(new Event('eventhub:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default client
