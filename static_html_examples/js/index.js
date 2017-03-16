let $input_username = $('#input_username');
let $input_password = $('#input_password');

$('form').submit(function (e) {

    let username = $input_username.val();
    let password = $input_password.val();

    if (username.length < 4 || password.length < 4) {
        warnUser();
    } else {

        // Do something else like logging in the user
    }


    e.preventDefault();
});

function warnUser() {
    $input_username.addClass('input_danger');
    $input_password.addClass('input_danger');
}