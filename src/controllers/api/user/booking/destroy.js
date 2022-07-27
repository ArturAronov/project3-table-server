import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const controllersApiUserBookingDestroy = async (req, res) => {
  try {
    const deleteBooking = await prisma.booking.delete({
      where: {
        id: parseInt(req.params.id)
      }
    })

    return res.status(201).json(deleteBooking)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiUserBookingDestroy
