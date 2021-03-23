import { Message } from "discord.js";
import { Pool } from "mysql2";
import { Time } from "../misc/timeZone";

const c = require("../misc/constants");
const mH = require("../misc/messageHelper");
const rM = require("../misc/roleManagement");
const lM = require("../misc/lobbyManagement");

/**
 * Checks if lobby exists and posts lobby post depending on lobby type
 * @param {Discord.Message} message coaches message that triggered the lobby post
 * @param {mysql.Pool} dbHandle bot database handle
 */
module.exports = async (message: Message, dbHandle: Pool) => {
  var type = mH.getLobbyType(message);
  if (type == undefined) return;
  // tryout 'region' and role
  var lobbyRegionRole = undefined;
  var beginnerRoleNumbers = [];
  var res: Boolean = false;
  var errormsg: string = "";

  if (c.isRoleBasedLobbyType(type)) {
    // get region role
    var lobbyRegionRole = mH.getLobbyRegionRoleFromMessage(message, 1);
    if (lobbyRegionRole === undefined)
      return mH.reactNegative(
        message,
        "Failed to recognize region, has to be any of '" +
          rM.getRegionalRoleStringsForCommand().join("', '") +
          "'"
      );

    // get beginner roles
    const minRole = 0;
    const maxRole = 4;
    [res, beginnerRoleNumbers, errormsg] = mH.getNumbersFromMessage(
      message,
      2,
      minRole,
      maxRole
    );
    if (!res) {
      return mH.reactNegative(message, errormsg);
    }
  } else if (
    type === c.lobbyTypes.replayAnalysis ||
    type === c.lobbyTypes.meeting
  ) {
    beginnerRoleNumbers = [0, 1, 2, 3, 4];
  } else if (type === c.lobbyTypes.tryout) {
    beginnerRoleNumbers = [5];
  }

  var lobbyBeginnerRoles = rM.getBeginnerRolesFromNumbers(beginnerRoleNumbers);

  // get zoned time
  const simpleLobbyIndex = 1;
  const roleBasedLobbyIndex = 3;
  const lobbyIndex = c.isSimpleLobbyType(type)
    ? simpleLobbyIndex
    : roleBasedLobbyIndex;
  var zonedTime: Time;
  [res, zonedTime, errormsg] = mH.getTimeFromMessage(message, lobbyIndex);
  if (!res) {
    return mH.reactNegative(message, errormsg);
  }

  // author is coach
  var coaches: string[] = [message.author.id];

  lM.postLobby(
    dbHandle,
    message.channel,
    coaches,
    type,
    lobbyBeginnerRoles,
    lobbyRegionRole,
    zonedTime
  ).then(() => {
    // react to coach's command
    mH.reactPositive(message);
  });
};
