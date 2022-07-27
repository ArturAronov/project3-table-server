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

    const bookingsForTheDay = await prisma.booking.findMany({
      where: {
        dayDate: verifiedInput.dayDate,
        month: verifiedInput.month,
        year: verifiedInput.year
      }
    })

    const daysOperatingArr = restaurant.daysOperating.split(',').map((element) => element.trim())
    const restaurantOpenInt = parseInt(restaurant.open.split(':').join(''))
    const restaurantCloseInt = parseInt(restaurant.close.split(':').join(''))
    const tableTurnaroundInt = restaurant.turnaround * 100
    const bookingTimeInt = parseInt(verifiedInput.time.split(':').join(''))

    // 1) Check if restaurant is open on the given day  --------------------------------------------------> OK!
    // 2) Check if booking is between opening and closing hours ------------------------------------------> OK!
    // 3) Check if there's tables available on the given day
    // 3.1) Extract all bookings for the day by filtering out using day / month / year  ------------------> OK!
    // 3.2) Iterate over tables and check in minCapacity and maxCapacity if any table is available -------> OK!
    // 3.3) Verify that there is no time conflict with existing bookings ---------------------------------> OK!

    // Filter out which tables are suitable for the booking, given the min and max seating capacity (3.2)
    const tablesCapacityAvailable = tables.filter((element) => element.minCapacity <= verifiedInput.covers && element.maxCapacity >= verifiedInput.covers)

    // Filter out which of the available tables are used on the requested booking day (3.1)
    const tableCapacityAvailableOnBookingsForTheDay = bookingsForTheDay.filter((booking) => tablesCapacityAvailable.map((table) => table.id).includes(booking.tableId))

    // Check if there's a time conflicts with the existing bookings (3.3)
    const verifyTime = tableCapacityAvailableOnBookingsForTheDay.some((element) => {
      const verifyTimeStart = parseInt(element.time.split(':').join(''))
      return Math.abs(verifyTimeStart - bookingTimeInt) < tableTurnaroundInt
    })

    const checkAvailability = () => {
      // Verify if restaurant is open on the booking day (1)
      if (daysOperatingArr.includes(verifiedInput.day)) {
        // Verify if booking time is within the opening hours (2)
        if (bookingTimeInt >= restaurantOpenInt && bookingTimeInt <= restaurantCloseInt) {
          // Verify that there's a tables available on the booking day (3)
          if (!verifyTime) {
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
                tableId: tablesCapacityAvailable[0].id,
                restaurantId,
                userId
              }
            })
          }
          return `There's no tables available for ${verifiedInput.covers} at ${verifiedInput.time}`
        }
        return `Restaurant is not open at ${verifiedInput.time}`
      }
      return `Restaurant is not open on ${verifiedInput.day}`
    }

    const createBooking = await checkAvailability()

    return res.status(201).json(createBooking)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiUserBookingCreate
