// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

function number_format(number) {
    return number;
}

var chartLabel = [];
var chartData = [];
var ctx = document.getElementById("myAreaChart");
var myLineChart = new Chart(ctx, options);
var temperatureLog = $('.temperature-log');
var dateLog = $('.date-log');
var alertLog = $('.alert-log');
var options = {
    type: 'line',
    data: {
        labels: chartLabel,
        datasets: [{
            label: "Temperature ",
            lineTension: 0.3,
            backgroundColor: "rgba(255, 255, 255, 0)",
            borderColor: "rgba(0, 136, 39, 1)",
            pointRadius: 3,
            pointBackgroundColor: "rgba(78, 115, 223, 1)",
            pointBorderColor: "rgba(78, 115, 223, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 2,
            data: chartData,
        },
        {
            label: "Low Limit ",
            lineTension: 0.3,
            backgroundColor: "rgba(50, 66, 92, 0.2)",
            borderColor: "rgba(78, 115, 223, 1)",
            pointRadius: 3,
            pointBackgroundColor: "rgba(78, 115, 223, 1)",
            pointBorderColor: "rgba(78, 115, 223, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 2,
            fill: 'start',
            data: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
        },
        {
            label: "High Limit ",
            lineTension: 0.3,
            backgroundColor: "rgba(50, 66, 92, 0.2)",
            borderColor: "rgba(204, 0, 0, 1)",
            pointRadius: 3,
            pointBackgroundColor: "rgba(78, 115, 223, 1)",
            pointBorderColor: "rgba(78, 115, 223, 1)",
            pointHitRadius: 10,
            pointBorderWidth: 2,
            fill: 'end',
            data: [28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
        }],
    },
    options: {
        maintainAspectRatio: false,
        layout: {
            padding: {
                left: 10,
                right: 25,
                top: 25,
                bottom: 0
            }
        },
        scales: {
            xAxes: [{
                time: {
                    unit: 'date'
                },
                gridLines: {
                    display: true,
                    drawBorder: false
                },
                ticks: {
                    maxTicksLimit: 12
                }
            }],
            yAxes: [{
                ticks: {
                    padding: 10,
                    // Include a dollar sign in the ticks
                    callback: function (value) {
                        return number_format(value) + '°C';
                    }
                },
                gridLines: {
                    color: "rgb(234, 236, 244)",
                    zeroLineColor: "rgb(234, 236, 244)",
                    drawBorder: false,
                    borderDash: [2],
                    zeroLineBorderDash: [2]
                }
            }],
        },
        legend: {
            display: false
        },
        tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            titleMarginBottom: 10,
            titleFontColor: '#6e707e',
            titleFontSize: 14,
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            intersect: false,
            mode: 'index',
            caretPadding: 10
        }
    }
}

function logHandler(dateLog, temperatureLog, chartLabel, chartData) {
    dateLog.css('opacity', '0');
    dateLog.delay(500).animate({ opacity: 1}, 300);
    dateLog.text(chartLabel[chartLabel.length - 1]);
    temperatureLog.css('opacity', '0');
    temperatureLog.delay(500).animate({ opacity: 1}, 300);
    temperatureLog.text(chartData[chartData.length - 1] + '°C');

    if (temperatureLog.text().split('°')[0] > 28) {
        alertLog.text('At this time, the temperature is too high for the aquarium, please adjust this!');
    } else if (temperatureLog.text().split('°')[0] < 25) {
        alertLog.text('At this time, the temperature is too low for the aquarium, please adjust this!');
    } else {
        alertLog.text('The temperature is perfect, no issue for your aquarium now!');
    }
}

$.post('/setChart').done(function (data) {
    if (data) {
        for (var i = 0; i < data.length; i++) {
            var splitDate = data[i].date.split(' ');
            splitDate = splitDate[1].split(':');
            splitDate = splitDate[0] + ':' + splitDate[1];
            chartLabel.push(splitDate);
            chartData.push(data[i].temp);
        }

        chartData.reverse();
        chartLabel.reverse();
        myLineChart = new Chart(ctx, options);
        logHandler(dateLog, temperatureLog, chartLabel, chartData);
    }
});

setInterval(function () {
    $.post('/updateChart').done(function (data) {
        if (data) {
            var splitDate = data[0].date.split(' ');
            splitDate = splitDate[1].split(':');
            splitDate = splitDate[0] + ':' + splitDate[1];

            if (chartLabel[chartLabel.length - 1] !== splitDate) {
                chartLabel.shift();
                chartData.shift();
                chartLabel.push(splitDate);
                chartData.push(data[0].temp);
                myLineChart = new Chart(ctx, options);
                logHandler(dateLog, temperatureLog, chartLabel, chartData);
            }
        }
    });
}, 120000);
