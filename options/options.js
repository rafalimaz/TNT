// Saves options to chrome.storage
function save_options() {
    chrome.storage.sync.set({
      disableCreateBranch: document.getElementById('disableCreateBranch').checked,
      notifyNewOpenIssues: document.getElementById('notifyNewOpenIssues').checked,
      jiraUser: document.getElementById('jiraUser').value,
      jiraPassword: document.getElementById('jiraPassword').value,
      jiraRestApi: document.getElementById('jiraRestApi').value,
      jiraSearchQuery: document.getElementById('jiraSearchQuery').value,
      removeAutoPullRequestToDevelop: document.getElementById('removeAutoPullRequestToDevelop').checked,
      addIssueDescriptionTemplates: document.getElementById('addIssueDescriptionTemplates').checked,
      customTemplateName: document.getElementById('customTemplateName').value,
      customTemplateDescription: document.getElementById('customTemplateDescription').value,
      checkChromeVersion: document.getElementById('checkChromeVersion').checked
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
      jiraRestApi: document.getElementById('jiraRestApi').value,
      jiraSearchQuery: document.getElementById('jiraSearchQuery').value
     });
  }

  // Restores select box and checkbox state using the preferences stored in chrome.storage.
  function restore_options() {
    chrome.storage.sync.get({
      disableCreateBranch: true,
      notifyNewOpenIssues: true,
      checkChromeVersion: true,
      jiraUser: "",
      jiraPassword: "",
      jiraRestApi: "",
      jiraSearchQuery: "",
      removeAutoPullRequestToDevelop: true,
      addIssueDescriptionTemplates: true,
      customTemplateName: "",
      customTemplateDescription: ""
    }, function(items) {
      document.getElementById('disableCreateBranch').checked = items.disableCreateBranch;
      document.getElementById('notifyNewOpenIssues').checked = items.notifyNewOpenIssues;
      document.getElementById('checkChromeVersion').checked = items.checkChromeVersion;
      document.getElementById('jiraUser').value = items.jiraUser;
      document.getElementById('jiraPassword').value = items.jiraPassword;
      document.getElementById('jiraRestApi').value = items.jiraRestApi;
      document.getElementById('jiraSearchQuery').value = items.jiraSearchQuery;
      document.getElementById('removeAutoPullRequestToDevelop').checked = items.removeAutoPullRequestToDevelop;
      document.getElementById('addIssueDescriptionTemplates').checked = items.addIssueDescriptionTemplates;
      document.getElementById('customTemplateName').value = items.customTemplateName;
      document.getElementById('customTemplateDescription').value = items.customTemplateDescription;
    });
  }

  function search() {
    window.open('http://136.166.96.136:8010/issues/?jql=' + document.getElementById('jiraSearchQuery').value );
  }

  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click', save_options);
  document.getElementById('btnSearch').addEventListener('click', search);