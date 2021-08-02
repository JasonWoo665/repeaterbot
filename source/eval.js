// const { GuildMemberManager } = require("discord.js")

const command = require('./command')
const ownerID = '677185421607960589'
const channelID = '718373329345445945'

module.exports = (client) =>{
    command(client, 'eval', (message)=>{
        const { member, channel, content } = message

        if (member.id === ownerID && channel.id === channelID){
            const result = eval(content.replace('?eval',''))
            channel.send(result)
        }

    })
}