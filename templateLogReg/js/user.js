$(document).ready(function () {
    function onRun () {
        var userName = $('.user-fullname');
        var userMail = $('.user-email');
        var userRole = $('.user-role');
    
        $.post('/user').done(function (user) {
            if (user) {
                userName.text(user.fname + ' ' + user.lname);
                userMail.text(user.email);

                if (user.role === '1') {
                    userRole.text('Developer');
                } else {
                    userRole.text('System Admin');
                }
            }
        });
    };
    
    setInterval(onRun, 500);
});
