import express from "express";
import { Express } from "express-serve-static-core";

import http from "http";
import https from "https";
import { CoachSerializer } from "../src/logic/serializers/coachSerializer";
import { ReferrerSerializer } from "../src/logic/serializers/referrerSerializer";
import { Coach } from "../src/logic/serializables/coach";
import { Referrer } from "../src/logic/serializables/referrer";
import { guildId } from "../src/misc/constants";
import { tryGetSSLCredentials } from "./ssl";
import { setupMiddleWares } from "./middlewares";
import { registerEndpoints } from "./endPoints";
import { Guild } from "discord.js";
import { DFZDiscordClient } from "../src/logic/discord/DFZDiscordClient";

export default class Website {
  app: Express;
  private client: DFZDiscordClient;

  private httpServer: http.Server | undefined;
  private httpsServer: https.Server | undefined;

  coachList: Coach[] = [];
  referrerList: Referrer[] = [];

  useHttps: boolean = false;
  private httpsCredentials: {
    key: string;
    cert: string;
    ca: string;
  } = {
    key: "",
    cert: "",
    ca: "",
  };

  constructor(client: DFZDiscordClient) {
    this.client = client;
    this.setupHallOfFame();

    this.app = express();
    setupMiddleWares(this.app);
    registerEndpoints(this);

    this.trySetupHttps();
    this.setupHttp();
  }

  private trySetupHttps() {
    try {
      this.setupHttps();
    } catch (error) {
      console.log(`Did not set https: ${error}`);
    }
  }

  private setupHttps() {
    this.httpsCredentials = tryGetSSLCredentials();
    this.useHttps = true;

    this.httpsServer = https.createServer(this.httpsCredentials, this.app);
    const port = 444;
    this.httpsServer.listen(port, () => {
      console.log(`HTTPS Server running on port ${port}`);
    });
  }

  private setupHttp() {
    this.httpServer = http.createServer(this.app);
    const port = 81;
    this.httpServer.listen(port, () => {
      console.log(`HTTP Server running on port ${port}`);
    });
  }

  private async setupHallOfFame() {
    await this.setupReferrerHallOfFame();
    await this.setupCoachHallOfFame();
  }

  private async setupReferrerHallOfFame() {
    await this.updateReferrerList();
    setInterval(this.updateReferrerList.bind(this), twoHours);
  }

  private async updateReferrerList() {
    const serializer = new ReferrerSerializer(this.client.dbClient);
    this.referrerList = await serializer.getSorted();
  }

  private async setupCoachHallOfFame() {
    await this.tryGetCoachList();
    setInterval(this.tryGetCoachList.bind(this), twoHours);
  }

  private async tryGetCoachList() {
    try {
      this.getCoachList();
    } catch (e) {
      console.log(`Failed updating coaches\nReason:\n${e}`);
    }
  }

  private async getCoachList() {
    const serializer = new CoachSerializer(this.client.dbClient);
    const nativeCoachList = await serializer.getSorted();

    this.coachList = await this.addCoachDisplayNames(nativeCoachList);
  }

  private async addCoachDisplayNames(coaches: Coach[]) {
    var guild = await this.client.guilds.fetch(guildId);

    for (const coach of coaches) {
      await this.setGuildDisplayName(coach, guild);
    }

    return coaches;
  }

  private async setGuildDisplayName(someObject: any, guild: Guild) {
    try {
      var member = await guild.members.fetch(someObject.userId);
      someObject.displayName = member.displayName;
    } catch {
      someObject.displayName = "Unknown";
    }
  }
}

const twoHours = 2 * 60 * 60 * 1000;
