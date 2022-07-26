import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const controllersApiBusinessTableIndex = async (req, res) => {
  try {
    const getTables = await prisma.table.findMany({
      where: {
        restaurantId: req.session.restaurant.id
      }
    })
    return res.status(201).json(getTables)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiBusinessTableIndex
