import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import videos from './vite-plugin-videos.js'

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_PAGES === 'true' && repository && !repository.endsWith('.github.io')
    ? `/${repository}/`
    : '/'

export default defineConfig({ base, plugins: [react(), videos()], server: { open: true } })