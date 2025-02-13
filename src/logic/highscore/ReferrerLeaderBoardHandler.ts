import { DFZDiscordClient } from "../discord/DFZDiscordClient";
import {
  Collection,
  Message,
  MessageEmbed,
  NewsChannel,
  TextChannel,
} from "discord.js";
import providerFactory from "./factories/HighscoreProviderFactory";
import { ChannelManager } from "../discord/ChannelManager";
import { ReferrerSerializer } from "../serializers/referrerSerializer";
import { EmbeddingCreator } from "../discord/EmbeddingCreator";
import { HighscoreUserTypes } from "./enums/HighscoreUserTypes";
import { ReferrerHighscoreProvider } from "./ReferrerHighscoreProvider";
import { DFZDataBaseClient } from "../database/DFZDataBaseClient";
import { EnvironmentVariableManager } from "../misc/EnvironmentVariableManager";

export class ReferrerLeaderBoardHandler {
  public static async postReferralLeaderboard(client: DFZDiscordClient) {
    try {
      await ReferrerLeaderBoardHandler.tryPostLeaderBoard(client);
    } catch (e) {
      console.log(e);
    }
  }

  private static async tryPostLeaderBoard(client: DFZDiscordClient) {
    const embed =
      await ReferrerLeaderBoardHandler.getReferrerLeaderBoardEmbedding(
        client.dbClient
      );
    const channel = await ChannelManager.getChannel(
      client,
      EnvironmentVariableManager.ensureString(
        process.env.BOT_LEADERBOARD_CHANNEL
      )
    );
    await ReferrerLeaderBoardHandler.postUpdatedEmbedding(channel, embed);
  }

  private static async getReferrerLeaderBoardEmbedding(
    dbClient: DFZDataBaseClient
  ) {
    const highscoreTable = await ReferrerLeaderBoardHandler.getHighscoreTable(
      dbClient
    );

    return EmbeddingCreator.create(
      "Referrer High score",
      "Hall of Fame of DFZ referrerrs!",
      "",
      highscoreTable
    );
  }

  private static async getHighscoreTable(dbClient: DFZDataBaseClient) {
    const serializer = new ReferrerSerializer(dbClient);
    const referrers = await serializer.getSorted();

    const highscoreProvider = providerFactory(
      HighscoreUserTypes.referrers,
      dbClient
    ) as ReferrerHighscoreProvider;
    return highscoreProvider.generateHighscore(referrers);
  }

  private static async postUpdatedEmbedding(
    channel: TextChannel | NewsChannel,
    embed: MessageEmbed
  ) {
    const message = await channel.messages.fetch(messageId);
    const messageOptions = { embeds: [embed] };
    if (!message) {
      const msg = await channel.send(messageOptions);
      messageId = msg.id;
    } else {
      await message.edit(messageOptions);
    }
  }

  public static async findLeaderBoardMessage(client: DFZDiscordClient) {
    try {
      await ReferrerLeaderBoardHandler.tryFindLeaderBoardMessage(client);
    } catch (e) {
      console.log(e);
    }
  }

  private static async tryFindLeaderBoardMessage(client: DFZDiscordClient) {
    const channel = await ChannelManager.getChannel(
      client,
      EnvironmentVariableManager.ensureString(
        process.env.BOT_LEADERBOARD_CHANNEL
      )
    );
    const messages = await channel.messages.fetch();
    ReferrerLeaderBoardHandler.findAndUpdateLeaderBoardMessage(
      messages,
      client
    );
  }

  private static findAndUpdateLeaderBoardMessage(
    messages: Collection<string, Message>,
    client: DFZDiscordClient
  ) {
    const message: Message | undefined = messages.find((msg) => {
      return msg.author === client.user;
    });

    if (message) messageId = message.id;
  }
}

var messageId: string = "";
