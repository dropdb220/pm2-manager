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
    aliases: ['시작', 'start', 'exec', '실행', 'ㄴㅅㅁㄱㅅ', 'ㄷㅌㄷㅊ', 'tlfgod', 'tlwkr'],
    description: '새 프로세스를 시작해요.',
    usage: 'start <메인 파일 경로> [프로세스 이름]',
    run: async (client, message, args) => {
        if (!client.ops.devs.includes(message.author.id)) return message.channel.send(`${client.user.username} 개발자만 사용할 수 있어요.`);
        if (!args[1]) return message.channel.send('메인 파일의 경로를 입력해 주세요.');
        try {
            require('child_process').execSync(`pm2 start ${args[1]} --cwd ${require('path').parse(args[1]).dir}${args[2] ? ` --name ${args[2]}` : ''}`);
            let lists = JSON.parse(require('child_process').execSync('pm2 jlist').toString());
            const embed = new Discord.MessageEmbed()
                .setTitle('새 프로세스를 시작했어요')
                .setColor('RANDOM')
                .setFooter(message.author.id, message.author.displayAvatarURL())
                .setTimestamp();
            for (let x of lists) {
                embed.addField(x.name, `상태: ${statuses[x.pm2_env.status]}\nID: ${x.pm_id}\n네임스페이스: ${x.pm2_env.namespace}\n프로세스 버전: ${x.pm2_env.version}\n실행 모드: ${x.pm2_env.exec_mode}\n프로세스 ID(PID): ${x.pid}\n업타임: ${Math.floor((new Date() - x.pm2_env.created_at) / 360000) / 10}시간\n재시작 횟수: ${x.pm2_env.restart_time}회\nCPU 사용량: ${x.monit.cpu}%\nRAM 사용량: ${x.monit.memory / 1048576|0}MB\n사용자: ${x.pm2_env.username}`, true);
            }
            message.channel.send(embed);
        } catch (e) {
            message.channel.send(`프로세스를 시작하지 못했어요.`);
        }
    }
}