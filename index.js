const TelegramBot = require('node-telegram-bot-api')
require('dotenv').config()
const token = '6725161255:AAFlT_dA3FXEy0wIyUZ2oXdu3Blpu2txvGc'
const bot = new TelegramBot(token, { polling: true });
const Users = require('./Models/Users')
const Messages = require('./Models/Messages')
let user , mainUser
console.log('server started successfully')
bot.onText(/^\/start$/, async msg => {
    console.log('requested successfully')
     user = await Users.exist(msg.from.id)
    if (user) {
        if (user.role === 'ADMIN') {
            bot.sendMessage(msg.chat.id, 'سلام به ربات ناشناس خوش اومدین \n از دکمه های زیر برای خودت لینک بساز و  به اشتراک بذار', {
                "reply_markup": {
                    "keyboard": [["لینک ناشناس من"], ["راهنما"], ["ورود به پنل مدیریت"]]

                }
            })
        } else if (user.role === 'USER') {
            bot.sendMessage(msg.chat.id, 'سلام به ربات ناشناس خوش اومدین \n از دکمه های زیر برای خودت لینک بساز و  به اشتراک بذار', {
                "reply_markup": {
                    "keyboard": [["لینک ناشناس من"], ["راهنما"]]
                }
            })
        }

    } else {
        bot.sendMessage(msg.chat.id, 'سلام به ربات ناشناس خوش اومدین \n از دکمه های زیر برای خودت لینک بساز و  به اشتراک بذار', {
            "reply_markup": {
                "keyboard": [["لینک ناشناس من"], ["راهنما"]]
            }
        })
        await Users.insertUser({
            userId: msg.from.id,
            fName: msg.from.first_name,
            userName: msg.from.username,
            link: null,
            blocks: [],
            role: 'USER',
            createdAt: msg.date
        })
    }
})
bot.onText(/لینک ناشناس من/, async msg => {
     user = await Users.exist(msg.from.id)
    if (user.link == null) {
        let token = Math.floor(Math.random() * 10 ** 8)
        await Users.setToken(msg.from.id, token)
    }
    let userToken = await Users.getToken(msg.from.id)
    let link = 'https://telegram.me/Say_anonymousbot?start=' + userToken
    bot.sendMessage(msg.chat.id, `لینگ ناشناس شما : \n ${link}`)
})
bot.onText(/^\/start \d+$/, async msg => {
     user = await Users.exist(msg.from.id)
    if (!user) {
        await Users.insertUser({
            userId: msg.from.id,
            fName: msg.from.first_name,
            userName: msg.from.username,
            link: null,
            role: 'USER',
            createdAt: msg.date
        })
        user = await Users.exist(msg.from.id)
    }
    let userToken = msg.text.match(/\d+/)[0]
     mainUser = await Users.findToken(userToken)
    if (mainUser.userId == msg.from.id) {
        bot.sendMessage(msg.chat.id, 'شما نمیتوانید به خودتان پیام ناشناس بدهید')
    } else {
        bot.sendMessage(msg.from.id, `شما در حال ارسال پیام ناشناس به ${mainUser.fName} هستید \n لطفا پیام خود را ارسال کنید`)
        let i = 1
        console.log('under i');
        bot.onText(/.+/, msg => {
            if (i == 1) {
                let text = msg.text
                if (text.match(/\/start/)) {

                } else {
                    console.log('pishnamayesh')
                    bot.sendMessage(msg.chat.id, `پیشنمایش : \n\n ${text}`, {
                        reply_markup: {
                            inline_keyboard:
                                [[{
                                    text: 'ارسال',
                                    callback_data: 'send'
                                }],
                                [{
                                    text: 'لغو ',
                                    callback_data: 'cancel'
                                }]]
                        }

                    })
                    bot.on('callback_query', async query => {
                        if (query.data == 'send') {
                            await Messages.insertMessage({
                                messageText: text,
                                messageId: query.message.message_id,
                                date: query.message.date,
                                seen: false,
                                from: user,
                                to: mainUser
                            })
                            bot.deleteMessage(user.userId, query.message.message_id)
                            bot.sendMessage(mainUser.userId, 'هی یک پیام جدید داری \n برای دیدن پیام های جدید بزن روی /newmsg')
                            bot.sendMessage(user.userId, 'پیام شما با موفقیت ارسال شد')
                        } else if (query.data == 'cancel') {
                            bot.deleteMessage(user.userId, query.message.message_id)
                            bot.sendMessage(user.userId, 'ارسال پیام لغو شد')
                        }
                    })
                }
                i++
            }
        })
    }
})
bot.onText(/^\/newmsg$/, async msg => {
    let msgs = await Messages.readNew(msg.from.id)
    if (msgs.length) {
        msgs.forEach(messg => {
            bot.sendMessage(msg.from.id, messg.messageText, {
                reply_markup: {
                    inline_keyboard:
                        [[{
                            text: 'بلاک ',
                            callback_data: `block ${messg.from.userId}`
                        },
                        {
                            text: 'پاسخ',
                            callback_data: `answer ${messg.messageId}`
                        }
                        ]]
                }
            })
        })
    } else {
        bot.sendMessage(msg.from.id, 'شما هیچ پیغام جدیدی ندارید :(')
    }

})
bot.on('callback_query', async query => {
    if (query.data.match(/^answer/)) {
        console.log(query)
        bot.sendMessage(query.from.id, 'پاسخ خود را بنویسید')
        let i = 1
        console.log('under i');
        bot.onText(/.+/, async msg => {
            if (i == 1) {
                let text = msg.text
                if (text.match(/\/start/)) {

                } else {
                    console.log('pishnamayesh')
                    bot.sendMessage(msg.chat.id, `پیش نمایش : \n\n ${text}`, {
                        reply_markup: {
                            inline_keyboard:
                                [[{
                                    text: 'ارسال',
                                    callback_data: 'send'
                                }],
                                [{
                                    text: 'لغو ',
                                    callback_data: 'cancel'
                                }]]
                        }

                    })
                     user = await Users.exist(msg.chat.id)
                     mainUser = await Messages.findSenderFromMsg(query.data.match(/\d+$/)[0])
                    bot.on('callback_query', async query => {
                        if (query.data == 'send') {
                            await Messages.insertMessage({
                                messageText: text,
                                messageId: query.message.message_id,
                                date: query.message.date,
                                seen: false,
                                from: user,
                                to: mainUser
                            })
                            bot.deleteMessage(user.userId, query.message.message_id)
                            bot.sendMessage(mainUser.userId, 'هی یک پیام جدید داری \n برای دیدن پیام های جدید بزن روی /newmsg')
                            bot.sendMessage(user.userId, 'پیام شما با موفقیت ارسال شد')
                        }
                    })
                }
                i++
            }
        })
    } else if (query.data.match(/^block/)) {
        let userHasBlocked = await Users.isBlocked(query.from.id, query.data.match(/\d+$/)[0])
        if (userHasBlocked) {
            bot.sendMessage(query.from.id, 'این کاربر قبلا بلاک شده است')
        } else {
            await Users.blockUser(query.from.id, query.data.match(/\d+$/)[0])
            bot.sendMessage(query.from.id, 'کاربر مورد نظر با موفقیت بلاک شد')
        }
        console.log(query.message.message_id)
        bot.editMessageReplyMarkup({
            inline_keyboard:
                [[{
                    text: 'آنبلاک',
                    callback_data: `unblock ${query.data.match(/\d+$/)[0]}`
                }
                ]]
        }, {
            chat_id: query.from.id,
            message_id: query.message.message_id
        })
    } else if (query.data.match(/^unblock/)) {
        await Users.unblockUser(query.from.id, query.data.match(/\d+$/)[0])
        bot.sendMessage(query.from.id, 'کاربر مورد نظر با موفقیت آنبلاک شد')
        bot.editMessageReplyMarkup({

            inline_keyboard:
                [[{
                    text: 'بلاک ',
                    callback_data: `block ${query.data.match(/\d+$/)[0]}`
                }]]
        }, {
            chat_id: query.from.id,
            message_id: query.message.message_id
        })
    }
})
bot.onText(/^\/who$/, async msg => {

    let user = await Users.exist(msg.from.id)
    if (user.role === 'ADMIN') {
        let reg = msg.reply_to_message
        if (reg) {
            if (reg.reply_markup.inline_keyboard[0][0].callback_data.match(/\d+$/)[0]) {
                 mainUser = await Users.exist(msg.reply_to_message.reply_markup.inline_keyboard[0][0].callback_data.match(/\d+$/)[0])
                bot.sendMessage(msg.from.id, `name : ${mainUser.fName} \n username : @${mainUser.userName} \n userid : ${mainUser.userId} \n link : ${mainUser.link}`)
            }
        }
    }
})
bot.onText(/^راهنما$/, msg => {
    bot.sendMessage(msg.from.id, `
    متن راهنمای ربات ارسال پیام ناشناس:
    
    👻 ربات ارسال پیام ناشناس
    
    با استفاده از این ربات ساده، شما می‌توانید پیام‌های ناشناس بفرستید. برای شروع و دریافت لینک ناشناس:
    
    ابتدا ربات را با دکمه "/start" فعال کنید.
    
    پس از اجرای دستور فوق، یک لینک ناشناس به شما اختصاص داده می‌شود.
    
    حالا می‌توانید با دستور "/newmsg" به همراه متن پیام خود، پیامی ناشناس بفرستید.
    
    برای مثال:
    
 
    /newmsg این یک پیام ناشناس است!
    پیام شما به صورت ناشناس به دیگران ارسال می‌شود.
    
    🔐 توجه:
    استفاده از این ربات باید با رعایت قوانین و شرایط سرویس پلتفرم مورد استفاده صورت گیرد. همچنین، پیام‌های ناشناس باید احترام‌آمیز و بدون محتوای خلاف قوانین باشند.
    
    🚫 اطلاعات:
    برای دریافت لینک از دکمه زیر استفاده کن
    
    ❓ سوالات:
    در صورت بروز هرگونه مشکل یا سوال، با مدیریت تماس بگیرید.
    
    ممنون از استفاده شما از ربات ارسال پیام ناشناس! 👋
    
    `)
})