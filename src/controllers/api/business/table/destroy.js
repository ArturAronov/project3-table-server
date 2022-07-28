import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const controllersApiBusinessTableDestroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const deleteTable = await prisma.table.delete({
      where: {
        id
      }
    })

    return res.status(201).json(deleteTable)
  } catch (err) {
    return handleErrors(res, err)
  }
}

export default controllersApiBusinessTableDestroy
