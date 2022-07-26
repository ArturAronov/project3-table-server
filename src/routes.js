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

// API | PROFILE (BOTH USER & BUSINESS)
router.get('/api/profile', (await import('./controllers/api/profile/index.js')).default)

// API | TIME SLOTS AVAILABLE
router.get('/api/timeslots/:id/:covers/:date/:month/:year', (await import('./controllers/api/timeslots/index.js')).default)

// API | RESTAURANTS
router.get('/api/restaurants', (await import('./controllers/api/restaurants/index.js')).default)
router.get('/api/restaurant/:id', (await import('./controllers/api/restaurant/index.js')).default)

// API | USER BOOKINGS | AUTH REQUIRED
router.get('/api/user/bookings', authenticateUser, (await import('./controllers/api/user/booking/show.js')).default)
router.post('/api/user/booking/:id', authenticateUser, (await import('./controllers/api/user/booking/create.js')).default)
router.put('/api/user/booking/:id', authenticateUser, (await import('./controllers/api/user/booking/update.js')).default)
router.delete('/api/user/booking/:id', authenticateUser, (await import('./controllers/api/user/booking/destroy.js')).default)

// API | USER PROFILE | AUTH REQUIRED
router.put('/api/user/profile/update', authenticateUser, (await import('./controllers/api/user/profile/update.js')).default)

// API | BUSINESS TABLES | AUTH REQUIRED
router.get('/api/business/table', authenticateUser, (await import('./controllers/api/business/table/index.js')).default)
router.post('/api/business/table', authenticateUser, (await import('./controllers/api/business/table/create.js')).default)
router.put('/api/business/table/:id', authenticateUser, (await import('./controllers/api/business/table/update.js')).default)
router.delete('/api/business/table/:id', authenticateUser, (await import('./controllers/api/business/table/destroy.js')).default)

// API | BUSINESS BOOKINGS | AUTH REQUIRED
router.get('/api/business/booking', authenticateUser, (await import('./controllers/api/business/booking/index.js')).default)
router.post('/api/business/booking', authenticateUser, (await import('./controllers/api/business/booking/create.js')).default)
router.put('/api/business/booking/:id', authenticateUser, (await import('./controllers/api/business/booking/update.js')).default)
router.delete('/api/business/booking/:id', authenticateUser, (await import('./controllers/api/business/booking/destroy.js')).default)

// API | BUSINESS PROFILE | AUTH REQUIRED
router.put('/api/business/profile/update', authenticateUser, (await import('./controllers/api/business/profile/update.js')).default)

export default router
