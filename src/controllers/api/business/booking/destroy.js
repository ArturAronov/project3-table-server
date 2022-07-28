import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const controllersApiBusinessBookingDestroy = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id)

    const deleteBooking = await prisma.booking.delete({
      where: {
        id: bookingId
      }
    })

    return res.status(201).json(deleteBooking)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiBusinessBookingDestroy
