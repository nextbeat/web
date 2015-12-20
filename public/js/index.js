$(document).ready(function() {

    $("#get-form").submit(function(event) {
        // phone number validation is handled by HTML5
        $("#form-description").hide();
        $("#get-form").hide();
        $("#form-success").show(300);
        ga('send', 'event', 'button', 'click', 'get-button');

        $.ajax({
            url: "get-app-sms",
            data: $("#get-form").serialize(),
            type: "POST",
            dataType: "json",

            success: function(json) {

            },

            error: function(json) {

            }
        });

        return false;
    });

});
