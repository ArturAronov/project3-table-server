import yup from 'yup'
import bcrypt from 'bcrypt'
import _ from 'lodash'

import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'

const signupSchema = yup.object({
  firstName: yup.string().required().test({
    message: () => 'Please enter your first name',
    test: (value) => value
  }),
  lastName: yup.string().required().test({
    message: () => 'Please enter your last name',
    test: (value) => value
  }),
  email: yup.string().email().required().test({
    message: () => 'Email already exists',
    test: async (value) => {
      try {
        await prisma.user.findUnique({
          where: {
            email: value
          },
          rejectOnNotFound: true
        })

        return false
      } catch (err) {
        return true
      }
    }
  }),
  phone: yup.string().required().test({
    message: 'Please enter your phone number',
    test: (value) => value
  }),
  password: yup.string().min(6).required(),
  passwordConfirmation: yup.string().oneOf([yup.ref('password'), null], 'Password must match').required()
})

const controllersApiUserAuthSignup = async (req, res) => {
  try {
    const verifiedData = await signupSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    const newUser = await prisma.user.create({
      data: {
        firstName: verifiedData.firstName,
        lastName: verifiedData.lastName,
        email: verifiedData.email,
        phone: verifiedData.phone,
        passwordHash: await bcrypt.hash(verifiedData.password, 10)
      }
    })

    req.session.user = {
      id: newUser.id
    }

    await req.session.save()

    return res.status(201).json(_.omit(newUser, ['passwordHash']))
  } catch (err) {
    return handleErrors(res, err)
  }
}

export default controllersApiUserAuthSignup
