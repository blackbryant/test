export default defineNuxtPlugin(() => {
  // 全域錯誤處理
  if (process.client) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未處理的 Promise 錯誤:', event.reason)
    })
  }
})
