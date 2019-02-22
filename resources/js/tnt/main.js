$(function() {
    $("#btnSearch").on("click", function() {
        chrome.storage.sync.get({
            jiraSearchQuery: ""
        }, function(item) {
            window.open('http://136.166.96.136:8010/issues/?jql=' + item.jiraSearchQuery);
        });
    });

    $("#btnOptions").on("click", function() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
          } else {
            window.open(chrome.runtime.getURL('/options/index.html'));
          }
    });

    $("#btnChangeLog").on("click", function() {
        window.open(chrome.runtime.getURL('/options/changelog.html'));
    });
});