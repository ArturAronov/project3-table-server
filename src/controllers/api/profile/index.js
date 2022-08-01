import _ from 'lodash'

import handleErrors from '../../_helpers/handle-errors.js'
import prisma from '../../_helpers/prisma.js'

const controllersApiProfileIndex = async (req, res) => {
  try {
    const {
      session: {
        restaurant,
        user
      }
    } = req

    if (!restaurant?.id && !user?.id) return res.status(401).json('Please Login First!')

    let profile
    if (restaurant) {
      profile = await prisma.restaurant.findUnique({
        where: {
          id: restaurant.id
        },
        rejectOnNotFound: true
      })
      profile.authType = 'business'
    } else {
      profile = await prisma.user.findUnique({
        where: {
          id: user.id
        },
        rejectOnNotFound: true
      })
      profile.authType = 'user'
    }

    return res.status(201).json(_.omit(profile, ['passwordHash']))
  } catch (err) {
    return handleErrors(res, err)
  }
}

export default controllersApiProfileIndex
