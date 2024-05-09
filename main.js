(function () {

    var signalObj = null;

    function startPlay() {
        if (signalObj)
            return;

        var hostname = location.hostname;
        var address = hostname + ':' + (location.port || (location.protocol === 'https:' ? 443 : 80)) + '/webrtc';
        var protocol = location.protocol === "https:" ? "wss:" : "ws:";
        var wsurl = protocol + '//' + address;

        var video = document.getElementById('v');

        signalObj = new signal(wsurl,
            function (stream) {
                console.log('got a stream!');
                video.srcObject = stream;
                video.play();
            },
            function (error) {
                alert(error);
                signalObj = null;
            },
            function () {
                console.log('websocket closed. bye bye!');
                video.srcObject = null;
                signalObj = null;
            },
            function (message) {
                alert(message);
            }
        );
    }

    function stopPlay() {
        if (signalObj) {
            signalObj.hangup();
            signalObj = null;
        }
    }

    function sendCMD2(cmd) {
        console.log("Command:", cmd);
    }

    // cmd to the API server, flask
    function sendCMD(key) {
        fetch('http://10.13.233.1:5000/control', {  // Hard code right
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key: key })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send control command');
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    // Map the keyboard
    function handleKeyPress(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
                sendCMD('w');
                break;
            case 's':
                sendCMD('s');
                break;
            case 'a':
                sendCMD('a');
                break;
            case 'd':
                sendCMD('d');
                break;
            case 'j':
                sendCMD('j');
                break;
            case 'k':
                sendCMD('k');
                break;
            case 'x':
                sendCMD('x');
                break;
            default:
                break;
        }
    }

    function handleKeyRelease(event) {
        // generally, when the key release, robot stop
        // set the key to 'x', x means stop
        sendCMD('x');
    }

    window.addEventListener('DOMContentLoaded', function () {

        var start = document.getElementById('start');
        if (start) {
            start.addEventListener('click', function (e) {
                startPlay();
            }, false);
        }
        else {
            // auto play if there is no stop button
            startPlay();
        }

        var stop = document.getElementById('stop');
        if (stop) {
            stop.addEventListener('click', function (e) {
                stopPlay();
            }, false);
        }

        // App will call viewPause/viewResume for view status change
        window.viewPause = stopPlay;
        window.viewResume = startPlay;

        // Control pannel
        var btnUp = document.getElementById("up");
        var btnDown = document.getElementById("down");
        var btnLeft = document.getElementById("left");
        var btnRight = document.getElementById("right");
        var btnstrafeLeft = document.getElementById("strafeLeft");
        var btnstrafeRight = document.getElementById("strafeRight");
        var btnstop = document.getElementById("robotStop");

        btnUp.addEventListener('click', function () {
            sendCMD('w');
        });

        btnDown.addEventListener('click', function () {
            sendCMD('s');
        });

        btnLeft.addEventListener('click', function () {
            sendCMD('a');
        });

        btnRight.addEventListener('click', function () {
            sendCMD('d');
        });

        btnstrafeLeft.addEventListener('click', function () {
            sendCMD('j');
        });

        btnstrafeRight.addEventListener('click', function () {
            sendCMD('k');
        });

        btnstop.addEventListener('click', function () {
            sendCMD('x');
        });

        document.addEventListener('keydown', handleKeyPress);

        // when the keyup, stop the robot
        // document.addEventListener('keyup', handleKeyRelease);
    });


})();
