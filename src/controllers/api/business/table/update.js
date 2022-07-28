import yup from 'yup'
import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const userInput = yup.object({
  tableNr: yup.string(),
  minCapacity: yup.number(),
  maxCapacity: yup.number()
})

const controllersApiBusinessTableUpdate = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const verifiedInput = await userInput.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    const getTable = await prisma.table.findUnique({
      where: {
        id
      }
    })

    const updateTable = await prisma.table.update({
      where: {
        id
      },
      data: {
        tableNr: verifiedInput.tableNr || getTable.tableNr,
        minCapacity: verifiedInput.minCapacity || getTable.minCapacity,
        maxCapacity: verifiedInput.maxCapacity || getTable.maxCapacity
      }
    })

    return res.status(201).json(updateTable)
  } catch (err) {
    return handleErrors(res, err)
  }
}

export default controllersApiBusinessTableUpdate
