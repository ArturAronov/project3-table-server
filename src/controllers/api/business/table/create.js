import yup from 'yup'
import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const controllersApiBusinessTableCreate = async (req, res) => {
  try {
    return res.status(201)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiBusinessTableCreate
