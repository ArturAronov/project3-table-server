import yup from 'yup'
import _ from 'lodash'
import bcrypt from 'bcrypt'
import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const userInput = yup.object({
  firstName: yup.string(),
  lastName: yup.string(),
  email: yup.string().email(),
  phone: yup.string(),
  password: yup.string().min(6),
  passwordConfirmation: yup.string().oneOf([yup.ref('password'), null], 'Password must match')
})

const controllersApiUserProfileUpdate = async (req, res) => {
  try {
    const verifiedInput = await userInput.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    const existingProfile = await prisma.user.findUnique({
      where: {
        id: req.session.user.id
      }
    })

    const updatedProfile = await prisma.user.update({
      where: {
        id: req.session.user.id
      },
      data: {
        firstName: verifiedInput.firstName || existingProfile.firstName,
        lastName: verifiedInput.lastName || existingProfile.lastName,
        email: verifiedInput.email || existingProfile.email,
        phone: verifiedInput.phone || existingProfile.phone,
        passwordHash: verifiedInput.password ? await bcrypt.hash(verifiedInput.password, 10) : existingProfile.passwordHash
      }
    })

    return res.status(201).json(_.omit(updatedProfile, ['passwordHash']))
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiUserProfileUpdate
