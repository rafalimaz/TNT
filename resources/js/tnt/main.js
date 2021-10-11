$(function() {
    $("#btnOptions").off().on("click", function() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
          } else {
            window.open(chrome.runtime.getURL('/options/index.html'));
          }
    });

    $("#btnChangeLog").off().on("click", function() {
        window.open(chrome.runtime.getURL('/options/changelog.html'));
    });

    chrome.storage.local.get({
        notifyNewOpenIssues: false,
        jiraSearchQuery: "",
        autoLogger: false,
        otp: ""
    }, function(item) {
        if (item.notifyNewOpenIssues) {
            $("#btnSearch").show();
            $("#btnSearch").off().on("click", function() {
                window.open('http://200.129.43.196:8010/issues/?jql=' + item.jiraSearchQuery);
            });
        } else {
            $("#btnSearch").hide();
        }

        if (item.autoLogger) {
            $("#divOTP").show();

            if (item.otp) {
                //$("#lastOTP").val(item.otp);
            }

            $("#btnSSOLogin").off().on("click", function() {
                chrome.storage.local.set({ otp: "" });
                $("#lastOTP").val("");
                window.open('https://sso.lge.com');
            });

            $("#lastOTP").off().on("change", function() {
                //chrome.storage.local.set({ otp: $("#lastOTP").val() });
            });
        } else {
            $("#divOTP").hide();
        }
    });
});