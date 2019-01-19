const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const { Pool } = require('pg')

// pools will use environment variables
// for connection information
const pool = new Pool()

pool.on('connect', async (client) => {
  client.query("SET SCHEMA 'financial'")
})

app.get('/now', async (req, res) => {
  const client = await pool.connect()
  try {
    const r = await client.query('SELECT NOW()')
    res.send(r)
  } finally {
    client.release()
  }
})

app.post('/cat', async (req, res) => {
  const client = await pool.connect()
  try {
    const r = await client.query('INSERT INTO category (kind, name) VALUES ($1, $2)', [req.body.kind, req.body.name])
    res.send(r)
  } finally {
    client.release()
  }
})

app.get('/cat', async (req, res) => {
  const client = await pool.connect()
  try {
    const r = await client.query('SELECT (kind, name) FROM category')
    res.send(r)
  } finally {
    client.release()
  }
})

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

process.on('SIGTERM', async () => {
  console.info('SIGTERM signal received.')

  console.log('Closing http server.')
  await server.close()

  console.log('Closing db pool.')
  await pool.end()
  console.log('Db pool closed.')

  process.exit(0)
})
