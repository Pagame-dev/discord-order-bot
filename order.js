require('dotenv').config();
const express = require("express");
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require("discord.js");

const app = express();
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once("ready", () => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
});

app.post("/order", async (req, res) => {
  // Destructure the fields based on your form keys
  const {
    name,
    discordUserId,
    email,
    serviceType,
    description,
    budget,
    deadline
  } = req.body;

  console.log("Received order:", req.body); // Log incoming data for debugging

  try {
    const guild = await client.guilds.fetch("1274419828349992980"); // Your server ID
    await guild.members.fetch();

    // Find member by ID (better than by tag)
    const member = guild.members.cache.get(discordUserId);
    if (!member) return res.status(404).send("User not found in the server.");

    const channelName = `order-${member.user.username}-${Date.now()}`;

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: "1392433138814156820", // Your Orders category ID
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

    // Compose a detailed message in the order channel
    const orderMessage = `
📩 New order from **${name}** (${member.user.tag})

**Service Required:** ${serviceType}
**Description:** ${description}
${budget ? `**Budget:** ${budget}` : ''}
${deadline ? `**Deadline:** ${deadline}` : ''}
${email ? `**Email:** ${email}` : ''}

A staff member will respond shortly.
`;

    await channel.send(orderMessage.trim());

    res.send("Order received. Channel created.");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

client.login(process.env.BOT_TOKEN);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
