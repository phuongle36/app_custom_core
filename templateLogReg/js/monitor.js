$(document).ready(function () {
    setInterval(function () {
        var temperature = $('.sensor-temperature');
        var tempAlert = $('.temperature-alert');
        var pH = $('.sensor-pH');
        var pHAlert = $('.pH-alert');
        var tempValue = temperature[0].innerText.split('°');
        var tempPHValue =  pH[0].innerText;

        $.get('/updateMonitor').done(function (data) {
            if (data) {
                temperature.css('opacity', '0');
                pH.css('opacity', '0');
                temperature.delay(500).animate({ opacity: 1}, 300);
                pH.delay(500).animate({ opacity: 1}, 300);
                tempAlert.delay(1000).animate({ opacity: 1}, 500);
                pHAlert.delay(1000).animate({ opacity: 1}, 500);
                temperature[0].innerText = data[0].temp + '°C' + '  ';
                pH[0].innerText = data[0].pH;

                if (data[0].temp > tempValue[0]) {
                    temperature.append('<i class="fas fa-arrow-up" style="font-size:24px;color:#f55d5d;"></i>');
                } else if (data[0].temp < tempValue[0]) {
                    temperature.append('<i class="fas fa-arrow-down" style="font-size:24px;color:#094f8d;"></i>');
                } else {}

                if (data[0].pH > tempPHValue) {
                    pH.append('<i class="fas fa-arrow-up" style="font-size:24px;color:#f55d5d;"></i>');
                } else if (data[0].pH < tempPHValue) {
                    pH.append('<i class="fas fa-arrow-down" style="font-size:24px;color:#094f8d;"></i>');
                } else {}

                if (data[0].temp < 25) {
                    tempAlert.css('color', '#094f8d');
                    tempAlert[0].innerText = 'Too Cold';
                } else if (data[0].temp > 28) {
                    tempAlert.css('color', '#f55d5d');
                    tempAlert[0].innerText = 'Too Hot';
                } else {
                    tempAlert.css('color', '#01a897');
                    tempAlert[0].innerText = 'The temperature is perfect';
                }

                if (data[0].pH < 6.8) {
                    pHAlert.css('color', '#094f8d');
                    pHAlert[0].innerText = 'Acidic';
                } else if (data[0].pH > 7.6) {
                    pHAlert.css('color', '#f55d5d');
                    pHAlert[0].innerText = 'Basic';
                } else {
                    pHAlert.css('color', '#01a897');
                    pHAlert[0].innerText = 'The pH is perfect';
                }

            } else {
                temperature[0].innerText = 'Cannot get';
                pH[0].innerText = 'Cannot get';
            }
        });
    }, 2000);
});