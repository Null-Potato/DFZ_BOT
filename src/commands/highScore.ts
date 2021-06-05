import { Message } from "discord.js";
import { Pool } from "mysql2/promise";
import { getArguments, reactNegative } from "../misc/messageHelper";
import { HighscoreUserTypes } from "../types/HighscoreProvider";
import providerFactory from "../types/factories/HighscoreProviderFactory";

/**
 * Returns list of coaches and their lobby count as a private message to the messaging user
 * @param {Message} message triggering message
 * @param {Pool} dbHandle bot database handle
 */
export default async (message: Message, dbHandle: Pool) => {
  try {
    const options = getOptionsFromMessage(message);
    const highScoreProvider = providerFactory(options.userType, dbHandle);
    await highScoreProvider.generateHighscores(message);
  } catch (error) {
    reactNegative(message, "Could not post highscore: " + error);
  }
};

interface HighScoreOptions {
  userType: HighscoreUserTypes;
  lobbyType: number;
}

function getOptionsFromMessage(message: Message) {
  var args = getArguments(message);
  return parseArguments(args);
}

function parseArguments(args: string[]): HighScoreOptions {
  var nextIsUserType = false;

  var highScoreOptions: HighScoreOptions = {
    userType: HighscoreUserTypes.coaches,
    lobbyType: -1,
  };

  while (args.length > 0) {
    let arg = args[0];
    args.shift();

    if (arg === "-userType" || arg === "-ut") {
      nextIsUserType = true;
      continue;
    }

    if (nextIsUserType) {
      highScoreOptions.userType = getHighScoreUserTypeByString(arg);
      nextIsUserType = false;
      continue;
    }
  }

  return highScoreOptions;
}

function getHighScoreUserTypeByString(type: string): HighscoreUserTypes {
  if (type === HighscoreUserTypes.players) return HighscoreUserTypes.players;
  if (type === HighscoreUserTypes.coaches) return HighscoreUserTypes.coaches;
  if (type === HighscoreUserTypes.referrers)
    return HighscoreUserTypes.referrers;

  throw `You did not provide a valid user type; valid user types are ${Object.values(
    HighscoreUserTypes
  ).join(",")}.`;
}
