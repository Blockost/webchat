function getRandomRGBColor(){
    var red = Math.floor(Math.random()*255);
    var green = Math.floor(Math.random()*255);
    var blue = Math.floor(Math.random()*255);
    return "rgb("+red+","+green+","+blue+")";
}