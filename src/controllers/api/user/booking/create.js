import yup from 'yup'
import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const userInput = yup.object({
  date: yup.string(),
  time: yup.string(),
  covers: yup.number()
})

const controllersApiUserBookingCreate = async (req, res) => {
  try {
    const verifiedInput = await userInput.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    const userId = req.session.user.id
    const restaurantId = req.params.id

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

    const bookings = await prisma.booking.findMany({
      where: {
        restaurantId
      }
    })

    // 1) Check if restaurant is open on the given day
    // 2) Check if booking is between opening and closing hours
    // 3) Check if there's tables available on the given day

    const restaurantOpen = restaurant.open.split(':').map((element) => Number(element))
    const restaurantDaysOperating = restaurant.daysOperating.split(',')
    const inputTime = verifiedInput.time.split(':')
    const inputDateArr = verifiedInput.date.split(' ').splice(0, 6)
    const inputDateYear = inputDateArr[3]
    const inputDateMonth = new Date(verifiedInput.date).getMonth()
    const inputDateDay = inputDateArr[2]

    const createBooking = await prisma.booking.create({
      data: {
        covers: verifiedInput.covers,
        time: verifiedInput.time,
        date: new Date(verifiedInput.date),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email ? user.email : ' ',
        phone: user.phone,
        userId,
        restaurantId
      }
    })

    console.log(bookings)
    return res.status(201).json(createBooking)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiUserBookingCreate
