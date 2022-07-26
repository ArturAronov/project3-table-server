import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const controllersApiBusinessTableDestroy = async (req, res) => {
  try {
    return res.status(201)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiBusinessTableDestroy
