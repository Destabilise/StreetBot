/**
 * @license Copyright (C) 2014 
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/> .
 */


(function(){

var diebot = function(){
    clearInterval(superBot.room.autodisableInterval);
    clearInterval(superBot.room.afkInterval);
    superBot.status = false;
    console.log("SuperBot está agora offline :joy: ");
}

var storeToStorage = function(){
    if(navigator.userAgent.toLowerCase().indexOf("chrome")<0) return;
    localStorage.setItem("superBotRoomSettings", JSON.stringify(superBot.roomSettings));
    localStorage.setItem("superBotRoom", JSON.stringify(superBot.room));
    var superBotStorageInfo = {
        time: Date.now(),
        stored: true,
        version: superBot.version,
    };
    localStorage.setItem("superBotStorageInfo", JSON.stringify(superBotStorageInfo));

};

var retrieveFromStorage = function(){
    if(navigator.userAgent.toLowerCase().indexOf("chrome")<0) return;
    var info = localStorage.getItem("superBotStorageInfo");
    if(info === null) API.chatLog("Dados Antigos não encontrados.");
    else{
        var settings = JSON.parse(localStorage.getItem("superBotRoomSettings"));
        var room = JSON.parse(localStorage.getItem("superBotRoom"));
        var elapsed = Date.now() - JSON.parse(info).time;
        if((elapsed < 1*60*60*1000)){
            API.chatLog('Carregando Dados Antigos...');
            for(var prop in settings){
                superBot.roomSettings[prop] = settings[prop];
            }
            //superBot.roomSettings = settings;
            superBot.room.users = room.users;
            superBot.room.afkList = room.afkList;
            superBot.room.historyList = room.historyList;
            superBot.room.mutedUsers = room.mutedUsers;
            superBot.room.autoskip = room.autoskip;
            superBot.room.roomstats = room.roomstats;
            superBot.room.messages = room.messages;
            superBot.room.queue = room.queue;
            API.chatLog('Dados Antigos Carregados.');
        }
    }
    var json_sett = null;
    var roominfo = document.getElementById("room-info");
    var info = roominfo.innerText;
    var ref_bot = "@SuperBot=";
    var ind_ref = info.indexOf(ref_bot);
    if(ind_ref > 0){
        var link = info.substring(ind_ref + ref_bot.length, info.length);
        if(link.indexOf(" ") < link.indexOf("\n")) var ind_space = link.indexOf(" ");
        else var ind_space = link.indexOf("\n");
        link = link.substring(0,ind_space);
        $.get(link, function(json){
            if(json !== null && typeof json !== "undefined"){
                var json_sett = JSON.parse(json);
                for(var prop in json_sett){
                    superBot.roomSettings[prop] = json_sett[prop];
                }
            }
        });
    }

};

var superBot = {
        version: "2.0.0",        
        status: false,
        name: "SuperBot",
        creator: "TioFrosty , DropTheBass",
        loggedInID: null,
        scriptLink: "https://raw.githubusercontent.com/Destabilise/SuperBot/master/SuperBot.js",
        cmdLink: "http://git.io/245Ppg",
        roomSettings: {
            maximumAfk: 9999,
            afkRemoval: false,                
            maximumDc: 60,                                
            bouncerPlus: true,                
            lockdownEnabled: false,                
            lockGuard: true,
            maximumLocktime: 4,                
            cycleGuard: false,
            maximumCycletime: 9999,                
            timeGuard: true,
            maximumSongLength: 6,                
            autodisable: true,                
            commandCooldown: 30,
            usercommandsEnabled: true,                
            lockskipPosition: 1,
            lockskipReasons: [ ["tema", "Esta música não entra nos temas da sala. "], 
                    ["op", "Esta Musica esta na lista OP. "], 
                    ["history", "Esta música esta no historico. "], 
                    ["mix", "You played a mix, which is against the rules. "], 
                    ["sound", "A música que você tocou tem má qualidade de som ou não tem som. "],
                    ["nsfw", "The song you contained was NSFW (image or sound). "], 
                    ["unavailable", "A música que você tocou, não está disponivel para algumas pessoas. "] 
                ],
            afkpositionCheck: 15,
            afkRankCheck: "ambassador",                
            motdEnabled: true,
            motdInterval: 5,
            motd: "Vote para não ser removido da lista de espera! :v: ",                
            filterChat: false,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: "http://bit.ly/DTMGRUPO",
            youtubeLink: null,
            website: "http://bit.ly/DTMPAGE",
            intervalMessages: [],
            messageInterval: 5,
            songstats: true,                      
        },        
        room: {        
            users: [],                
            afkList: [],                
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,   
            afkInterval: null,
            autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function(){
                if(superBot.status && superBot.roomSettings.autodisable){
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function(){},1),                
            roomstats: {
                    accountName: null,
                    totalWoots: 0,
                    totalCurates: 0,
                    totalMehs: 0,
                    launchTime: null,
                    songCount: 0,
                    chatmessages: 0,                
            },
            messages: {
                from: [],
                to: [],
                message: [],
            },                
            queue: {
                    id: [],
                    position: [],                             
            },
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown : null,
                startRoulette: function(){
                    superBot.room.roulette.rouletteStatus = true;
                    superBot.room.roulette.countdown = setTimeout(function(){ superBot.room.roulette.endRoulette(); }, 60 * 1000);
                    API.sendChat("/me A Loteria está aberta agora! Escreva !join para participar!");
                },
                endRoulette: function(){
                    superBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * superBot.room.roulette.participants.length);
                    var winner = superBot.room.roulette.participants[ind];
                    superBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = superBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat("/me Um Vencedor foi Escolhido! @" + name + " para a posição " + pos + ".");
                    setTimeout(function(winner){
                        superBot.userUtilities.moveUser(winner, pos, false);
                    }, 1*1000, winner, pos);

                },
            },
        },        
        User: function(id, name) {
            this.id = id;
            this.username = name;        
            this.jointime = Date.now();
            this.lastActivity = Date.now();         
            this.votes = {
                    woot: 0,
                    meh: 0,
                    curate: 0,
            };
            this.lastEta = null;            
            this.afkWarningCount = 0;            
            this.afkCountdown;            
            this.inRoom = true;            
            this.isMuted = false;
            this.lastDC = {
                    time: null,
                    position: null,
                    songCount: 0,
            };
            this.lastKnownPosition = null;       
        },      
        userUtilities: {
            getJointime: function(user){
                return user.jointime;
                },                        
            getUser: function(user){
                return API.getUser(user.id);
                },
            updatePosition: function(user, newPos){
                    user.lastKnownPosition = newPos;
                },                      
            updateDC: function(user){
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = superBot.room.roomstats.songCount;
                },                
            setLastActivity: function(user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);          
                },                        
            getLastActivity: function(user) {
                return user.lastActivity;
                },                        
            getWarningCount: function(user) {
                return user.afkWarningCount;
                },                        
            setWarningCount: function(user, value) {
                user.afkWarningCount = value;
                },        
            lookupUser: function(id){
                for(var i = 0; i < superBot.room.users.length; i++){
                        if(superBot.room.users[i].id === id){                                        
                                return superBot.room.users[i];
                        }
                }
                return false;
            },                
            lookupUserName: function(name){
                for(var i = 0; i < superBot.room.users.length; i++){
                        if(superBot.userUtilities.getUser(superBot.room.users[i]).username === name){
                            return superBot.room.users[i];
                        }
                }
                return false;
            },                
            voteRatio: function(id){
                var user = superBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if(votes.meh=== 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;
            
            },                
            getPermission: function(id){ //1 requests
                var u = API.getUser(id);
                return u.permission;
            },                
            moveUser: function(id, pos, priority){
                var user = superBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if(API.getWaitListPosition(id) === -1){                    
                    if (wlist.length < 50){
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function(id, pos){ 
                            API.moderateMoveDJ(id, pos);        
                        },1250, id, pos);
                    }                            
                    else{
                        var alreadyQueued = -1;
                        for (var i = 0; i < superBot.room.queue.id.length; i++){
                                if(superBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if(alreadyQueued !== -1){
                            superBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat('/me O utilizador já está sendo adicionado! Movido para a posição desejada para ' + superBot.room.queue.position[alreadyQueued] + '.');
                        }
                        superBot.roomUtilities.booth.lockBooth();
                        if(priority){
                            superBot.room.queue.id.unshift(id);
                            superBot.room.queue.position.unshift(pos);
                        }
                        else{
                            superBot.room.queue.id.push(id);
                            superBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat('/me Adicionando @' + name + ' a lista. Lista Atual : ' + superBot.room.queue.position.length + '.');
                    }
                }
                else API.moderateMoveDJ(id, pos);                    
            },        
            dclookup: function(id){
                var user = superBot.userUtilities.lookupUser(id);                        
                if(typeof user === 'boolean') return ('/me Usuario não encontrado.');
                var name = user.username;
                if(user.lastDC.time === null) return ('/me @' + name + ' Não se desconectou durante o meu tempo :confounded: ');
                var dc = user.lastDC.time;
                var pos  = user.lastDC.position;
                if(pos === null) return ("/me A Lista de espera precisa de ser atualizada pelo menos uma vez para registrar a ultima posição do utilizador");
                var timeDc = Date.now() - dc;
                var validDC = false;
                if(superBot.roomSettings.maximumDc * 60 * 1000 > timeDc){
                    validDC = true;
                }                        
                var time = superBot.roomUtilities.msToStr(timeDc);
                if(!validDC) return ("/me @" + superBot.userUtilities.getUser(user).username + ", o seu ultimo DC foi a muito tempo atrás : " + time + ".");
                var songsPassed = superBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;superBot
                var afkList = superBot.room.afkList;
                for(var i = 0; i < afkList.length; i++){
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if(dc < timeAfk && posAfk < pos){
                            afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if(newPosition <= 0) newPosition = 1;
                var msg = '/me @' + superBot.userUtilities.getUser(user).username + ' Desconectou-se ' + time + ' atrás e deveria estar na posição ' + newPosition + '.';
                superBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;             
            },              
        },
        
        roomUtilities: {
            rankToNumber: function(rankString){
                var rankInt = null;
                switch (rankString){
                    case "admin":           rankInt = 10;   break;
                    case "ambassador":      rankInt = 8;    break;
                    case "host":            rankInt = 5;    break;
                    case "cohost":          rankInt = 4;    break;
                    case "manager":         rankInt = 3;    break;
                    case "bouncer":         rankInt = 2;    break;
                    case "residentdj":      rankInt = 1;    break;
                    case "user":            rankInt = 0;    break;
                }
                return rankInt;
            },        
            msToStr: function(msTime){
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                  'days': 0,
                  'hours': 0,
                  'minutes': 0,
                  'seconds': 0
                };
                ms = {
                  'day': 24 * 60 * 60 * 1000,
                  'hour': 60 * 60 * 1000,
                  'minute': 60 * 1000,
                  'second': 1000
                };                        
                if (msTime > ms.day) {
                  timeAway.days = Math.floor(msTime / ms.day);
                  msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                  timeAway.hours = Math.floor(msTime / ms.hour);
                  msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                  timeAway.minutes = Math.floor(msTime / ms.minute);
                  msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                  timeAway.seconds = Math.floor(msTime / ms.second);
                }                        
                if (timeAway.days !== 0) {
                  msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                  msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                  msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                  msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                  return msg;
                } else {
                  return false;
                }                       
            },                
            booth:{                
                lockTimer: setTimeout(function(){},1000),                        
                locked: false,                        
                lockBooth: function(){
                    API.moderateLockWaitList(!superBot.roomUtilities.booth.locked);
                    superBot.roomUtilities.booth.locked = false;
                    if(superBot.roomSettings.lockGuard){
                        superBot.roomUtilities.booth.lockTimer = setTimeout(function (){
                            API.moderateLockWaitList(superBot.roomUtilities.booth.locked);
                        },superBot.roomSettings.maximumLocktime * 60 * 1000);
                    };                        
                },                        
                unlockBooth: function() {
                  API.moderateLockWaitList(superBot.roomUtilities.booth.locked);
                  clearTimeout(superBot.roomUtilities.booth.lockTimer);
                },                
            },                
            afkCheck: function(){
                if(!superBot.status || !superBot.roomSettings.afkRemoval) return void (0);
                    var rank = superBot.roomUtilities.rankToNumber(superBot.roomSettings.afkRankCheck);
                    var djlist = API.getWaitList();
                    var lastPos = Math.min(djlist.length , superBot.roomSettings.afkpositionCheck);
                    if(lastPos - 1 > djlist.length) return void (0);
                    for(var i = 0; i < lastPos; i++){
                        if(typeof djlist[i] !== 'undefined'){
                            var id = djlist[i].id;
                            var user = superBot.userUtilities.lookupUser(id);
                            if(typeof user !== 'boolean'){
                                var plugUser = superBot.userUtilities.getUser(user);
                                if(rank !== null && plugUser.permission <= rank){
                                    var name = plugUser.username;
                                    var lastActive = superBot.userUtilities.getLastActivity(user);
                                    var inactivity = Date.now() - lastActive;
                                    var time = superBot.roomUtilities.msToStr(inactivity);
                                    var warncount = user.afkWarningCount;
                                    if (inactivity > superBot.roomSettings.maximumAfk * 60 * 1000 ){
                                        if(warncount === 0){
                                            API.sendChat('/me @' + name + ', Você esteve AFK durante ' + time + ', Por favor, responda em 2 minutos ou você será removido da lista.');
                                            user.afkWarningCount = 3;
                                            user.afkCountdown = setTimeout(function(userToChange){
                                                userToChange.afkWarningCount = 1; 
                                            }, 90 * 1000, user);
                                        }
                                        else if(warncount === 1){
                                            API.sendChat("/me @" + name + ", Você será removido em breve se você não responder. [AFK]");
                                            user.afkWarningCount = 3;
                                            user.afkCountdown = setTimeout(function(userToChange){
                                                userToChange.afkWarningCount = 2;
                                            }, 30 * 1000, user);
                                        }
                                        else if(warncount === 2){
                                            var pos = API.getWaitListPosition(id);
                                            if(pos !== -1){
                                                pos++;
                                                superBot.room.afkList.push([id, Date.now(), pos]);
                                                user.lastDC = {
                                                    time: null,
                                                    position: null,
                                                    songCount: 0,
                                                };
                                                API.moderateRemoveDJ(id);
                                                API.sendChat('/me @' + name + ', Você foi removido por estar AFK durante ' + time + '. Você estava na posição ' + pos + '. Envie alguma mensagem pelo menos a cada ' + superBot.roomSettings.maximumAfk + ' minutos se você quiser tocar alguma música.');
                                            }
                                            user.afkWarningCount = 0;
                                        };
                                    }
                                }
                            }
                        }
                    }                
            },                
            changeDJCycle: function(){
                var toggle = $(".cycle-toggle");
                if(toggle.hasClass("disabled")) {
                    toggle.click();
                    if(superBot.roomSettings.cycleGuard){
                    superBot.room.cycleTimer = setTimeout(function(){
                            if(toggle.hasClass(superBot"enabled")) toggle.click();
                            }, superBot.roomSettings.cycleMaxTime * 60 * 1000);
                    }        
                }
                else {
                    toggle.click();
                    clearTimeout(superBot.room.cycleTimer);
                }        
            },
            intervalMessage: function(){
                var interval;
                if(superBot.roomSettings.motdEnabled) interval = superBot.roomSettings.motdInterval;
                else interval = superBot.roomSettings.messageInterval;
                if((superBot.room.roomstats.songCount % interval) === 0 && superBot.status){
                    var msg;
                    if(superBot.roomSettings.motdEnabled){
                        msg = superBot.roomSettings.motd;
                    }
                    else{
                        if(superBot.roomSettings.intervalMessages.length === 0) return void (0);
                        var messageNumber = superBot.room.roomstats.songCount % superBot.roomSettings.intervalMessages.length;
                        msg = superBot.roomSettings.intervalMessages[messageNumber];
                    };                              
                    API.sendChat('/me ' + msg);
                }
            },      
        },        
        eventChat: function(chat){
            for(var i = 0; i < superBot.room.users.length;i++){
                if(superBot.room.users[i].id === chat.fromID){
                        superBot.userUtilities.setLastActivity(superBot.room.users[i]);
                        if(superBot.room.users[i].username !== chat.from){
                                superBot.room.users[i].username = chat.from;
                        }
                }                            
            }                        
            if(superBot.chatUtilities.chatFilter(chat)) return void (0);
            if( !superBot.chatUtilities.commandCheck(chat) ) 
                    superBot.chatUtilities.action(chat);             
        },        
        eventUserjoin: function(user){
            var known = false;
            var index = null;
            for(var i = 0; i < superBot.room.users.length;i++){
                if(superBot.room.users[i].id === user.id){
                        known = true;
                        index = i;
                }
            }
            var greet = true;
            if(known){
                superBot.room.users[index].inRoom = true;
                var u = superBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if(t < 10*1000) greet = false;
                else var welcome = "Seja Bem-Vindo Denovo, ";
            }
            else{
                superBot.room.users.push(new superBot.User(user.id, user.username));
                var welcome = "Bem Vindo ";
            }    
            for(var j = 0; j < superBot.room.users.length;j++){
                if(superBot.userUtilities.getUser(superBot.room.users[j]).id === user.id){
                    superBot.userUtilities.setLastActivity(superBot.room.users[j]);
                    superBot.room.users[j].jointime = Date.now();
                }
            
            }
            if(superBot.roomSettings.welcome && greet){
                setTimeout(function(){
                    API.sendChat("/me " + welcome + "@" + user.username + " :wave: .");
                }, 1*1000);
            }               
        },        
        eventUserleave: function(user){
            for(var i = 0; i < superBot.room.users.length;i++){
                if(superBot.room.users[i].id === user.id){
                        superBot.userUtilities.updateDC(superBot.room.users[i]);
                        superBot.room.users[i].inRoom = false;
                }
            }
        },        
        eventVoteupdate: function(obj){
            for(var i = 0; i < superBot.room.users.length;i++){
                if(superBot.room.users[i].id === obj.user.id){
                    if(obj.vote === 1){
                        superBot.room.users[i].votes.woot++;
                    }
                    else{
                        superBot.room.users[i].votes.meh++;                                        
                    }
                }
            }               
        },        
        eventCurateupdate: function(obj){
            for(var i = 0; i < superBot.room.users.length;i++){
                if(superBot.room.users[i].id === obj.user.id){
                    superBot.room.users[i].votes.curate++;
                }
            }       
        },        
        eventDjadvance: function(obj){                
            var lastplay = obj.lastPlay;
            if(typeof lastplay === 'undefined') return void (0);
            if(superBot.roomSettings.songstats) API.sendChat("/me " + lastplay.media._previousAttributes.author + " - " + lastplay.media._previousAttributes.title + ": " + lastplay.score.positive + "W/" + lastplay.score.curates + "G/" + lastplay.score.negative + "M.")
            superBot.room.roomstats.totalWoots += lastplay.score.positive;
            superBot.room.roomstats.totalMehs += lastplay.score.negative;
            superBot.room.roomstats.totalCurates += lastplay.score.curates;
            superBot.room.roomstats.songCount++;
            superBot.roomUtilities.intervalMessage();
            superBot.room.currentDJID = API.getDJ().id;
            var alreadyPlayed = false;
            for(var i = 0; i < superBot.room.historyList.length; i++){
                if(superBot.room.historyList[i][0] === obj.media.cid){
                    var firstPlayed = superBot.room.historyList[i][1];
                    var plays = superBot.room.historyList[i].length - 1;
                    var lastPlayed = superBot.room.historyList[i][plays];
                    var now = +new Date();
                    var interfix = '';
                    if(plays > 1) interfix = 's'
                    API.sendChat('/me :repeat: Esta música foi tocada ' + plays + ' vez(es) ' + interfix + ' na última ' + superBot.roomUtilities.msToStr(Date.now() - firstPlayed) + ', Foi tocada pela última vez á ' + superBot.roomUtilities.msToStr(Date.now() - lastPlayed) + ' atrás. :repeat: ');

                    superBot.room.historyList[i].push(+new Date());
                    alreadyPlayed = true;
                }
            }
            if(!alreadyPlayed){
                superBot.room.historyList.push([obj.media.cid, +new Date()]);
            }
            superBot.room.historyList;
            var newMedia = obj.media;
            if(superBot.roomSettings.timeGuard && newMedia.duration > superBot.roomSettings.maximumSongLength*60  && !superBot.room.roomevent){
                var name = obj.dj.username;
                API.sendChat('/me @' + name + ', a sua música é maior que ' + superBot.roomSettings.maximumSongLength + ' minutos, você precisa de autorização para tocar musicas longas.');
                API.moderateForceSkip();
            }
            var user = superBot.userUtilities.lookupUser(obj.dj.id);
            if(user.ownSong){
                API.sendChat('/me :up: @' + user.username + ' Têm autorização para tocar as suas proprias produções!');
                user.ownSong = false;
            }
            user.lastDC.position = null;
            clearTimeout(superBot.room.autoskipTimer);
            if(superBot.room.autoskip){
                var remaining = media.duration * 1000; 
                superBot.room.autoskipTimer = setTimeout(function(){ API.moderateForceSkip(); }, remaining - 500);
            }
            storeToStorage();

        },
        eventWaitlistupdate: function(users){
            if(users.length < 50){
                if(superBot.room.queue.id.length > 0 && superBot.room.queueable){
                    superBot.room.queueable = false;
                    setTimeout(function(){superBot.room.queueable = true;}, 500);
                    superBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function(){
                            id = superBot.room.queue.id.splice(0,1)[0];
                            pos = superBot.room.queue.position.splice(0,1)[0];
                            API.moderateAddDJ(id,pos);
                            setTimeout(
                                function(id, pos){
                                API.moderateMoveDJ(id, pos);
                                superBot.room.queueing--;
                                if(superBot.room.queue.id.length === 0) setTimeout(function(){
                                    superBot.roomUtilities.booth.unlockBooth();
                                },1000);
                            },1000,id,pos);
                    },1000 + superBot.room.queueing * 2500);
                }
            }            
            for(var i = 0; i < users.length; i++){
                var user = superBot.userUtilities.lookupUser(users[i].id)
                superBot.userUtilities.updatePosition(user, users[i].wlIndex + 1);
            }
        },
        chatcleaner: function(chat){
            if(!superBot.roomSettings.filterChat) return false;
            if(superBot.userUtilities.getPermission(chat.fromID) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for(var i = 0; i < msg.length; i++){
                ch = msg.charAt(i);
                if((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if(msg === ''){
                return true;
            }
            if(!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g,'');
            var capitals = 0;
            var ch;
            for(var i = 0; i < msg.length; i++){
                ch = msg.charAt(i);
                if(ch >= 'A' && ch <= 'Z') capitals++;
            }
            if(capitals >= 40){
                API.sendChat("/me @" + chat.from + ", Desligue o seu capslock por favor :persevere: .");
                return true;
            }
            msg = msg.toLowerCase();
            if(msg === 'skip'){
                    API.sendChat("/me @" + chat.from + ", Não peça para pular.");
                    return true;
                    }
            for (var j = 0; j < superBot.chatUtilities.spam.length; j++){
                if(msg === superBot.chatUtilities.spam[j]){
                    API.sendChat("/me @" + chat.from + ",por favor não faça spam.");
                    return true;
                    }
                }
            for (var i = 0; i < superBot.chatUtilities.beggarSentences.length; i++){
                if(msg.indexOf(superBot.chatUtilities.beggarSentences[i]) >= 0){
                    API.sendChat("/me @" + chat.from + ",por favor não peça fans.");
                    return true;
                }
            } 
            return false;
        },        
        chatUtilities: {        
            chatFilter: function(chat){
                var msg = chat.message;
                var perm = superBot.userUtilities.getPermission(chat.fromID);
                var user = superBot.userUtilities.lookupUser(chat.fromID);
                var isMuted = false;
                for(var i = 0; i < superBot.room.mutedUsers.length; i++){
                                if(superBot.room.mutedUsers[i] === chat.fromID) isMuted = true;
                        }
                if(isMuted){
                    API.moderateDeleteChat(chat.chatID);
                    return true;
                    };
                if(superBot.roomSettings.lockdownEnabled){
                                if(perm === 0){    
                                        API.moderateDeleteChat(chat.chatID);
                                        return true;
                                }
                        };
                if(superBot.chatcleaner(chat)){
                    API.moderateDeleteChat(chat.chatID);
                    return true;
                }
                var plugRoomLinkPatt, sender;
                    plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                    if (plugRoomLinkPatt.exec(msg)) {
                      sender = API.getUser(chat.fromID);
                      if (perm === 0) {                                                              
                              API.sendChat("/me @" + chat.from + ", por favor, não poste links de outras salas aqui.");
                              API.moderateDeleteChat(chat.chatID);
                              return true;
                      }
                    }
                if(msg.indexOf('http://adf.ly/') > -1){
                    API.moderateDeleteChat(chat.chatID);
                    API.sendChat('/me @' + chat.from + ', por favor, mude o seu programa de autowoot, Nos recomendamos - TastyPlug - : http://fungustime.pw/tastyplug/');
                    return true;
                }                    
                if(msg.indexOf('Autojoin não foi ativado') > 0 || msg.indexOf('AFKMSG não foi ativado') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('AutoJoin desativado') > 0 || msg.indexOf('AFKMSG desativado') > 0){ 
                    API.moderateDeleteChat(chat.chatID);
                    return true;
                }                       
            return false;                        
            },                        
            commandCheck: function(chat){
                var cmd;
                if(chat.message.charAt(0) === '!'){
                        var space = chat.message.indexOf(' ');
                        if(space === -1){
                                cmd = chat.message;
                        }
                        else cmd = chat.message.substring(0,space);
                }
                else return false;
                var userPerm = superBot.userUtilities.getPermission(chat.fromID);
                if(chat.message !== "!join" && chat.message !== "!leave"){                            
                    if(userPerm === 0 && !superBot.room.usercommand) return void (0);
                    if(!superBot.room.allcommand) return void (0);
                }                            
                if(chat.message === '!eta' && superBot.roomSettings.etaRestriction){
                    if(userPerm < 2){
                        var u = superBot.userUtilities.lookupUser(chat.fromID);
                        if(u.lastEta !== null && (Date.now() - u.lastEta) < 1*60*60*1000){
                            API.moderateDeleteChat(chat.chatID);
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }                            
                var executed = false;                            
                switch(cmd){
                    case '!active':             superBot.commands.activeCommand.functionality(chat, '!active');                        executed = true; break;
                    case '!add':                superBot.commands.addCommand.functionality(chat, '!add');                              executed = true; break;
                    case '!afklimit':           superBot.commands.afklimitCommand.functionality(chat, '!afklimit');                    executed = true; break;
                    case '!afkremoval':         superBot.commands.afkremovalCommand.functionality(chat, '!afkremoval');                executed = true; break;
                    case '!afkreset':           superBot.commands.afkresetCommand.functionality(chat, '!afkreset');                    executed = true; break;
                    case '!afktime':            superBot.commands.afktimeCommand.functionality(chat, '!afktime');                      executed = true; break;
                    case '!autoskip':           superBot.commands.autoskipCommand.functionality(chat, '!autoskip');                    executed = true; break;
                    case '!autowoot':           superBot.commands.autowootCommand.functionality(chat, '!autowoot');                    executed = true; break;
                    case '!ba':                 superBot.commands.baCommand.functionality(chat, '!ba');                                executed = true; break;
                    case '!ban':                superBot.commands.banCommand.functionality(chat, '!ban');                              executed = true; break;
                    case '!bouncer+':           superBot.commands.bouncerPlusCommand.functionality(chat, '!bouncer+');                 executed = true; break;
                    case '!clearchat':          superBot.commands.clearchatCommand.functionality(chat, '!clearchat');                  executed = true; break;
                    case '!commands':           superBot.commands.commandsCommand.functionality(chat, '!commands');                    executed = true; break;
                    case '!cookie':             superBot.commands.cookieCommand.functionality(chat, '!cookie');                        executed = true; break;
                    case '!cycle':              superBot.commands.cycleCommand.functionality(chat, '!cycle');                          executed = true; break;
                    case '!cycleguard':         superBot.commands.cycleguardCommand.functionality(chat, '!cycleguard');                executed = true; break;
                    case '!cycletimer':         superBot.commands.cycletimerCommand.functionality(chat, '!cycletimer');                executed = true; break;
                    case '!dclookup':           superBot.commands.dclookupCommand.functionality(chat, '!dclookup');                    executed = true; break;
                    case '!dc':                 superBot.commands.dclookupCommand.functionality(chat, '!dc');                          executed = true; break;
                    case '!emoji':              superBot.commands.emojiCommand.functionality(chat, '!emoji');                          executed = true; break;
                    case '!english':            superBot.commands.englishCommand.functionality(chat, '!english');                      executed = true; break;
                    case '!eta':                superBot.commands.etaCommand.functionality(chat, '!eta');                              executed = true; break;
                    case '!fb':                 superBot.commands.fbCommand.functionality(chat, '!fb');                                executed = true; break;
                    case '!filter':             superBot.commands.filterCommand.functionality(chat, '!filter');                        executed = true; break;
                    case '!join':               superBot.commands.joinCommand.functionality(chat, '!join');                            executed = true; break;
                    case '!jointime':           superBot.commands.jointimeCommand.functionality(chat, '!jointime');                    executed = true; break;
                    case '!kick':               superBot.commands.kickCommand.functionality(chat, '!kick');                            executed = true; break;
                    case '!diebot':             superBot.commands.diebotCommand.functionality(chat, '!diebot');                            executed = true; break;
                    case '!leave':              superBot.commands.leaveCommand.functionality(chat, '!leave');                          executed = true; break;
                    case '!link':               superBot.commands.linkCommand.functionality(chat, '!link');                            executed = true; break;
                    case '!lock':               superBot.commands.lockCommand.functionality(chat, '!lock');                            executed = true; break;
                    case '!lockdown':           superBot.commands.lockdownCommand.functionality(chat, '!lockdown');                    executed = true; break;
                    case '!lockguard':          superBot.commands.lockguardCommand.functionality(chat, '!lockguard');                  executed = true; break;
                    case '!lockskip':           superBot.commands.lockskipCommand.functionality(chat, '!lockskip');                    executed = true; break;
                    case '!lockskippos':        superBot.commands.lockskipposCommand.functionality(chat, '!lockskippos');              executed = true; break;
                    case '!locktimer':          superBot.commands.locktimerCommand.functionality(chat, '!locktimer');                  executed = true; break;
                    case '!maxlength':          superBot.commands.maxlengthCommand.functionality(chat, '!maxlength');                  executed = true; break;
                    case '!motd':               superBot.commands.motdCommand.functionality(chat, '!motd');                            executed = true; break;
                    case '!move':               superBot.commands.moveCommand.functionality(chat, '!move');                            executed = true; break;
                    case '!mute':               superBot.commands.muteCommand.functionality(chat, '!mute');                            executed = true; break;
                    case '!op':                 superBot.commands.opCommand.functionality(chat, '!op');                                executed = true; break;
                    case '!ping':               superBot.commands.pingCommand.functionality(chat, '!ping');                            executed = true; break;
                    case '!reload':             superBot.commands.reloadCommand.functionality(chat, '!reload');                        executed = true; break;
                    case '!remove':             superBot.commands.removeCommand.functionality(chat, '!remove');                        executed = true; break;
                    case '!refresh':            superBot.commands.refreshCommand.functionality(chat, '!refresh');                      executed = true; break;
                    case '!restricteta':        superBot.commands.restrictetaCommand.functionality(chat, '!restricteta');              executed = true; break;
                    case '!roulette':           superBot.commands.rouletteCommand.functionality(chat, '!roulette');                    executed = true; break;
                    case '!rules':              superBot.commands.rulesCommand.functionality(chat, '!rules');                          executed = true; break;
                    case '!sessionstats':       superBot.commands.sessionstatsCommand.functionality(chat, '!sessionstats');            executed = true; break;
                    case '!skip':               superBot.commands.skipCommand.functionality(chat, '!skip');                            executed = true; break;
                    case '!status':             superBot.commands.statusCommand.functionality(chat, '!status');                        executed = true; break;
                    case '!swap':               superBot.commands.swapCommand.functionality(chat, '!swap');
                    case '!theme':              superBot.commands.themeCommand.functionality(chat, '!theme');                          executed = true; break;
                    case '!timeguard':          superBot.commands.timeguardCommand.functionality(chat, '!timeguard');                  executed = true; break;
                    case '!togglemotd':         superBot.commands.togglemotdCommand.functionality(chat, '!togglemotd');                executed = true; break;
                    case '!unban':              superBot.commands.unbanCommand.functionality(chat, '!unban');                          executed = true; break;
                    case '!unlock':             superBot.commands.unlockCommand.functionality(chat, '!unlock');                        executed = true; break;
                    case '!unmute':             superBot.commands.unmuteCommand.functionality(chat, '!unmute');                        executed = true; break;
                    case '!usercmdcd':          superBot.commands.usercmdcdCommand.functionality(chat, '!usercmdcd');                  executed = true; break;
                    case '!usercommands':       superBot.commands.usercommandsCommand.functionality(chat, '!usercommands');            executed = true; break;
                    case '!voteratio':          superBot.commands.voteratioCommand.functionality(chat, '!voteratio');                  executed = true; break;
                    case '!welcome':            superBot.commands.welcomeCommand.functionality(chat, '!welcome');                      executed = true; break;
                    case '!website':            superBot.commands.websiteCommand.functionality(chat, '!website');                      executed = true; break;
                    case '!youtube':            superBot.commands.youtubeCommand.functionality(chat, '!youtube');                      executed = true; break;
                    //case '!command': superBot.commands.commandCommand.functionality(chat, '!command'); executed = true; break;
                }
                if(executed && userPerm === 0){
                    superBot.room.usercommand = false;
                    setTimeout(function(){ superBot.room.usercommand = true; }, superBot.roomSettings.commandCooldown * 1000);                               
                }
                if(executed){
                    API.moderateDeleteChat(chat.chatID);
                    superBot.room.allcommand = false;
                    setTimeout(function(){ superBot.room.allcommand = true; }, 5 * 1000);
                }
                return executed;                                
            },                        
            action: function(chat){
                var user = superBot.userUtilities.lookupUser(chat.fromID);                        
                if (chat.type === 'message') {
                    for(var j = 0; j < superBot.room.users.length;j++){
                        if(superBot.userUtilities.getUser(superBot.room.users[j]).id === chat.fromID){
                            superBot.userUtilities.setLastActivity(superBot.room.users[j]);
                        }
                    
                    }
                }
                superBot.room.roomstats.chatmessages++;                                
            },
            spam: [
                'hueh','hu3','brbr','heu','brbr','kkkk','spoder','mafia','zuera','zueira',
                'zueria','aehoo','aheu','alguem','algum','brazil','zoeira','fuckadmins','affff','vaisefoder','huenaarea',
                'hitler','ashua','ahsu','ashau','lulz','huehue','hue','huehuehue','merda','pqp','puta','mulher','pula','retarda','caralho','filha','ppk',
                'gringo','fuder','foder','hua','ahue','modafuka','modafoka','mudafuka','mudafoka','ooooooooooooooo','foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa','motherfucker','modafocka'
            ],                        
            beggarSentences: ['fanme','funme','becomemyfan','trocofa','fanforfan','fan4fan','fan4fan','hazcanfanz','fun4fun','fun4fun',
                'meufa','fanz','isnowyourfan','reciprocate','fansme','givefan','fanplz','fanpls','plsfan','plzfan','becomefan','tradefan',
                'fanifan','bemyfan','retribui','gimmefan','fansatfan','fansplz','fanspls','ifansback','fanforfan','addmefan','retribuo',
                'fantome','becomeafan','fan-to-fan','fantofan','canihavefan','pleasefan','addmeinfan','iwantfan','fanplease','ineedfan',
                'ineedafan','iwantafan','bymyfan','fannme','returnfan','bymyfan','givemeafan','sejameufa','sejameusfa','sejameuf��',
                'sejameusf��','f��please','f��pls','f��plz','fanxfan','addmetofan','fanzafan','fanzefan','becomeinfan','backfan',
                'viremmeuseguidor','viremmeuseguir','fanisfan','funforfun','anyfanaccept','anyfanme','fan4fan','fan4fan','turnmyfan',
                'turnifan','beafanofme','comemyfan','plzzfan','plssfan','procurofan','comebackafan','fanyfan','givemefan','fan=fan',
                'fan=fan','fan+fan','fan+fan','fanorfan','beacomeafanofme','beacomemyfan','bcomeafanofme','bcomemyfan','fanstofan',
                'bemefan','trocarfan','fanforme','fansforme','allforfan','fansintofans','fanintofan','f(a)nme','prestomyfan',
                'presstomyfan','fanpleace','fanspleace','givemyafan','addfan','addsmetofan','f4f','canihasfan','canihavefan',
                'givetomeafan','givemyfan','phanme','fanforafan','fanvsfan','fanturniturn','fanturninturn','sejammeufa',
                'sejammeusfa','befanofme','faninfan','addtofan','fanthisaccount','fanmyaccount','fanback','addmeforfan',
                'fans4fan','fans4fan','fanme','fanmyaccount','fanback','addmeforfan','fans4fan','fans4fan','fanme','turnfanwhocontribute',
                "bemefan","bemyfan","beacomeafanofme","beacomemyfan","becameyafan","becomeafan",
                "becomefan","becomeinfan","becomemyfan","becomemyfans","bouncerplease","bouncerpls",
                "brbrbrbr","brbrbrbr","bymyfan","canihasfan","canihavefan","caralho",
                "clickmynametobecomeafan","comebackafan","comemyfan","dosfanos","everyonefan",
                "everyonefans","exchangefan","f4f","f&n","f(a)nme","f@nme","��@nme","f4f","f4n4f4n",
                "f4nforf4n","f4nme","f4n4f4n","f��","f��","f��������please","f��������pls","f��������plz","fan:four:fan",
                'fanme','funme','becomemyfan','trocofa','fanforfan','fan4fan','fan4fan','hazcanfanz',
                'fun4fun','fun4fun','meufa','fanz','isnowyourfan','reciprocate','fansme','givefan',
                'fanplz','fanpls','plsfan','plzfan','becomefan','tradefan','fanifan','bemyfan',
                'retribui','gimmefan','fansatfan','fansplz','fanspls','ifansback','fanforfan',
                'addmefan','retribuo','fantome','becomeafan','fan-to-fan','fantofan',
                'canihavefan','pleasefan','addmeinfan','iwantfan','fanplease','ineedfan',
                'ineedafan','iwantafan','bymyfan','fannme','returnfan','bymyfan','givemeafan',
                'sejameufa','sejameusfa','sejameufã','sejameusfã','fãplease','fãpls','fãplz',
                'fanxfan','addmetofan','fanzafan','fanzefan','becomeinfan','backfan',
                'viremmeuseguidor','viremmeuseguir','fanisfan','funforfun','anyfanaccept',
                'anyfanme','fan4fan','fan4fan','turnmyfan','turnifan','beafanofme','comemyfan',
                'plzzfan','plssfan','procurofan','comebackafan','fanyfan','givemefan','fan=fan',
                'fan=fan','fan+fan','fan+fan','fanorfan','beacomeafanofme','beacomemyfan',
                'bcomeafanofme','bcomemyfan','fanstofan','bemefan','trocarfan','fanforme',
                'fansforme','allforfan','fnme','fnforfn','fansintofans','fanintofan','f(a)nme','prestomyfan',
                'presstomyfan','fanpleace','fanspleace','givemyafan','addfan','addsmetofan',
                'f4f','canihasfan','canihavefan','givetomeafan','givemyfan','phanme','but i need please fan',
                'fanforafan','fanvsfan','fanturniturn','fanturninturn','sejammeufa',
                'sejammeusfa','befanofme','faninfan','addtofan','fanthisaccount',
                'fanmyaccount','fanback','addmeforfan','fans4fan','fans4fan','fanme','bemyfanpls','befanpls','f4f','fanyfan'
            ],
        },
        connectAPI: function(){
            this.proxy = {
                    eventChat:                                      $.proxy(this.eventChat,                                     this),
                    eventUserskip:                                  $.proxy(this.eventUserskip,                                 this),
                    eventUserjoin:                                  $.proxy(this.eventUserjoin,                                 this),
                    eventUserleave:                                 $.proxy(this.eventUserleave,                                this),
                    eventUserfan:                                   $.proxy(this.eventUserfan,                                  this),
                    eventFriendjoin:                                $.proxy(this.eventFriendjoin,                               this),
                    eventFanjoin:                                   $.proxy(this.eventFanjoin,                                  this),
                    eventVoteupdate:                                $.proxy(this.eventVoteupdate,                               this),
                    eventCurateupdate:                              $.proxy(this.eventCurateupdate,                             this),
                    eventRoomscoreupdate:                           $.proxy(this.eventRoomscoreupdate,                          this),
                    eventDjadvance:                                 $.proxy(this.eventDjadvance,                                this),
                    eventDjupdate:                                  $.proxy(this.eventDjupdate,                                 this),
                    eventWaitlistupdate:                            $.proxy(this.eventWaitlistupdate,                           this),
                    eventVoteskip:                                  $.proxy(this.eventVoteskip,                                 this),
                    eventModskip:                                   $.proxy(this.eventModskip,                                  this),
                    eventChatcommand:                               $.proxy(this.eventChatcommand,                              this),
                    eventHistoryupdate:                             $.proxy(this.eventHistoryupdate,                            this),

            };            
            API.on(API.CHAT,                                        this.proxy.eventChat);
            API.on(API.USER_SKIP,                                   this.proxy.eventUserskip);
            API.on(API.USER_JOIN,                                   this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE,                                  this.proxy.eventUserleave);
            API.on(API.USER_FAN,                                    this.proxy.eventUserfan);
            API.on(API.FRIEND_JOIN,                                 this.proxy.eventFriendjoin);
            API.on(API.FAN_JOIN,                                    this.proxy.eventFanjoin);
            API.on(API.VOTE_UPDATE,                                 this.proxy.eventVoteupdate);
            API.on(API.CURATE_UPDATE,                               this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE,                           this.proxy.eventRoomscoreupdate);
            API.on(API.DJ_ADVANCE,                                  this.proxy.eventDjadvance);
            API.on(API.DJ_UPDATE,                                   this.proxy.eventDjupdate);
            API.on(API.WAIT_LIST_UPDATE,                            this.proxy.eventWaitlistupdate);
            API.on(API.VOTE_SKIP,                                   this.proxy.eventVoteskip);
            API.on(API.MOD_SKIP,                                    this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND,                                this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE,                              this.proxy.eventHistoryupdate);
        },
        disconnectAPI:function(){                        
            API.off(API.CHAT,                                        this.proxy.eventChat);
            API.off(API.USER_SKIP,                                   this.proxy.eventUserskip);
            API.off(API.USER_JOIN,                                   this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE,                                  this.proxy.eventUserleave);
            API.off(API.USER_FAN,                                    this.proxy.eventUserfan);
            API.off(API.FRIEND_JOIN,                                 this.proxy.eventFriendjoin);
            API.off(API.FAN_JOIN,                                    this.proxy.eventFanjoin);
            API.off(API.VOTE_UPDATE,                                 this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE,                               this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE,                           this.proxy.eventRoomscoreupdate);
            API.off(API.DJ_ADVANCE,                                  this.proxy.eventDjadvance);
            API.off(API.DJ_UPDATE,                                   this.proxy.eventDjupdate);
            API.off(API.WAIT_LIST_UPDATE,                            this.proxy.eventWaitlistupdate);
            API.off(API.VOTE_SKIP,                                   this.proxy.eventVoteskip);
            API.off(API.MOD_SKIP,                                    this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND,                                this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE,                              this.proxy.eventHistoryupdate);
        },
        startup: function(){
            var u = API.getUser();
            if(u.permission < 2) return API.chatLog("Only bouncers and up can run a bot.");
            if(u.permission === 2) return API.chatLog("The bot can't move people when it's run as a bouncer.");
            if(navigator.userAgent.toLowerCase().indexOf("chrome")<0){
                API.chatLog("Storing data across sessions isn't supported when not running the bot on Google Chrome.");
                console.log("Storing data across sessions isn't supported when not running the bot on Google Chrome.");
            }
            this.connectAPI();
            retrieveFromStorage();
            if(superBot.room.roomstats.launchTime === null){
                superBot.room.roomstats.launchTime = Date.now();
            }
            for(var j = 0; j < superBot.room.users.length; j++){
                superBot.room.users[j].inRoom = false;
            }                        
            var userlist = API.getUsers();
            for(var i = 0; i < userlist.length;i++){
                var known = false;
                var ind = null;
                for(var j = 0; j < superBot.room.users.length; j++){
                    if(superBot.room.users[j].id === userlist[i].id){
                        known = true;
                        ind = j;
                    }
                }
                if(known){
                        superBot.room.users[ind].inRoom = true;
                }
                else{
                        superBot.room.users.push(new superBot.User(userlist[i].id, userlist[i].username));
                        ind = superBot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(superBot.room.users[ind].id) + 1;
                superBot.userUtilities.updatePosition(superBot.room.users[ind], wlIndex);
            }
            superBot.room.afkInterval = setInterval(function(){superBot.roomUtilities.afkCheck()}, 10 * 1000);
            superBot.room.autodisableInterval = setInterval(function(){superBot.room.autodisableFunc();}, 60 * 60 * 1000);
            superBot.loggedInID = API.getUser().id;            
            superBot.status = true;
            API.sendChat('/cap 1');
            API.setVolume(0);
            API.sendChat('/me ' + superBot.name + ' v' + superBot.version + ' online!');
        },                        
        commands: {        
            executable: function(minRank, chat){
                var id = chat.fromID;
                var perm = superBot.userUtilities.getPermission(id);
                var minPerm;
                switch(minRank){
                        case 'admin': minPerm = 7; break;
                        case 'ambassador': minPerm = 6; break;
                        case 'host': minPerm = 5; break;
                        case 'cohost': minPerm = 4; break;
                        case 'manager': minPerm = 3; break;
                        case 'mod': 
                                if(superBot.roomSettings.bouncerPlus){
                                    minPerm = 2;
                                }
                                else {
                                    minPerm = 3;
                                }
                                break;
                        case 'bouncer': minPerm = 2; break;
                        case 'residentdj': minPerm = 1; break;
                        case 'user': minPerm = 0; break;
                        default: API.chatLog('error assigning minimum permission');
                };
                if(perm >= minPerm){
                return true;
                }
                else return false;                      
            },                
                /**
                commandCommand: {
                        rank: 'user/bouncer/mod/manager',
                        type: 'startsWith/exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                
                                };                              
                        },
                },          
                **/

                activeCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    var now = Date.now();
                                    var chatters = 0;
                                    var time;
                                    if(msg.length === cmd.length) time = 60;
                                    else{
                                        time = msg.substring(cmd.length + 1);
                                        if(isNaN(time)) return API.sendChat('/me [@' + chat.from + '] Tempo Invalido.');
                                    }
                                    for(var i = 0; i < superBot.room.users.length; i++){
                                        userTime = superBot.userUtilities.getLastActivity(superBot.room.users[i]);
                                        if((now - userTime) <= (time * 60 * 1000)){
                                        chatters++;
                                        }
                                    }
                                    API.sendChat('/me [@' + chat.from + '] Estiveram aqui ' + chatters + ' pessoas conversando nos ultimos ' + time + ' minutos.');
                                };                              
                        },
                },

                addCommand: {
                        rank: 'mod',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if(msg.length === cmd.length) return API.sendChat('/me [@' + chat.from + '] Nenhum Usuario Especificado.');
                                    var name = msg.substr(cmd.length + 2);   
                                    var user = superBot.userUtilities.lookupUserName(name);
                                    if (msg.length > cmd.length + 2) {
                                        if (typeof user !== 'undefined') {
                                            if(superBot.room.roomevent){
                                                superBot.room.eventArtists.push(user.id);
                                            }
                                            superBot.userUtilities.moveUser(user.id, 0, false);
                                        } else API.sendChat('/me [@' + chat.from + '] Usuario Invalido');
                                      }
                                };                              
                        },
                },

                afklimitCommand: {
                        rank: 'manager',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if(msg.length === cmd.length) return API.sendChat('/me [@' + chat.from + '] Limite não especificado');
                                    var limit = msg.substring(cmd.length + 1);
                                    if(!isNaN(limit)){
                                        superBot.roomSettings.maximumAfk = parseInt(limit, 10);
                                        API.sendChat('/me [@' + chat.from + '] Maximo Tempo AFK definido para ' + superBot.roomSettings.maximumAfk + ' minutos.');
                                    }
                                    else API.sendChat('/me [@' + chat.from + '] Limite Invalido.');
                                };                              
                        },
                },

                afkremovalCommand: {
                        rank: 'mod',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBot.roomSettings.afkRemoval){
                                        superBot.roomSettings.afkRemoval = !superBot.roomSettings.afkRemoval;
                                        clearInterval(superBot.room.afkInterval);
                                        API.sendChat('/me [@' + chat.from + '] AFK Remove está desativado.');
                                      }
                                    else {
                                        superBot.roomSettings.afkRemoval = !superBot.roomSettings.afkRemoval;
                                        superBot.room.afkInterval = setInterval(function(){superBot.roomUtilities.afkCheck()}, 2 * 1000);
                                        API.sendChat('/me [@' + chat.from + '] AFK Remove está ativado.');
                                      }
                                };                              
                        },
                },

                afkresetCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if(msg.length === cmd.length) return API.sendChat('/me [@' + chat.from + '] No user specified.')
                                    var name = msg.substring(cmd.length + 2);
                                    var user = superBot.userUtilities.lookupUserName(name);
                                    if(typeof user === 'boolean') return API.sendChat('/me [@' + chat.from + '] Invalid user specified.');
                                    superBot.userUtilities.setLastActivity(user);
                                    API.sendChat('/me [@' + chat.from + '] Reset the afk status of @' + name + '.');
                                };                              
                        },
                },

                afktimeCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{                                    
                                    var msg = chat.message;
                                    if(msg.length === cmd.length) return API.sendChat('/me [@' + chat.from + '] No user specified.');
                                    var name = msg.substring(cmd.length + 2);
                                    var user = superBot.userUtilities.lookupUserName(name);
                                    if(typeof user === 'boolean') return API.sendChat('/me [@' + chat.from + '] Invalid user specified.');
                                    var lastActive = superBot.userUtilities.getLastActivity(user);
                                    var inactivity = Date.now() - lastActive;
                                    var time = superBot.roomUtilities.msToStr(inactivity);
                                    API.sendChat('/me [@' + chat.from + '] @' + name + ' esteve inativo durante ' + time + '.');
                                };                              
                        },
                },
                
                autoskipCommand: {
                        rank: 'mod',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBot.roomSettings.autoskip){
                                        superBot.roomSettings.autoskip = !superBot.roomSettings.autoskip;
                                        clearTimeout(superBot.room.autoskipTimer);
                                        return API.sendChat('/me [@' + chat.from + '] Autoskip desativado.');
                                    }
                                    else{
                                        superBot.roomSettings.autoskip = !superBot.roomSettings.autoskip;
                                        return API.sendChat('/me [@' + chat.from + '] Autoskip ativado.');
                                    }
                                };                              
                        },
                },

                autowootCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    API.sendChat("/me Nos Recomendamos TastyPlug para AutoWoot : http://fungustime.pw/tastyplug/ ")
                                };                              
                        },
                },

                baCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    API.sendChat("/me A Brand Ambassador is the voice of the plug.dj users. They promote events, engage the community and share the plug.dj message around the world. For more info: http://blog.plug.dj/brand-ambassadors/");
                                };                              
                        },
                },

                banCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if(msg.length === cmd.length) return API.sendChat('/me [@' + chat.from + '] No valid user specified.');
                                    var name = msg.substr(cmd.length + 2);
                                    var user = superBot.userUtilities.lookupUserName(name);
                                    if(typeof user === 'boolean') return API.sendChat('/me [@' + chat.from + '] Invalid user specified.');
                                    API.sendChat('/me [' + chat.from + ' whips out the banhammer :hammer:]');
                                    API.moderateBanUser(user.id, 1, API.BAN.DAY);
                                };                              
                        },
                },

                bouncerPlusCommand: {
                        rank: 'mod',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if(superBot.roomSettings.bouncerPlus){
                                        superBot.roomSettings.bouncerPlus = false;
                                        return API.sendChat('/me [@' + chat.from + '] Bouncer+ está agora desativado.');
                                        }
                                    else{ 
                                        if(!superBot.roomSettings.bouncerPlus){
                                            var id = chat.fromID;
                                            var perm = superBot.userUtilities.getPermission(id);
                                            if(perm > 2){
                                                superBot.roomSettings.bouncerPlus = true;
                                                return API.sendChat('/me [@' + chat.from + '] Bouncer+ está agora ativado.');
                                            }
                                        }
                                        else return API.sendChat('/me [@' + chat.from + '] Você tem que ser Coordenador Ou + Para ativar Bouncer+.');
                                    };
                                };                              
                        },
                },

                clearchatCommand: {
                        rank: 'manager',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var currentchat = $('#chat-messages').children();       
                                    for (var i = 0; i < currentchat.length; i++) {
                                        for (var j = 0; j < currentchat[i].classList.length; j++) {
                                            if (currentchat[i].classList[j].indexOf('cid-') == 0) 
                                                API.moderateDeleteChat(currentchat[i].classList[j].substr(4));
                                        }
                                    }                                 
                                return API.sendChat('/me [@' + chat.from + '] Apanga tudo.');
                                
                                };                              
                        },
                },

                commandsCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    API.sendChat("/me "+ superBot.name + " Comandos: " + superBot.cmdLink);
                                };                              
                        },
                },

                cookieCommand: {
                        rank: 'user',
                        type: 'startsWith',

                        cookies: ['has given you a chocolate chip cookie!',
                                   'has given you a soft homemade oatmeal cookie!',
                                   'has given you a plain, dry, old cookie. It was the last one in the bag. Gross.',
                                   'gives you a sugar cookie. What, no frosting and sprinkles? 0/10 would not touch.',
                                   'gives you a chocolate chip cookie. Oh wait, those are raisins. Bleck!',
                                   'gives you an enormous cookie. Poking it gives you more cookies. Weird.',
                                   'gives you a fortune cookie. It reads "Why aren\'t you working on any projects?"',
                                   'gives you a fortune cookie. It reads "Give that special someone a compliment"',
                                   'gives you a fortune cookie. It reads "Take a risk!"',
                                   'gives you a fortune cookie. It reads "Go outside."',
                                   'gives you a fortune cookie. It reads "Don\'t forget to eat your veggies!"',
                                   'gives you a fortune cookie. It reads "Do you even lift?"',
                                   'gives you a fortune cookie. It reads "m808 pls"',
                                   'gives you a fortune cookie. It reads "If you move your hips, you\'ll get all the ladies."',
                                   'gives you a fortune cookie. It reads "I love you."',
                                   'gives you a Golden Cookie. You can\'t eat it because it is made of gold. Dammit.',
                                   'gives you an Oreo cookie with a glass of milk!',
                                   'gives you a rainbow cookie made with love :heart:',
                                   'gives you an old cookie that was left out in the rain, it\'s moldy.',
                                   'bakes you fresh cookies, it smells amazing.'
                            ],

                        getCookie: function() {
                            var c = Math.floor(Math.random() * this.cookies.length);
                            return this.cookies[c];
                        },

                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
      
                                    var space = msg.indexOf(' ');
                                    if(space === -1){ 
                                        API.sendChat('/em come um cookie.');
                                        return false;
                                    }
                                    else{
                                        var name = msg.substring(space + 2);
                                        var user = superBot.userUtilities.lookupUserName(name);
                                        if (user === false || !user.inRoom) {
                                          return API.sendChat("/em não vê '" + name + "' na sala e come o seu cookie.");
                                        } 
                                        else if(user.username === chat.from){
                                            return API.sendChat("/me @" + name +  ", you're a bit greedy, aren't you? Giving cookies to yourself, bah. Share some with other people!")
                                        }
                                        else {
                                            return API.sendChat("/me @" + user.username + ", @" + chat.from + ' ' + this.getCookie() );
                                        }
                                    }
                                
                                };                              
                        },
                },

                cycleCommand: {
                        rank: 'manager',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    superBot.roomUtilities.changeDJCycle();
                                };                              
                        },
                },

                cycleguardCommand: {
                        rank: 'bouncer',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBot.roomSettings.cycleGuard){
                                        superBot.roomSettings.cycleGuard = !superBot.roomSettings.cycleGuard;
                                        return API.sendChat('/me [@' + chat.from + '] CycleGuard desativado.');
                                    }
                                    else{
                                        superBot.roomSettings.cycleGuard = !superBot.roomSettings.cycleGuard;
                                        return API.sendChat('/me [@' + chat.from + '] CycleGuard ativado.');
                                    }
                                
                                };                              
                        },
                },

                cycletimerCommand: {
                        rank: 'manager',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    var cycleTime = msg.substring(cmd.length + 1);
                                    if(!isNaN(cycleTime)){
                                        superBot.roomSettings.maximumCycletime = cycleTime;
                                        return API.sendChat('/me [@' + chat.from + '] O CycleGuard está definido para ' + superBot.roomSettings.maximumCycletime + ' minuto(s).');
                                    }
                                    else return API.sendChat('/me [@' + chat.from + '] Nenhum tempo correto definido para o CycleGuard.');
                                
                                };                              
                        },
                },

                dclookupCommand: {
                        rank: 'user',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    var name;
                                    if(msg.length === cmd.length) name = chat.from;
                                    else{ 
                                        name = msg.substring(cmd.length + 2);
                                        var perm = superBot.userUtilities.getPermission(chat.fromID);
                                        if(perm < 2) return API.sendChat('/me [@' + chat.from + '] Only bouncers and above can do !dclookup for others.');
                                    }    
                                    var user = superBot.userUtilities.lookupUserName(name);
                                    if(typeof user === 'boolean') return API.sendChat('/me [@' + chat.from + '] Invalid user specified.');
                                    var id = user.id;
                                    var toChat = superBot.userUtilities.dclookup(id);
                                    API.sendChat(toChat);
                                };                              
                        },
                },

                emojiCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    API.sendChat('/me Lista De Emoji: http://www.emoji-cheat-sheet.com/');
                                };                              
                        },
                },

                englishCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                                    var name = chat.message.substring(cmd.length + 2);
                                    var user = superBot.userUtilities.lookupUserName(name);
                                    if(typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                                    var lang = superBot.userUtilities.getUser(user).language;
                                    var ch = '/me @' + name + ' ';
                                    switch(lang){
                                        case 'en': break;
                                        case 'da': ch += 'Vær venlig at tale engelsk.'; break;
                                        case 'de': ch += 'Bitte sprechen Sie Englisch.'; break;
                                        case 'es': ch += 'Por favor, hable Inglés.'; break;
                                        case 'fr': ch += 'Parlez anglais, s\'il vous plaît.'; break;
                                        case 'nl': ch += 'Spreek Engels, alstublieft.'; break;
                                        case 'pl': ch += 'Proszę mówić po angielsku.'; break;
                                        case 'pt': ch += 'Por favor, fale Inglês.'; break;
                                        case 'sk': ch += 'Hovorte po anglicky, prosím.'; break;
                                        case 'cs': ch += 'Mluvte prosím anglicky.'; break;
                                        case 'sr': ch += 'Молим Вас, говорите енглески.'; break;                                  
                                    }
                                    ch += ' English please.';
                                    API.sendChat(ch);
                                };                              
                        },
                },

                etaCommand: {
                        rank: 'user',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var perm = superBot.userUtilities.getPermission(chat.fromID);
                                    var msg = chat.message;
                                    var name;
                                    if(msg.length > cmd.length){
                                        if(perm < 2) return void (0);
                                        name = msg.substring(cmd.length + 2);
                                      } else name = chat.from;
                                    var user = superBot.userUtilities.lookupUserName(name);
                                    if(typeof user === 'boolean') return API.sendChat('/me [@' + chat.from + '] Usuario Invalido.');
                                    var pos = API.getWaitListPosition(user.id);
                                    if(pos < 0) return API.sendChat('/me @' + name + ', você não está na lista de espera.');
                                    var timeRemaining = API.getTimeRemaining();
                                    var estimateMS = ((pos+1) * 4 * 60 + timeRemaining) * 1000;
                                    var estimateString = superBot.roomUtilities.msToStr(estimateMS);
                                    API.sendChat('/me @' + name + ' Você vai chegar a Cabine De Dj em, aproximadamente ' + estimateString + '.');                       
                                };                              
                        },
                },

                fbCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(typeof superBot.roomSettings.fbLink === "string")
                                        API.sendChat('/me [' + chat.from + '] Entre no nosso grupo : ' + superBot.roomSettings.fbLink);
                                };                              
                        },
                },

                filterCommand: {
                        rank: 'bouncer',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBot.roomSettings.filterChat){
                                        superBot.roomSettings.filterChat = !superBot.roomSettings.filterChat;
                                        return API.sendChat('/me [@' + chat.from + '] Filtro de Chat desativado.');
                                    }
                                    else{
                                        superBot.roomSettings.filterChat = !superBot.roomSettings.filterChat;
                                        return API.sendChat('/me [@' + chat.from + '] Filtro de Chat ativado.');
                                    } 
                                
                                };                              
                        },
                },

                joinCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBot.room.roulette.rouletteStatus && superBot.room.roulette.participants.indexOf(chat.fromID) < 0){
                                        superBot.room.roulette.participants.push(chat.fromID);
                                        API.sendChat("/me @" + chat.from + " entrou na loteria! (!leave se quiser desistir.)");
                                    }
                                };                              
                        },
                },

                jointimeCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if(msg.length === cmd.length) return API.sendChat('/me [@' + chat.from + '] No user specified.');
                                    var name = msg.substring(cmd.length + 2);
                                    var user = superBot.userUtilities.lookupUserName(name);
                                    if(typeof user === 'boolean') return API.sendChat('/me [@' + chat.from + '] Invalid user specified.');
                                    var join = superBot.userUtilities.getJointime(user);
                                    var time = Date.now() - join;
                                    var timeString = superBot.roomUtilities.msToStr(time);
                                    API.sendChat('/me [@' + chat.from + '] @' + name + ' Esteve na sala durante ' + timeString + '.');
                                };                              
                        },
                },

                kickCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    var lastSpace = msg.lastIndexOf(' ');
                                    var time;
                                    var name;
                                    if(lastSpace === msg.indexOf(' ')){
                                        time = 0.25;
                                        name = msg.substring(cmd.length + 2);
                                        }    
                                    else{
                                        time = msg.substring(lastSpace + 1);
                                        name = msg.substring(cmd.length + 2, lastSpace);
                                    }
                                    
                                    var user = superBot.userUtilities.lookupUserName(name);
                                    var from = chat.from;
                                    if(typeof user === 'boolean') return API.sendChat('/me [@' + chat.from + '] Usuario invalido.');

                                    var permFrom = superBot.userUtilities.getPermission(chat.fromID);
                                    var permTokick = superBot.userUtilities.getPermission(user.id);

                                    if(permFrom <= permTokick)
                                        return API.sendChat("/me [@" + chat.from + "] Voce não pode expulsar usuarios com cargo igual ou maior que você!")

                                    if(!isNaN(time)){
                                        API.sendChat('/me [' + chat.from + ' used kick, it\'s super effective!]');
                                        API.sendChat('/me [@' + name + '], Você será expulso da comunidade por ' + time + ' minutos.');

                                        if(time > 24*60*60) API.moderateBanUser(user.id, 1 , API.BAN.PERMA);
                                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                                        setTimeout(function(id, name){ 
                                            API.moderateUnbanUser(id); 
                                            console.log('Unbanned @' + name + '.'); 
                                            }, time * 60 * 1000, user.id, name);
                                        
                                    }

                                    else API.sendChat('/me [@' + chat.from + '] Tempo invalido (minutos) definido.');                                   
                                };                              
                        },
                },

                diebotCommand: {
                        rank: 'bouncer',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    storeToStorage();
                                    API.sendChat('/me SuperBot is dead :joy: .');
                                    superBot.disconnectAPI();
                                    setTimeout(function(){diebot();},1000);
                                };                              
                        },
                },

                leaveCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var ind = superBot.room.roulette.participants.indexOf(chat.fromID);
                                    if(ind > -1){
                                        superBot.room.roulette.participants.splice(ind, 1);
                                        API.sendChat("/me @" + chat.from + " saiu da loteria!");
                                    }
                                };                              
                        },
                },

                linkCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var media = API.getMedia();
                                    var from = chat.from;
                                    var user = superBot.userUtilities.lookupUser(chat.fromID);
                                    var perm = superBot.userUtilities.getPermission(chat.fromID);
                                    var dj = API.getDJ().id;
                                    var isDj = false;
                                    if (dj === chat.fromID) isDj = true;
                                    if(perm >= 1 || isDj){
                                        if(media.format === '1'){
                                            var linkToSong = "https://www.youtube.com/watch?v=" + media.cid;
                                            API.sendChat('/me [' + from + '] Link para a música atual : ' + linkToSong);
                                        }
                                        if(media.format === '2'){
                                            var SCsource = '/tracks/' + media.cid;
                                            SC.get('/tracks/' + media.cid, function(sound){API.sendChat('/me [' + from + '] Link para a música atual : ' + sound.permalink_url);});
                                        }   
                                    }                    
                                
                                
                                };                              
                        },
                },

                lockCommand: {
                        rank: 'mod',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    superBot.roomUtilities.booth.lockBooth();
                                };                              
                        },
                },

                lockdownCommand: {
                        rank: 'mod',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var temp = superBot.roomSettings.lockdownEnabled;
                                    superBot.roomSettings.lockdownEnabled = !temp;
                                    if(superBot.roomSettings.lockdownEnabled){
                                        return API.sendChat("/me [@" + chat.from + "] Lockdown ativado. Agora apenas staff pode conversar.");
                                    }
                                    else return API.sendChat('/me [@' + chat.from + '] Lockdown desativado.');
                                
                                };                              
                        },
                },

                lockguardCommand: {
                        rank: 'bouncer',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBot.roomSettings.lockGuard){
                                        superBot.roomSettings.lockGuard = !superBot.roomSettings.lockGuard;
                                        return API.sendChat('/me [@' + chat.from + '] Lockguard desativado.');
                                    }
                                    else{
                                        superBot.roomSettings.lockGuard = !superBot.roomSettings.lockGuard;
                                        return API.sendChat('/me [@' + chat.from + '] Lockguard ativado.');
                                    } 
                                
                                };                              
                        },
                },

                lockskipCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBot.room.skippable){

                                        var dj = API.getDJ();
                                        var id = dj.id;
                                        var name = dj.username;
                                        var msgSend = '@' + name + ': ';

                                        superBot.room.queueable = false;

                                        if(chat.message.length === cmd.length){
                                            API.sendChat('/me [' + chat.from + ' usou LockSkip.]');
                                            superBot.roomUtilities.booth.lockBooth();
                                            //superBot.roomUtilities.changeDJCycle();
                                            setTimeout(function(id){
                                                API.moderateForceSkip();
                                                superBot.room.skippable = false;
                                                setTimeout(function(){ superBot.room.skippable = true}, 5*1000);
                                                setTimeout(function(id){
                                                    superBot.userUtilities.moveUser(id, superBot.roomSettings.lockskipPosition, false);
                                                    superBot.room.queueable = true;
                                                    setTimeout(function(){superBot.roomUtilities.booth.unlockBooth();}, 1000);
                                                    //superBot.roomUtilities.changeDJCycle();
                                                    
                                                },1500, id);
                                            }, 1000, id);

                                            return void (0);

                                        }
                                        var validReason = false;
                                        var msg = chat.message;
                                        var reason = msg.substring(cmd.length + 1);       
                                        for(var i = 0; i < superBot.roomSettings.lockskipReasons.length; i++){
                                            var r = superBot.roomSettings.lockskipReasons[i][0];
                                            if(reason.indexOf(r) !== -1){
                                                validReason = true;
                                                msgSend += superBot.roomSettings.lockskipReasons[i][1];
                                            }
                                        }
                                        if(validReason){
                                            API.sendChat('/me [' + chat.from + ' usou LockSkip.]');
                                            superBot.roomUtilities.booth.lockBooth();
                                            //superBot.roomUtilities.changeDJCycle();
                                            setTimeout(function(id){
                                                API.moderateForceSkip();
                                                superBot.room.skippable = false;
                                                API.sendChat(msgSend);
                                                setTimeout(function(){ superBot.room.skippable = true}, 5*1000);
                                                setTimeout(function(id){
                                                    superBot.userUtilities.moveUser(id, superBot.roomSettings.lockskipPosition, false);
                                                    superBot.room.queueable = true;
                                                    setTimeout(function(){superBot.roomUtilities.booth.unlockBooth();}, 1000);
                                                    //superBot.roomUtilities.changeDJCycle();
                                                    
                                                },1500, id);
                                            }, 1000, id);

                                            return void (0);
                                        }
                                                                                
                                    }
                                }                              
                        },
                },

                lockskipposCommand: {
                        rank: 'manager',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    var pos = msg.substring(cmd.length + 1);
                                    if(!isNaN(pos)){
                                        superBot.roomSettings.lockskipPosition = pos;
                                        return API.sendChat('/me [@' + chat.from + '] LockSkip irá mover o DJ para a posição ' + superBot.roomSettings.lockskipPosition + '.');
                                    }
                                    else return API.sendChat('/me [@' + chat.from + '] Posição invalida.');
                                };                              
                        },
                },

                locktimerCommand: {
                        rank: 'manager',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    var lockTime = msg.substring(cmd.length + 1);
                                    if(!isNaN(lockTime)){
                                        superBot.roomSettings.maximumLocktime = lockTime;
                                        return API.sendChat('/me [@' + chat.from + '] O LockGuard está definido para ' + superBot.roomSettings.maximumLocktime + ' minuto(s).');
                                    }
                                    else return API.sendChat('/me [@' + chat.from + '] Sem tempo correto definido para o LockGuard.');
                                };                              
                        },
                },

                maxlengthCommand: {
                        rank: 'manager',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    var maxTime = msg.substring(cmd.length + 1);
                                    if(!isNaN(maxTime)){
                                        superBot.roomSettings.maximumSongLength = maxTime;
                                        return API.sendChat('/me [@' + chat.from + '] O Maximo Tempo para Músicas foi definida para ' +superBot superBot.roomSettings.maximumSongLength + ' minutos.');
                                    }
                                    else return API.sendChat('/me [@' + chat.from + '] Sem Tempo Correcto Definido.');
                                };                              
                        },
                },

                motdCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if(msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + superBot.roomSettings.motd);
                                    var argument = msg.substring(cmd.length + 1);
                                    if(!superBot.roomSettings.motdEnabled) superBot.roomSettings.motdEnabled = !superBot.roomSettings.motdEnabled;
                                    if(isNaN(argument)){
                                        superBot.roomSettings.motd = argument;
                                        API.sendChat("/me MotD definido para : " + superBot.roomSettings.motd);
                                    }
                                    else{
                                        superBot.roomSettings.motdInterval = argument;
                                        API.sendChat('/me Intervalo de MotD definido para : ' + superBot.roomSettings.motdInterval + '.');
                                    }
                                };                              
                        },
                },

                moveCommand: {
                        rank: 'mod',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if(msg.length === cmd.length) return API.sendChat('/me [@' + chat.from + '] Nenhum usuario especificado.');
                                    var firstSpace = msg.indexOf(' ');
                                    //var secondSpace = msg.substring(firstSpace + 1).indexOf(' ');
                                    var lastSpace = msg.lastIndexOf(' ');
                                    var pos;
                                    var name;
                                    if(isNaN(parseInt(msg.substring(lastSpace + 1))) ){
                                        pos = 1;
                                        name = msg.substring(cmd.length + 2);
                                    }
                                    else{
                                        pos = parseInt(msg.substring(lastSpace + 1));
                                        name = msg.substring(cmd.length + 2,lastSpace);
                                    }
                                    var user = superBot.userUtilities.lookupUserName(name);
                                    if(typeof user === 'boolean') return API.sendChat('/me [@' + chat.from + '] Usuario Invalido.');
                                    if(user.id === superBot.loggedInID) return API.sendChat('/me [@' + chat.from + '] Por favor, Nao tente me adicionar na lista de espera.');
                                    if (!isNaN(pos)) {
                                        API.sendChat('/me [' + chat.from + ' usou move.]');
                                        superBot.userUtilities.moveUser(user.id, pos, false); 
                                    } else return API.sendChat('/me [@' + chat.from + '] Posição Invalida.');
                                };                           
                        },
                },

                muteCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if(msg.length === cmd.length) return API.sendChat('/me [@' + chat.from + '] Nenhum User Especificado :warning:.');
                                    var lastSpace = msg.lastIndexOf(' ');
                                    var time = null;
                                    var name;
                                    if(lastSpace === msg.indexOf(' ')){
                                        name = msg.substring(cmd.length + 2);
                                        }    
                                    else{
                                        time = msg.substring(lastSpace + 1);
                                        if(isNaN(time)){
                                            return API.sendChat('/me [@' + chat.from + '] Tempo Invalido :warning: .');
                                        }
                                        name = msg.substring(cmd.length + 2, lastSpace);
                                    }
                                    var from = chat.from;
                                    var user = superBot.userUtilities.lookupUserName(name);
                                    if(typeof user === 'boolean') return API.sendChat('/me [@' + chat.from + '] Usuario Invalido :warning: .');
                                    var permFrom = superBot.userUtilities.getPermission(chat.fromID);
                                    var permUser = superBot.userUtilities.getPermission(user.id);
                                    if(permFrom > permUser){
                                        superBot.room.mutedUsers.push(user.id);
                                        if(time === null) API.sendChat('/me [@' + chat.from + '] Mutou @' + name + ' :no_mouth: .');
                                        else{
                                            API.sendChat('/me [@' + chat.from + '] Mutou @' + name + ' for ' + time + ' minutos :no_mouth:.');
                                            setTimeout(function(id){
                                                var muted = superBot.room.mutedUsers;
                                                var wasMuted = false;
                                                var indexMuted = -1;
                                                for(var i = 0; i < muted.length; i++){
                                                    if(muted[i] === id){
                                                        indexMuted = i;
                                                        wasMuted = true;
                                                    }
                                                }
                                                if(indexMuted > -1){
                                                    superBot.room.mutedUsers.splice(indexMuted);
                                                    var u = superBot.userUtilities.lookupUser(id);
                                                    var name = u.username;
                                                    API.sendChat('/me [@' + chat.from + '] Desmutado @' + name + '.');
                                                }
                                            }, time * 60 * 1000, user.id);
                                        } 
                                    }
                                    else API.sendChat("/me [@" + chat.from + "] Você não pode mutar pessoas com o cargo igual ou maior que você :warning: .");
                                };                              
                        },
                },

                opCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(typeof superBot.roomSettings.opLink === "string")
                                        return API.sendChat("/me Lista OP : " + superBot.roomSettings.opLink);
                                    
                                };                              
                        },
                },

                pingCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    API.sendChat('/me Pong! :yum: ')
                                };                              
                        },
                },

                refreshCommand: {
                        rank: 'manager',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    storeToStorage();
                                    superBot.disconnectAPI();
                                    setTimeout(function(){
                                    window.location.reload(false);
                                        },1000);
                                
                                };                              
                        },
                },

                reloadCommand: {
                        rank: 'bouncer',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    API.sendChat('/me Reiniciando SuperBot.. :yum: .');
                                    superBot.disconnectAPI();
                                    diebot();
                                    setTimeout(function(){$.getScript(superBot.scriptLink);},2000);
                                };                              
                        },
                },

                removeCommand: {
                        rank: 'mod',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if (msg.length > cmd.length + 2) {
                                        var name = msg.substr(cmd.length + 2);
                                        var user = superBot.userUtilities.lookupUserName(name);
                                        if (typeof user !== 'boolean') {
                                            user.lastDC = {
                                                time: null,
                                                position: null,
                                                songCount: 0,
                                            };
                                            API.moderateRemoveDJ(user.id);                                          
                                        } else API.sendChat("/me [@" + chat.from + "] Usuario Especificado @" + name + " não está na lista de espera .");
                                      } else API.sendChat("/me [@" + chat.from + "] Nenhum Usuario especificado.");
                                
                                };                              
                        },
                },

                restrictetaCommand: {
                        rank: 'bouncer',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBot.roomSettings.etaRestriction){
                                        superBot.roomSettings.etaRestriction = !superBot.roomSettings.etaRestriction;
                                        return API.sendChat('/me [@' + chat.from + '] eta não restrito.');
                                    }
                                    else{
                                        superBot.roomSettings.etaRestriction = !superBot.roomSettings.etaRestriction;
                                        return API.sendChat('/me [@' + chat.from + '] eta restrito.');
                                    } 
                                
                                };                              
                        },
                },

                rouletteCommand: {
                        rank: 'mod',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(!superBot.room.roulette.rouletteStatus){
                                        superBot.room.roulette.startRoulette();
                                    }
                                };                              
                        },
                },

                rulesCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(typeof superBot.roomSettings.rulesLink === "string")
                                        return API.sendChat("/me Encontre as regras da sala aqui : " + superBot.roomSettings.rulesLink);                                
                                };                              
                        },
                },

                sessionstatsCommand: {
                        rank: 'bouncer',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var from = chat.from;
                                    var woots = superBot.room.roomstats.totalWoots;
                                    var mehs = superBot.room.roomstats.totalMehs;
                                    var grabs = superBot.room.roomstats.totalCurates;
                                    API.sendChat('/me [@' + from + '] :heavy_check_mark: : ' + woots + ', :heavy_minus_sign: : ' + mehs + ', :heavy_plus_sign: : ' + grabs + '.');
                                };                              
                        },
                },

                skipCommand: {
                        rank: 'bouncer',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    API.sendChat('/me [' + chat.from + ' usou skip.]');
                                    API.moderateForceSkip();
                                    superBot.room.skippable = false;
                                    setTimeout(function(){ superBot.room.skippable = true}, 5*1000);
                                
                                };                              
                        },
                },  

                sourceCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    API.sendChat('/me Este Bot foi criado por ' + superBot.creator + '.');
                                };                              
                        },
                },

                statusCommand: {
                        rank: 'bouncer',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var from = chat.from
                                    var msg = '/me [@' + from + '] ';
                                      
                                    msg += 'AFK removal: ';
                                    if(superBot.roomSettings.afkRemoval) msg += 'ON';
                                    else msg += 'OFF';
                                    msg += '. ';
                                    msg += "AFK's removidos: " + superBot.room.afkList.length + '. ';
                                    msg += 'Tempo AFK Limite: ' + superBot.roomSettings.maximumAfk + '. ';
                                     
                                    msg+= 'Bouncer+: '
                                    if(superBot.roomSettings.bouncerPlus) msg += 'ON';
                                    else msg += 'OFF';
                                    msg += '. ';

                                    msg+= 'Lockguard: '
                                    if(superBot.roomSettings.lockGuard) msg += 'ON';
                                    else msg += 'OFF';
                                    msg += '. ';

                                    msg+= 'Cycleguard: '
                                    if(superBot.roomSettings.cycleGuard) msg += 'ON';
                                    else msg += 'OFF';
                                    msg += '. ';

                                    msg+= 'Timeguard: '
                                    if(superBot.roomSettings.timeGuard) msg += 'ON';
                                    else msg += 'OFF';
                                    msg += '. ';

                                    msg+= 'Filtro de Chat: '
                                    if(superBot.roomSettings.filterChat) msg += 'ON';
                                    else msg += 'OFF';
                                    msg += '. ';

                                    var launchT = superBot.room.roomstats.launchTime;
                                    var durationOnline = Date.now() - launchT;
                                    var since = superBot.roomUtilities.msToStr(durationOnline);
                                    msg += 'Estive ativo durante ' + since + '. ';
                                      
                                     return API.sendChat(msg);
                                };                              
                        },
                },
                
                swapCommand: {
                        rank: 'mod',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if(msg.length === cmd.length) return API.sendChat('/me [@' + chat.from + '] Usuario não especificado.');
                                    var firstSpace = msg.indexOf(' ');
                                    //var secondSpace = msg.substring(firstSpace + 1).indexOf(' ');
                                    var lastSpace = msg.lastIndexOf(' ');
                                    var name1 = msg.substring(cmd.length + 2,lastSpace);
                                    var name2 = msg.substring(lastSpace + 2);
                                    var user1 = superBot.userUtilities.lookupUserName(name1);
                                    var user2 = superBot.userUtilities.lookupUserName(name2);
                                    if(typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat('/me [@' + chat.from + '] Usuario Invalido (Sem Nomes com espaços!)');
                                    if(user1.id === superBot.loggedInID || user2.id === superBot.loggedInID) return API.sendChat('/me [@' + chat.from + '] Por favor, não tentem me adicionar na lista de espera.');
                                    var p1 = API.getWaitListPosition(user1.id);
                                    var p2 = API.getWaitListPosition(user2.id);
                                    if(p1 < 0 || p2 < 0) return API.sendChat('/me [@' + chat.from + '] Por favor, só troque usuarios que estejam na lista de espera!');
                                    API.sendChat("/me Trocando " + name1 + " com " + name2 + ".");
                                    if(p1 < p2){
                                        superBot.userUtilities.moveUser(user2.id, p1, false);
                                        setTimeout(function(user1, p2){
                                            superBot.userUtilities.moveUser(user1.id, p2, false);
                                        },2000, user1, p2);
                                    }
                                    else{
                                        superBot.userUtilities.moveUser(user1.id, p2, false);
                                        setTimeout(function(user2, p1){
                                            superBot.userUtilities.moveUser(user2.id, p1, false);
                                        },2000, user2, p1);
                                    }
                                };
                        },
                },

                themeCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(typeof superBot.roomSettings.themeLink === "string")
                                        API.sendChat("/me Encontre os Temas Permitidos na sala, aqui : " + superBot.roomSettings.themeLink);
                                
                                };                              
                        },
                },

                timeguardCommand: {
                        rank: 'bouncer',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBot.roomSettings.timeGuard){
                                        superBot.roomSettings.timeGuard = !superBot.roomSettings.timeGuard;
                                        return API.sendChat('/me [@' + chat.from + '] Timeguard desativado.');
                                    }
                                    else{
                                        superBot.roomSettings.timeGuard = !superBot.roomSettings.timeGuard;
                                        return API.sendChat('/me [@' + chat.from + '] Timeguard ativado.');
                                    } 
                                
                                };                              
                        },
                },

                togglemotdCommand: {
                        rank: 'bouncer',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBot.roomSettings.motdEnabled){
                                        superBot.roomSettings.motdEnabled = !superBot.roomSettings.motdEnabled;
                                        API.sendChat('/me MotD desativado.');
                                    }
                                    else{
                                        superBot.roomSettings.motdEnabled = !superBot.roomSettings.motdEnabled;
                                        API.sendChat('/me MotD ativado.');
                                    }
                                };                              
                        },
                },

                unbanCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    $(".icon-population").click();
                                    $(".icon-ban").click();
                                    setTimeout(function(chat){
                                        var msg = chat.message;
                                        if(msg.length === cmd.length) return API.sendChat()
                                        var name = msg.substring(cmd.length + 2);
                                        var bannedUsers = API.getBannedUsers();
                                        var found = false;
                                        for(var i = 0; i < bannedUsers.length; i++){
                                            var user = bannedUsers[i];
                                            if(user.username === name){
                                                id = user.id;
                                                found = true;
                                            }
                                          }
                                        if(!found){
                                            $(".icon-chat").click();
                                            return API.sendChat('/me [@' + chat.from + '] O usuario não foi banido. :warning: ');  
                                        }                                
                                        API.moderateUnbanUser(user.id);
                                        console.log("Desbanido: " + name);
                                        setTimeout(function(){
                                            $(".icon-chat").click();
                                        },1000);
                                    },1000,chat);
                                };                              
                        },
                },

                unlockCommand: {
                        rank: 'mod',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    superBot.roomUtilities.booth.unlockBooth();
                                };                              
                        },
                },

                unmuteCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    var permFrom = superBot.userUtilities.getPermission(chat.fromID);
                                      
                                    if(msg.indexOf('@') === -1 && msg.indexOf('all') !== -1){
                                        if(permFrom > 2){
                                            superBot.room.mutedUsers = [];
                                            return API.sendChat('/me [@' + chat.from + '] Desmutou Todos.');
                                        }
                                        else return API.sendChat('/me [@' + chat.from + '] Apenas Coordenadores ou + podem desmutar todos de uma vez. :warning: ')
                                    }
                                      
                                    var from = chat.from;
                                    var name = msg.substr(cmd.length + 2);

                                    var user = superBot.userUtilities.lookupUserName(name);
                                      
                                    if(typeof user === 'boolean') return API.sendChat("/me Usuario Invalido. :warning:");
                                    
                                    var permUser = superBot.userUtilities.getPermission(user.id);
                                    if(permFrom > permUser){

                                        var muted = superBot.room.mutedUsers;
                                        var wasMuted = false;
                                        var indexMuted = -1;
                                        for(var i = 0; i < muted.length; i++){
                                            if(muted[i] === user.id){
                                                indexMuted = i;
                                                wasMuted = true;
                                            }

                                        }
                                        if(!wasMuted) return API.sendChat("/me [@" + chat.from + "] esse usuario não foi mutado. :warning: ");
                                        superBot.room.mutedUsers.splice(indexMuted);
                                        API.sendChat('/me [@' + chat.from + '] Desmutou @' + name + '.');
                                    }
                                    else API.sendChat("/me [@" + chat.from + "] :warning: Você não pode Desmutar pessoas com cargo igual ou maior que você");
                                    
                                };                              
                        },
                },

                usercmdcdCommand: {
                        rank: 'manager',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBotsuperBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    var cd = msg.substring(cmd.length + 1);
                                    if(!isNaN(cd)){
                                        superBotsuperBot.roomSettings.commandCooldown = cd;
                                        return API.sendChat('/me [@' + chat.from + '] O CoolDown para comandos de users está agora definido para ' + superBot.roomSettings.commandCooldown + ' segundos.');
                                    }
                                    else return API.sendChat('/me [@' + chat.from + '] :warning: CoolDown Definido Incorreto.');
                                
                                };                              
                        },
                },

                usercommandsCommand: {
                        rank: 'manager',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBotsuperBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBotsuperBot.roomSettings.usercommandsEnabled){
                                        API.sendChat('/me [@' + chat.from + '] :warning: Comandos de User desativados.');
                                        superBotsuperBot.roomSettings.usercommandsEnabled = !superBotsuperBot.roomSettings.usercommandsEnabled;
                                    }
                                    else{
                                        API.sendChat('/me [@' + chat.from + '] :warning: Comandos de User ativados .');
                                        superBotsuperBot.roomSettings.usercommandsEnabled = !superBotsuperBot.roomSettings.usercommandsEnabled;
                                    }
                                };                              
                        },
                },

                voteratioCommand: {
                        rank: 'bouncer',
                        type: 'startsWith',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBotsuperBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    var msg = chat.message;
                                    if(msg.length === cmd.length) return API.sendChat('[@' + chat.from + '] :warning: Usuario não especificado.');
                                    var name = msg.substring(cmd.length + 2);
                                    var user = superBotsuperBot.userUtilities.lookupUserName(name);
                                    if(user === false) return API.sendChat('/me [@' + chat.from + '] :warning: Usuario Especificado é Invalido');
                                    var vratio = user.votes;
                                    var ratio = vratio.woot / vratio.meh;
                                    API.sendChat('/me [@' + chat.from + '] @' + name + ' ~ woots: ' + vratio.woot + ', mehs: ' + vratio.meh + ', ratio (w/m): ' + ratio.toFixed(2) + '.');
                                };                              
                        },
                },

                welcomeCommand: {
                        rank: 'mod',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBotsuperBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(superBotsuperBot.roomSettings.welcome){
                                        superBotsuperBot.roomSettings.welcome = !superBotsuperBot.roomSettings.welcome;
                                        return API.sendChat('/me [@' + chat.from + '] :warning: Mensagem de Boas-Vindas desativado .');
                                    }
                                    else{
                                        superBotsuperBot.roomSettings.welcome = !superBotsuperBot.roomSettings.welcome;
                                        return API.sendChat('/me [@' + chat.from + '] :warning: Mensagem De Boas-Vindas ativado. ');
                                    } 
                                
                                };                              
                        },
                },

                websiteCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBotsuperBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(typeof superBotsuperBot.roomSettings.website === "string")
                                        API.sendChat('/me Visite o nosso site : ' + superBotsuperBot.roomSettings.website);
                                };                              
                        },
                },

                youtubeCommand: {
                        rank: 'user',
                        type: 'exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !superBotsuperBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                    if(typeof superBotsuperBot.roomSettings.youtubeLink === "string")
                                        API.sendChat('/me [' + chat.from + '] Subscreva-se no nosso canal : ' + superBotsuperBot.roomSettings.youtubeLink);                                
                                };                              
                        },
                },
                
        },
                
};

superBotsuperBot.startup(); 
}).call(this);
