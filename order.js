require('dotenv').config();

const express = require("express");
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require("discord.js");
const app = express();
app.use(express.json());

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once("ready", () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
});

app.post("/order", async (req, res) => {
  const { discordTag, serviceType, description } = req.body;

  try {
    const guild = await client.guilds.fetch("1274419828349992980");
    await guild.members.fetch();

    const member = guild.members.cache.find(m => m.user.tag === discordTag);
    if (!member) return res.status(404).send("User not found in the server.");

    const channel = await guild.channels.create({
      name: `order-${member.user.username}`,
      type: ChannelType.GuildText,
      parent: "1392433138814156820", // your Orders category ID
      permissionOverwrites: [
        {
          id: guild.id, // @everyone
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: member.id, // customer
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: "1274424747031007443", // Staff role 1
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: "1292486429242425364", // Staff role 2
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: "1371808211577081958", // Staff role 3
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: "1358018921852174376", // Staff role 4
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
      ],
    });

    await channel.send(`📩 New order from **${discordTag}**

**Service:** ${serviceType}  
**Description:** ${description}

A staff member will respond shortly.`);

    res.send("Order received. Channel created.");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

client.login(process.env.TOKEN);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
