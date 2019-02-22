var jiraUser, jiraPassword, jiraRestApi, JiraSearchQuery;

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
            case "options":
                jiraUser = request.jiraUser;
                jiraPassword = request.jiraPassword;
                jiraRestApi = request.jiraRestApi;
                jiraSearchQuery = request.jiraSearchQuery;
                featureCheckDevBugIssues(request.notifyNewOpenIssues);
                break;
            case "closeTab":
                chrome.storage.sync.get({ tabId: null }, function(items) { try { chrome.tabs.remove(items.tabId); } catch {} });
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

function loadFeatures() {
    chrome.storage.sync.get({
        notifyNewOpenIssues : true,
        checkChromeVersion: true,
        jiraUser: "",
        jiraPassword: "",
        jiraRestApi: "",
        jiraSearchQuery: ""
	}, function(items) {
        jiraUser = items.jiraUser;
        jiraPassword = items.jiraPassword;
        jiraRestApi = items.jiraRestApi;
        jiraSearchQuery = items.jiraSearchQuery;
        featureCheckDevBugIssues(items.notifyNewOpenIssues);
		featureCheckChromeVersion(items.checkChromeVersion);
    });
}

function featureCheckChromeVersion(enabled) {
    if (enabled) {
        chrome.tabs.create({ url: "https://www.whatismybrowser.com/", active: false }, function(tab) { chrome.storage.sync.set({ tabId: tab.id }); });
    }
}

function featureCheckDevBugIssues(enabled) {
    if (enabled) {
        setInterval(checkDevBugIssues, 20000);
    } else {
        chrome.browserAction.setBadgeText({text: "..." });
    }
}

function checkDevBugIssues() {
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