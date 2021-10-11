chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.type) {
		case "test":
            alert("test message received on content");
			sendResponse("test");
			break;
	}
	return true;
});

var self = this;
var otpUser, otpPassword, otpEmpNumber, otpBirthday;
var epLoginUrl = "https://sso.lge.com";
var collabUrl = "https://mlmdi.lge.com/cuas/?permissionViolation=true&os_destination=%2Fbrowse%2FRBS&page_caps=&user_role=";

$(function() {
	loadFeatures();
	console.log("content loaded");
});

function loadFeatures() {
	chrome.storage.local.get({
		disableCreateBranch : true,
		removeAutoPullRequestToDevelop: true,
		addIssueDescriptionTemplates: true,
		checkChromeVersion: true,
		autoLogger: true,
		otpUser: "",
		otpPassword: "",
		otpEmpNumber: "",
		otpBirthday: "",
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

		if (items.autoLogger) {
			otpUser = items.otpUser;
			otpPassword = items.otpPassword;
			otpEmpNumber = items.otpEmpNumber;
			otpBirthday = items.otpBirthday;

			if (otpUser && otpPassword && otpEmpNumber && otpBirthday) {
				featureAutoLogger();
			}
		}

		if (true) {
			featureBranchVersions();
		}
	});
};

function featureBranchVersions() {
	var current_path = window.location.pathname;
	if (current_path == "/stash/projects/BVR/repos/beaver-common/branches") {
		setCommonBranchesVersions();
	} else if (current_path == "/stash/projects/PVG/repos/pvg/branches") {
		setBeagleBranchesVersions();
	}
}

async function setCommonBranchesVersions() {
	await timer(100);
	const trs = $('tbody').children("tr");
	for (let index = 0; index < trs.length; index++) {
		const element = trs[index];

		var request = new XMLHttpRequest();
		request.open("GET", "http://200.129.43.196:8050/stash/projects/BVR/repos/beaver-common/raw/pom.xml?at=" + $(element).attr("data-id"), true);
		request.responseType = 'document';
		request.overrideMimeType('text/xml');
		request.onload = async function () {
			await timer(100);
			if (request.readyState === request.DONE) {
				if (request.status === 200) {
					const version = $(request.responseXML).find("project").find("version:eq(0)").text();
					$(element).find("div.line")
						.append('<div class="default-branch-lozenge aui-lozenge aui-lozenge-subtle">v' + version + '</div>');
				}
			}
		};

		request.send(null);

		await timer(500);
	}
}

async function setBeagleBranchesVersions() {
	await timer(100);
	const trs = $('tbody').children("tr");
	for (let index = 0; index < trs.length; index++) {
		const element = trs[index];

		var request = new XMLHttpRequest();
		request.open("GET", "http://200.129.43.196:8050/stash/projects/PVG/repos/pvg/raw/pom.xml?at=" + $(element).attr("data-id"), true);
		request.responseType = 'document';
		request.overrideMimeType('text/xml');
		request.onload = async function () {
			await timer(100);
			if (request.readyState === request.DONE) {
				if (request.status === 200) {
					const version = $(request.responseXML).find("project").find("version:eq(0)").text();
					const commonVersion = $(request.responseXML).find("beaver.common.version".replace(/\./g,'\\.')).text()
					$(element).find("div.line")
						.append('<div class="default-branch-lozenge aui-lozenge aui-lozenge-subtle">V' + version + '</div>');
					$(element).find("div.line")
						.append('<div class="default-branch-lozenge aui-lozenge aui-lozenge-subtle">CV' + commonVersion + '</div>');


				}
			}
		};

		request.send(null);

		await timer(500);
	}
}

function timer(ms) {
	return new Promise(res => setTimeout(res, ms));
}

function featureAutoLogger() {
	var current_path = window.location.pathname.split('/').pop();
	if (current_path.indexOf("eplogin.jsp") > -1 ||  window.location.pathname.indexOf("cuas") > -1) {
		chrome.storage.local.get({
			otp : ""
		}, function (result) {
			if (result.otp.length) {
				let userElemId, passwordElemId, otpPasswordElemId, btnLoginElem;

				if (current_path.indexOf("eplogin.jsp") > -1) {
					userElemId = "USER";
					passwordElemId = "LDAPPASSWORD";
					otpPasswordElemId = "OTPPASSWORD";
					btnLoginElem = "input[type=button][value=Login]";
				} else {
					fixFieldBehaviour("otpPassword");

					userElemId = "userId";
					passwordElemId = "password";
					otpPasswordElemId = "otpPassword";
					btnLoginElem = "#btnLogin";
				}

				setTimeout(function() {
					$("#" + userElemId).val(otpUser);
					$("#" + userElemId).focus();
					$("#" + userElemId).focusout();

					$("#" + passwordElemId).val(otpPassword);
					$("#" + passwordElemId).focus();
					$("#" + passwordElemId).focusout();

					setTimeout(function() {
						$("#" + otpPasswordElemId).val(result.otp);
						$("#" + otpPasswordElemId).focus();
						$("#" + otpPasswordElemId).focusout();

						setTimeout(function() {
							$(btnLoginElem).click();
							chrome.storage.local.set({ otpLoginType: (current_path.indexOf("eplogin.jsp") > -1 ? "eplogin" : "collab") });
							setTimeout(function() { chrome.storage.local.set({ otp: "" });}, 43200000);
						}, 1500);
					}, 1000);
				}, 2000)
			} else {
				window.location = "http://otpauth.lge.com:8090/motp/OTPselfserviceLogin.jsp?lang=kr&uid=" + otpUser;
			}
		});
	}

	const isNewOtp = current_path.indexOf("OTPselfserviceLogin2.jsp") > -1;
	if (current_path.indexOf("OTPselfserviceLogin.jsp") > -1 || isNewOtp) {
		chrome.storage.local.set({ isNewOtp: isNewOtp });
		if (isNewOtp) {
			$("#id").val(otpUser);
		}

		$("#pw").val(otpPassword);

		var yourCustomJavaScriptCode = "javascript:sendRequest();"
		var script = document.createElement('script');
		var code = document.createTextNode('(function() {' + yourCustomJavaScriptCode + '})();');
		script.appendChild(code);
		(document.body || document.head).appendChild(script);
	}

	if (current_path.indexOf("OTPselfservices.jsp") > -1) {
		var yourCustomJavaScriptCode = "requestTempPW(); this.close();"
		var script = document.createElement('script');
		var code = document.createTextNode('(function() {' + yourCustomJavaScriptCode + '})();');
		script.appendChild(code);
		(document.body || document.head).appendChild(script);
	}

	if (current_path.indexOf("TempPasswordRequestPcode.jsp") > -1) {
		$("#loading").show();
		var readyStateCheckInterval = setInterval(function() {
			if (document.readyState === "complete") {
				clearInterval(readyStateCheckInterval);

				$("#bizidE").val(otpEmpNumber);
				$("#pcodeE").val(otpBirthday);

				chrome.storage.local.get({
					isNewOtp: false
				}, function(items) {
					var site = items.isNewOtp ? "https://otp.lge.com:9444" : "http://otpauth.lge.com:8090";
					readImg(site + $("#photo_imageE").attr("src"),
						function(text) {
							if (text) {
								$("#answerE").val(text);
								$("input[type=button][value='Ok']").trigger("click");

								if (!item.isNewOtp) {
									setTimeout(function() { self.close();}, 2000);
								}
							}
						});

				});
			}
		}, 10);
	}

	if (current_path.indexOf("TempPasswordCodes.jsp") > -1) {
		chrome.storage.local.get({
			isNewOtp: false
		}, function(items) {
			if (!items.isNewOtp) {
				var readyStateCheckInterval = setInterval(function() {
					if (document.readyState === "complete") {
						clearInterval(readyStateCheckInterval);
						chrome.storage.local.set({ otp: $("#loadingE").text() });

						chrome.storage.local.get({
							otpLoginType: "eplogin"
						}, function(items) {
							if (items.otpLoginType) {
								chrome.runtime.sendMessage({
									directive: "open",
									url: epLoginUrl,
									active: true
								});

								setTimeout(function() { self.close();}, 2000);
							}
						});
					}
				}, 10);
			}
		});
	}

	function readImg(img, callback) {
		Tesseract.recognize(img)
		.then(function (result) {
			if (result.text.length == 7) {
				$("#loading").hide();
				callback(result.text);
			} else {
				readImg(img, callback);
			}
		});
	}
}

function fixFieldBehaviour(id) {
	var old_element = document.getElementById(id);
	old_element.parentNode.replaceChild(new_element, old_element);
}

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
				directive: "closeTab",
				type: "chrome"
			});
		}
	}, 10);
}

function featureBlockCreateBranchWhenNotReady() {
	$("span.trigger-label").on("click", function() {
		setTimeout(checkIssueNotReady, 10000);
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

var showTemplateInterval;
function featureShowTemplatesOnIssueCreation() {
	$("#create_link").on("click", function() {
		showTemplateInterval = setInterval(appendDivTemplates, 2000);
	});
}

function appendDivTemplates() {
	if($("#create-issue-dialog").length == 0 || $('#divTemplate').length > 0) {
		return;
	}

	$.get(chrome.extension.getURL('resources/html/templates/options.html'), function(data) {
		clearInterval(showTemplateInterval);

		$('#qf-field-labels').after($(data));
		$('#template-field').val("empty");

		chrome.storage.local.get({
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
						chrome.storage.local.get({
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