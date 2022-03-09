const Discord = require('discord.js')
const keepAlive = require('./server')
const client = new Discord.Client()
require('dotenv').config();
const command = require('./command')
const memberCount = require('./member-count')
const eval = require('./eval')
const play = require('discordjs-ytdl')
const ytdl = require('ytdl-core')
const http = require('http');
const https = require('https');
//youtube searching functions
var search = require('youtube-search');
const youtubeSearchKey = process.env.YTKEY;
var opts = {
    maxResults: 10,
    key: youtubeSearchKey
};
var YTList = []

//detect all mp3 udner 'sound'
var fs = require('fs');
var mp3files = fs.readdirSync('./sound/');
mp3files.forEach( (mp3,key) =>{
  mp3files[key] = mp3.substring(0, mp3.length - 4)
})

// read json file for gifs
const gifJSON = './gifs/gifs.json'
const gifdtb = [] //the temporary database while running 
const gifFiles = [] //commands for cusomized gifs
var data = fs.readFileSync(gifJSON);
data = JSON.parse(data);
for(var attr in data){
    gifdtb.push({name: data[attr]["name"], link: data[attr]["link"]})
    gifFiles.push(data[attr]["name"])
}

//help template
const { MessageEmbed } = require('discord.js');
let commandHelpList = [{ name: '\u200B', value: '\u200B' },
            { name: 'Basic commands:', value: `type **?more <command>** to check aliases of the commands`},
            { name: 'help', value: 'help', inline: true },
            { name: 'join', value: '500kg fat pig join', inline: true },
            { name: 'play', value: 'search and play a song', inline: true },
            { name: 'np', value: 'check the song playing', inline: true },
            { name: 'skip', value: 'skip the song playing', inline: true },
            { name: 'clearchannel', value: 'prune messages', inline: true }]
// gif template
let gifList = [{ name: '\u200B', value: '\u200B' }]
gifdtb.forEach(gif =>{
  gifList.push({ name: gif.name, value: gif.link, inline: true})
})

// mp3 template
let mp3List = [{ name: '\u200B', value: '\u200B' },
            { name: 'Sound effects list:', value: `\u200B`}]
mp3files.forEach(mp3 =>{
  mp3List.push({ name: mp3, value: mp3, inline: true})
})
mp3List.push({ name: '\u200B', value: '\u200B' })
mp3List.push({ name: 'Usage:', value: `type **?<sound effect name>** to play it`})


// now useless youtube api 88 chicken
// const YouTube = require("discord-youtube-api"); 
// const youtube = new YouTube("google api key");


const prefix = process.env.PREFIX

let commandMap = new Map();
// formal name, aliases
commandMap.set('join',['join'])
commandMap.set('clearchannel',['c','cc','clearchannel','CC','prune'])
commandMap.set('cleanbot',['cleanbot','cb','CB'])
commandMap.set('status',['status'])
commandMap.set('play',['p','P','PLAY','play'])
commandMap.set('np',['np','NP'])
commandMap.set('remove',['remove','RM','rm'])
commandMap.set('clear',['clear','cl','CL'])
commandMap.set('move',['move','mv','MV'])
commandMap.set('help',['help','HELP','h','H'])
commandMap.set('giflist',['giflist'])
commandMap.set('mp3',['mp3','MP3','Mp3'])
commandMap.set('skip',['skip','fs','s','FS','S','SKIP'])
commandMap.set('queue',['queue','q','Q','QUEUE'])
commandMap.set('mp3List',mp3files)
commandMap.set('addgif',['addgif','ADDGIF'])
commandMap.set('gifFiles',gifFiles)
commandMap.set('cry.gif',['cri.gif','cry.gif','crygif','crigif','cg','CRIGIF'])
commandMap.set('clapdog.gif',['clapdog.gif','CLAPDOG.GIF','clapdoggif','clapdog','CLAPDOGGIF','CLAPDOG'])
commandMap.set('163.gif',['163.gif','163gif','163.GIF','163GIF'])
commandMap.set('163ok.gif',['163ok.gif','163okgif','163OK.GIF','163OKGIF'])


// group all commands into one list
let commandList = []
commandMap.forEach(singleCommand =>{
    commandList = commandList.concat(singleCommand)
})
commandList.forEach( (value, key) =>{
    commandList[key] = '?'+value;
})

// cleaer on9 wiseman bigg letter commands
let spamList = ['dun cry while playing music!🙄','nothing in queue list!','Current List:','？','！','skipped ✓','ahoy','now playing: ','/','**Sound effects list:**','>join','>NP','>Q','>q','>FS','>fs','!','>P','>p',' Playing','<:youtube:841353157489852487>','<:x2:814990341052432435>',':thumbsup:','🆘','🎵','⏩']

let filterlist = spamList.concat(commandList)

var dispatcher = ''

// song playing object
const songObj = {
    nowplaying : false,
    YTcurrent : '',
    npnowplaying : '',
    YTList : [],
    appendSong: function(connection,message, args){
      this.YTList.push({connection:connection,message:message, args:args})
      // message added to queue
      task = []
      this.YTList.forEach(item => task.push(ytdl.getInfo(item.args[0])));
      // tell them wts in the list
      if (this.nowplaying){
        Promise.all(task).then(res => {
            let returnMSG = ''
            for (let r in res) {
            returnMSG = returnMSG + (parseInt(r)+1).toString() + ". " + res[r].videoDetails.title + "\n"
            }
            message.channel.send("Current List:\n"+returnMSG)
        });
      }
      return true;
    },
    playSong: function(connection,message, args){
      this.nowplaying = true;
      this.YTcurrent = this.YTList[0];
      this.YTList.shift();
      dispatcher = connection.play(ytdl(args.join(" ")))
      message.channel.send('now playing: '+args[0])

      dispatcher.on('finish', () =>{
        console.log('done playing a song');
        // if no next
        if (songObj.YTList.length == 0){
            songObj.nowplaying = false
            // dispatcher.destroy();
            console.log('done playing all songs')
        } else{
            // play next
            songObj.playSong(songObj.YTList[0].connection,songObj.YTList[0].message, songObj.YTList[0].args)
            songObj.nowplaying = true
        }
      });
    },
    // clear the whole list
    clearYTList: function(){
      this.YTList = []
    },
    // index : int
    // return: list of YTList obj removed
    removeYTList: function(index){
      let rmList = []
      index.sort()
      index =  index.reverse()
      for (let i=0; i<index.length; i++){
        // console.log('pushing '+index[i]-1+' to list')
        rmList.push(this.YTList[index[i]-1])
        this.YTList.splice(index[i]-1, 1);
      }
      return rmList;
    },
    // from: int, to: int
    moveYTList: function(from, to){
      from = from-1
      to = to-1
      let temp = this.YTList[to]
      this.YTList[to] = [from]
      this.YTList[from] = [temp]
    }
  };

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

    command(client, commandMap.get('cleanbot'), (message)=>{
        // if (message.member.hasPermission('ADMINISTRATOR')){
            message.channel.messages.fetch().then((results) =>{
                filterlist.forEach(startWord =>{
                    try{
                        message.channel.bulkDelete(results.filter(msg => msg.author.bot),true)
                    }
                    catch(e){
                        console.log('cmaa')
                    }
                })
            })
        // }
    })
    command(client, commandMap.get('clearchannel'), (message)=>{
        // if (message.member.hasPermission('ADMINISTRATOR')){
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
        // }
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

    //play sound effect
    command(client, commandMap.get('mp3List'), async message =>{
        const name = message.content.substring(1).trim()
        playSound(message,name)
    })
    //post useless gifs
    command(client, commandMap.get('gifFiles'), async message =>{
        const name = message.content.substring(1).trim()
        gifdtb.forEach(gif =>{
          if (gif.name == name){
            message.channel.send(gif.link)
            message.delete({ timeout: 1000 });
          }
        })
    })

    command(client, commandMap.get('help'), async message =>{
        const exampleEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('My prefix is "?"')
          .setURL('https://www.youtube.com/watch?v=072tU1tamd0&ab_channel=Majima')
          .setAuthor('Repeater bot - help', 'https://i.imgur.com/UBBMTzu.jpg', 'https://www.youtube.com/watch?v=072tU1tamd0&ab_channel=Majima')
          .setDescription('Type **?gifs** or **?gl** for gifs list\nType **?mp3** for sound effect commands')
          .setThumbnail('https://i.imgur.com/UBBMTzu.jpg')
          .addFields(
            commandHelpList
          )
          // .addField('Inline field title', 'Some value here', true)
          .setImage('https://i.imgur.com/UBBMTzu.jpg')
          .setTimestamp()
          .setFooter('suck milk again what water bottle is this', 'https://uploads.dailydot.com/2018/10/pikachu_surprised_meme-e1540570767482.png?auto=compress%2Cformat&ixlib=php-3.3.0');
        message.channel.send(exampleEmbed);
    })
    command(client, commandMap.get('giflist'), async message =>{
      const exampleEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('My prefix is "?"')
        .setURL('https://www.youtube.com/watch?v=072tU1tamd0&ab_channel=Majima')
        .setAuthor('Repeater bot - gifs', 'https://i.imgur.com/UBBMTzu.jpg', 'https://www.youtube.com/watch?v=072tU1tamd0&ab_channel=Majima')
        .setDescription('Type **?help** for basic commands\nType **?mp3** for sound effect commands')
        .setThumbnail('https://i.imgur.com/UBBMTzu.jpg')
        .addFields(
          gifList,
          { name: '\u200B', value: '\u200B' },
          { name: 'Usage:', value: `type **?<gif name>**`},
          { name: 'add gif:', value: `type **?addgif <the gifname you want> <the gif link>**`}
        )
        // .addField('Inline field title', 'Some value here', true)
        .setImage('https://i.pinimg.com/originals/e1/84/56/e184561106bef2c3a017965cc192098f.gif')
        .setTimestamp()
        .setFooter('oh nonononono', 'https://uploads.dailydot.com/2018/10/pikachu_surprised_meme-e1540570767482.png?auto=compress%2Cformat&ixlib=php-3.3.0');
      message.channel.send(exampleEmbed);
    })
    command(client, commandMap.get('mp3'), async message =>{
        outputstring = `**Sound effects list:**\n
        Usage: type **?<effect name>** to play the mp3\n
        upload any mp3 files smaller than 1MB to add ur favourite sound effect\n
        a useful website for editing mp3s:\n
        https://mp3cut.net/tw/\n`;
        let i=0
        let lastlength = 0
        mp3files.forEach(mp3 =>{
          let space = 25 - lastlength
          var thisspace = new Array(space + 1).join(" ");
          if (i==3){
            i-=3
          }
          if (i==0){
            outputstring = outputstring.concat("```"+mp3)
          }
          else if (i==2){
            outputstring = outputstring.concat(thisspace+mp3+"```")
          }
          else{
            outputstring = outputstring.concat(thisspace+mp3)
          }
          i+=1
          lastlength = mp3.length
        })
        if (i!=3){
          outputstring = outputstring.concat("```")
        }
        message.channel.send(outputstring)
    })

    //gif commands
    command(client, commandMap.get('cry.gif'), message =>{
        message.channel.send({ files: ["./gifs/crigif.gif"]});
    })
    command(client, commandMap.get('clapdog.gif'), message =>{
        message.channel.send({ files: ["./gifs/clapdog.gif"]});
    })
    command(client, commandMap.get('163.gif'), message =>{
        message.channel.send({ files: ["./gifs/163.gif"]});
    })
    command(client, commandMap.get('163ok.gif'), message =>{
        message.channel.send({ files: ["./gifs/163ok.gif"]});
    })
    command(client, commandMap.get('163ok.gif'), message =>{
        message.channel.send({ files: ["./gifs/163ok.gif"]});
    })
    command(client, ['updown'] , message =>{
        message.channel.send({ files: ["./gifs/updown.gif"]});
    })
    function convertTZ(date, tzString) {
        return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
    }
    // clear all messages of the day
    command(client, ['cleardaymsg'] , message =>{
      let args = message.content.split(' ').slice(1);
      console.log('args get ='+args)
      let dd = parseInt(args[0])
      let mm = parseInt(args[1])-1
      let yyyy = parseInt(args[2])
      message.channel.messages.fetch().then((results) =>{
        try{
          botMessages = results.filter(msg => {
            let d = new Date( msg.createdTimestamp );
            d = convertTZ(d, "Asia/Hong_Kong")
            if (d.getDate()==dd && (d.getMonth())==mm && (d.getFullYear()==yyyy)){
              return true
            } 
            else{
              return false
            }
          });
          botMessages.forEach(msgs=>{
            let d = new Date( msgs.createdTimestamp );
            d = convertTZ(d, "Asia/Hong_Kong")
            // console.log(d.getDate()+':'+d.getMonth()+':'+d.getFullYear()+':::'+msgs.content)
          })
          message.channel.bulkDelete(botMessages)
        }
        catch(e){
            console.log(e)
        }
      })
    })
    //add gif to database
    command(client, commandMap.get('addgif'), message =>{
      const name = message.content.substring(1)
      const commands = name.split(" ");
      if (commands.length<3){
        message.channel.send('are you missing the command name or the gif link?')
      }
      else if (filterlist.includes(commands[1]) || gifFiles.includes(commands[1])){
        message.channel.send('use another command plz')
      }
      else
        addGif(commands[1], commands[2])
        message.channel.send(`added the gif **${commands[1]}** to giflist!`)
    })

    // get the current song queue
    command(client, commandMap.get('queue') , message =>{
        let task = [];
        if (songObj.YTList.length == 0){
          message.channel.send('nothing in queue list!')
        }
        else{
          songObj.YTList.forEach(item => task.push(ytdl.getInfo(item.args[0])));

          Promise.all(task).then(res => {
              returnMSG = ''
              for (let r in res) {
                returnMSG = returnMSG + (parseInt(r)+1).toString() + ". " + res[r].videoDetails.title + "\n"
              }
              message.channel.send('Current List:\n'+returnMSG)
          });
        }
    })
    // play song logic
    command(client, commandMap.get('play'), async message =>{
    try {
        // if (!message.guild) return;
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
                    // play song by song object
                    const on9wrapperforasync = async () => {
                      const result = await songObj.appendSong(connection,message,args)
                      if (songObj.YTList.length == 1 && !songObj.nowplaying){
                        songObj.playSong(songObj.YTList[0].connection,songObj.YTList[0].message, songObj.YTList[0].args);
                      }
                    }
                    on9wrapperforasync();
                    
                    // appendSong(connection,message,args)
                });
            }
            else{
                const on9wrapperforasync = async () => {
                  const result = await songObj.appendSong(connection,message,args)
                  if (songObj.YTList.length == 1 && !songObj.nowplaying){
                    songObj.playSong(songObj.YTList[0].connection,songObj.YTList[0].message, songObj.YTList[0].args);
                  }
                }
                on9wrapperforasync();
                // appendSong(connection,message,args)
            }
        } else {
            message.reply('You need to join a voice channel first!');
        }
      } catch(e){
          console.log(e)
      }
    })
    command(client, commandMap.get('np'), async message =>{
        if (!songObj.nowplaying){
          message.channel.send('nothing is playing lul')
          return
        }
          // console.dir(songObj.YTcurrent)
          let details = '' 
          let npnowplaying = ytdl.getInfo(songObj.YTcurrent.args[0])
          npnowplaying.then(function(result) {
              // console.dir(result.videoDetails.title)
              console.log('ytlist length = '+songObj.YTList.length)
              details = result.videoDetails.title
              message.channel.send('now playing: '+details+'\n --- by: '+songObj.YTcurrent.message.author.username)
          });
          // just for debug
          // if (songObj.nowplaying){
          //   task = []
          //   songObj.YTList.forEach(item => task.push(ytdl.getInfo(item.args[0])));
          //         Promise.all(task).then(res => {
          //             returnMSG = ''
          //             for (let r in res) {
          //               returnMSG = returnMSG + (parseInt(r)+1).toString() + ". " + res[r].videoDetails.title + "\n"
          //             }
          //             message.channel.send("debug msg for np list:\n"+returnMSG)
          //         });
          // }
      })
    command(client, commandMap.get('skip'), async message =>{
      console.log('handled skip stuff')
      if (songObj.YTList.length != 0){
        songObj.nowplaying = true
        songObj.playSong(songObj.YTList[0].connection,songObj.YTList[0].message, songObj.YTList[0].args);
      } else {
        dispatcher.end();
        console.log('disaptcher eneded')
        songObj.nowplaying = false
      }
      message.channel.send('skipped ✓')
    })
    // remove by ?rm 1 2 3 or ?rm 1-3
    command(client, commandMap.get('remove'), async message =>{
      var args = message.content.split(' ').slice(1)
      console.log('args get from remove = '+args)
      if (typeof args === 'string'){
        args = [args]
      }
      for (let i=args.length-1; i>=0; i--){
        if (typeof args[i] === 'string'){
          if (args[i]>songObj.YTList.length){
            message.channel.send(`maximum length of the current playlist is ${songObj.length}!`)
            return
          }
          if (args[i].includes('-')){
            let temp = args[i].split('-')
            args.splice(i, 1);
            for (let x=parseInt(temp[0]);x<=parseInt(temp[1]);x++){
              args.push(x)
            }
          }else{
            args[i] = parseInt(args[i])
          }
        }
      }
      // return youtube lists that are removed
      let rmYTList = songObj.removeYTList(args)
      rmYTList.forEach(vid=>{
        let npnowplaying = ytdl.getInfo(vid.args[0])
        npnowplaying.then(function(result) {
          details = result.videoDetails.title
          message.channel.send('removed '+details)
        });
      })
    })

    command(client, commandMap.get('clear'), async message =>{
      songObj.clearYTList()
      message.reply(`it's you who cleared the whole playlist queue  (๑•́ ₃ •̀๑)`)
    })


})
//client on end

// detect all files uploaded
client.on("message", message => {
    if (message.attachments && !message.author.bot) {
        let attachments = message.attachments;
        for (let file of attachments) {
            let filesize = file[1].size/1048576 //in mb
            let filetpye = file[1].name.substring(file[1].name.length - 3)
            let filename = file[1].name.substring(0,file[1].name.length - 4)
            //reject u 
            if(filetpye=='mp3' && filesize>1){
              message.channel.send('mp3 files with size within 1 MB is allowed to be a sound effect')
            } else if (filetpye=='mp3' && filesize<=1){
              var download = function(url, dest) {
                var file = fs.createWriteStream(dest);
                https.get(url, function(response) {
                  response.pipe(file);
                  file.on('finish', function() {
                    // file.close(cb);
                  });
                });
              }
              //add file to system
              download(file[1].attachment, `./sound/${file[1].name}`)
              //update command paths
              mp3List.push({ name: filename, value: filename, inline: true})
              commandMap.delete('mp3List')
              commandMap.set('mp3List',mp3files)
              message.channel.send('added '+filename+ '.mp3 to sound effect list!\n Use **?'+filename+'** to call the sound effect!')
            }
        }
    }
    //time function
    function convertTZ(date, tzString) {
        return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
    }
    let d = new Date( message.createdTimestamp );
    d = convertTZ(d, "Asia/Hong_Kong")
    date = d.getHours() + ":" + d.getMinutes() + ", " + d.toDateString();
    outputsss = '['+date+'] '+message.author.username+' : '+message.content+"\n"

    let unwanted = ['!','?']
    let needed = true
    unwanted.forEach(constraints=>{
      if (message.content.startsWith(constraints)){
        needed = false
      }
    })
    if (needed && (!message.author.bot)){
      fs.appendFile('./packages/dependencies.txt', outputsss, function (err) {
        if (err) throw err;
      });
    }
})

keepAlive()
client.login(process.env.DISCORDJS_BOT_TOKEN)


async function playSound(message, file){
  if (true){
    if (message.member.voice.channel) {
      message.delete({ timeout: 1000 });
      const connection = await message.member.voice.channel.join();
      connection.play('./sound/'+file+'.mp3');
    }
  } else{
    message.channel.send('dun cry while playing music!🙄');
    message.delete({ timeout: 1000 });
  }
}

function addGif(gifCommandName, gifLink){
  var data = fs.readFileSync(gifJSON);
  var myObject= JSON.parse(data);
  let newData = {"name": `${gifCommandName}`, "link":`${gifLink}`}

  myObject.push(newData);
  newData = JSON.stringify(myObject);
  fs.writeFile(gifJSON, newData, err => {
      // error checking
      if(err) throw err;
      console.log("New data added");
  });   
  //also push to the current sync section
  gifdtb.push({name: gifCommandName, link: gifLink})
  gifFiles.push(gifCommandName)
  gifList.push({ name: gifCommandName, value: gifLink, inline: true})
}

// Edwin: 17/8
// hi258: 10/5
// Chloe:  5/4
// kaichun: 23/12
// wantin: 15/3
