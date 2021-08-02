require('dotenv').config();

const { Client } = require('discord.js')
const client = new Client();
const prefix = process.env.PREFIX;

client.on('ready',()=>{
    console.log(`${client.user.username} with tag ${client.user.username} has logged on`);
});

client.on('message', (message)=>{
    if (message.content.bot) return;
    console.log(`[${message.author.tag} | ${message.createdAt}]: ${message.content}`);
    if (message.content.startsWith()){
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(prefix.length)
            .split(/\s+/);
        console.log(CMD_NAME);
    }

    // commands starts
    // message.TextChannel.send(`[${message.author.tag} | ${message.createdAt}]: ${message.content}`);
    
});

// console.log(process.env.PREFIX)
client.login(process.env.DISCORDJS_BOT_TOKEN)