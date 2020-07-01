// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

function number_format(number) {
    return number;
}

var chartLabel = [];
var chartData = [];
var sideBarButton = $('#sidebarToggle');
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
var options = {
    type: 'line',
    data: {
        labels: chartLabel,
        datasets: [{
            label: "Temperature ",
            lineTension: 0.3,
            pointRadius: 0,
            backgroundColor: "rgba(255, 255, 255, 0)",
            borderColor: "rgba(0, 136, 39, 1)",
            data: chartData,
        },
        {
            label: "Low Limit ",
            lineTension: 0.3,
            pointRadius: 0,
            backgroundColor: "rgba(50, 66, 92, 0.2)",
            borderColor: "rgba(78, 115, 223, 1)",
            fill: 'start',
            showLine: true,
            data: [],
        },
        {
            label: "High Limit ",
            lineTension: 0.3,
            pointRadius: 0,
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
                display: false,
                time: {
                    unit: 'date'
                },
                gridLines: {
                    display: false,
                    drawBorder: false
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

$('#downloadData').hide();

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

function createFinder (day, month, year, count) {
    if (day) {
        var temp = parseInt(year) + '/' + parseInt(month) + '/' + parseInt(day);
    } else if (!day) {
        var temp = parseInt(year) + '/' + parseInt(month);
    } else if (!day && !month) {
        var temp = parseInt(year);
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
                options.data.datasets[1].data.push(25);
                options.data.datasets[2].data.push(28);

                if ($('.chart-temp-1').hasClass('active')) {
                    chartData.push(data[i].device[0].temperature);
                } else {
                    chartData.push(data[i].device[1].temperature);
                }
            }

            chartData.reverse();
            chartLabel.reverse();

            options.data.labels = chartLabel;
            options.data.datasets[0].data = chartData;

            if (data.length === 12) {
                options.options.scales.xAxes[0].display = true;
            } else {
                options.options.scales.xAxes[0].display = false;
            }

            myLineChart = new Chart(ctx, options);

            tempLogHandler(dateLog, temperatureLog, chartLabel, chartData);
        }
    });
}

function updateDataChart (chartFinder) {
    $.get('/updateChart', chartFinder).done(function (data) {
        if (data) {
            if (typeof data[0] === 'undefined') {
                return;
            }

            var splitDate = data[0].date.split(' ');
            splitDate = splitDate[1].split(':');
            splitDate = splitDate[0] + ':' + splitDate[1];

            if (chartLabel[chartLabel.length - 1] !== splitDate) {
                chartLabel.shift();
                chartData.shift();
                chartLabel.push(splitDate);

                if ($('.chart-temp-1').hasClass('active')) {
                    chartData.push(data[0].device[0].temperature);
                } else {
                    chartData.push(data[0].device[1].temperature);
                }

                myLineChart = new Chart(ctx, options);

                tempLogHandler(dateLog, temperatureLog, chartLabel, chartData);
            }
        }
    });
}

function defaultHandler () {
    todayLog = $('.chart-td-log');
    yesterdayLog = $('.chart-ys-log');
    monthLog = $('.chart-mn-log');
    $('.search-section').hide();
    var today = new Date();
    var chartFinder = {};
    var myInterval;

    if (todayLog.hasClass('active')) {
        chartFinder = createFinder(today.getDate(), today.getMonth() + 1, today.getFullYear(), 12);
        myInterval = setInterval(updateDataChart(chartFinder), 5000);
    } else if (yesterdayLog.hasClass('active')) {
        chartFinder = createFinder(today.getDate() - 1, today.getMonth() + 1, today.getFullYear(), 0);
        clearInterval(myInterval);
    } else if (monthLog.hasClass('active')) {
        chartFinder = createFinder(null, today.getMonth() + 1, today.getFullYear(), 0);
        clearInterval(myInterval);
    } else {
        return;
    }

    setChart(chartFinder);
}

$('.search-day-submit').on('click', function () {
    var searchDate = $('#search-date').val().split('-');
    var chartFinder = createFinder(searchDate[2], searchDate[1], searchDate[0], 0);

    setChart(chartFinder);
});

$('.search-month-submit').on('click', function () {
    var searchDate = $('#search-date').val().split('-');
    var chartFinder = createFinder(null, searchDate[1], searchDate[0], 0);

    setChart(chartFinder);
});

$('.search-year-submit').on('click', function () {
    var searchDate = $('#search-date').val().split('-');
    var chartFinder = createFinder(null, null, searchDate[0], 0);

    setChart(chartFinder);
});

todayLog.on('click', function () {
    if (!todayLog.hasClass('active')) {
        todayLog.addClass('active');
    }

    yesterdayLog.removeClass('active');
    monthLog.removeClass('active');
    $('.chart-search').removeClass('active');
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
    $('.chart-search').removeClass('active');
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
    $('.chart-search').removeClass('active');
    chartTitle.text('(Month)');
    todayStatus.hide();
    defaultHandler();
});

$('.chart-search').on('click', function () {
    if (!$('.chart-search').hasClass('active')) {
        $('.chart-search').addClass('active');
    }

    todayLog.removeClass('active');
    yesterdayLog.removeClass('active');
    monthLog.removeClass('active');
    chartTitle.text('(Day)');
    todayStatus.hide();
    defaultHandler();
    $('.search-section').show();
});

$('.chart-export').on('click', function () {
    todayLog.removeClass('active');
    yesterdayLog.removeClass('active');
    monthLog.removeClass('active');
    $('#downloadData').hide();
    $('#downloadButton').addClass('btn-primary');
    $('#downloadButton').removeClass('btn-secondary');
});

$('.chart-temp-1').on('click', function () {
    if (!$('.chart-temp-1').hasClass('active')) {
        $('.chart-temp-1').addClass('active');
    }

    $('.chart-temp-2').removeClass('active');
    defaultHandler();
});

$('.chart-temp-2').on('click', function () {
    if (!$('.chart-temp-2').hasClass('active')) {
        $('.chart-temp-2').addClass('active');
    }

    $('.chart-temp-1').removeClass('active');
    defaultHandler();
});

$('#downloadData').on('click', function () {
    this.href = 'data:application/json;charset=utf-8,'  + encodeURIComponent(JSON.stringify($('#downloadButton').data('download'), null, 2));
});

$('#downloadButton').on('click', function () {
    $.get('/download').done(function (data) {
        if (data) {
            $('#downloadButton').data('download', data);
            $('#downloadButton').removeClass('btn-primary');
            $('#downloadButton').addClass('btn-secondary');
            $('#downloadData').show();
        }
    });
});

sideBarButton.on('click', function () {
    defaultHandler();
});

window.onload = defaultHandler();

