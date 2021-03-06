const Discord = require('discord.js')
const client = new Discord.Client()
require('dotenv').config();
const command = require('./command')
const memberCount = require('./member-count')
const eval = require('./eval')
const play = require('discordjs-ytdl')
const ytdl = require('ytdl-core')
//youtube searching functions
var search = require('youtube-search');
const youtubeSearchKey = process.env.YTKEY;
var opts = {
    maxResults: 10,
    key: youtubeSearchKey
};

// now useless youtube api 88 chicken
// const YouTube = require("discord-youtube-api"); 
// const youtube = new YouTube("google api key");


const prefix = process.env.PREFIX

let commandMap = new Map();
// formal name, aliases
commandMap.set('join',['join','j','come'])
commandMap.set('clearchannel',['c','cc','clearchannel','CC','Clearchannel'])
commandMap.set('status',['status'])
commandMap.set('cry',['cri','cry','CRI','CRY'])
commandMap.set('cry2',['cri2','cry2','CRI2','CRY2'])
commandMap.set('offensemode',['offensemode','offense','OFFENSE','OFFENSEMODE'])
commandMap.set('play',['p','P','PLAY','play'])
commandMap.set('np',['np','NP'])
commandMap.set('help',['help','HELP'])
commandMap.set('skip',['skip','fs','s','FS','S','SKIP'])
commandMap.set('cry.gif',['cri.gif','cry.gif','crygif','crigif','cg','CRIGIF'])

// group all commands into one list
let commandList = []
commandMap.forEach(singleCommand =>{
    commandList = commandList.concat(singleCommand)
})
commandList.forEach( (value, key) =>{
    commandList[key] = '?'+value;
})

// cleaer on9 wiseman bigg letter commands
let spamList = ['？','！','skipped ✓','ahoy','now playing: ','/','Commands available:','!join','>join','>NP','!NP','>np','!np','!Q','>Q','!q','>q','>FS','!FS','>fs','!fs','>P','!P','!p','>p','**Playing**','<:youtube:841353157489852487>','<:x2:814990341052432435>',':thumbsup:','🆘']



client.on('ready', async ()=>{
    console.log('The client is ready!')

    // memberCount(client)
    eval(client)

    command(client, commandMap.get('join'), message =>{
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

    command(client, commandMap.get('clearchannel'), (message)=>{
        
        filterlist = spamList.concat(commandList)
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

    command(client, commandMap.get('status'), message => {
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

    command(client, commandMap.get('cry'), async message =>{
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
    command(client, commandMap.get('offensemode'), async message =>{
        message.delete();
        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            connection.play('./source/stanleyattack.mp3');
        }
    })
    command(client, commandMap.get('cry2'), async message =>{
        message.delete();
        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            connection.play('./source/stanleycri2.mp3');
        }
    })
    command(client, commandMap.get('play'), async message =>{
        try {
            if (!message.guild) return;
        
            // Only try to join the sender's voice channel if they are in one themselves
            if (message.member.voice.channel) {
                const connection = await message.member.voice.channel.join();
                var args = message.content.split(' ').slice(1)
                console.log('args get = ',args)
                if (args.length==0){
                    return;
                }
                // in case it is a keyword instead of youtube link
                else if (!args[0].startsWith('http')){
                    // convert args to string
                    let searchString =''
                    args.forEach(arg => {
                        searchString = searchString + arg + ' '
                    });
                    searchString =searchString.substring(0, searchString.length - 1);
                    search(searchString, opts, function(err, results) {
                        if(err) return console.log(err);
                        var doneloop = false
                        results.forEach(searchResult => {
                            if ((searchResult.kind == 'youtube#video') && (!doneloop)){
                                console.log(searchResult.link);
                                console.log(searchResult.kind);
                                args = [searchResult.link];
                                console.log(args)
                                doneloop = true
                            }
                        });
                        playSong(connection,message,args)
                    });
                }
                else{
                    playSong(connection,message,args)
                }
            } else {
                message.reply('You need to join a voice channel first!');
            }
        } catch(e){
            console.log(e)
        }
    })
    command(client, commandMap.get('help'), async message =>{
        replymessage = 'Commands available:\n';
        let i=1;
        commandMap.forEach((key,element) => {
            replymessage = replymessage + i.toString() + ". " + element + "\n";
            i+=1;
        });
        replymessage = replymessage + "don't ask, just try it"
        message.channel.send(replymessage)     
    })
    command(client, commandMap.get('cry.gif'), message =>{
        message.channel.send({ files: ["./source/crigif.gif"]});
    })
})

client.login(process.env.DISCORDJS_BOT_TOKEN)

function playSong(connection,message, args){
    connection.play(ytdl(args.join(" ")))
    message.channel.send('now playing: '+args[0])
    command(client, commandMap.get('skip'), async message =>{
        connection.disconnect();
        message.channel.send('skipped ✓')
    })
}