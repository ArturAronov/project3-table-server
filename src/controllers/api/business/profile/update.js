import yup from 'yup'
import _ from 'lodash'
import bcrypt from 'bcrypt'
import prisma from '../../../_helpers/prisma.js'
import handleErrors from '../../../_helpers/handle-errors.js'
import uploadFileAsync from '../../../_helpers/upload-file.js'

const userInput = yup.object({
  name: yup.string(),
  phone: yup.string(),
  email: yup.string().email(),
  building: yup.string(),
  street: yup.string(),
  city: yup.string(),
  country: yup.string(),
  zipCode: yup.string(),
  logo: yup.mixed(),
  open: yup.string(),
  close: yup.string(),
  turnaround: yup.number(),
  daysOperating: yup.string(),
  password: yup.string().min(6),
  passwordConfirmation: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match')
})

const controllersApiBusinessProfileUpdate = async (req, res) => {
  try {
    const verifiedInput = await userInput.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    const existingProfile = await prisma.restaurant.findUnique({
      where: {
        id: req.session.restaurant.id
      },
      rejectOnNotFound: true
    })

    if (await verifiedInput.logo) {
      const businessEmail = await existingProfile.email
      const businessEmailLettersOnly = await businessEmail.split('').filter((element) => /[A-Za-z0-9]/.test(element)).join('')
      await uploadFileAsync(businessEmailLettersOnly, verifiedInput, req)
    }

    const updatedProfile = await prisma.restaurant.update({
      where: {
        id: req.session.restaurant.id
      },
      data: {
        name: verifiedInput.name || existingProfile.name,
        phone: verifiedInput.phone || existingProfile.phone,
        email: verifiedInput.email || existingProfile.email,
        building: verifiedInput.building || existingProfile.building,
        street: verifiedInput.street || existingProfile.street,
        city: verifiedInput.city || existingProfile.city,
        country: verifiedInput.country || existingProfile.country,
        zipCode: verifiedInput.zipCode || existingProfile.zipCode,
        logo: verifiedInput.logo || existingProfile.logo,
        open: verifiedInput.open || existingProfile.open,
        close: verifiedInput.close || existingProfile.close,
        turnaround: verifiedInput.turnaround || existingProfile.turnaround,
        daysOperating: verifiedInput.daysOperating || existingProfile.daysOperating,
        passwordHash: verifiedInput.password ? await bcrypt.hash(verifiedInput.password, 10) : existingProfile.passwordHash
      }
    })

    return res.status(201).json(_.omit(updatedProfile, ['passwordHash']))
  } catch (err) {
    return handleErrors(res, err)
  }
}

export default controllersApiBusinessProfileUpdate
