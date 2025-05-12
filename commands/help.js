const Discord = require('discord.js');
module.exports = {
    name: 'help',
    aliases: ['도움', '도움말', 'ㅗ디ㅔ', 'ehdna', 'ehdnaakf'],
    description: '봇의 도움말 확인하기',
    usage: 'help [명령어 이름]',
    run: async (client, message, args) => {
        let isAzure = require('child_process').execSync('hostname').toString() == `${process.env.AZURE_HOSTNAME}\n`;
        if (args[1]) {
            let cmd = client.commands.get(args[1]);
            if (!cmd) {
                message.channel.send(`해당 명령어가 없어요. \`${isAzure ? process.env.PREFIX_AZURE : process.env.PREFIX_LOCAL}help\`를 입력해 모든 명령어를 확인하세요.`);
            } else {
                const embed = new Discord.EmbedBuilder()
                    .setTitle(cmd.name)
                    .setColor('RANDOM')
                    .addFields([
                        { name: 'Aliases', value: cmd.aliases.map(x => `\`${x}\``).join(', ') },
                        { name: 'Description', value: cmd.description },
                        { name: 'Usage(`<>` 안은 필수, `[]` 안은 선택)', value: `${isAzure ? process.env.PREFIX_AZURE : process.env.PREFIX_LOCAL}${cmd.usage}` }
                    ])
                    .setFooter(message.author.tag, message.author.displayAvatarURL())
                    .setTimestamp();
                message.channel.send({
                    embed: embed
                });
            }
        } else {
            const embed = new Discord.MessageEmbed()
                .setTitle(`${client.user.username} 도움말`)
                .setColor('RANDOM')
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp()
                .setThumbnail(client.user.displayAvatarURL())
                .addFields([{ name: '명령어 목록', value: client.commands.map(x => `\`${x.name}\``).join(', ') }])
                .setDescription(`자세한 정보는 ${isAzure ? process.env.PREFIX_AZURE : process.env.PREFIX_LOCAL}help <명령어 이름>을 입력하세요.`)
            message.channel.send({
                embed: embed
            });
        }
    }
}