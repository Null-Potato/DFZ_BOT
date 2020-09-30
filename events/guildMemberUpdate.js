const rM = require("../misc/roleManagement")

function hasNickname(member)
{
    return member.nickname !== undefined && member.nickname !== null;
}

/**
 * Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
 * Here we check if a regional role has been added or removed - and change the users nickname to reflect that change
 * @param {Client} client discord client
 * @param {GuildMember} oldMember The member before the update
 * @param {GuildMember} newMember The member after the update
 */
module.exports = async (client, oldMember, newMember) => {
    // ignore if roles did not change
    if(oldMember.roles.size === newMember.roles.size)
        return;

    var oldRole = rM.findRole(oldMember, rM.regionRoleStrings);
    var newRole = rM.findRole(newMember, rM.regionRoleStrings);
    if((oldRole === null && newRole === null) || (oldRole !== null && newRole !== null)) 
    {
        // if no roles are defined => role change had nothing to do with regional roles (e.g. tier change)
        // if both roles are defined => someone is having more than 1 regional role => cannot decide which prefix
        return;
    }

    // add or remove?
    var addRole = newRole !== null;

    // which prefix to look for?
    var prefix = rM.getRegionalRolePrefix(addRole ? newRole.id : oldRole.id);
    if(prefix == "")
        return;

    if(addRole) // set nick to reflect role
    {
        newMember.setNickname(prefix+newMember.displayName, "Added regional role " + prefix).catch(err => { 
            console.log("Could not change nickname of " + newMember.displayName);
            console.log(err);
        });
    } else if (hasNickname(newMember)) // if user has nick => remove it now
    {
        newMember.setNickname(null, "Removed regional role " + prefix).catch(err => { 
            console.log("Could not remove nickname of " + newMember.displayName);
            console.log(err);
        })
    } 
}