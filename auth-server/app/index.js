const { createServer, LOGGER } = require('node-auth-server')
const auth = require('./auth')

async function checkCredentials (req, res, next) {
  const authHeader = req.get('Authorization')

  if (!authHeader) {
    LOGGER.error(`Suspicous attemp to authorize with no authorization header`
      + ` sent from ${req.ip}`)
    const err = new Error('Invalid attempt')
    err.status = 401
    return next(err)
  }

  const [ scheme, credentials ] = authHeader.split(' ')
  if (scheme.toLowerCase() !== 'basic') {
    LOGGER.error(`Suspicous attemp to authorize with the following`
      + ` authorization header: ${authHeader}`)
    const err = new Error('Invalid attempt')
    err.status = 401
    return next(err)
  }

  LOGGER.info(`Authorization request from ${req.ip} with ${authHeader}`)

  const [ usr, pwd ] = Buffer.from(credentials, 'base64').toString('ascii').split(':')
  try {
    res.locals.payload = await auth(usr, pwd)
    next()
  } catch (e) {
    if (e.name === 'InvalidCredentialsError')
      e.status = 401
    next(e)
  }
}

const server = createServer(checkCredentials)
server.listen(process.env.PORT, () => {
  LOGGER.info(`Authorization server started on port ${process.env.PORT}`)
})
