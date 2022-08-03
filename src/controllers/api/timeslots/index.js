import prisma from '../../_helpers/prisma.js'
import handleErrors from '../../_helpers/handle-errors.js'

const controllersApiTimeslotsIndex = async (req, res) => {
  try {
    const {
      id,
      covers,
      date,
      month,
      year
    } = req.params

    // List all of the tables that belong to the restaurant
    const getTables = await prisma.table.findMany({
      where: {
        restaurantId: id
      }
    })

    // Return the restaurant data
    const getRestaurant = await prisma.restaurant.findUnique({
      where: {
        id
      }
    })

    // Return all of the tables that seat covers requested by user
    const tablesAvailable = getTables.filter((element) => element.maxCapacity >= parseInt(covers) && element.minCapacity <= parseInt(covers))

    // Return all of the existing bookings assigned to the tables that match the requested cover number
    const getBookings = await prisma.booking.findMany({
      where: {
        restaurantId: id,
        dayDate: date,
        month,
        year,
        tableId: { in: tablesAvailable.map((element) => element.id) }
      }
    })

    // Turn opening and closing times into integer, such as from 12:00 to 1200
    const openInt = parseInt(getRestaurant.open.split(':').join(''))
    const closeInt = parseInt(getRestaurant.close.split(':').join(''))

    // Number of time slots available for table ie from 12:00 to 21:00, there's 36 available time slots => 12:00, 12:15, 12:30, 12:45, 13:00 ... 20:30, 20:34, 21:00
    const timeSlotsNum = ((closeInt - openInt) / 100) * 4

    // Create array with time slot templates from opening until closing
    let minutes = 0
    let hours = 0
    const timeSlotTemplate = new Array(timeSlotsNum + 1).fill(openInt - 100).map((element) => {
      if (minutes % 60) {
        element += minutes
        element += hours
      } else {
        hours += 100
        element += hours
        minutes = 0
      }

      minutes += 15
      return element
    })

    // Turn user input booking time into integer - ie 13:00 to 1300
    const reservationTimes = getBookings.map((element) => parseInt(element.time.split(':').join('')))

    // Create empty array that will store all of the available time slots
    const timeSlots = []
    for (let i = 0; i < timeSlotTemplate.length; i += 0) {
      if (reservationTimes.includes(timeSlotTemplate[i])) {
        // if there's a existing booking under the time, jump loop by turnaround time
        // 2h         120 / 4 => 30   / 4 => 7.5
        // 2h 30min   150 / 4 => 37.5 / 4 => 9.375
        const iterations = Math.ceil((parseInt(getRestaurant.turnaround) / 4) / 4)
        i += iterations
      } else {
        timeSlots.push(timeSlotTemplate[i])
        i++
      }
    }

    // Turns time format from 12:00 to 1200
    const maxCapacity = Math.max(...getTables.map((element) => element.maxCapacity))

    const resultObj = {
      tableMax: maxCapacity,
      tablesAvailable: timeSlots
    }

    return res.status(201).json(resultObj)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiTimeslotsIndex
