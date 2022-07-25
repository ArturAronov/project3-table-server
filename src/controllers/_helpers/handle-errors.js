import _ from 'lodash'

const mapErrors = (err) => {
  if (err.inner.length === 0) {
    throw new Error('no error found! check to see if you are using { abortEarly: true }? This can also be an error unrelated to validation!')
  }

  const errorMessages = {}

  err.inner.forEach(({ path, errors: [msg] }) => {
    _.set(errorMessages, path, msg)
  })

  return errorMessages
}

const handleErrors = (res, err) => {
  console.log(err) // eslint-disable-line
  switch (err.constructor.name) {
    case 'PrismaClientKnownRequestError':
      if (err.code === 'P2025') return res.status(404).json(err.meta.cause)
      return res.status(400).json(err)
    case 'NotFoundError':
      return res.status(404).json('Entry Not Found')
    case 'ValidationError':
      return res.status(406).json(mapErrors(err))
    default:
      return res.status(400).json(err)
  }
}

export default handleErrors
