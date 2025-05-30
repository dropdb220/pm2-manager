const Discord = require('discord.js');
let statuses = {
    online: '🟢 온라인',
    stopped: '🔴 정지됨',
    launching: '🟡 프로세스 시작 중',
    errored: '🔴 에러',
    stopping: '🟡 프로세스 정지 중'
}
module.exports = {
    name: 'save',
    aliases: ['sync', 'wjwkd', 'ehdrlghk', '저장', '동기화', 'ㄴㅁㅍㄷ', '뇨ㅜㅊ'],
    description: '프로세스 목록 저장하기',
    usage: 'save',
    run: async (client, message, args) => {
        if (!client.ops.devs.includes(message.author.id)) return message.channel.send(`${client.user.username} 개발자만 사용할 수 있습니다.`);
        try {
            require('child_process').execSync(`pm2 save`);
            let lists = JSON.parse(require('child_process').execSync('pm2 jlist').toString());
            const embed = new Discord.EmbedBuilder()
                .setTitle('프로세스 목록 저장 완료!')
                .setColor([114, 137, 218])
                .setFooter({ text: message.author.tag, icon_url: message.author.displayAvatarURL() })
                .setTimestamp();
            for (let x of lists) {
                embed.addFields([{ name: x.name, value: `상태: ${statuses[x.pm2_env.status]}\nID: ${x.pm_id}\n실행 모드: ${x.pm2_env.exec_mode}\n프로세스 ID(PID): ${x.pid}\n업타임: ${Math.floor((new Date() - x.pm2_env.created_at) / 360000) / 10}시간\n재시작 횟수: ${x.pm2_env.restart_time}회\nCPU 사용량: ${x.monit.cpu}%\nRAM 사용량: ${x.monit.memory / 1048576|0}MB`, inline: true }]);
            }
            message.channel.send({ embeds: [embed] });
        } catch (e) {
            message.channel.send(`프로세스 목록을 저장하는 중 에러가 발생했습니다.\n\`\`\`${e}\`\`\``);
        }
    }
}