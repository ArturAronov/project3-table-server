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

    console.log(existingUser)

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

    const bookingsForTheDay = await prisma.booking.findMany({
      where: {
        restaurantId,
        dayDate: verifiedInput.dayDate,
        month: verifiedInput.month,
        year: verifiedInput.year
      }
    })

    const maxTableCapacity = Math.max(...tables.map((element) => element.maxCapacity))
    const daysOperatingArr = restaurant.daysOperating.split(',').map((element) => element.trim())
    const restaurantOpenInt = parseInt(restaurant.open.split(':').join(''))
    const restaurantCloseInt = parseInt(restaurant.close.split(':').join(''))
    const tableTurnaroundInt = restaurant.turnaround * 100
    const bookingTimeInt = verifiedInput.time ? parseInt(verifiedInput.time.split(':').join('')) : parseInt(booking.time.split(':').join(''))

    // 1) Check if restaurant is open on the given day  --------------------------------------------> OK!
    // 2) Check if booking is between opening and closing hours ------------------------------------> OK!
    // 3) Check if there's tables available on the given day
    // 3.1) Extract all bookings for the day by filtering out using day / month / year  ------------> OK!
    // 3.2) Iterate over tables and check in minCapacity and maxCapacity if any table is available -> OK!
    // 3.3) Verify that there is no time conflict with existing bookings ---------------------------> OK!
    // 4) Check that restaurant has table large enough to facilitate the booking -------------------> OK!

    // Filter out which tables are suitable for the booking, given the min and max seating capacity (3.2)
    const tablesCapacityAvailable = tables.filter((element) => element.minCapacity <= (verifiedInput.covers || booking.covers) && element.maxCapacity >= (verifiedInput.covers || booking.covers))

    // Filter out which of the available tables are used on the requested booking day (3.1)
    const tableCapacityAvailableOnBookingsForTheDay = bookingsForTheDay.filter((element) => tablesCapacityAvailable.map((table) => table.id).includes(element.tableId) && element.id !== bookingId)

    // Check if there's a time conflicts with the existing bookings (3.3)
    const verifyTime = tableCapacityAvailableOnBookingsForTheDay.some((element) => {
      const verifyTimeStart = parseInt(element.time.split(':').join(''))
      return Math.abs(verifyTimeStart - bookingTimeInt) < tableTurnaroundInt
    })

    const checkAvailability = () => {
      // Verify if restaurant is open on the booking day (1)
      if (daysOperatingArr.includes(verifiedInput.day || booking.day)) {
        // Verify if booking time is within the opening hours (2)
        if (bookingTimeInt >= restaurantOpenInt && bookingTimeInt <= restaurantCloseInt) {
          // Verify that restaurant has table large enough to facilitate the booking (4)
          if (maxTableCapacity > (verifiedInput.covers || booking.covers)) {
            // Verify that there's a tables available on the booking day (3)
            if (!verifyTime) {
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
                  tableId: tablesCapacityAvailable[0].id,
                  userId: existingUser ? existingUser.id : null
                }
              })
            }
            return `There's no tables available for ${verifiedInput.covers} at ${verifiedInput.time}`
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
