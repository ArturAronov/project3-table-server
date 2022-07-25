import handleErrors from '../../_helpers/handle-errors.js'
import prisma from '../../_helpers/prisma.js'

const controllersApiRestaurantsIndex = async (req, res) => {
  try {
    const getRestaurants = await prisma.restaurant.findMany()

    return res.status(201).json(getRestaurants)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiRestaurantsIndex
