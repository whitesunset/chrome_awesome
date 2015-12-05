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

// set default templates
if(!localStorage['la_templates']){
    var templates = [{
        name: 'Hello',
        code: 'Hello <%= client_name %>,'
    },{
        name: 'Access',
        code: 'Hi, please <a href="<%= contact_form %>">contact us</a> and send your URL and temporary admin access so we can inspect this and help.'
    },{
        name: 'Live URL',
        code: 'Hello, please share live URL.'
    },{
        name: 'Later',
        code: 'Hello. We plan to add this in future updates.\nThank you for feedback!'
    },{
        name: 'Thanks',
        code: 'It\'s great to hear! Hope you\'re enjoying our plugin. Let me know if you have further questions.<br>Please take a moment and <a href="http://codecanyon.net/downloads">rate</a> <%= plugin_name %>. Thanks!'
    }];
    localStorage['la_templates'] = JSON.stringify(templates);
}
if(!localStorage['la_name']){
    var name =  'Looks Awesome';
    localStorage['la_name'] = name;
}
if(!localStorage['la_sign']){
    var sign = '<p>Best Regards, <br /><%= name %></p>__________________' +
        '<p>' +
        '<a href="<%= plugin_docs %>">Docs & FAQ</a> | ' +
        '<a href="<%= contact_form %>">Send us a private message</a> | ' +
        '<% if (plugin_quiz) { %><a href="<%= plugin_quiz %>">User Suggestion Form</a> | <% } %>' +
        '<a href="<%= twitter %>">Twitter</a> | ' +
        '<a href="<%= facebook %>">Facebook</a></p>';
    localStorage['la_sign'] = sign;
}
if(!localStorage['la_sign_enabled']){
    var sign_enabled = 1;
    localStorage['la_sign_enabled'] = sign_enabled;
}

// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
    openOrFocusOptionsPage();
});