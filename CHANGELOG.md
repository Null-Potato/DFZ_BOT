*@Coach The bot received some new features today!*

**DFZ-Bot v0.6 - Changelog**

1. Auto-posting of lobbies for scheduled events that have signed up coaches.
> The bot will now post the lobbies for each scheduled event in the respective channel 8 hours prior to the lobby time (the time at which the lobby was scheduled)
> If a coach signs up after that point in time, then the lobby is posted immediatly. **The lobby post is public and will only happen once.** 
> '*Off topic: If you find out that for whatever reason you cannot coach that lobby you can still withdraw. It's just that after it's been posted, you have to kindly ask your fellow coaches for a stand-in. If you cannot find someone, then you have to cancel the lobby (❌) and make amends to your fello dfz-lers.*'

---

**DFZ-Bot v0.5 - Changelog**

1. Added update-functionality for lobbies
> Command reads '*!update &lt;msgId&gt; -tiers &lt;tiers&gt;*'<br/>
> It updates the lobby that is associated with the given message-ID. To get a lobby's message-ID, first activate discord's developer mode in the discord options, then rightclick the lobby post that you want to change and click 'copy ID'.<br/>
> Available options: -tiers &lt;tiers&gt; Give tiers you want to allow in this lobby (e.g. '1,2')<br/>
> Example: '*!update 791297808669737001 -tiers 1,2,3*' would've updated DFZ-bot's EU unranked lobby on the 23rd of december at 8pm CET to also allow Tier 3 players, because 791297808669737001 is the associated message ID of the lobby post.<br/>
> Options to change additional lobby parameters can be implemented if needed.

---

**DFZ-Bot v0.4 - Changelog**

1. Automatic scheduling every sunday.
> The bot will issue schedule-posts for tryout and 5v5-lobby schedule.

2. Display of coach signup in scheduling posts. 
> Clicking on the Emojis representing the scheduled lobbies will have the coaches name appear in the list of coaches.
> If more than the designated number of coaches sign up, then they will be queued and - in case a coach resigns, move up and replace them.

3. Automatic creation of Google calendar entries.
> If enough coaches have signed up for a lobby (for tryouts e.g. 1 coach, for 5v5-lobby 2 coaches) then a google calendar entry is created.
> The calendar entry will update itself to display the coaches that are currently signed up.
> Links to the calendars will be posted in the announcement-channel.

If you find bugs or have improvement suggestion, please either DM me or mention me in a post in #internal-talk.

---

**DFZ-Bot v0.3 - Changelog**

1. Multiple lobbies per channel are now allowed.
> Posting lobbies for later/tomorrow without blocking other coaches is therefore now possible.

2. Reworked bot-lobby interaction for coaches.<br/>
> Removed all written commands except for  '*!helpme*' and '*!post*'; Introduced two new emojis, 🔒 and ❌, in the lobby post.
> <br/>
> 🔒 replaces the commands '*!start*' and '*!f_start*'. Clicking it will start the lobby (if you are a coach) and create the teams.
> If there are not enough players, the bot will post a list containing the available players.
> You can only use this emoji when the lobby is supposed to start (or at a later time).
> <br/>
> ❌ replaces the command '*!undo*'. Clicking it will cancel the lobby.
> <br/>
> other commands:<br/>
> '*!clear*': It could be used to remove all players from a lobby. That's not useful.
> *!list*': It simply displayed a list of current players for a lobby. This is redundant because the lobby post contains such a list.
<br/>
3. Removed the following player commands: *!correct*', *!withdraw*', *!time*', *!status*'
> *!correct*' and *!withdraw*' have already been replaced by emojis in the lobby post.
> *!time*' can be inferred from looking at "Time to lobby.
> *!status*' can be inferred by looking at the respective (pinned) lobby posts.

---

**DFZ-Bot v0.2 - Changelog**

1. Removed regions from **tryout** lobbies. <br/>
> New command '*!post tryout &lt;time&gt;*', e.g. '*!post tryout 11:59pm Europe/London*'<br/>
> The other lobby types are unaffected.<br/>

2. Changed behaviour of how time works with lobby creation<br/>
> Now, if given time is in the past, it will simply create the lobby at the next day. <br/>
> Example: Suppose it is 10:15pm in Berlin at the 22nd of october. You sit in Berlin and type '*!post tryout 10:00pm Europe/Berlin*'.<br/>
> Because 10pm already in the past today, the bot will create a lobby for 10:00pm CET at the **23rd** of october, that is tomorrow.

---

**DFZ-Bot v0.1 - Changelog**

1. Added region to lobby posts.
> The !post command now reads e.g. '*!post inhouse* ***EU*** *1,2 10:00pm CET*' (type the region right after lobby-type)
> 3 regions possible: EU, NA, SEA
  
2. Players from region get pushed up in a lobby.
> Region refers to the region-role that player is assigned to (EU, NA, SEA). If he/she has multiple region-roles, the first one counts.<br/>
> The idea is that players from the region have priority over other regions because of ping issues and suitable time-slots.<br/>
> <br/>
> Example 1: If an EU player is the 2nd player to join a SEA-lobby and a SEA-player joins as third, he will be 2nd instead and the EU player pushed to 3rd.<br/>
> Example 2: If there are 12 player waiting in a SEA-lobby, 4 of which are EU and 8 are SEA, and another SEA-player joins, he/she will be placed at 9th position and the EU-players pushed backwards.<br/>
    
3. Lobby posts now automatically ping players<br/>
> So far the mention only happens in the Embedding (the darker square in which the lobby-message is posted) - which does not trigger pinging the respective beginner-roles.<br/>
> Now the bot will also mention them in the text above the embedding - which triggers the ping. So you no longer have to add a "pinging"-message when posting any lobby.
