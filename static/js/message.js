/**
 * Practical class for messages manipulation
 * @param {String} from is the message's emitter
 * @param {String} text is what the emitter wants to say
 * @param {Date} date is time emitter has sent this message
 * @constructor
 */
function Message(from, text, date) {

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


    this.getShortDetails = () => {
        return $('<p>' + this.text + '</p>');
    };

    this.getFullDetails = () => {
        return $('<span class="msg_sender">' + this.from + '</span><span class="msg_time">'
            + getTimeOnly(this.date) + '</span><br>'
            + '<p>' + this.text + '</p>');
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