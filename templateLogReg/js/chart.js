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
var todayLog = $('.chart-td-log');
var yesterdayLog = $('.chart-ys-log');
var monthLog = $('.chart-mn-log');
var todayStatus = $('.chart-status-today');
var chartTitle = $('.chart-title');
var tempType = $('.chart-type-temp');
var pHType = $('.chart-type-ph');
var options = {
    type: 'line',
    data: {
        labels: chartLabel,
        datasets: [{
            label: "Temperature ",
            lineTension: 0.3,
            backgroundColor: "rgba(255, 255, 255, 0)",
            borderColor: "rgba(0, 136, 39, 1)",
            data: chartData,
        },
        {
            label: "Low Limit ",
            lineTension: 0.3,
            backgroundColor: "rgba(50, 66, 92, 0.2)",
            borderColor: "rgba(78, 115, 223, 1)",
            fill: 'start',
            showLine: true,
            data: [],
        },
        {
            label: "High Limit ",
            lineTension: 0.3,
            backgroundColor: "rgba(50, 66, 92, 0.2)",
            borderColor: "rgba(204, 0, 0, 1)",
            fill: 'end',
            showLine: true,
            data: [],
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
                    display: false
                }
            }],
            yAxes: [{
                ticks: {
                    padding: 10,
                    // Include a dollar sign in the ticks
                    callback: function (value) {
                        if ($('.chart-type-temp').hasClass('active')) {
                            return number_format(value) + '°C';
                        } else {
                            return number_format(value);
                        }
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

function tempLogHandler(dateLog, temperatureLog, chartLabel, chartData) {
    if (typeof chartData[chartData.length - 1] === 'undefined' && $('.chart-td-log').hasClass('active')) {
        dateLog.text('No data to display');
        alertLog.text('Something gone wrong, our technical team is working to resolve this problem, please come back later!');
        temperatureLog.hide();
        return;
    }

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

function pHLogHandler(dateLog, temperatureLog, chartLabel, chartData) {
    if (typeof chartData[chartData.length - 1] === 'undefined' && $('.chart-td-log').hasClass('active')) {
        dateLog.text('No data to display');
        alertLog.text('Something gone wrong, our technical team is working to resolve this problem, please come back later!');
        temperatureLog.hide();
        return;
    }

    dateLog.css('opacity', '0');
    dateLog.delay(500).animate({ opacity: 1}, 300);
    dateLog.text(chartLabel[chartLabel.length - 1]);
    temperatureLog.css('opacity', '0');
    temperatureLog.delay(500).animate({ opacity: 1}, 300);
    temperatureLog.text(chartData[chartData.length - 1]);

    if (temperatureLog.text() > 7.6) {
        alertLog.text('pH is now too high, this will cause bad effects for your fish!');
    } else if (temperatureLog.text() < 6.8) {
        alertLog.text('pH is now too low, this will cause bad effects for your fish!');
    } else {
        alertLog.text('pH is perfect, no issue for your aquarium now!');
    }
}

function createFinder (day, month, year, count) {
    if (day) {
        var temp = year + '/' + month + '/' + day;
    } else {
        var temp = year + '/' + month;
    }

    return {
        data: {
            limit: count,
            finder: {
                topic: 'sensorTest',
                date: {
                    $regex: temp + '.*'
                }
            }
        }
    };
}

function setChart (chartFinder) {
    $.get('/setChart', chartFinder).done(function (data) {
        if (data) {
            chartLabel = [];
            chartData = [];
            options.data.datasets[1].data = [];
            options.data.datasets[2].data = [];

            for (var i = 0; i < data.length; i++) {
                if (data.length === 12) {
                    var splitDate = data[i].date.split(' ');
                    splitDate = splitDate[1].split(':');
                    splitDate = splitDate[0] + ':' + splitDate[1];
                } else {
                    var splitDate = data[i].date;
                }

                chartLabel.push(splitDate);
                if ($('.chart-type-temp').hasClass('active')) {
                    options.data.datasets[1].data.push(25);
                    options.data.datasets[2].data.push(28);
                    chartData.push(data[i].temp);
                } else {
                    options.data.datasets[1].data.push(6.8);
                    options.data.datasets[2].data.push(7.6);
                    chartData.push(data[i].pH);
                }
            }

            chartData.reverse();
            chartLabel.reverse();

            options.data.labels = chartLabel;
            options.data.datasets[0].data = chartData;

            if (data.length === 12) {
                options.options.scales.xAxes[0].ticks.display = true;
            } else {
                options.options.scales.xAxes[0].ticks.display = false;
            }

            myLineChart = new Chart(ctx, options);

            if ($('.chart-type-temp').hasClass('active')) {
                tempLogHandler(dateLog, temperatureLog, chartLabel, chartData);
            } else {
                pHLogHandler(dateLog, temperatureLog, chartLabel, chartData);
            }
        }
    });
}

function updateTodayChart () {
    $.post('/updateChart').done(function (data) {
        if (data) {
            var splitDate = data[0].date.split(' ');
            splitDate = splitDate[1].split(':');
            splitDate = splitDate[0] + ':' + splitDate[1];

            if (chartLabel[chartLabel.length - 1] !== splitDate) {
                chartLabel.shift();
                chartData.shift();
                chartLabel.push(splitDate);
                if ($('.chart-type-temp').hasClass('active')) {
                    chartData.push(data[0].temp);
                } else {
                    chartData.push(data[0].pH);
                }
                myLineChart = new Chart(ctx, options);

                if ($('.chart-type-temp').hasClass('active')) {
                    tempLogHandler(dateLog, temperatureLog, chartLabel, chartData);
                } else {
                    pHLogHandler(dateLog, temperatureLog, chartLabel, chartData);
                }
            }
        }
    });
}

function defaultHandler () {
    todayLog = $('.chart-td-log');
    yesterdayLog = $('.chart-ys-log');
    monthLog = $('.chart-mn-log');
    var today = new Date();
    var chartFinder = {};

    if (todayLog.hasClass('active')) {
        chartFinder = createFinder(today.getDate(), today.getMonth() + 1, today.getFullYear(), 12);
        setInterval(updateTodayChart, 120000);
    } else if (yesterdayLog.hasClass('active')) {
        chartFinder = createFinder(today.getDate() - 1, today.getMonth() + 1, today.getFullYear(), 0);
        clearInterval(updateTodayChart);
    } else if (monthLog.hasClass('active')) {
        chartFinder = createFinder(null, today.getMonth() + 1, today.getFullYear(), 0);
        clearInterval(updateTodayChart);
    }

    if ($('.chart-type-temp').hasClass('active')) {
        $('.about-temperature').show();
        $('.about-ph').hide();
    } else {
        $('.about-temperature').hide();
        $('.about-ph').show();
    }

    setChart(chartFinder);
}

todayLog.on('click', function () {
    if (!todayLog.hasClass('active')) {
        todayLog.addClass('active');
    }

    yesterdayLog.removeClass('active');
    monthLog.removeClass('active');
    chartTitle.text('(Today)');
    todayStatus.show();
    defaultHandler();
});

yesterdayLog.on('click', function () {
    if (!yesterdayLog.hasClass('active')) {
        yesterdayLog.addClass('active');
    }

    todayLog.removeClass('active');
    monthLog.removeClass('active');
    chartTitle.text('(Yesterday)');
    todayStatus.hide();
    defaultHandler();
});

monthLog.on('click', function () {
    if (!monthLog.hasClass('active')) {
        monthLog.addClass('active');
    }

    todayLog.removeClass('active');
    yesterdayLog.removeClass('active');
    chartTitle.text('(Month)');
    todayStatus.hide();
    defaultHandler();
});

tempType.on('click', function () {
    if (!tempType.hasClass('active')) {
        tempType.addClass('active');
    }

    pHType.removeClass('active');
    defaultHandler();
});

pHType.on('click', function () {
    if (!pHType.hasClass('active')) {
        pHType.addClass('active');
    }

    tempType.removeClass('active');
    defaultHandler();
});

window.onload = defaultHandler();
