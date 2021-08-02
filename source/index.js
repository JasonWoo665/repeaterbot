const Discord = require('discord.js')
const client = new Discord.Client()
require('dotenv').config();
const command = require('./command')
const memberCount = require('./member-count')
const eval = require('./eval')

const prefix = process.env.PREFIX

let commandList = ['join','j','come','cc','clearchannel','CC','Clearchannel','status','cri','cry']
let spamList = ['>NP','!NP','>np','!np','!Q','>Q','!q','>q','>FS','!FS','>fs','!fs','>P','!P','!p','>p','?CC','?cc','?clearchannel','?Clearchannel','**Playing**','<:youtube:841353157489852487>','<:x2:814990341052432435>']

commandList.forEach( (value, key) =>{
    commandList[key] = '?'+value;
})


client.on('ready', async ()=>{
    console.log('The client is ready!')

    // memberCount(client)
    eval(client)

    command(client, ['join','j','come'], message =>{
        if (message.member.voice.channel) {
            const connection = message.member.voice.channel.join();
            console.log('Connected to '+message.member.voice.channel.name+'!');
        }
    });

    // command(client, ['ping','pong','test'], (message)=>{
    //     message.channel.send('Pong!')
    // })

    // command(client, ['servers','server'], (message)=>{
    //     client.guilds.cache.forEach((guild)=>{
    //         message.channel.send(guild.memberCount)
    //     })
    // })

    command(client, ['cc','clearchannel','CC','Clearchannel'], (message)=>{
        filterlist = spamList.concat(commandList)
        // console.log(filterlist)
        if (message.member.hasPermission('ADMINISTRATOR')){
            message.channel.messages.fetch().then((results) =>{
                filterlist.forEach(startWord =>{
                    try{
                        message.channel.bulkDelete(results.filter(msg => msg.content.startsWith(startWord)),true)
                    }
                    catch(e){
                        console.log('cmaa')
                    }
                })
            })
        }
    })

    command(client, ['status'], message => {
        if (message.member.hasPermission('MANAGE_GUILD') || message.hasPermission('ADMINISTRATOR')) {
            message.channel.send('**You Can Replace This With a Custom Message Or Delete This Line**')
            const content = message.content.replace(`${prefix}status`, ' ')

        client.user.setPresence({
            activity: {
                name:content,
                type:0,
            }
            })
        }else (message.channel.send("**Replace This With Error Message For People Without Perms (Or Delete This Line):**"))
    })

    command(client, ['cri','cry'], async message =>{
        message.delete();
        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            // Create a dispatcher
            let stanleycry = connection.play('./source/stanleycry.mp3');
            // stanleycry.setVolume(0.9);
            stanleycry.on('start', () => {
                console.log('audio.mp3 is now playing!');
            });
            stanleycry.on('finish', () => {
                console.log('audio.mp3 has finished playing!');
            });
            // Always remember to handle errors appropriately!
            stanleycry.on('error', console.error);
    
            // stanleycry.destroy();
        }
    })

})

client.login(process.env.DISCORDJS_BOT_TOKEN)