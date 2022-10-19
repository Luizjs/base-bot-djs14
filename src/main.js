const { Intents, Client, Collection } = require('discord.js');
const guildSchema = require('./botDatabase/dbSchemas/Guild.js');
const userSchema = require('./botDatabase/dbSchemas/User.js');
const dotenv = require('dotenv');
const fs = require('fs');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES
  ],
  partials: ['CHANNEL','MESSAGE']
});

client.db = new Collection();
client.commands = new Collection();
client.aliases = new Collection();
client.slash = new Collection();
client.categories = fs.readdirSync('./src/normalCommands');

dotenv.config()

client.login(process.env.botToken);

client.once('ready', async () => { client.db.guilds = guildSchema; client.db.users = userSchema;});

const indexDb = require('./botDatabase/index.js');
indexDb.start();

fs.readdir('./src/botEvents/', (err, eventosPath) => {
    eventosPath.forEach((f) => {
        if (!f.endsWith('.js')) return;
        
        const eventoFile = require(`./botEvents/${f}`);
        let eventoNome = f.split('.')[0];
  
        console.log(`🥮 | [Eventos] ${eventoNome} carregado.`);
        client.on(eventoNome, (...args) => {
          eventoFile(client, ...args);
        });
    });
  });

fs.readdirSync('./src/normalCommands/').forEach((cmdsPath) => {
    const botComandos = fs.readdirSync(`./src/normalCommands/${cmdsPath}`).filter((fileJs) => fileJs.endsWith('.js'));
  
    for (let fileCmd of botComandos) {
      let acharCmd = require(`./normalCommands/${cmdsPath}/${fileCmd}`);
  
      if (acharCmd.name) {
        client.commands.set(acharCmd.name, acharCmd);
      }
      if (acharCmd.aliases && Array.isArray(acharCmd.aliases))
        acharCmd.aliases.forEach((x) => client.aliases.set(x, acharCmd.name));
        console.log(`🍁 | [Comandos Normais] ${acharCmd.name} carregado.`)
    }
  });

let slashArray = [];
fs.readdirSync('./src/slashCommands/').forEach((cmdsPath) => {
    const botComandos = fs.readdirSync(`./src/slashCommands/${cmdsPath}`).filter((fileJs) => fileJs.endsWith('.js'));
  
    for (let fileCmd of botComandos) {
      let acharCmd = require(`./slashCommands/${cmdsPath}/${fileCmd}`);
  
      if (acharCmd.name) {
        client.slash.set(acharCmd.name, acharCmd);
        slashArray.push(acharCmd)
        console.log(`💪 | [Comandos Slash] ${acharCmd.name} carregado.`)
      } else {
        console.log((`🚨 | [Erro] Falha ao carregar comando ${acharCmd.name}.`));
        continue;
    }
}
  });

module.exports = client;
module.exports = slashArray;
