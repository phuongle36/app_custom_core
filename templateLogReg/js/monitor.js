$(document).ready(function () {
    $('.sensor-active').hide();
    $('.sensor-inactive').hide();
    $('.sensor-live').hide();
    $('.sensor-dead').hide();

    setInterval(function () {
        var dateNow = new Date();
        var temperature = $('.sensor-temperature');
        var tempAlert = $('.temperature-alert');
        var tempValue = [temperature[0].innerText.split('°'), temperature[1].innerText.split('°')];
        var dataDate = $('.sensor-date');
        var sensorActive = $('.sensor-active');
        var sensorInactive = $('.sensor-inactive');

        $.get('/updateMonitor').done(function (data) {
            if (data) {
                var sensorDate = new Date(data[0].date);
                temperature.css('opacity', '0');
                temperature.delay(500).animate({ opacity: 1}, 300);
                tempAlert.delay(1000).animate({ opacity: 1}, 500);

                for (var i = 0; i < data[0].device.length; i++) {
                    temperature[i].innerText = data[0].device[i].temperature + '°C' + '  ';

                    if (data[0].device[i].temperature > tempValue[i][0]) {
                        $(temperature[i]).append('<i class="fas fa-arrow-up" style="font-size:24px;color:#f55d5d;"></i>');
                    } else if (data[0].device[i].temperature < tempValue[i][0]) {
                        $(temperature[i]).append('<i class="fas fa-arrow-down" style="font-size:24px;color:#094f8d;"></i>');
                    } else {}

                    if (data[0].device[i].temperature < 25) {
                        tempAlert.css('color', '#094f8d');
                        tempAlert[i].innerText = 'Too Cold';
                    } else if (data[0].device[i].temperature > 28) {
                        tempAlert.css('color', '#f55d5d');
                        tempAlert[i].innerText = 'Too Hot';
                    } else {
                        tempAlert.css('color', '#01a897');
                        tempAlert[i].innerText = 'The temperature is perfect';
                    }
                }

                dataDate[0].innerText = data[0].date;

                if (dateNow.getTime() - sensorDate >= 3600000) {
                    sensorActive.hide();
                    sensorInactive.show();
                    $('.sensor-live').hide();
                    $('.sensor-dead').show();
                } else {
                    sensorInactive.hide();
                    sensorActive.show();
                    $('.sensor-dead').hide();
                    $('.sensor-live').show();
                }

            } else {
                temperature.innerText = 'Cannot get';
            }
        });
    }, 2000);
});
