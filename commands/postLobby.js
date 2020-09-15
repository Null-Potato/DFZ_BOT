const c = require("../misc/constants")
const aE = require("../misc/answerEmbedding")
const mH = require("../misc/messageHelper")
const rM = require("../misc/roleManagement")
const lM = require("../misc/lobbyManagement")
const tZ = require("../misc/timeZone")

/**
 * Internal function that creates the embedding for the lobby post
 * @param {*} message coaches message that triggered the lobby post
 * @param {*} state bot state
 * @param {*} lobbyType type of lobby
 * @param {*} lobbyTypeName printing name of that lobby
 * @param {*} footer String to append to embedding
 */
async function postLobby_int(message, state, lobbyType, lobbyTypeName, footer) {
	var channel = message.channel.id;

	if(lM.getLobby(state, channel, lobbyType) !== undefined) {
		return mH.reactNegative(message, "Cannot override already created lobby of type "+ lobbyTypeName +" in channel <#" + message.channel.id + ">");
	}

	// get roles
	const minRole = 1;
	const maxRole = 4;
	[res, numbers, errormsg] = mH.getNumbersFromMessage(message, 1, minRole, maxRole);
	if(!res) {
		return mH.reactNegative(message, errormsg);
	}

	// get zoned time
	[res, zonedTime, zoneName, errormsg] = await mH.getTimeFromMessage(message, 2);
	if(!res) {
		return mH.reactNegative(message, errormsg);
	}

	// send embedding post to lobby signup-channel
	var roles = rM.getRolesFromNumbers(numbers);
	const _embed = aE.generateEmbedding("We host a " + lobbyTypeName + " lobby on " + tZ.weekDays[zonedTime.dayOfWeek] + ", "+tZ.months[zonedTime.month]+" "+ zonedTime.day +" at " + zonedTime.hours +":" + zonedTime.minutes + " " + zoneName, "for " + rM.getRoleStrings(roles), footer);
	const lobbyPostMessage = await message.channel.send("Prepare your keyboards " + rM.getRoleStrings(roles), {embed: _embed});

	// pin message to channel
	lobbyPostMessage.pin();

	// add emojis
	try {
		for(let idx = 0; idx < c.reactionTypes.length; idx++)
		{
			lobbyPostMessage.react(c.reactionTypes[idx]);	
		}
	} catch (error) {
		console.error('One of the emojis failed to react.');
	}

	// react to message
	mH.reactPositive(message);

	// create lobby data in state
	lM.createLobby(state, channel, lobbyType, Array.from(numbers), zonedTime.epoch, lobbyPostMessage.id);
}

var reactionString = "React to the numbers below to join the lobby at the positions you want.\nRemove the reaction to remove the position.\nRemove all positions to withdraw from the lobby."

/**
 * Checks if lobby exists and posts lobby post depending on lobby type
 * @param {*} message coaches message that triggered the lobby post
 * @param {*} state bot state
 */
module.exports = async (message, state) => {
	var type = mH.getLobbyType(message);
	if(type == undefined)
		return;

	if(type == c.lobbyTypes.inhouse)
	{
		postLobby_int(message, state, c.lobbyTypes.inhouse, c.getLobbyNameByType(c.lobbyTypes.inhouse), reactionString);
	} else if(type == c.lobbyTypes.unranked)
	{
		postLobby_int(message, state, c.lobbyTypes.unranked, c.getLobbyNameByType(c.lobbyTypes.unranked), reactionString);
	}else if(type == c.lobbyTypes.botbash)
	{
		postLobby_int(message, state, c.lobbyTypes.botbash, c.getLobbyNameByType(c.lobbyTypes.botbash), reactionString);
	}
}