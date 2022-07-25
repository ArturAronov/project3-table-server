// Libraries used to create the server
import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import methodOverride from 'method-override'
import cors from 'cors'
import { ironSession } from 'iron-session/express'

import parseData from './src/_middlewares/parse-data.js'

const app = express() // The instance that "host" our server
const port = process.env.PORT || 3000 // The port number our server runs on

// Prints out request information
app.use(morgan('tiny'))

// Give forms the ability to use DELETE and PUT method
app.use(methodOverride('_method'))

app.use(ironSession({
  cookieName: 'iron-session',
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}))

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.urlencoded({ extended: true })) // parses url queries to req.query
app.use(express.json()) // parses json to req.body
app.use(parseData) // parses multi-part to req.body and req.files

// Defining the routes for our server
app.use('/', (await import('./src/routes.js')).default)

// Starts the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`App listening at http://localhost:${port}`)
})
