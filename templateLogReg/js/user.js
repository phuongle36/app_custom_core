$(document).ready(function () {
    window.onload = function () {
        var userName = $('.user-fullname');
        var userMail = $('.user-email');
        var userRole = $('.user-role');
    
        $.post('/user').done(function (user) {
            if (user) {
                userName.text(user.fname + ' ' + user.lname);
                userMail.text(user.email);
            }
        });
    };
});