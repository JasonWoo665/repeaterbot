module.exports = client =>{
    const channelID = '870636071149510757'
    const updateMembers = guild =>{
        const channel = guild.channels.cache.get(channelID)
        channel.setName(`Members: ${guild.memberCount.toLocaleString()}`)

    }
    client.on('guildMemberAdd', member => updateMembers(member.guild))
    client.on('guildMemberRemove', member => updateMembers(member.guild))

    const guild = client.guilds.cache.get('718373327193767957')
    updateMembers(guild)
}