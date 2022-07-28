import handleErrors from '../../_helpers/handle-errors.js'

const controllersApiAuthLogout = async (req, res) => {
  try {
    await req.session.destroy()
    return res.status(201).json('Successfully Logged Out!')
  } catch (error) {
    return handleErrors(res, error)
  }
}

export default controllersApiAuthLogout
