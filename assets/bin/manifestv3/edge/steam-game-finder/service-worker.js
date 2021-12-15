var appTab = null;

self.addEventListener('fetch', function (event) {
    event.respondWith( fetch(event.request, { mode: 'no-cors' }));// fetch as normal
});

chrome.action.onClicked.addListener(
    (activeTab) => {
        if (appTab) {
           chrome.tabs.get(appTab.id, (t) => {
            if (!t) {
                   chrome.tabs.create({ url:chrome.runtime.getURL('index.html') },
                (t) => { appTab = t; });
            } else {
                   chrome.tabs.update(t.id, { active: true });
            }
        });
        } else {
           chrome.runtime.sendMessage(
            { ping: true }, null,
            (response) => {
                if (!response) {
                       chrome.tabs.create({ url:chrome.runtime.getURL('index.html') },
                    (t) => { appTab = t; });
                }
            });
        }
    });

/*
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.url) {
            var url = request.url;
            return fetch(url, { mode: 'no-cors' });
                .then((response) => {
                    response = response.clone();
                    if (!request.type || request.type == 'text') {
                        return response.text();
                    } else if (request.type == 'blob') {
                        return response.blob();
                    } else if (request.type == 'json') {
                        return response.json();
                    } else if (request.type == 'arrayBuffer') {
                        return response.arrayBuffer();
                    }
                }).then((data) => {
                    if (request.type == 'blob') {
                        var reader = new FileReader();
                        data = reader.readAsDataURL(data);
                    } else if (request.type == 'arrayBuffer') {
                        var enc = new TextEncoder();
                        data = enc.decode(data);
                    } else {
                        data = data;
                    }
                    sendResponse({ data: data });
                })
                .catch(error => {
                    sendResponse({ error: error });
                })
            return true;  // Will respond asynchronously.
        }
    });
*/