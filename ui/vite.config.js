import {defineConfig} from 'vite'
import {fileURLToPath} from 'url'
import fs from 'fs'
import path from 'path'
import vue from '@vitejs/plugin-vue'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.VITE_VERSION) {
    const packageData = JSON.parse(fs.readFileSync(path.join(dirname, '..', 'package.json')))
    process.env.VITE_VERSION = packageData.version
}

// eslint-disable-next-line no-console
console.log('Build version:', process.env.VITE_VERSION)

export default defineConfig({
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@/': `${path.resolve(dirname, 'src')}/`,
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3030',
            },
            '/ws': {
                changeOrigin: false,
                target: 'http://localhost:8443/',
                ws: true,
            },
        },
    },

})
