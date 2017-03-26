/**
 * Authors: Simon ESPIGOLÉ, Teddy GILBERT, Hugo LEGRAND
 */

function togglePanel(btn) {
    let $btn = $(btn);
    let $channel_members = $('.global_members');
    let $chat_panel = $('.chat_panel');

    if ($channel_members.css('display') === 'none') {

        $btn.addClass('btn_active');
        // Show side_panel
        $chat_panel.animate({'width': '85%'}, 500, () => {
            $channel_members.css('display', 'flex');
        });

    } else {
        $btn.removeClass('btn_active');
        // Hide sidenav
        $channel_members.css('display', 'none');
        $chat_panel.animate({'width': '100%'}, 500);
    }
}