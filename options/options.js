// Saves options to chrome.storage
function save_options() {
  chrome.storage.local.set({
    disableCreateBranch: document.getElementById('disableCreateBranch').checked,
    notifyNewOpenIssues: document.getElementById('notifyNewOpenIssues').checked,
    jiraUser: document.getElementById('jiraUser').value,
    jiraPassword: document.getElementById('jiraPassword').value,
    jiraSearchQuery: document.getElementById('jiraSearchQuery').value,
    removeAutoPullRequestToDevelop: document.getElementById('removeAutoPullRequestToDevelop').checked,
    addIssueDescriptionTemplates: document.getElementById('addIssueDescriptionTemplates').checked,
    customTemplateName: document.getElementById('customTemplateName').value,
    customTemplateDescription: document.getElementById('customTemplateDescription').value,
    checkChromeVersion: document.getElementById('checkChromeVersion').checked,
    autoLogger: document.getElementById('autoLogger').checked,
    otpUser: document.getElementById('otpUser').value,
    otpPassword: document.getElementById('otpPassword').value,
    otpEmpNumber: document.getElementById('otpEmpNumber').value,
    otpBirthday: document.getElementById('otpBirthday').value
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });

  chrome.extension.sendMessage({
    directive: "options",
    notifyNewOpenIssues: document.getElementById('notifyNewOpenIssues').checked,
    checkChromeVersion: document.getElementById('checkChromeVersion').checked,
    jiraUser: document.getElementById('jiraUser').value,
    jiraPassword: document.getElementById('jiraPassword').value,
    jiraSearchQuery: document.getElementById('jiraSearchQuery').value
  });
}

// Restores select box and checkbox state using the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({
    disableCreateBranch: false,
    notifyNewOpenIssues: false,
    checkChromeVersion: false,
    jiraUser: "",
    jiraPassword: "",
    jiraRestApi: "",
    jiraSearchQuery: "",
    removeAutoPullRequestToDevelop: false,
    addIssueDescriptionTemplates: false,
    customTemplateName: "",
    customTemplateDescription: "",
    autoLogger: false,
    otpUser: "",
    otpPassword: "",
    otpEmpNumber: "",
    otpBirthday: ""
  }, function(items) {
    setCheckboxes(["disableCreateBranch","notifyNewOpenIssues","checkChromeVersion","removeAutoPullRequestToDevelop",
      "addIssueDescriptionTemplates","autoLogger"], items);

    setInputs(["jiraUser","jiraPassword","jiraSearchQuery","customTemplateName","customTemplateDescription",
      "otpUser","otpPassword","otpEmpNumber","otpBirthday"], items);
  });
}

function setCheckboxes(checkboxes, items) {
    checkboxes.map(function(item) {
      document.getElementById(item).checked = items[item];
    });
}

function setInputs(inputs, items) {
  inputs.map(function(item) {
    document.getElementById(item).value = items[item];
  });
}

function search() {
  window.open('http://200.129.43.196:8010/issues/?jql=' + document.getElementById('jiraSearchQuery').value );
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('btnSearch').addEventListener('click', search);

$(function() {
  $("#notifyNewOpenIssues").off().on("change", function() {
    if ($(this).prop("checked")) {
      $("#notifyNewOpenIssuesConfig").show();
    } else {
      $("#notifyNewOpenIssuesConfig").hide();
    }
  });

  $("#addIssueDescriptionTemplates").off().on("change", function() {
    if ($(this).prop("checked")) {
      $(".issueTemplate").show();
    } else {
      $(".issueTemplate").hide();
    }
  });

  $("#autoLogger").off().on("change", function() {
    if ($(this).prop("checked")) {
      $("#autoLoggerConfig").show();
    } else {
      $("#autoLoggerConfig").hide();
    }
  });
});