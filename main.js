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

    // cmd to the API server, flask
    function sendCMD(key) {
        var hostname = window.location.hostname; // 获取当前页面的主机名
        var url = `http://${hostname}:5000/control`; // 构建 URL

        fetch(url, {
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
        // 更新按键状态为按下状态
        keysPressed[event.key.toLowerCase()] = true;

        // 获取同时按下的按键数量
        var simultaneousKeysPressed = getSimultaneousKeysPressed();

        // 如果同时按下的按键数量大于1，则执行组合按键功能
        if (simultaneousKeysPressed.length > 1) {
            handleComboKeys(simultaneousKeysPressed);
            return;
        } else {
            // 否则，执行单个按键功能
            handleSingleKey(event.key.toLowerCase());
        }
    }

    // 获取同时按下的按键数组
    function getSimultaneousKeysPressed() {
        return Object.keys(keysPressed).filter(function (key) {
            return keysPressed[key];
        });
    }

    function handleKeyRelease(event) {
        // 更新按键状态为释放状态
        keysPressed[event.key.toLowerCase()] = false;

        // 检查同时按下的情况
        handleComboKeys();
    }

    function handleComboKeys() {
        if (keysPressed['w'] && keysPressed['a']) {
            sendCMD('w+a');
        } else if (keysPressed['w'] && keysPressed['d']) {
            sendCMD('w+d');
        } else if (keysPressed['s'] && keysPressed['a']) {
            sendCMD('s+a');
        } else if (keysPressed['s'] && keysPressed['d']) {
            sendCMD('s+d');
        } else if (keysPressed['w'] && keysPressed['j']) {
            sendCMD('w+j');
        } else if (keysPressed['w'] && keysPressed['k']) {
            sendCMD('w+k');
        } else {
            sendCMD('stop');
        }
    }

    function handleSingleKey(key) {
        switch (key) {
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

        document.addEventListener('keyup', handleKeyRelease);
    });


})();
