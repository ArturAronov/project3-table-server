import _ from 'lodash'

import handleErrors from '../../../_helpers/handle-errors.js'
import prisma from '../../../_helpers/prisma.js'

const controllersApiBusinessProfileIndex = async (req, res) => {
  try {
    console.log(req.session.restaurant.id)
    const { session: {
      restaurant: {
        id
      }
    }
    } = req

    const getProfile = await prisma.restaurant.findUnique({
      where: {
        id
      },
      rejectOnNotFound: true
    })

    return res.status(201).json(_.omit(getProfile, ['passwordHash']))
  } catch (err) {
    return handleErrors(res, err)
  }
}

export default controllersApiBusinessProfileIndex
