/**
 * Practical class for messages manipulation
 * @param {String} from is the message's emitter
 * @param {String} text is what the emitter wants to say
 * @param {Date} date is time emitter has sent this message
 * @param {String} custom color attributed to @this user
 * @constructor
 */
function Message(from, text, date, color) {

    /****************/
    /* Constructors */
    /****************/

    if (typeof text === 'undefined')
        text = '';

    this.from = from;
    this.text = text;
    if (date instanceof Date)
        this.date = date;
    else
        this.date = new Date(date);


    /*****************/
    /**** Methods ****/
    /*****************/


    this.buildShortMessage = () => {
        return $('<p>').text(this.text);
    };

    this.buildFullMessage = () => {

        //TODO @See JQuery templates ?
        let $msg_group = $('<div>').addClass('msg_group')
            .append($('<span>').addClass('msg_sender').text(this.from))
            .append($('<span>').addClass('msg_time').text(getTimeOnly(this.date)))
            .append($('<p>').text(this.text));

        return $('<div>').addClass('msg_row')
            .append($('<div>').addClass('avatar').css('background-color', color)
                .append($('<div>').addClass('avatar_name').text(this.from.charAt(0))))
            .append($msg_group);
    };

    this.toString = () => {
        return this.from
            + ' (' + getTimeOnly(this.date) + '):\n'
            + this.text;
    };

    /**
     * Return time interval between this.date and
     * another date object supplied as param
     * @param {Message} another_message
     * @returns {number} (this.date - another_message.date)
     */
    this.getTimeIntervalWith = (another_message) => {
        return this.date - another_message.date;
    };

    /**
     * Return true if messages are issued by the same person
     * @param {Message} another_message
     * @returns {boolean} true if same person, false otherwise
     */
    this.hasSameSourceThan = (another_message) => {
        return this.from == another_message.from;
    }
}

/**
 *
 * @param date
 * @returns {string} formatted as HH:mm
 */
function getTimeOnly(date) {
    return date.toTimeString()
        .split(' ')[0]
        .split(':')
        .filter((value, index) => {
            if (index == 0 || index == 1)
                return value;
        })
        .join(':')
        .toString();
}