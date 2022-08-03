/* eslint-disable no-else-return */
/* eslint-disable no-param-reassign */
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

    const getTables = await prisma.table.findMany({
      where: {
        restaurantId: id
      }
    })

    const getRestaurant = await prisma.restaurant.findUnique({
      where: {
        id
      }
    })

    const tablesAvailable = getTables.filter((element) => element.maxCapacity >= parseInt(covers) && element.minCapacity <= parseInt(covers))

    const getBookings = await prisma.booking.findMany({
      where: {
        restaurantId: id,
        dayDate: date,
        month,
        year,
        tableId: { in: tablesAvailable.map((element) => element.id) }
      }
    })

    const openInt = parseInt(getRestaurant.open.split(':').join(''))
    const closeInt = parseInt(getRestaurant.close.split(':').join(''))
    const timeSlotsNum = ((closeInt - openInt) / 100) * 4
    let minutes = 0
    let hours = 0
    const openingTimeslots = new Array(timeSlotsNum + 1).fill(openInt - 100).map((element) => {
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

    const reservationTimes = getBookings.map((element) => parseInt(element.time.split(':').join('')))
    console.log(reservationTimes)
    const timeSlots = []
    for (let i = 0; i < openingTimeslots.length; i += 0) {
      if (reservationTimes.includes(openingTimeslots[i])) {
        i += 8
      } else {
        timeSlots.push(openingTimeslots[i])
        i++
      }
    }

    // Turns time format from 12:00 to 1200
    const maxCapacity = Math.max(...getTables.map((element) => element.maxCapacity))

    const resultObj = {
      tableMax: maxCapacity,
      tablesAvailable: timeSlots
    }

    console.log(resultObj)

    return res.status(201).json(resultObj)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiTimeslotsIndex
