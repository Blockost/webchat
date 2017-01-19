'use strict';

let colors = [
    '#E8EAF6',
    '#FBE9E7',
    '#E0F2F1',
    '#F3E5F5',
    '#EEEEEE',
    '#FFEBEE',
    '#E3F2FD'
];

function getRandomColor() {
    return colors[Math.floor(Math.random() * (colors.length - 1))];
}

module.exports.getRandomColor = getRandomColor;