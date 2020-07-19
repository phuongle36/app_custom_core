$(document).ready(function () {
    $('.sensor-active').hide();
    $('.sensor-inactive').hide();
    $('.sensor-live').hide();
    $('.sensor-dead').hide();

    setInterval(function () {
        var dateNow = new Date();
        var temperature = $('.sensor-temperature');
        var tempAlert = $('.temperature-alert');
        var tempValue = [temperature[0].innerText.split('°'), temperature[1].innerText.split('°'), temperature[2].innerText];
        var dataDate = $('.sensor-date');
        var sensorActive = $('.sensor-active');
        var sensorInactive = $('.sensor-inactive');

        $.get('/updateMonitor').done(function (data) {
            if (data) {
                var sensorDate = new Date(data[0].date);
                temperature.css('opacity', '0');
                temperature.delay(500).animate({ opacity: 1 }, 300);
                tempAlert.delay(1000).animate({ opacity: 1 }, 500);
                
                for (var a = 0; a < data.length; a++) {
                    if (data[a].device[0].type === 'temperature') {
                        for (var b = 0; b < data[a].device.length; b++) {
                            temperature[b].innerText = data[a].device[b].value + '°C' + '  ';

                            if (data[a].device[b].value > tempValue[b][0]) {
                                $(temperature[b]).append('&nbsp<i class="fas fa-arrow-up" style="font-size:24px;color:#f55d5d;"></i>');
                            } else if (data[a].device[b].value < tempValue[b][0]) {
                                $(temperature[b]).append('&nbsp<i class="fas fa-arrow-down" style="font-size:24px;color:#094f8d;"></i>');
                            } else { }

                            if (data[a].device[b].value < 25) {
                                tempAlert[b].style.color = '#094f8d';
                                tempAlert[b].innerText = 'Too Cold';
                            } else if (data[a].device[b].value > 28) {
                                tempAlert[b].style.color = '#f55d5d';
                                tempAlert[b].innerText = 'Too Hot';
                            } else {
                                tempAlert[b].style.color = '#01a897';
                                tempAlert[b].innerText = 'The temperature is perfect';
                            }
                        }
                        break;
                    }
                }
                
                for (var a = 0; a < data.length; a++) {
                    if (data[a].device[0].type === 'ph') {
                        temperature[2].innerText = data[a].device[0].value;

                        if (data[a].device[0].value < tempValue[2]) {
                            $(temperature[2]).append('&nbsp<i class="fas fa-arrow-up" style="font-size:24px;color:#f55d5d;"></i>');
                        } else if (data[a].device[0].value < tempValue[2]) {
                            $(temperature[2]).append('&nbsp<i class="fas fa-arrow-down" style="font-size:24px;color:#094f8d;"></i>');
                        } else { }

                        if (data[a].device[0].value < 6) {
                            tempAlert[2].style.color = '#094f8d';
                            tempAlert[2].innerText = 'pH is too low';
                        } else if (data[a].device[0].value > 8.5) {
                            tempAlert[2].style.color = '#f55d5d';
                            tempAlert[2].innerText = 'pH is too high';
                        } else {
                            tempAlert[2].style.color = '#01a897';
                            tempAlert[2].innerText = 'pH is perfect';
                        }
                        break;
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
