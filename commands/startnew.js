const Discord = require('discord.js');
let statuses = {
    online: '🟢 온라인',
    stopped: '🔴 정지됨',
    launching: '🟡 프로세스 시작 중',
    errored: '🔴 에러',
    stopping: '🟡 프로세스 정지 중'
}
module.exports = {
    name: 'start',
    aliases: ['새로시작', 'startnew', 'newstart', 'exec', '실행', 'ㄴㅅㅁㄱㅅ', 'ㄷㅌㄷㅊ', 'tlfgod', 'tlwkr'],
    description: '새 프로세스 시작하기',
    usage: 'startnew <프로세스 이름> [메인 파일 경로 또는 시작 명령어]',
    run: async (client, message, args) => {
        if (!client.ops.devs.includes(message.author.id)) return message.channel.send(`${client.user.username} 개발자만 사용할 수 있습니다.`);
        if (!args[1]) return message.channel.send('프로세스 이름을 입력하세요.');
        if (!args[2]) return message.channel.send('메인 파일 경로 또는 시작 명령어를 입력하세요.');
        try {
            require('child_process').execSync(`pm2 start ${args[2]} --cwd ${require('path').parse(args[2]).dir === '' ? '.' : require('path').parse(args[2]).dir}${args[1] ? ` --name ${args[1]}` : ''}${args[3] ? ` -- ${args.slice(3).join(' ')}` : ''}`);
            let lists = JSON.parse(require('child_process').execSync('pm2 jlist').toString());
            const embed = new Discord.MessageEmbed()
                .setTitle('새 프로세스 시작 완료!')
                .setColor('RANDOM')
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp();
            for (let x of lists) {
                embed.addFields([{ name: x.name, value: `상태: ${statuses[x.pm2_env.status]}\nID: ${x.pm_id}\n실행 모드: ${x.pm2_env.exec_mode}\n프로세스 ID(PID): ${x.pid}\n업타임: ${Math.floor((new Date() - x.pm2_env.created_at) / 360000) / 10}시간\n재시작 횟수: ${x.pm2_env.restart_time}회\nCPU 사용량: ${x.monit.cpu}%\nRAM 사용량: ${x.monit.memory / 1048576|0}MB`, inline: true }]);
            }
            message.channel.send(embed);
        } catch (e) {
            message.channel.send(`새 프로세스를 시작하는 중 에러가 발생했습니다.\n\`\`\`${e}\`\`\``);
        }
    }
}