// ====================
// SECTION | IMPORTS
// ====================
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { loveeye } from '@assets/json/reaction-gifs.json';
import _ from 'lodash';
// ====================!SECTION

// ====================
// SECTION | COMMAND
// ====================
module.exports = {
  data: new SlashCommandBuilder()
    .setName('loveeye')
    .setDescription('Love :)'),
  async execute(interaction: CommandInteraction) {
    await interaction.reply({
      embeds: [
        new MessageEmbed({
          title: `${
            (interaction.member! as GuildMember).displayName
          } is love struck`,
          image: {
            url: _.sample(loveeye),
          },
        }),
      ],
    });
  },
};
// ====================!SECTION
