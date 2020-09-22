const c = require("../misc/constants")
const lM = require("../misc/lobbyManagement")
const mH = require("../misc/messageHelper")

/**
 * Handles a coach's call to !start. Creates a lobby post
 * @param {*} message coach's message
 * @param {*} state bot state
 * @param {boolean} force Force game start even if not enough players are signed up. Tries to still matchmake where possible
 */
module.exports = async (message, state, force=false) => {

	[lobby, type] = mH.getLobbyAndType(state, message)
	if(lobby == undefined || type == undefined)
		return;
	
	var key = Object.keys(c.lobbyTypes).find( typeKey => c.lobbyTypes[typeKey] == type);
	var playersPerLobby = c.lobbyTypePlayerCount[key];

	var lessThan = lobby.users.length < playersPerLobby;

	if(lessThan && !force)
		return mH.reactNegative(message, "There are fewer than " + playersPerLobby + " players signed up. Cannot start yet");

	lM.createLobbyStartPost(state, message.channel, type, playersPerLobby);

    lM.finishLobbyPost(lobby, message.channel);
	lM.removeLobby(state, message.channel.id, type);
	
	mH.reactPositive(message);
}