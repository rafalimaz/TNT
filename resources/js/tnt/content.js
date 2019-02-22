chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.type) {
		case "test":
            alert("test message received on content");
			sendResponse("test");
			break;
	}
	return true;
});

function saveData(key, value) {
	var obj = {};
	obj[key] = value;
	chrome.storage.local.set(obj);
}

function loadData(key, callback) {
	chrome.storage.local.get(key, callback);
}

$(function() {
	loadFeatures();
	console.log("content loaded");
});

function loadFeatures() {
	chrome.storage.sync.get({
		disableCreateBranch : true,
		removeAutoPullRequestToDevelop: true,
		addIssueDescriptionTemplates: true,
		checkChromeVersion: true,
		tabId: null,
	}, function(items) {
		if (items.disableCreateBranch) {
			featureBlockCreateBranchWhenNotReady();
		}

		if (items.removeAutoPullRequestToDevelop) {
			featureAvoidAutoPullRequestToDevelop();
		}

		if (items.addIssueDescriptionTemplates) {
			featureShowTemplatesOnIssueCreation();
		}

		if (items.checkChromeVersion) {
			featureChromeVersionCheck();
		}
	});
};

function featureChromeVersionCheck() {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);

			var $divVersionCheck = $("div.version-check");
			if (!$divVersionCheck) {
				alert(window.location + "\nError checking chrome version! Please contact TNT developer!");
			}

			if ($divVersionCheck.find("div.label-danger").length > 0) {
				alert(window.location + "\nWARNING! CHROME VERSION IS OUT OF DATE!!!");
			}

			chrome.runtime.sendMessage({
				directive: "closeTab"
			});
		}
	}, 10);
}

function featureBlockCreateBranchWhenNotReady() {
	$("span.trigger-label").on("click", function() {
		setInterval(checkIssueNotReady, 10000);
	});

	checkIssueNotReady();
}

function checkIssueNotReady() {
	var span = $("span.devstatus-cta-link-text:contains('Create branch')");
	if ($("span.trigger-label:contains('Issue Ready')").length == 1 || $("span.trigger-label:contains('Reopen')").length == 1) {
		span.parent().attr("disabled", true);
		span.html("Create branch [Issue Not Ready]");
	} else {
		span.parent().attr("disabled", false);
		span.html("Create branch");
	}
}

function featureAvoidAutoPullRequestToDevelop() {
	var btnChangeBranch = $("button.branch-change");
	if (btnChangeBranch.length > 0) {
		btnChangeBranch.click();
	}
}

function featureShowTemplatesOnIssueCreation() {
	$("#create_link").on("click", function() {
		setInterval(appendDivTemplates, 2000);
	});
}

function appendDivTemplates() {
	if($("#create-issue-dialog").length == 0 || $('#divTemplate').length > 0) {
		return;
	}

	$.get(chrome.extension.getURL('resources/html/templates/options.html'), function(data) {
		$('#qf-field-labels').after($(data));
		$('#template-field').val("empty");

		chrome.storage.sync.get({
			customTemplateName : "",
			customTemplateDescription: ""
		}, function(items) {
			if (items.customTemplateName != "")	 {
				$('#template-field').append($("<option value='custom'>" + items.customTemplateName + "</option>"));
				$('#template-field').val("custom");
				$("#description").val(items.customTemplateDescription);
			}
		});

		$('#template-field').on("change", function() {
			var selected = $(this).val();
			$.ajax({
				url: chrome.extension.getURL('resources/html/templates/' + selected + '.txt'),
				type: 'GET',
				success: function(data2) {
					$("#description").val(data2);
				},
				error: function(data) {
					if (selected == "custom") {
						chrome.storage.sync.get({
							customTemplateDescription: ""
						}, function(items) {
							$("#description").val(items.customTemplateDescription);
						});
					}
				}
			});
		});
	});
}