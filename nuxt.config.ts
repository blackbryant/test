// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  
  modules: [
    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n'
  ],

  css: [
    '~/assets/css/main.css'
  ],

  // Element Plus 配置
  elementPlus: {
    importStyle: 'css',
    themes: ['dark']
  },

  // Tailwind CSS 配置
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js'
  },

  // i18n 配置 - 中英雙語
  i18n: {
    locales: [
      { 
        code: 'zh', 
        language: 'zh-TW',
        name: '繁體中文', 
        files: ['zh-TW.json']
      },
      { 
        code: 'en', 
        language: 'en-US',
        name: 'English', 
        files: ['en-US.json']
      }
    ],
    defaultLocale: 'zh',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  // Nitro 配置
  nitro: {
    experimental: {
      openAPI: true
    }
  },

  // Vite 配置
  vite: {
    optimizeDeps: {
      exclude: ['better-sqlite3']
    }
  },

  // App 配置
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Nano Banana Studio'
    }
  }
})
