import "dotenv/config";
import { ActivityType, GatewayIntentBits, Partials } from "discord.js";
import { CronJob } from "cron";
import CommunityClient from "./modules/CommunityClient";

process.on("unhandledRejection", (err) => {
  console.error(err);
});

const client = new CommunityClient({
  partials: [Partials.GuildMember],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const controlJob = async () => {
  try {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return console.log("Guild not found!");

    const voteRole = guild.roles.cache.get(process.env.VOTE_ROLE_ID);
    if (!voteRole) return console.log("Vote role not found!");

    const primeRole = guild.roles.cache.get(process.env.PRIME_ROLE_ID);
    if (!primeRole) return console.log("Prime role not found!");

    const notificationChannel = guild.channels.cache.find(
      (c) => c.name === "bildirimler"
    );
    if (!notificationChannel || !notificationChannel.isTextBased())
      return console.log("Notification channel not found!");

    if (guild.members.cache.size < guild.memberCount)
      await guild.members.fetch();

    const votes = await client.getVotes();
    const subscriptions = await client.getSubscriptions();

    for (const memberId of votes) {
      const member = guild.members.cache.get(memberId);
      if (!member) continue;
      if (!member.roles.cache.has(voteRole.id)) {
        await member.roles.add(voteRole).catch(() => null);
        await notificationChannel.send(
          `${member.toString()} Çok ama çok teşekkürler! Senin sayende bot'a daha fazla kişi erişecek.\n_ _\`${
            voteRole.name
          }\` rolünü kazandın! Unutma bu rol sadece 12 saat boyunca geçerli, 12 saat sonra tekrardan oy vermen gerekiyor.`
        );
      }
    }

    for (const member of voteRole.members.values()) {
      if (!votes.includes(member.id)) {
        await member.roles.remove(voteRole).catch(() => null);
        await notificationChannel.send(
          `${member.toString()} Görünüşe göre oy verme vaktin gelmiş bu süreç boyunca senden \`${
            voteRole.name
          }\` rolünü geri alıyorum.`
        );
      }
    }

    for (const memberId of subscriptions) {
      const member = guild.members.cache.get(memberId);
      if (!member) continue;
      if (!member.roles.cache.has(primeRole.id)) {
        await member.roles.add(primeRole).catch(() => null);
        await notificationChannel.send(
          `${member.toString()} Çorbada benim de tuzum olsun dedi ve bize destek oldu.\n_ _\`${
            primeRole.name
          }\` rolünü kazandın!`
        );
      }
    }

    for (const member of primeRole.members.values()) {
      if (!subscriptions.includes(member.id)) {
        await member.roles.remove(primeRole).catch(() => null);
        await notificationChannel.send(
          `${member.toString()} Prime aboneliğin sonlandığı için \`${
            primeRole.name
          }\` rolünü geri aldım.`
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

client.once("ready", async () => {
  console.log(`${client.user.tag} is ready!`);
  await client.user.setPresence({
    activities: [
      {
        name: "Naber?",
        type: ActivityType.Playing,
      },
    ],
    status: "online",
  });

  new CronJob("*/15 * * * *", controlJob, null, true);
});

client.on("messageCreate", (message) => {
  if (
    message.mentions.has(client.user) &&
    message.author.id === "269581360316940299" &&
    message.content.includes("kontrol")
  ) {
    message.reply("Kontrol işlemi başlatıldı.");
    controlJob();
  }
});

client.login(process.env.TOKEN);
