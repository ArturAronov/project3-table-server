import { Router } from 'express'
import authenticateUser from './_middlewares/authenticate-user.js'

const router = Router()

// API | BUSINESS AUTH
router.post('/api/business/auth/signup', (await import('./controllers/api/business/auth/signup.js')).default)
router.post('/api/business/auth/login', (await import('./controllers/api/business/auth/login.js')).default)

// API | USER AUTH
router.post('/api/user/auth/signup', (await import('./controllers/api/user/auth/signup.js')).default)
router.post('/api/user/auth/login', (await import('./controllers/api/user/auth/login.js')).default)

// API | LOGOUT AUTH
router.delete('/api/auth/logout', (await import('./controllers/api/auth/logout.js')).default)

// API | RESTAURANTS
router.get('/api/restaurants', (await import('./controllers/api/restaurants/index.js')).default)

// API | USER BOOKINGS | AUTH REQUIRED
router.post('/api/user/booking', authenticateUser('json'), (await import('./controllers/api/user/booking/create.js')).default)
router.put('/api/user/booking/:id', authenticateUser('json'), (await import('./controllers/api/user/booking/update.js')).default)
router.delete('/api/user/booking/:id', authenticateUser('json'), (await import('./controllers/api/user/booking/destroy.js')).default)

// API | USER PROFILE | AUTH REQUIRED
router.get('/api/user/profile', authenticateUser('json'), (await import('./controllers/api/user/profile/index.js')).default)
router.put('/api/user/profile/update', authenticateUser('json'), (await import('./controllers/api/user/profile/update.js')).default)

// API | BUSINESS BOOKINGS | AUTH REQUIRED
router.get('/api/business/booking', authenticateUser('json'), (await import('./controllers/api/business/booking/index.js')).default)
router.post('/api/business/booking', authenticateUser('json'), (await import('./controllers/api/business/booking/create.js')).default)
router.put('/api/business/booking/:id', authenticateUser('json'), (await import('./controllers/api/business/booking/update.js')).default)
router.delete('/api/business/booking/:id', authenticateUser('json'), (await import('./controllers/api/business/booking/destroy.js')).default)

// API | BUSINESS PROFILE | AUTH REQUIRED
router.get('/api/business/profile', authenticateUser('json'), (await import('./controllers/api/business/profile/index.js')).default)
router.put('/api/business/profile/update', authenticateUser('json'), (await import('./controllers/api/business/profile/update.js')).default)

// WELCOME
router.get('/', (await import('./controllers/welcome.js')).default)

export default router
