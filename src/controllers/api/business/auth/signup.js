import yup from 'yup'
import bcrypt from 'bcrypt'
import _ from 'lodash'

import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'
import uploadFileAsync from '../../../_helpers/upload-file.js'

const signupSchema = yup.object({
  name: yup.string().required().test({
    message: () => 'Please enter your name',
    test: (value) => value
  }),
  phone: yup.string().required().test({
    message: () => 'Please enter your phone number',
    test: (value) => value
  }),
  email: yup.string().email().required().test({
    message: () => 'Email already exists',
    test: async (value) => {
      try {
        await prisma.business.findUnique({
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
  building: yup.string(),
  street: yup.string().required().test({
    message: () => 'Street name / number is required',
    test: (value) => value
  }),
  city: yup.string().required().test({
    message: () => 'City is required',
    test: (value) => value
  }),
  country: yup.string().required().test({
    message: () => 'Country is required',
    test: (value) => value
  }),
  zipCode: yup.string(),
  logo: yup.mixed(),
  open: yup.string().required().test({
    message: () => 'Opening time is required',
    test: (value) => value
  }),
  close: yup.string().required().test({
    message: () => 'Closing time is required',
    test: (value) => value
  }),
  turnaround: yup.number().required().test({
    message: 'Please enter table turnaround time',
    test: (value) => value
  }),
  daysOperating: yup.string().required().test({
    message: () => 'Please select operating days',
    test: (value) => value
  }),
  password: yup.string().min(6).required().test({
    message: () => 'Please enter password',
    test: (value) => value
  }),
  passwordConfirmation: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required()
})

const controllersApiBusinessAuthSignup = async (req, res) => {
  try {
    const verifiedData = await signupSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    const businessEmail = verifiedData.email
    const businessEmailLettersOnly = businessEmail.split('').filter((element) => /[A-Za-z0-9]/.test(element)).join('')

    await uploadFileAsync(businessEmailLettersOnly, verifiedData, req)

    const newBusiness = await prisma.restaurant.create({
      data: {
        name: verifiedData.name,
        phone: verifiedData.phone,
        email: verifiedData.email,
        building: verifiedData.building,
        street: verifiedData.street,
        city: verifiedData.city,
        country: verifiedData.country,
        zipCode: verifiedData.zipCode,
        logo: verifiedData.logo || 'https://unit-2-cardify.s3.ap-northeast-1.amazonaws.com/table-logo.png',
        open: verifiedData.open,
        close: verifiedData.close,
        turnaround: verifiedData.turnaround,
        daysOperating: verifiedData.daysOperating,
        passwordHash: await bcrypt.hash(verifiedData.password, 10)
      }
    })

    req.session.restaurant = {
      id: newBusiness.id
    }

    await req.session.save()

    return res.status(201).json(_.omit(newBusiness, ['passwordHash']))
  } catch (err) {
    handleErrors(res, err)
  }
}

export default controllersApiBusinessAuthSignup
