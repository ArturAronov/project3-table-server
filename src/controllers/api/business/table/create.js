import yup from 'yup'
import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const userInput = yup.object({
  tableNr: yup.string().required(),
  minCapacity: yup.number().required(),
  maxCapacity: yup.number().required()
})

const controllersApiBusinessTableCreate = async (req, res) => {
  try {
    const verifiedInput = await userInput.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    const newTable = await prisma.table.create({
      data: {
        tableNr: verifiedInput.tableNr,
        minCapacity: verifiedInput.minCapacity,
        maxCapacity: verifiedInput.maxCapacity,
        restaurantId: req.session.restaurant.id
      }
    })

    return res.status(201).json(newTable)
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiBusinessTableCreate
