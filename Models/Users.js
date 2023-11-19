const database = require('./../Config/db')
let db , collection
async function prequire () {
    db = await database.dbConnection()
    collection = await db.collection('users')
}
async function exist (id) {
    await prequire()
    return await collection.findOne({userId : +id})

}
async function insertUser (user) {
    await prequire()
    await collection.insertOne(user)
}
async function setToken (id ,token) {
    await prequire()
    await collection.updateOne({userId : id} , {$set : {link : token}})
}
async function getToken (id) {
    await prequire()
    let user = await collection.findOne({userId : id})
    return user.link
}
async function findToken (token) {
    await prequire()
    return await collection.findOne({link: +token})
}
async function blockUser (id , mainUserId){
    await prequire()
    await collection.updateOne({userId : id } , {$push : {
        blocks : mainUserId
    }})
}
async function isBlocked (id , mainUserId) {
    await prequire()
    let user = await collection.findOne({userId : id})
    return user.blocks.some( block => block == mainUserId)
}
async function unblockUser (id , mainUserId) {
    await prequire()
    await collection.updateOne({userId : id} , {$pull : { blocks : mainUserId}})
}
module.exports = {exist , insertUser , setToken , getToken , findToken , blockUser , isBlocked , unblockUser}