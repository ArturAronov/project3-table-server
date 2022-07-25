const authenticateUser = (req, res, next) => {
  if (!req.session?.user?.id) {
    return res.status(401).json('Please Login First!')
  }
  return next()
}

export default authenticateUser
