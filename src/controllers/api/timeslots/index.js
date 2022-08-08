import yup from 'yup'
import prisma from '../../_helpers/prisma.js'
import handleErrors from '../../_helpers/handle-errors.js'

const userInput = yup.object({
  id: yup.string().required(),
  covers: yup.number().required(),
  date: yup.string().required(),
  month: yup.string().required(),
  year: yup.string().required()
})

const controllersApiTimeslotsIndex = async (req, res) => {
  try {
    const verifiedInput = await userInput.validate(req.body, {
      abortEarly: false,
      strinpUnknown: true
    })

    const {
      id,
      covers,
      date,
      month,
      year
    } = verifiedInput

    // 1 Get restaurant data ------------------------------------------------------> OK!
    //   1.1 Retrieve opening and closing times
    //   1.2 Retrieve turnaround time
    // 2 Get all all of the restaurant data ---------------------------------------> OK!
    //   2.1 Retrieve all of the tables that are available for the requested covers
    // 3 Get bookings that have been allocated to the tables we need --------------> OK!
    // 4 Get total booking time slots from opening to closing ---------------------> OK!
    //   4.1 Fill an array with the time slots with 15 minute intervals
    // 5 Find clashing time slots, and block them off -----------------------------> OK!
    // 6 Filter out all of the blocked time slots from the time slot template -----> OK!

    // List all of the tables that belong to the restaurant (2).
    const getTables = await prisma.table.findMany({
      where: {
        restaurantId: id
      }
    })

    // Return the restaurant data (1).
    const getRestaurant = await prisma.restaurant.findUnique({
      where: {
        id
      }
    })

    // Return all of the tables that seat covers requested by user (2.1).
    const tablesAvailable = getTables.filter((element) => element.maxCapacity >= covers && element.minCapacity <= covers)

    // Return all of the existing bookings assigned to the tables that match the requested cover number (3).
    const getBookings = await prisma.booking.findMany({
      where: {
        restaurantId: id,
        dayDate: date,
        month,
        year,
        tableId: { in: tablesAvailable.map((element) => element.id) }
      }
    })

    // Turn opening and closing times into integer, such as from 12:00 to 1200 (1.1).
    const openInt = parseInt(getRestaurant.open.split(':').join(''))
    const closeInt = parseInt(getRestaurant.close.split(':').join(''))

    // Number of time slots available for table ie from 12:00 to 21:00, there's 36 available time slots => 12:00, 12:15, 12:30, 12:45, 13:00 ... 20:30, 20:34, 21:00 (4).
    const timeSlotsNum = ((closeInt - openInt) / 100) * 4

    // Create array with time slot templates from opening until closing (4.1).
    let minutes = 0
    let hours = 0
    const timeSlotTemplate = new Array(timeSlotsNum + 1)
      .fill(openInt - 100)
      .map((element) => {
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

    // Puts allocates time slots per each table that fits the covers criteria
    const timeSlotsPerTable = []

    for (let i = 0; i < tablesAvailable.length; i++) {
      timeSlotsPerTable.push(...timeSlotTemplate)
    }

    // Turn user input booking time into integer - ie 13:00 to 1300.
    const reservationTimes = getBookings.map((element) => parseInt(element.time.split(':').join('')))

    // Create empty array that will store all of the available time slots.
    const blockedTimeSlots = []

    // turn 90 (minutes) into 130 (as in 1 hour and 30 minutes) (1.2).
    const tableTurnaroundInt = (parseInt(getRestaurant.turnaround / 60) * 100) + (getRestaurant.turnaround % 60)

    for (let i = 0; i < timeSlotTemplate.length; i++) {
      for (let j = 0; j < reservationTimes.length; j++) {
        if (Math.abs(reservationTimes[j] - timeSlotTemplate[i]) < tableTurnaroundInt) {
          // If the reservation time - time slot is smaller than the table turnaround, then there's a time conflict, therefore this time slot gets blocked off and added to blockedTimeSlots array (5).
          blockedTimeSlots.push(timeSlotTemplate[i])
        }
      }
    }
    const maxCapacity = Math.max(...getTables.map((element) => element.maxCapacity))

    // Remove all of the time slots from the template that are in the blocked time slot array (6).
    // const result = timeSlotTemplate.filter((element) => !blockedTimeSlots.includes(element) && element)

    const timeSlotsPerTableWithoutTimeConflicts = timeSlotsPerTable
      .sort((a, b) => a - b)
      .filter((element) => {
        if (blockedTimeSlots.includes(element)) {
          const timeIndex = blockedTimeSlots.indexOf(element)

          blockedTimeSlots.splice(timeIndex, 1)
        } else {
          return element
        }
      })

    const returnData = [...new Set(timeSlotsPerTableWithoutTimeConflicts)]

    const resultObj = {
      tableMax: maxCapacity,
      tablesAvailable: returnData
    }

    return res.status(201).json(resultObj)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiTimeslotsIndex
