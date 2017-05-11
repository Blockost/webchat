let $input_username = $('#input_username');
let $input_password = $('#input_password');

$('form').submit((e) => {

    let username = $input_username.val();
    let password = $input_password.val();

    if (username.length < 4 || password.length < 4) {
        warnUser();
    } else {
        let data = {
            username: username,
            password: password
        };

        $.post('/login', data, (res) => {
            if (res.redirectTo)
                window.location = res.redirectTo;
            else {
                warnUser();
            }
            $input_password.val('');
        });
    }


    e.preventDefault();
});

function warnUser() {
    $input_username.addClass('input_danger');
    $input_password.addClass('input_danger');
}