import { Client, ClientOptions } from "discord.js";
import { readdirSync } from "fs";
import { lobbyChannels } from "../misc/channelManagement";
import { guildId } from "../misc/constants";
import { LobbyTimeout } from "../misc/interfaces/LobbyTimeout";
import {
  postReferralLeaderboard,
  findLeaderBoardMessage,
} from "../misc/leaderBoardPoster";
import { updateLobbyPosts } from "../misc/lobbyManagement";
import {
  insertScheduledLobbies,
  postSchedules,
  tryRemoveDeprecatedSchedules,
} from "../misc/scheduleManagement";
import { DFZDataBaseClient } from "./database/DFZDataBaseClient";
import { Schedule } from "./serializables/schedule";
import { LobbySerializer } from "./serializers/lobbySerializer";
import { ScheduleSerializer } from "./serializers/scheduleSerializer";

export class DFZDiscordClient extends Client {
  dbClient: DFZDataBaseClient;
  timeouts: LobbyTimeout[] = [];
  constructor(options?: ClientOptions | undefined) {
    super(options);

    this.setupDiscordEventHandlers();
    this.dbClient = new DFZDataBaseClient();
  }

  private setupDiscordEventHandlers() {
    const files = readdirSync("./build/src/events/");
    for (const file of files) {
      const eventHandler = require(`../events/${file}`);
      const eventName = file.split(".")[0];
      this.on(eventName, (...args: any) => eventHandler(this, ...args));
    }
  }

  async onReady() {
    try {
      await this.setupBot();
    } catch (error) {
      console.log(`Error while setting up bot: ${error}`);
    }
  }

  private async setupBot() {
    await this.dbClient.tryCreateDataBaseTables();

    await this.fetchDiscordData();
    await this.setIntervalTasks();
  }

  private async fetchDiscordData() {
    await this.fetchLobbyMessages();
    await this.fetchScheduleMessages();
  }

  private async setIntervalTasks() {
    await this.setLobbyPostUpdateTimer();
    await this.setSchedulePostUpdateTimer();
    await this.setPostLobbyFromScheduleTimer();
    await this.setLeaderBoardPostTimer();
  }

  private async fetchLobbyMessages() {
    var guild = await this.guilds.fetch(guildId);
    for (const channel of lobbyChannels) {
      var gc = guild.channels.cache.find((chan) => chan.id === channel);
      if (gc === undefined || !gc.isText()) {
        continue;
      }

      const serializer = new LobbySerializer(this.dbClient, channel);
      var lobbies = await serializer.get();
      if (lobbies.length === 0 || lobbies === [] || lobbies === undefined)
        continue;

      for (const lobby of lobbies) {
        await gc.messages.fetch(lobby.messageId);
      }
    }
  }

  private async fetchScheduleMessages() {
    const serializer = new ScheduleSerializer(this.dbClient);
    const schedules = await serializer.get();
    if (schedules === undefined || schedules.length === 0) return;

    var fetchedSchedulePosts = this.getUniqueSchedulePosts(schedules);

    var guild = await this.guilds.fetch(guildId);
    for (const post of fetchedSchedulePosts) {
      var gc = guild.channels.cache.find((chan) => chan.id === post.channelId);

      if (gc === undefined || !gc.isText()) {
        continue;
      }
      gc.messages.fetch(post.messageId);
    }
  }

  private getUniqueSchedulePosts(schedules: Array<Schedule>) {
    var fetchedSchedulePosts = [];

    for (const schedule of schedules) {
      const containsPost: boolean =
        fetchedSchedulePosts.find(
          (fetched) =>
            fetched.messageId == schedule.messageId &&
            fetched.channelId === schedule.channelId
        ) !== undefined;
      if (containsPost) continue;

      fetchedSchedulePosts.push({
        messageId: schedule.messageId,
        channelId: schedule.channelId,
      });
    }
    return fetchedSchedulePosts;
  }

  private async setLobbyPostUpdateTimer() {
    const timeUpdater = async () => {
      try {
        var guild = await this.guilds.fetch(guildId);
        if (guild === undefined || guild === null) return;
        await updateLobbyPosts(guild, this.dbClient);
      } catch {
        (err: string) => console.log(err);
      }
    };
    await timeUpdater();
    setInterval(timeUpdater, oncePerMinute); // once per minute
  }

  private async setSchedulePostUpdateTimer() {
    const scheduleRemover = async () => {
      try {
        tryRemoveDeprecatedSchedules(this.dbClient);
      } catch {
        (err: string) => console.log(err);
      }
    };
    await scheduleRemover();
    setInterval(scheduleRemover, oncePerHour); // once per hour

    const scheduleWriter = async () => {
      try {
        postSchedules(this);
      } catch {
        (err: string) => console.log(err);
      }
    };
    await scheduleWriter();
    setInterval(scheduleWriter, oncePerHour); // once per hour
  }

  private async setPostLobbyFromScheduleTimer() {
    const lobbyPoster = async () => {
      try {
        var guild = await this.guilds.fetch(guildId);
        if (guild === undefined || guild === null) return;
        await insertScheduledLobbies(guild.channels, this.dbClient);
      } catch {
        (err: string) => console.log(err);
      }
    };
    await lobbyPoster();
    setInterval(lobbyPoster, oncePerHour); // once per hour
  }

  private async setLeaderBoardPostTimer() {
    const leaderBordPoster = async () => {
      try {
        await postReferralLeaderboard(this);
      } catch {
        (err: string) => console.log(err);
      }
    };
    await findLeaderBoardMessage(this);
    await postReferralLeaderboard(this);
    setInterval(leaderBordPoster, oncePerHour); // once per hour
  }
}

const oncePerMinute = 60000;
const oncePerHour = oncePerMinute * 60;
