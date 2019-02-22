$(function() {
    $("head").append("head.html");
    $("#header").load("header.html");
    $("#footer").load("footer.html");

    setTimeout(function() {
        var current_path = window.location.pathname.split('/').pop();
        $("#menu a").parent().removeClass("selected");
        $("li[id='" + current_path + "']").addClass("selected");
    }, 300);
  });