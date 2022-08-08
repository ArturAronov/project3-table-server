import yup from 'yup'
import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const userInput = yup.object({
  covers: yup.number().required(),
  time: yup.string().required(),
  day: yup.string().required(),
  dayDate: yup.string().required(),
  month: yup.string().required(),
  year: yup.string().required()
})

const controllersApiUserBookingCreate = async (req, res) => {
  try {
    const userId = req.session.user.id
    const restaurantId = req.params.id

    const verifiedInput = await userInput.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId
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
    const bookingTimeInt = parseInt(verifiedInput.time.split(':').join(''))

    const tableTurnaroundInt = (parseInt(restaurant.turnaround / 60) * 100) + (restaurant.turnaround % 60)

    // 1) Check if restaurant is open on the given day  --------------------------------------------> OK!
    // 2) Check if booking is between opening and closing hours ------------------------------------> OK!
    // 3) Check that restaurant has table large enough to facilitate the booking -------------------> OK!

    // Filter out which tables are suitable for the booking, given the min and max seating capacity (3.2)
    const tablesThatFitCapacity = tables.filter((element) => element.minCapacity <= parseInt(verifiedInput.covers) && element.maxCapacity >= parseInt(verifiedInput.covers))

    const getBookings = await prisma.booking.findMany({
      where: {
        restaurantId,
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
      if (daysOperatingArr.includes(verifiedInput.day)) {
        // Verify if booking time is within the opening hours (2)
        if (bookingTimeInt >= restaurantOpenInt && bookingTimeInt <= restaurantCloseInt) {
          // Verify that restaurant has table large enoug to facilitate the booking (4)
          if (maxTableCapacity > verifiedInput.covers) {
            // If there's any table available that fit all of the criterias, proceed with booking the table.
            if (availableTables.length > 0) {
              return prisma.booking.create({
                data: {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phone: user.phone,
                  covers: verifiedInput.covers,
                  time: verifiedInput.time,
                  day: verifiedInput.day,
                  dayDate: verifiedInput.dayDate,
                  month: verifiedInput.month,
                  year: verifiedInput.year,
                  tableNr: availableTables[0].tableNr,
                  tableId: availableTables[0].id,
                  restaurantName: restaurant.name,
                  restaurantId,
                  userId
                }
              })
            }
          }
          return `Restaurant doesn't have any tables that could accomondate ${verifiedInput.covers}`
        }
        return `Restaurant is not open at ${verifiedInput.time}`
      }
      return `Restaurant is not open on ${verifiedInput.day}`
    }

    const createBooking = await checkAvailability()

    return res.status(201).json(createBooking)
  } catch (err) {
    return handleErrors(res, err)
  }
}

export default controllersApiUserBookingCreate
