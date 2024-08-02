chrome.runtime.onInstalled.addListener(function() {
    const webhooks = [
        { id: 'evil2', title: 'Evil2' },
        { id: 'ragevil', title: 'Ragevil' },
        { id: 'nationalskibidi', title: 'National Skibidi' },
        { id: 'nemes', title: 'Nemes' }
    ];

    const contexts = ["image", "video", "audio", "selection", "link", "page"];
    const titles = {
        image: "Image",
        video: "Video",
        audio: "Audio",
        selection: "Selection",
        link: "Link",
        page: "Page"
    };

    contexts.forEach(context => {
        chrome.contextMenus.create({
            id: `send${context}todiscord`,
            title: `Send ${titles[context]} To Discord`,
            contexts: [context]
        });

        webhooks.forEach(webhook => {
            chrome.contextMenus.create({
                id: `send${context}todiscord_${webhook.id}`,
                title: webhook.title,
                parentId: `send${context}todiscord`,
                contexts: [context]
            });
        });
    });
});

let webhookUrls = {
    evil2: "",
    ragevil: "",
    nationalskibidi: "",
    nemes: ""
};
let username = "";

let webhook_is_valid = true;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse({});
    if (request.type === 'set_webhook_valid') {
        webhook_is_valid = request.valid;
        console.log(request, webhook_is_valid);
    } else if (request.type === 'update') {
        refreshVars();
    }
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    const [action, webhookId] = info.menuItemId.split('_');
    if (action.startsWith('send')) {
        sendToDiscord(info, webhookId);
    }
});

async function postToWebhook(content, webhookUrl) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({ content: content })
        });

        if (response.ok) {
            console.log('Posted to Discord');
        } else {
            console.error('Failed to post to Discord', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error posting to Discord', error);
    }
}

function sendToDiscord(info, webhookId) {
    let content = ` `;

    switch (info.menuItemId.split('_')[0]) {
        case "sendimagetodiscord":
            content += info.srcUrl;
            break;
        case "sendvideotodiscord":
            content += info.srcUrl;
            break;
        case "sendaudiotodiscord":
            content += info.srcUrl;
            break;
        case "sendselectiontodiscord":
            content += `"${info.selectionText}" - ${info.pageUrl}`;
            break;
        case "sendlinktodiscord":
            content += info.linkUrl;
            break;
        case "sendpagetodiscord":
            content += info.pageUrl;
            break;
    }

    postToWebhook(content, webhookUrls[webhookId]);
}

function refreshVars() {
    chrome.storage.sync.get([
        'username', 
        'webHookUrl_evil2', 
        'webHookUrl_ragevil', 
        'webHookUrl_nationalskibidi', 
        'webHookUrl_nemes'
    ], function(data) {
        username = data.username || '';
        webhookUrls.evil2 = data.webHookUrl_evil2 || '';
        webhookUrls.ragevil = data.webHookUrl_ragevil || '';
        webhookUrls.nationalskibidi = data.webHookUrl_nationalskibidi || '';
        webhookUrls.nemes = data.webHookUrl_nemes || '';
        console.log("username:", username);
        console.log("webhook URLs:", webhookUrls);
    });
}

refreshVars();
