// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


function openOrFocusOptionsPage() {
    var optionsUrl = chrome.extension.getURL('src/options_custom/index.html');
    chrome.tabs.query({}, function(extensionTabs) {
        var found = false;
        for (var i=0; i < extensionTabs.length; i++) {
            if (optionsUrl == extensionTabs[i].url) {
                found = true;
                console.log("tab id: " + extensionTabs[i].id);
                chrome.tabs.update(extensionTabs[i].id, {"selected": true});
            }
        }
        if (found == false) {
            chrome.tabs.create({url: "src/options_custom/index.html"});
        }
    });
}

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getData"){
        var data = {
                name: localStorage['la_name'],
                sign: localStorage['la_sign'],
                sign_enabled: localStorage['la_sign_enabled'],
                templates: []
            },
            templates = JSON.parse(localStorage['la_templates']);
        templates.forEach(function (item, i, arr) {
            data.templates.push({
                name: item.name,
                code: item.code
            });
        });
        sendResponse(data);
    }else{
        sendResponse({}); // snub them.
    }
});


// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
    openOrFocusOptionsPage();
});