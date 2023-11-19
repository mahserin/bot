const database = require('./../Config/db')
let db , collection
async function prequire () {
    db = await database.dbConnection()
    collection = db.collection('messages')
}
async function insertMessage (mesg) {
    await prequire()
    await collection.insertOne(mesg)
    console.log('insert message')
}
async function readNew (id) {
    await prequire()
    let messages = await collection.find({
        'to.userId' : +id ,
        seen : false}).toArray()
    // await collection.updateMany({'to.userId' : +id} , {$set : {seen : true}})
    return messages
}
async function findSenderFromMsg (id) {
    await prequire()
    
    let msg = await collection.findOne({messageId : +id})
    return msg.from
}
module.exports = {insertMessage , readNew , findSenderFromMsg}