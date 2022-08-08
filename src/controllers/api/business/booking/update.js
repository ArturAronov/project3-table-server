import yup from 'yup'
import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const userInput = yup.object({
  firstName: yup.string(),
  lastName: yup.string(),
  email: yup.string().email(),
  phone: yup.string(),
  covers: yup.number(),
  time: yup.string(),
  day: yup.string(),
  dayDate: yup.string(),
  month: yup.string(),
  year: yup.string()
})

const controllersApiBusinessBookingUpdate = async (req, res) => {
  try {
    const verifiedInput = await userInput.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    const bookingId = parseInt(req.params.id)
    const restaurantId = req.session.restaurant.id

    // Find existing user record, if any
    const existingUser = verifiedInput.phone && await prisma.user.findUnique({
      where: {
        phone: verifiedInput.phone
      },
      rejectOnNotFound: true
    })

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId
      }
    })

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: booking.restaurantId
      }
    })

    const tables = await prisma.table.findMany({
      where: {
        restaurantId
      }
    })

    const maxTableCapacity = Math.max(...tables.map((element) => element.maxCapacity))
    const daysOperatingArr = restaurant.daysOperating.split(',').map((element) => element.trim())
    const restaurantOpenInt = parseInt(restaurant.open.split(':').join(''))
    const restaurantCloseInt = parseInt(restaurant.close.split(':').join(''))
    const bookingTimeInt = verifiedInput.time ? parseInt(verifiedInput.time.split(':').join('')) : parseInt(booking.time.split(':').join(''))

    const tableTurnaroundInt = (parseInt(restaurant.turnaround / 60) * 100) + (restaurant.turnaround % 60)

    // 1) Check if restaurant is open on the given day  --------------------------------------------> OK!
    // 2) Check if booking is between opening and closing hours ------------------------------------> OK!
    // 3) Check that restaurant has table large enough to facilitate the booking -------------------> OK!

    // Filter out which tables are suitable for the booking, given the min and max seating capacity (3.2)
    const tablesThatFitCapacity = tables.filter((element) => element.minCapacity <= (verifiedInput.covers || booking.covers) && element.maxCapacity >= (verifiedInput.covers || booking.covers))

    const getBookings = await prisma.booking.findMany({
      where: {
        restaurantId: restaurant.id,
        dayDate: verifiedInput.dayDate,
        month: verifiedInput.month,
        year: verifiedInput.year,
        tableId: { in: tablesThatFitCapacity.map((element) => element.id) }
      }
    })

    // Get all of the bookings that clash with the current booking time, and put them on the side to be filtered out later
    const reservedTables = []

    for (let i = 0; i < getBookings.length; i++) {
      const existingBookingTime = parseInt(getBookings[i].time.split(':').join(''))

      if (Math.abs(existingBookingTime - bookingTimeInt) < tableTurnaroundInt) {
        reservedTables.push(getBookings[i])
      }
    }

    const availableTables = tablesThatFitCapacity.filter((element) => !reservedTables.map((table) => table.tableNr).includes(element.tableNr))

    const checkAvailability = () => {
      // Verify if restaurant is open on the booking day (1)
      if (daysOperatingArr.includes(verifiedInput.day || booking.day)) {
        // Verify if booking time is within the opening hours (2)
        if (bookingTimeInt >= restaurantOpenInt && bookingTimeInt <= restaurantCloseInt) {
          // Verify that restaurant has table large enough to facilitate the booking (4)
          if (maxTableCapacity > (verifiedInput.covers || booking.covers)) {
            // If there's any table available that fit all of the criterias, proceed with booking the table.
            if (availableTables.length > 0) {
              return prisma.booking.update({
                where: {
                  id: bookingId
                },
                data: {
                  dateEdited: new Date(),
                  firstName: !existingUser ? (verifiedInput.firstName || booking.firstName) : existingUser.firstName,
                  lastName: !existingUser ? (verifiedInput.lastName || booking.lastName) : existingUser.lastName,
                  email: !existingUser ? (verifiedInput.email || booking.email) : existingUser.email,
                  phone: verifiedInput.phone || booking.phone,
                  time: verifiedInput.time || booking.time,
                  day: verifiedInput.day || booking.day,
                  dayDate: verifiedInput.dayDate || booking.dayDate,
                  month: verifiedInput.month || booking.month,
                  year: verifiedInput.year || booking.year,
                  covers: verifiedInput.covers || booking.covers,
                  tableNr: availableTables[0].tableNr,
                  tableId: availableTables[0].id,
                  userId: existingUser ? existingUser.id : null,
                  restaurantName: restaurant.name
                }
              })
            }
          }
          return `Restaurant doesn't have any tables that could accommodate ${verifiedInput.covers}`
        }
        return `Restaurant is not open at ${verifiedInput.time}`
      }
      return `Restaurant is not open on ${verifiedInput.day || booking.day}`
    }

    const createBooking = await checkAvailability()

    return res.status(201).json(createBooking)
  } catch (err) {
    return handleErrors(res, err)
  }
}

export default controllersApiBusinessBookingUpdate
