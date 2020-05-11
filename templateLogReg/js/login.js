$(document).ready(function () {
    var passWordField = $('#password');
    var passWordConfirmField = $('#password_conf');
    var emailField = $('#signin input[for="email"]');
    var loginEmail = $('#login input[for="email"]');
    var loginPassword = $('#login input[for="password"]');
    var loginForm = $('#login');
    var loginButton = $('#login input[type="submit"]');
    var signinForm = $('#signin');
    var signinButton = $('#signin input[type="submit"]');

    signinButton.on('click', function () {
        if (passWordField.val() != passWordConfirmField.val()) {
            alert("Passwords do not match. Please try again.");
        } else {
            var data = {
                email: emailField.val()
            };
            $.get('/presignin', data).done(function (data) {
                if (data == 'success') {
                    console.log('data');
                    signinForm[0].submit();
                } else {
                    console.log('data');
                    alert('This email is already registed!');
                }
            });
        }
    });

    loginButton.on('click', function () {
        var loginData = {
            logemail: loginEmail.val(),
            logpassword: loginPassword.val()
        };
        $.get('/prelogin', loginData).done(function (data) {
            if (data == 'success') {
                loginForm[0].submit();
            } else {
                alert('Wrong email or password!');
            }
        });
    });
});