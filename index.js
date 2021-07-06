// const dotenv = require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

const prefix = '.';
const parametric = new Array();
const week = 1000 * 60 * 60 * 24 * 7;
const hoyolabCD = 1000 * 60 * 60 * 12; // mili, sec, min, hour
var channel = null;


// Seta o lembrete para usar o transformador paramétrico
function setParametric(author, time) {
    let aux = checkParametric(author);
    console.log('aux: ', aux);

    if (aux != -1) {
        showParametric(aux);
        return;
    }

    channel.send('You will be remembered in a week.');
    const user = { author: author, time: time }

    const timeoutObj = setTimeout( () => {
        rememberParametric(user);
    }, 30000);

    user.timeoutObj = timeoutObj;
    parametric.push(user);
    // console.log(parametric);
}

//Cancela um alarme já setado
function resetParametric(user) {
    channel.send('Do you want to cancel the reminder? Y/N');
    const filter = message => message.author == user.author;
    console.log('!!!', parametric);
    const collector = channel.createMessageCollector(filter, { time: 15000 });
    collector.on('collect', message => {
        if (message.content.toUpperCase() === 'YES' || message.content.toUpperCase() === 'Y') {
            clearTimeout(user.timeoutObj);
            channel.send('Canceled.');
            let index = checkParametric(user.author);
            parametric.splice(index, 1);
        }
        if (message.content.toUpperCase() === 'NO' || message.content.toUpperCase() === 'N') {
            channel.send('Hm, OK.');
        }
    });
    collector.on('end', collected => console.log(`Collected ${collected.size} items`));
}

// Checa se já existe um lembrete setado para o transformador paramétrico do usuário
function checkParametric(author) {
    return parametric.findIndex( (element) =>  element.author === author)
}

// Se já estiver setado o paramétrico mostra quando estará disponível de novo
function showParametric(index) {
    let user = parametric[index];
    // console.log(user);
    let date = new Date(user.time + week);
    console.log(date, date.getDay(), date.getMonth()+1);
    channel.send(`<@${user.author}> your parametric will be available at ${ date.getUTCDate() +'/'+ (date.getUTCMonth()+1) +' '+ date.getHours() +':'+ date.getMinutes()}`);
    resetParametric(user);
}

// Lembra de usar o transformador paramétrico
function rememberParametric(user) {
    channel.send(`<@${user.author}> remember to use parametric.`);
    setImmediate(() => {
        let aux = checkParametric(user.author);
        parametric.splice(aux, 1);
    });
}

function alarm() {
    if(channel != null) {
        channel.send('Have you logged today in Hoyolab?');
    }
}

function callAlarm() {
    setInterval(alarm, hoyolabCD);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'Why miHoYo?',
            type: 'LISTENING'
        }
    });
});

client.on('message', async message => {
    
    if (message.mentions.has(client.user.id) && channel == null) {
        channel = message.channel;
        message.channel.send("Hello there!");
        callAlarm();
        return;
    }

    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }
    
    if (channel == null) {
        message.channel.send('Define a channel for the bot by mentioning it in the specified channel.');
        return;
    }

    if (message.channel != channel) {
        return;
    }
    
    if (message.content.startsWith(prefix + 'parametric')) {
        setParametric(message.author.id, Date.now());
        return;
    }
    
});

client.login(process.env.BOT_LOGIN);