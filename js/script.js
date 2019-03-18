/*
This file is part of Finger Battle.

Finger Battle is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Finger Battle is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Finger Battle.  If not, see <http://www.gnu.org/licenses/>.
*/
$(document).ready(function () {
    /*
     * Text shadow CSS
     */
    function setShadow () {
        var result = "";
        var shadowlength = Math.round($(window).height() / 100);
        var i;
        for(i = 0; i < shadowlength; i++){
            result += i + "px " + i + "px #2c3e50, ";
        }
        result = result.substr(0, result.length-2);
        $("#text-layer1").css("text-shadow", result);
    }
    setShadow();
    $(window).on("resize", setShadow);
    /*
     * Variables
     */
    var keyCodes = {
        48: "0",
        49: "1",
        50: "2",
        51: "3",
        52: "4",
        53: "5",
        54: "6",
        55: "7",
        56: "8",
        57: "9",
        65: "a",
        66: "b",
        67: "c",
        68: "d",
        69: "e",
        70: "f",
        71: "g",
        72: "h",
        73: "i",
        74: "j",
        75: "k",
        76: "l",
        77: "m",
        78: "n",
        79: "o",
        80: "p",
        81: "q",
        82: "r",
        83: "s",
        84: "t",
        85: "u",
        86: "v",
        87: "w",
        88: "x",
        89: "y",
        90: "z"
    };
    var gameState = 0;
    var winAmount = 10;
    var moveAmount = 50 / winAmount;
    var currentPosition = 0;
    var holdTime = 0;
    var useMouse = false;
    var soundMuted = false;

    var key = {left: {}, right: {}};
    key.left.code = 65;
    key.right.code = 76;
    key.left.down, key.right.down = false;

    var html = {};
    html.menu = $("#html-menu").html();
    html.tutorial = $("#html-tutorial").html();
    html.settings = $("#html-settings").html();
    html.credits = $("#html-credits").html();
    html.credits2 = $("#html-credits2").html();
    var text = $("#text-layer1, #text-layer2");
    text.html(html.menu);

    var color = {left: {}, right: {}};
    color.left.off = "#cc1414";
    color.left.on = "#ff1919";
    color.right.off = "#1470cc";
    color.right.on = "#198cff";
    $("#leftBox").css("background-color", color.left.off);
    $("#rightBox").css("background-color", color.right.off);

    var audio = {};
    audio.gameOver = new Audio("audio/gameend.ogg");
    audio.left = new Audio("audio/lefttap.ogg");
    audio.right = new Audio("audio/righttap.ogg");
    audio.tick = new Audio("audio/tick.ogg");
    audio.gameStart = new Audio("audio/gamestart.ogg");
    /*
     * Game Tick
     */
    //only used for starting game as of now
    window.setInterval(function () {
        if (gameState !== 0) return;
        key.left.down && key.right.down ? holdTime++ : holdTime = 0;
        if (holdTime >= 10) {
            gameState = 1;
            setTimeout(function () { text.html("<h1>3</h1>"); audio.tick.play(); }, 0);
            setTimeout(function () { text.html("<h1>2</h1>"); audio.tick.play(); }, 1000);
            setTimeout(function () { text.html("<h1>1</h1>"); audio.tick.play(); }, 2000);
            setTimeout(function () { text.html("<h1>GO!</h1>"); playSound("gameStart"); gameState = 2;
            }, 3000); setTimeout(function () { text.html(""); }, 4000);
        }
    }, 100);
    /*
     * Menu Navigation
     */
     function navigateEvent(id, state, update) {
       $("#text-layer1, #text-layer2").on("click", ".show-" + id, function () {
           text.html(html[id]);
           gameState = state;
           if(update) { updateHTML(); }
       });
     }
     navigateEvent("menu"    , 0, true );
     navigateEvent("tutorial", 1, false);
     navigateEvent("settings", 1, true );
     navigateEvent("credits" , 1, false);
     navigateEvent("credits2", 1, false);
    /*
     * User Settings
     */
    $("#text-layer1, #text-layer2").on("keydown", ".set-size", function (e) {
        var k = e.keyCode;
        //backspace
        if (k === 8) winAmount < 10 ? winAmount = 0 : winAmount = parseInt(winAmount.toString().substring(0, winAmount.toString().length - 1));
        //no more than 2 digits
        if (winAmount > 9) {
            $(".settings-error").html("*stage size cannot be more than 2 digits<br />Press backspace to delete");
            return;
        }
        //numbers
        if ((k >= 48 && k <= 57)) {
            winAmount = parseInt(winAmount.toString() + keyCodes[k]);
            moveAmount = 50 / winAmount;
        }
        updateHTML();
    });
    $("#text-layer1, #text-layer2").on("focusout", ".set-size", function (e) {
        //stage size cannot be 0
        if (winAmount === 0) winAmount = 10;
        updateHTML();
    });
    $("#text-layer1, #text-layer2").on("focus blur", ".set-left, .set-right", function (e) {
        //visual feedback on options
        $(".settings-error").html("");
        if (useMouse) return;
        $(this).toggleClass("bold");
    });
    $("#text-layer1, #text-layer2").on("focus blur", ".set-size", function (e) {
        //visual feedback on options
        $(".settings-error").html("");
        $(this).toggleClass("bold");
    });
    $("#text-layer1, #text-layer2").on("keydown", ".set-left", function (e) {
        if (useMouse) return;
        //set left controls
        $(this).trigger("blur");
        setKey(e, "right", "left");
    });
    $("#text-layer1, #text-layer2").on("keydown", ".set-right", function (e) {
        if (useMouse) return;
        //set right controls
        $(this).trigger("blur");
        setKey(e, "left", "right");
    });
    $("#text-layer1, #text-layer2").on("click", ".set-controls", function (e) {
        //select mouse or keyboard
        useMouse = !useMouse
        updateHTML();
    });
    $("#text-layer1, #text-layer2").on("click", ".set-volume", function (e) {
        //toggle sound
        if (soundMuted) {
            soundMuted = false;
            setVolume(1.0);
        } else {
            soundMuted = true;
            setVolume(0.0);
        }
        updateHTML();
    });
    $("#text-layer1, #text-layer2").on("click", ".set-defaults", function (e) {
        //set to defaults
        winAmount = 10;
        moveAmount = 50 / winAmount;
        key.left.code = 65;
        key.right.code = 76;
        useMouse = false;
        soundMuted = false;
        setVolume(1.0);
        updateHTML();
    });
    /*
     * Play sounds (credits)
     */
    $("#text-layer1, #text-layer2").on("click", ".play-gameOver", function () {
        playSound("gameOver");
    });
    $("#text-layer1, #text-layer2").on("click", ".play-taps", function () {
        playSound("right");
        setTimeout(function () {
            playSound("left");
        }, 1000);
    });
    $("#text-layer1, #text-layer2").on("click", ".play-tick", function () {
        playSound("tick");
    });
    $("#text-layer1, #text-layer2").on("click", ".play-gameStart", function () {
        playSound("gameStart");
    });
    /*
     * Functions
     */
    function setKey(e, a, b) {
        var k = e.keyCode;
        if (k === key[a].code) {
            $(".settings-error").html("*key already in use");
            return;
        }
        if (k >= 65 && k <= 90) {
            key[b].code = k;
            updateHTML();
        } else {
            $(".settings-error").html("*key must be a letter");
        }
    }
    function updateHTML() {
        $(".current-size").html(winAmount);
        soundMuted ? $(".current-volume").html("yes") : $(".current-volume").html("no");
        if (useMouse) {
            $(".current-left").html("left-click");
            $(".current-right").html("right-click");
            $(".current-controls").html("yes");
            $(".set-left, .set-right").addClass("translucent");
        } else {
            $(".current-left").html(keyCodes[key.left.code].toUpperCase());
            $(".current-right").html(keyCodes[key.right.code].toUpperCase());
            $(".current-controls").html("no");
            $(".set-left, .set-right").removeClass("translucent");
        }
    }
    function testForWin() {
        if (Math.abs(currentPosition) === winAmount) {
            playSound("gameOver");
            gameState = 1;
            currentPosition > 0 ? text.html("Red wins!") : text.html("Blue wins!");
            currentPosition = 0;
            setTimeout(function () {
                gameState = 0;
                $("#container").animate({"left": "-50vw"}, 500);
                text.html(html.menu);
                updateHTML();
            }, 2000);
        }
    }
    function playerKeyDown(side, elem, dir) {
        if (key[side].down || gameState === 1) return;
        playSound([side]);
        $(elem).css("background-color", color[side].on);
        key[side].down = true;
        if (gameState !== 2) return;
        $("#container").css("left", "+=" + moveAmount * dir + "vw");
        currentPosition += dir;
        testForWin();
    }
    function playerKeyUp(side, elem) {
        key[side].down = false;
        $(elem).css("background-color", color[side].off);
    }
    function playSound(sound) {
        audio[sound].currentTime = 0;
        audio[sound].play();
    }
    function setVolume(v) {
        for(var x in audio) {
            audio[x].volume = v;
        }
    }
    /*
     * Keyboard Events
     */
    $(document).on("keydown", function (e) {
        if (useMouse) return;
        e.preventDefault();
        if (e.which === key.left.code) { playerKeyDown("left", "#leftBox", 1); }
        if (e.which === key.right.code) { playerKeyDown("right", "#rightBox", -1); }
    });
    $(document).on("keyup", function (e) {
        if (useMouse) return;
        if (e.which === key.left.code) { playerKeyUp("left", "#leftBox"); }
        if (e.which === key.right.code) { playerKeyUp("right", "#rightBox"); }
    });
    /*
     * Mouse Events
     */
    $(document).on("contextmenu", function (e) {
        //prevent right-click contextmenu
        e.preventDefault();
    });
    $(document).on("mousedown", function (e) {
        if (!useMouse) return;
        if (e.which === 1) { playerKeyDown("left", "#leftBox", 1); }
        if (e.which === 3) { playerKeyDown("right", "#rightBox", -1); }
    });
    $(document).on("mouseup", function (e) {
        if (!useMouse) return;
        if (e.which === 1) { playerKeyUp("left", "#leftBox"); }
        if (e.which === 3) { playerKeyUp("right", "#rightBox"); }
    });
});
