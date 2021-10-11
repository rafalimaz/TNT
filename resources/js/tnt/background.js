var jiraUser, jiraPassword, JiraSearchQuery;

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
            case "options":
                jiraUser = request.jiraUser;
                jiraPassword = request.jiraPassword;
                jiraSearchQuery = request.jiraSearchQuery;
                featureCheckDevBugIssues(request.notifyNewOpenIssues);
                featureCheckChromeVersion(request.checkChromeVersion);
                break;
            case "closeTab":
                if (request.type == "chrome") {
                    chrome.storage.local.get({ chromeTabId: null }, function(items) {
                        chrome.tabs.get(items.chromeTabId, function() {
                            if (chrome.runtime.lastError) {
                                console.log(chrome.runtime.lastError.message);
                            } else {
                                chrome.tabs.remove(items.chromeTabId);
                            }
                        });
                    });
                } else {
                    chrome.storage.local.get({ tabId: null }, function(items) {
                        chrome.tabs.get(items.tabId, function() {
                            /*alert("close: " + items.tabId);*/
                            if (items.tabId) {
                                if (chrome.runtime.lastError) {
                                    console.log(chrome.runtime.lastError.message);
                                } else {
                                    chrome.tabs.remove(items.tabId);
                                }
                            } else {
                                alert();
                                chrome.tabs.query(
                                    { currentWindow: true, active: true },
                                    function (tabArray) { chrome.tabs.remove(tabArray[0]); }
                                );
                            }
                        });
                    });
                }
                break;
            case "open":
                chrome.tabs.create({ url: request.url, active: request.active }, function(tab) { /*alert("open: " + tab.id);*/ chrome.storage.local.set({ tabId: tab.id }); });
                break;
            case "test":
                alert("test received on background");
                sendResponse({});
                break;
            default:
                alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);

$(function() {
    loadFeatures();
    console.log("background loaded");
});

var checkDevBugIssuesInterval;

function loadFeatures() {
    chrome.storage.local.get({
        notifyNewOpenIssues : false,
        checkChromeVersion: false,
        jiraUser: "",
        jiraPassword: "",
        jiraSearchQuery: ""
	}, function(items) {
        jiraUser = items.jiraUser;
        jiraPassword = items.jiraPassword;
        jiraSearchQuery = items.jiraSearchQuery;
        featureCheckDevBugIssues(items.notifyNewOpenIssues);
		featureCheckChromeVersion(items.checkChromeVersion);
    });
}

function featureCheckChromeVersion(enabled) {
    if (enabled) {
        chrome.tabs.create({ url: "https://www.whatismybrowser.com/", active: false }, function(tab) { chrome.storage.local.set({ chromeTabId: tab.id }); });
    }
}

function featureCheckDevBugIssues(enabled) {
    if (enabled) {
        checkDevBugIssues();
        checkDevBugIssuesInterval = setInterval(checkDevBugIssues, 30000);
    } else {
        clearInterval(checkDevBugIssuesInterval);
        chrome.browserAction.setBadgeText({text: "" });
    }
}

var jiraRestApi = "http://200.129.43.196:8010/rest/api/2";
function checkDevBugIssues() {
    if (!jiraSearchQuery) {
        chrome.browserAction.setBadgeText({text: "off" });
        return;
    }

    $.ajax({
        type: 'GET',
        url: jiraRestApi + "/search?jql=" + encodeURIComponent(jiraSearchQuery) + "&maxResults=9999&fields=key",
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(jiraUser + ":" + jiraPassword));
        },
        success: function(data)
        {
            chrome.browserAction.setBadgeText({text: data.issues.length.toString() });
        },
        error: function(error) {
            if (error.responseText.indexOf("Error in JQL Query")) {
                alert("Error searching jira issues. Please fix Jira Search Query on options page!");
            }
            chrome.browserAction.setBadgeText({text: "error" });
        }
    });
}