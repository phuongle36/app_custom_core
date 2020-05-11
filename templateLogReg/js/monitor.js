$(document).ready(function () {
    setInterval(function () {
        var temperature = $('.sensor-temperature');
        var tempAlert = $('.temperature-alert');
        var tempValue = temperature[0].innerText.split('°');
        $.get('/updateMonitor').done(function (data) {
            if (data) {
                temperature.css('opacity', '0');
                temperature.delay(500).animate({ opacity: 1}, 300);
                tempAlert.delay(1000).animate({ opacity: 1}, 500);
                temperature[0].innerText = data + '°C' + '  ';
                if (data > tempValue[0]) {
                    temperature.append('<i class="fas fa-arrow-up" style="font-size:24px;color:#f55d5d;"></i>');
                } else if (data < tempValue[0]) {
                    temperature.append('<i class="fas fa-arrow-down" style="font-size:24px;color:#094f8d;"></i>');
                } else {}

                if (data < 25) {
                    tempAlert.css('color', '#094f8d');
                    tempAlert[0].innerText = 'Too Cold';
                } else if (data > 28) {
                    tempAlert.css('color', '#f55d5d');
                    tempAlert[0].innerText = 'Too Hot';
                } else {
                    tempAlert.css('color', '#01a897');
                    tempAlert[0].innerText = 'The temperature is perfect';
                }
            } else {
                temperature[0].innerText = 'Cannot get';
            }
        });
    }, 2000);
});