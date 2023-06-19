import * as dotenv from 'dotenv';
import Parser from 'rss-parser';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

dotenv.config();

let parser = new Parser();
let feeds = ['https://filiphric.com/rss.xml', 'https://glebbahmutov.com/blog/atom.xml'];
let discordChannelId = '779784441572229120';

interface FeedItem {
  title: string;
  pubDate: string;
  content: string
  link: string
}

let client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('ready', async () => {
  console.log('Bot is ready!');
  let currentTime = new Date();
  let oneHourAgo = new Date(currentTime.getTime() - (60 * 60 * 1000 * 24 * 90));

  // iterate over feeds
  for (let feed of feeds) {
    let rssFeed = await parser.parseURL(feed);
    let items = rssFeed.items as FeedItem[];

    // iterate over feed items
    for (let i = 0; i < items.length; i++) {
      if (new Date(items[i].pubDate) >= oneHourAgo) {
        let channel = client.channels.cache.get(discordChannelId) as TextChannel;
        await channel.send(`\n**${items[i].title}**${items[i].content.length > 300 ? '' : '\n' + items[i].content}\n${items[i].link}`);
      }
    }
  }

  process.exit();
});

client.login(process.env.DISCORD_BOT_TOKEN);