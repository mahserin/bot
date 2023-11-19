const {MongoClient} = require('mongodb')
async function dbConnection () {
    const client = new MongoClient('mongodb://127.0.0.1:27017/')
    await client.connect()
    console.log('connected to database successfully')
    const db = await client.db('anonymous')
    return db
}

module.exports = {dbConnection}
