(function () {

    var signalObj = null;
    var keysPressed = {}; // track combination keys

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

    function debounce(func, delay) {
        let timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, arguments), delay);
        };
    }

    // cmd to the API server, flask
    const sendCMD = debounce((key) => {
        let route;
        switch (key) {
            case 'w':
                route = 'forward';
                break;
            case 's':
                route = 'backward';
                break;
            case 'a':
                route = 'strafe_left';
                break;
            case 'd':
                route = 'strafe_right';
                break;
            case 'j':
                route = 'turn_left';
                break;
            case 'k':
                route = 'turn_right';
                break;
            case 'x':
                route = 'stop';
                break;
            default:
                break;
        }

        var hostname = window.location.hostname; // 获取当前页面的主机名
        var url = `http://${hostname}:5000/${route}`; // 构建 URL

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send control command');
                }
            })
            .catch(error => {
                console.error(error);
            });
    }, 100); // 500ms debounce time

    // Map the keyboard

    function handleKeyPress(e) {
        switch (e.key.toLowerCase()) {
            case 'w':
                sendCMD('w');
                break;
            case 'a':
                sendCMD('a');
                break;
            case 's':
                sendCMD('s');
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
            default:
                break;
        }
    }

    function handleKeyRelease() {
        sendCMD('x');
    }

    window.addEventListener('DOMContentLoaded', function () {

        var start = document.getElementById('stream-start');
        if (start) {
            start.addEventListener('click', function (e) {
                startPlay();
            }, false);
        }
        else {
            // auto play if there is no stop button
            startPlay();
        }

        var stop = document.getElementById('stream-stop');
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
        var btnstop = document.getElementById("stop");

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

        btnstop.addEventListener('click', function () {
            sendCMD('x');
        });


        document.addEventListener('keydown', handleKeyPress);

        document.addEventListener('keyup', handleKeyRelease);
    });


})();