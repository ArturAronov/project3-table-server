import { Router } from 'express'

const router = Router()

// WELCOME
router.get('/', (await import('./controllers/welcome.js')).default)

export default router
