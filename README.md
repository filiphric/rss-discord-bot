# rss-discord-bot
![rss feed bot](https://github.com/filiphric/rss-discord-bot/assets/23213553/326befeb-fb0f-49cd-8770-1b2911ac90e6)

A simple RSS feed bot based on GitHub Actions cron and a simple Node.js script.

This bot will run every hour and check for new blogposts on a list of RSS feeds. For every feed, it will post a message if a blogpost was added to a feed.

It has two parts:
1. `app.ts` that contains the Discord client script and RSS fetch script
2. GitHub Action, which you can customize to run for a set interval. Bear in mind, that `app.ts` is set to 1 hour by default
