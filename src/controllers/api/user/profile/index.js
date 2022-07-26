import _ from 'lodash'

import handleErrors from '../../../_helpers/handle-errors.js'
import prisma from '../../../_helpers/prisma.js'

const controllersApiUserProfileIndex = async (req, res) => {
  try {
    const { session: {
      user: {
        id
      }
    }
    } = req

    const getProfile = await prisma.user.findUnique({
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

export default controllersApiUserProfileIndex
