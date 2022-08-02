import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const controllersApiUserBookingShow = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.session.user.id
      }
    })

    return res.status(201).json(bookings)
  } catch (err) {
    return handleErrors(res, err)
  }
}

export default controllersApiUserBookingShow
