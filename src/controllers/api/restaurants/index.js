import _ from 'lodash'
import handleErrors from '../../_helpers/handle-errors.js'
import prisma from '../../_helpers/prisma.js'

const controllersApiRestaurantsIndex = async (req, res) => {
  try {
    const getRestaurants = await prisma.restaurant.findMany()
    const removeHash = await getRestaurants.map((element) => _.omit(element, ['passwordHash']))

    return res.status(201).json(removeHash)
  } catch (err) {
    return handleErrors(res, err)
  }
}

export default controllersApiRestaurantsIndex
