import yup from 'yup'
import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const userInput = yup.object({
  covers: yup.number(),
  time: yup.string(),
  day: yup.string(),
  dayDate: yup.string(),
  month: yup.string(),
  year: yup.string()
})

const controllersApiUserBookingUpdate = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id)

    const verifiedInput = await userInput.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
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
        restaurantId: bookingId.restaurantId
      }
    })

    const maxTableCapacity = Math.max(...tables.map((element) => element.maxCapacity))
    const daysOperatingArr = restaurant.daysOperating.split(',').map((element) => element.trim())
    const restaurantOpenInt = parseInt(restaurant.open.split(':').join(''))
    const restaurantCloseInt = parseInt(restaurant.close.split(':').join(''))

    const bookingTimeInt = verifiedInput.time ? parseInt(verifiedInput.time.split(':').join('')) : parseInt(booking.time.split(':').join(''))

    // 1) Check if restaurant is open on the given day  --------------------------------------------> OK!
    // 2) Check if booking is between opening and closing hours ------------------------------------> OK!
    // 3) Check that restaurant has table large enough to facilitate the booking -------------------> OK!

    // Filter out which tables are suitable for the booking, given the min and max seating capacity (3.2)
    const tablesCapacityAvailable = tables.filter((element) => element.minCapacity <= (verifiedInput.covers || booking.covers) && element.maxCapacity >= (verifiedInput.covers || booking.covers))

    const checkAvailability = () => {
      // Verify if restaurant is open on the booking day (1)
      if (daysOperatingArr.includes(verifiedInput.day || booking.day)) {
        // Verify if booking time is within the opening hours (2)
        if (bookingTimeInt >= restaurantOpenInt && bookingTimeInt <= restaurantCloseInt) {
          // Verify that restaurant has table large enough to facilitate the booking (4)
          if (maxTableCapacity > (verifiedInput.covers || booking.covers)) {
            return prisma.booking.update({
              where: {
                id: bookingId
              },
              data: {
                dateEdited: new Date(),
                time: verifiedInput.time || booking.time,
                day: verifiedInput.day || booking.day,
                dayDate: verifiedInput.dayDate || booking.dayDate,
                month: verifiedInput.month || booking.month,
                year: verifiedInput.year || booking.year,
                covers: verifiedInput.covers || booking.covers,
                tableId: tablesCapacityAvailable[0].id,
                restaurantName: restaurant.name
              }
            })
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

export default controllersApiUserBookingUpdate
