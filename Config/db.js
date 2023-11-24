const {MongoClient} = require('mongodb')
async function dbConnection () {
    const client = new MongoClient(process.env.MONGODB_URL)
    await client.connect()
    console.log('connected to database successfully')
    const db = await client.db('bot-anonymous')
    return db
}

module.exports = {dbConnection}
