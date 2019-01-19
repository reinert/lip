const { promisify } = require('util')

const { LOGGER } = require('node-auth-server')
const CONFIG = require(process.env.CONFIG || './config')

async function authenticate(usr, pwd, cb) {
  let payload = null

  LOGGER.info(`Attempt to authenticate user '${usr}'`)

  if (CONFIG[usr] === pwd) {
    payload = usr
    cb(undefined, payload)
    return
  }

  let err = new Error('Invalid user')
  err.name = 'InvalidCredentialsError'
  cb(err)
}

module.exports = promisify(authenticate)
