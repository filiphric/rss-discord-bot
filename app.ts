import * as dotenv from 'dotenv';
import Parser from 'rss-parser';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

dotenv.config();

const parser = new Parser();
const blogFeeds = ['https://filiphric.com/rss.xml', 'https://glebbahmutov.com/blog/atom.xml'];
const videoFeeds = ['https://rss.app/feeds/F0c4yLQOAgohOHIN.xml', 'https://rss.app/feeds/e91NpH7pJ6cLyolA.xml'];
const blogChannelId = '779784441572229120';
const videoChannelId = '826430677494661140';

interface FeedItem {
  title: string;
  pubDate: string;
  content: string;
  link: string;
}

// We only need Guilds intent since we're just sending messages to a channel
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds
  ]
});

async function processFeeds(feeds: string[], channelId: string, type: 'blog' | 'video', cutoffDate: Date) {
  const channel = client.channels.cache.get(channelId) as TextChannel;
  if (!channel) {
    throw new Error(`Could not find Discord channel for ${type} feeds`);
  }

  for (const feed of feeds) {
    try {
      const rssFeed = await parser.parseURL(feed);
      const items = rssFeed.items as FeedItem[];

      for (const item of items) {
        if (new Date(item.pubDate) >= cutoffDate) {
          // Format message differently for videos vs blogs
          const message = type === 'video' 
            ? `🎥 **New Video**\n${item.title}\n${item.link}`
            : `📝 **New Blog Post**\n**${item.title}**${
                item.content.length > 300 ? '' : '\n' + item.content
              }\n${item.link}`;
          
          await channel.send(message);
        }
      }
    } catch (error) {
      console.error(`Error processing ${type} feed ${feed}:`, error);
    }
  }
}

async function checkFeeds() {
  const currentTime = new Date();
  // Since we're running daily now, we check for posts in the last 24 hours
  const oneDayAgo = new Date(currentTime.getTime() - (24 * 60 * 60 * 1000));

  try {
    // Process blog feeds
    await processFeeds(blogFeeds, blogChannelId, 'blog', oneDayAgo);
    
    // Process video feeds
    await processFeeds(videoFeeds, videoChannelId, 'video', oneDayAgo);
    
  } catch (error) {
    console.error('Error in checkFeeds:', error);
  } finally {
    // Exit after processing all feeds
    process.exit();
  }
}

client.once('ready', () => {
  console.log('Bot is ready!');
  checkFeeds().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
});

// Error handling for client
client.on('error', error => {
  console.error('Discord client error:', error);
});

// Handle token
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('No Discord bot token found in environment variables');
  process.exit(1);
}

client.login(token).catch(error => {
  console.error('Failed to login:', error);
  process.exit(1);
});