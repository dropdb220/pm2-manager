const Discord = require('discord.js');
const client = new Discord.Client({
    ws: {
        properties: {
            $browser: 'Discord iOS'
        }
    },
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMessageTyping,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMessageReactions
    ]
});
const { 
    DefaultWebSocketManagerOptions: { 
        identifyProperties 
    } 
} = require("@discordjs/ws");
identifyProperties.browser = "Discord Android";
const fs = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Command', 'Load Status');
require('dotenv').config();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.ops = require('./ops.json');
let isAzure = require('child_process').execSync('hostname').toString() == `${process.env.AZURE_HOSTNAME}\n`;
fs.readdir('./commands/', (err, list) => {
    for (let file of list) {
        try {
            let pull = require(`./commands/${file}`);
            if (pull.name && pull.run && pull.aliases) {
                table.addRow(file, '✅');
                for (let alias of pull.aliases) {
                    client.aliases.set(alias, pull.name);
                }
                client.commands.set(pull.name, pull);
            } else {
                table.addRow(file, '❌ -> Error');
                continue;
            }
        } catch (e) { 
            table.addRow(file, `❌ -> ${e}`); 
            continue;
        }
    }
    console.log(table.toString());
});
client.on('ready', () => {
    console.log(`Login ${client.user.username}\n---------------------`);
});
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.channel.type != Discord.ChannelType.GuildText && message.channel.type != Discord.ChannelType.GuildAnnouncement) return;
    if (!message.content.startsWith(isAzure ? process.env.PREFIX_AZURE : process.env.PREFIX_LOCAL)) return;
    message.channel.sendTyping();
    let args = message.content.slice((isAzure ? process.env.PREFIX_AZURE : process.env.PREFIX_LOCAL).length).trim().split(' ');
    if (client.commands.get(args[0])) {
        client.commands.get(args[0]).run(client, message, args);
    } else if (client.aliases.get(args[0])) {
        client.commands.get(client.aliases.get(args[0])).run(client, message, args);
    } else {
        let s = 0;
        let sname = undefined;
        let typed = args[0];
        let valids = [];
        for (let x of client.commands.array()) {
            for (let y of x.aliases) {
                valids.push(y);
            }
            valids.push(x.name);
        }
        for (let curr of valids) {
            let cnt = 0;
            let i = 0;
            for (let curlet of curr.split('')) {
                if (curlet[i] && typed.split('')[i] && curlet[i] == typed.split('')[i]) {
                    cnt++;
                }
                i++;
            }
            if (cnt > s) {
                s = cnt;
                sname = curr;
            }
        }
        if (sname) {
            let msgClone = message;
            let argsClone = args;
            argsClone[0] = `${isAzure ? process.env.PREFIX_AZURE : process.env.PREFIX_LOCAL}${sname}`;
            msgClone.content = message.content.replace(typed, sname);
            let m = await message.channel.send({
                embed: new Discord.EmbedBuilder()
                .setTitle('명령어 자동 수정')
                .setColor([114, 137, 218])
                .setDescription('입력한 명령어는 존재하지 않습니다.\n대신 아래 명령어를 대신 실행할까요?')
                .addFields([{ name: '실행할 명령어',value:  msgClone.content }])
                .setFooter({ text: message.author.tag, icon_url: message.author.displayAvatarURL() })
                .setTimestamp()
            });
            await m.react('✅');
            await m.react('❌');
            const filter = (r, u) => (r.emoji.name == '✅' || r.emoji.name == '❌') && u.id == message.author.id;
            const collector = m.createReactionCollector(filter, {
                max: 1
            });
            collector.on('end', collected => {
                m.delete();
                if (collected.first().emoji.name == '✅') {
                    (client.commands.get(sname) || client.commands.get(client.aliases.get(sname))).run(client, msgClone, argsClone);
                }
            });
        }
    }
});
client.login(process.env.TOKEN);
