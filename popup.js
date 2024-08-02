var loggedin = false;
var manual_loggedin = false;
var username;

chrome.storage.sync.get(['username', 'webHookInfo', 'webHookUrl_evil2', 'webHookUrl_ragevil', 'webHookUrl_nationalskibidi', 'webHookUrl_nemes'], function(data) {
    username = data.username;
    if('webHookUrl_evil2' in data) {
        document.getElementById("webHookUrl_evil2").value = data.webHookUrl_evil2;
    }
    if('webHookUrl_ragevil' in data) {
        document.getElementById("webHookUrl_ragevil").value = data.webHookUrl_ragevil;
    }
    if('webHookUrl_nationalskibidi' in data) {
        document.getElementById("webHookUrl_nationalskibidi").value = data.webHookUrl_nationalskibidi;
    }
    if('webHookUrl_nemes' in data) {
        document.getElementById("webHookUrl_nemes").value = data.webHookUrl_nemes;
    }
    if('webHookInfo' in data) {
        document.getElementById('webHookInfo').innerHTML = data.webHookInfo;
    }
});

function checkLoginStatus() {
    chrome.storage.sync.get(['discord_token', 'username'], function(data) {
        document.getElementById("login_status").value = data;
        if ('discord_token' in data || 'username' in data) {
            if ('discord_token' in data) {
                getUsername(data.discord_token.access_token);
                document.getElementById("username").classList.add("hidden");
                document.getElementById("username_label").classList.add("hidden");
            } else {
                manual_loggedin = true;
                username = data.username;
                document.getElementById("login_status").innerHTML = username;
                document.getElementById("username").value = username;
                document.getElementById("username").classList.remove("hidden");
                document.getElementById("username_label").classList.remove("hidden");
            }
            loggedin = true;
            document.getElementById("loginwithdiscord").innerHTML = "Logout";
            document.getElementById("login_status").innerHTML = username;
            document.getElementById("settings").classList.remove("hidden");
            document.getElementById("saveSettings").classList.remove("hidden");
            document.getElementById("login").classList.remove('notloggedin');
            document.getElementById("login").classList.add('loggedin');
            document.getElementById("manual_login").classList.add("hidden");
        } else {
            loggedin = false;
            document.getElementById("loginwithdiscord").innerHTML = "Login with Discord";
            document.getElementById("login_status").innerHTML = "";
            document.getElementById("settings").classList.add("hidden");
            document.getElementById("saveSettings").classList.add("hidden");
            document.getElementById("username").classList.add("hidden");
            document.getElementById("manual_login").classList.remove("hidden");
            document.getElementById("login").classList.remove('loggedin');
            document.getElementById("login").classList.add('notloggedin');
        }
    });
}

checkLoginStatus();

function getUsername(token) {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "https://discordapp.com/api/users/@me", true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            chrome.extension.getBackgroundPage().console.log(xhr.responseText);
            var username = JSON.parse(xhr.responseText).username;
            if(username === undefined) {
                return;
            }
            chrome.storage.sync.set({ username: username }, function() {
                chrome.runtime.sendMessage({type: 'update',  update: 1}, function(response) {});
            });
            document.getElementById("login_status").innerHTML = JSON.parse(xhr.responseText).username;
            username = JSON.parse(xhr.responseText).username;
        }
    };
    xhr.send();
}

function getToken(code) {
    var xhr = new XMLHttpRequest();
    
    xhr.open("POST", "https://discordapp.com/api/oauth2/token", true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            chrome.storage.sync.set({ discord_token: JSON.parse(xhr.responseText)}, function() {
                checkLoginStatus();
            });
        }
    };
    xhr.send("client_id=564897958210961427&client_secret=6DU7Kptjfv975HIt6-P_QuajUjT4Aq-W&code=" + code + "&redirect_uri=" + chrome.identity.getRedirectURL() + "&scope=identify&grant_type=authorization_code");
}

document.getElementById("saveSettings").addEventListener("click", function(){
    chrome.storage.sync.remove(['webHookInfo'], function() {
        if (manual_loggedin) {
            chrome.storage.sync.set({ 
                webHookUrl_evil2: document.getElementById("webHookUrl_evil2").value,
                webHookUrl_ragevil: document.getElementById("webHookUrl_ragevil").value,
                webHookUrl_nationalskibidi: document.getElementById("webHookUrl_nationalskibidi").value,
                webHookUrl_nemes: document.getElementById("webHookUrl_nemes").value,
                username: document.getElementById("username").value 
            }, function() {
                chrome.runtime.sendMessage({type: 'update',  update: 1}, function(response) {});
                username = document.getElementById("username").value;
                document.getElementById("login_status").innerHTML = username;
                document.getElementById('webHookInfo').innerHTML = "";
            });
        } else {
            chrome.storage.sync.set({ 
                webHookUrl_evil2: document.getElementById("webHookUrl_evil2").value,
                webHookUrl_ragevil: document.getElementById("webHookUrl_ragevil").value,
                webHookUrl_nationalskibidi: document.getElementById("webHookUrl_nationalskibidi").value,
                webHookUrl_nemes: document.getElementById("webHookUrl_nemes").value,
                webHookName: undefined 
            }, function() {
                chrome.runtime.sendMessage({type: 'update',  update: 1}, function(response) {});
                getGuildInfo();
            });
        }
    });
});

document.getElementById("loginwithdiscord").addEventListener("click", function(){
    if (loggedin) {
        logout();
    } else {
        login();
    }
});

document.getElementById("manual_login").addEventListener("click", function(){
    loggedin = true;
    manual_loggedin = true;
    document.getElementById("loginwithdiscord").innerHTML = "Logout";
    document.getElementById("login_status").innerHTML = "";
    document.getElementById("settings").classList.remove("hidden");
    document.getElementById("saveSettings").classList.remove("hidden");
    document.getElementById("login").classList.remove('notloggedin');
    document.getElementById("login").classList.add('loggedin');
    document.getElementById("manual_login").classList.add("hidden");
    document.getElementById("username").classList.remove("hidden");
});

function login() {
    var url = "https://discordapp.com/api/oauth2/authorize?client_id=564897958210961427&redirect_uri=" + chrome.identity.getRedirectURL() + "&response_type=code&scope=identify%20guilds";
    chrome.identity.launchWebAuthFlow({url: url, interactive: true}, function(res){
        var url = new URL(res);
        chrome.extension.getBackgroundPage().console.log(res);
        var code = url.searchParams.get("code");
        getToken(code);
    });
}

function logout() {
    chrome.storage.sync.remove(['discord_token', 'username'], function() {
        manual_loggedin = false;
        loggedin = false;
        checkLoginStatus();
    });
}

function getGuildInfo() { 
    chrome.runtime.sendMessage({type: 'set_webhook_valid',  valid: false}, function(response) {});
    document.getElementById('webHookInfo').innerHTML = "";
    const webHookUrls = [
        'webHookUrl_evil2',
        'webHookUrl_ragevil',
        'webHookUrl_nationalskibidi',
        'webHookUrl_nemes'
    ];
    webHookUrls.forEach(webHookUrlKey => {
        chrome.storage.sync.get(webHookUrlKey, function(data) {
            if (webHookUrlKey in data) {
                var webHookUrl = data[webHookUrlKey];
                var xhr = new XMLHttpRequest();
                xhr.open("GET", webHookUrl, true);
                xhr.onload = function() {
                    if (xhr.readyState === 4) {
                        chrome.storage.sync.get(['discord_token', 'webHookName', 'webHookInfo'], function(data) {
                            if ('discord_token' in data) {
                                if (xhr.status === 200 && xhr.getResponseHeader('content-type') === 'application/json' && 'name' in JSON.parse(xhr.responseText)) {
                                    chrome.runtime.sendMessage({type: 'set_webhook_valid',  valid: true}, function(response) {});
                                    var guild_id = JSON.parse(xhr.responseText).guild_id;
                                    var webHookId = JSON.parse(xhr.responseText).id;
                                    var webHookAvatar = JSON.parse(xhr.responseText).avatar;
                                    var webHookName = JSON.parse(xhr.responseText).name;
                                    
                                    var xhr2 = new XMLHttpRequest();
                                    xhr2.open("GET", "https://discordapp.com/api/users/@me/guilds", true);
                                    xhr2.setRequestHeader('Authorization', 'Bearer ' + data.discord_token.access_token);
                                    xhr2.onload = function() {
                                        if (xhr2.readyState === 4) {
                                            chrome.extension.getBackgroundPage().console.log(xhr2.responseText);
                                            var guilds = JSON.parse(xhr2.responseText);
                                            if("code" in guilds) {
                                                if(webHookName !== data.webHookName || data.webHookInfo === undefined) {
                                                    document.getElementById('webHookInfo').innerHTML = "<span class='form_error'>Api access token expired: Could not retrieve data from the Discord Api. <b>Please logout and login again.</b></span>";
                                                }
                                                return;
                                            }
                                            guilds.forEach(element => {
                                                if (element.id == guild_id) {
                                                    var info = "<p><span class='bold'>Webhook erkannt:</span></p> <br> <img id='avatar' src='https://cdn.discordapp.com/avatars/"+ webHookId +"/"+ webHookAvatar +".png'>" + '<p id="webHookName">' + element.name + " / " + webHookName + "</p>";
                                                    chrome.storage.sync.set({ webHookInfo: info, webHookName: webHookName }, function() {});
                                                    document.getElementById('webHookInfo').innerHTML = info;
                                                }
                                            });                      
                                        }
                                    };
                                    xhr2.send();
                                } else {
                                    document.getElementById('webHookInfo').innerHTML = "<span class='form_error'>Webhook not recognized. Please check that you entered the correct URL.</span>";
                                    chrome.runtime.sendMessage({type: 'set_webhook_valid',  valid: false}, function(response) {});
                                }
                            }
                        });
                    }
                };

                xhr.onerror = function(e) {
                    document.getElementById('webHookInfo').innerHTML = "";
                    chrome.runtime.sendMessage({type: 'set_webhook_valid',  valid: false}, function(response) {});
                }
                xhr.send();
            }
        });
    });
}

getGuildInfo();
