function toogleSidenavLeft() {
    let $sidenav_left = $('.sidenav_left');
    let $chat_panel = $('.chat_panel');

    if ($sidenav_left.css('display') === 'none') {

        // Show side_panel
        $chat_panel.animate({
            'width': '85%'
        }, 500, () => {
            $('.sidenav_left').css('display', 'flex');
        });

    } else {
        // Hide sidenav
        $('.sidenav_left').css('display', 'none');
        $chat_panel.animate({
            'width': '100%'
        }, 500, () => {

        });
    }
}
/**
 *
 * @param $div
 * @param percentage
 */
function scaleDiv($div, percentage) {

}