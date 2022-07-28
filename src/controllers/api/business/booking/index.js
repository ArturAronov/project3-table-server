import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const controllersApiBusinessBookingIndex = async (req, res) => {
  try {
    const restaurantId = req.session.restaurant.id

    const getBookings = await prisma.booking.findMany({
      where: {
        restaurantId
      }
    })

    return res.status(201).json(getBookings)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiBusinessBookingIndex
