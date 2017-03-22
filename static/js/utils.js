/**
 * Authors: Simon ESPIGOLÉ, Teddy GILBERT, Hugo LEGRAND
 */

'use strict';

let avatar_colors = [
    'avatar_color1',
    'avatar_color2',
    'avatar_color3',
    'avatar_color4',
    'avatar_color5',
    'avatar_color6',
    'avatar_color7'
];

function getRandomColor() {
    return avatar_colors[Math.floor(Math.random() * (avatar_colors.length - 1))];
}

module.exports.getRandomColor = getRandomColor;