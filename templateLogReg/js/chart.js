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
            label: '',
            lineTension: 0.3,
            pointRadius: 0,
            backgroundColor: "rgba(78, 115, 223, 0.05)",
            borderColor: "rgba(78, 115, 223, 1)",
            data: chartData,
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
                        if ($('.chart-temp-1').hasClass('active')) {
                            return number_format(value) + '°C';
                        } else if ($('.chart-temp-2').hasClass('active')) {
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

$('#downloadDataT').hide();
$('#downloadDataP').hide();
$('.about-ph').hide();

function addZero (number) {
    if (number.toString().length === 1) {
        number = '0' + number;
    }
    
    return number;
}

function createFinder (day, month, year, count) {
    if (day) {
        day = addZero(day);
        month = addZero(month);
        var temp = year + '/' + month + '/' + day;
    } else if (!day) {
        month = addZero(month);
        var temp = year + '/' + month;
    } else if (!day && !month) {
        var temp = year;
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
            var num = 0;
            
            if ($('.chart-temp-1').hasClass('active') || $('.chart-temp-2').hasClass('active')) {
                for (var i = 0; i < data.length; i++) {
                    if (typeof data[i].device[0] == 'undefined') { }
                    else {
                        if (data[i].device[0].type === 'temperature') {
                            var splitDate = data[i].date;
                            chartLabel.push(splitDate);
                            if ($('.chart-temp-1').hasClass('active')) {
                                chartData.push(data[i].device[0].value);
                            } else {
                                chartData.push(data[i].device[1].value);
                            }
                            num++;
                        }
                    }
                }
            } else {
                for (var i = 0; i < data.length; i++) {
                    if (typeof data[i].device[0] == 'undefined') { }
                    else {
                        if (data[i].device[0].type === 'ph') {
                            var splitDate = data[i].date;

                            chartLabel.push(splitDate);
                            chartData.push(data[i].device[0].value);
                            num++;
                        }
                    }
                }
            }

            chartData.reverse();
            chartLabel.reverse();

            options.data.labels = chartLabel;
            options.data.datasets[0].data = chartData;
            options.options.scales.xAxes[0].display = false;
            
            if ($('.chart-temp-1').hasClass('active') || $('.chart-temp-2').hasClass('active')) {
                options.data.datasets[0].label = 'Temperature';
            } else {
                options.data.datasets[0].label = 'pH';
            }

            myLineChart = new Chart(ctx, options);
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
        chartFinder = createFinder(today.getDate(), today.getMonth() + 1, today.getFullYear(), 0);
    } else if (yesterdayLog.hasClass('active')) {
        chartFinder = createFinder(today.getDate() - 1, today.getMonth() + 1, today.getFullYear(), 0);
    } else if (monthLog.hasClass('active')) {
        chartFinder = createFinder(null, today.getMonth() + 1, today.getFullYear(), 0);
    } else {
        return;
    }

    myLineChart.destroy();
    setChart(chartFinder);
}

function JSONToCSVConvertor(JSONData, ReportTitle, Type, ShowLabel) {
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

    var CSV = '';

    CSV += ReportTitle + '\r\n\n';

    if (ShowLabel) {
        if (Type === 'temperature') {
            var row = "";
            row += 'Date' + ',' + 'Device 1 - Temperature' + ',' + 'Device 2 - Temperature' + ',';
            row = row.slice(0, -1);
            CSV += row + '\r\n';
        } else {
            var row = "";
            row += 'Date' + ',' + 'Device 3 - pH' + ',';
            row = row.slice(0, -1);
            CSV += row + '\r\n';
        }
    }

    for (var i = 0; i < arrData.length; i++) {
        var row = "";

        if (typeof arrData[i].device[0] == 'undefined') { }
        else {
            if (arrData[i].device[0].type === Type && Type === 'temperature') {
                for (var index in arrData[i]) {
                    if (index == 'device') {
                        row += '"' + arrData[i][index][0].value + '",';
                        row += '"' + arrData[i][index][1].value + '",';
                    } else {
                        if (index == 'date') {
                            row += '"' + arrData[i][index] + '",';
                        }
                    }
                }

                row.slice(0, row.length - 1);

                CSV += row + '\r\n';
            } 
            if (arrData[i].device[0].type === Type && Type === 'ph') {
                for (var index in arrData[i]) {
                    if (index == 'device') {
                        row += '"' + arrData[i][index][0].value + '",';
                    } else {
                        if (index == 'date') {
                            row += '"' + arrData[i][index] + '",';
                        }
                    }
                }

                row.slice(0, row.length - 1);

                CSV += row + '\r\n';
            }
        }
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }

    var fileName = "Report_";
    fileName += ReportTitle.replace(/ /g, "_");

    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

    var link = document.createElement("a");
    link.href = uri;

    link.style = "visibility:hidden";
    link.download = fileName + ".csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    $('#downloadData').hide();
    $('#downloadButton').addClass('btn-primary');
    $('#downloadButton').removeClass('btn-secondary');
});

$('.chart-temp-1').on('click', function () {
    if (!$('.chart-temp-1').hasClass('active')) {
        $('.chart-temp-1').addClass('active');
    }

    $('.chart-temp-2').removeClass('active');
    $('.chart-ph-3').removeClass('active');
    $('.about-ph').hide();
    $('.about-temperature').show();
    defaultHandler();
});

$('.chart-temp-2').on('click', function () {
    if (!$('.chart-temp-2').hasClass('active')) {
        $('.chart-temp-2').addClass('active');
    }

    $('.chart-temp-1').removeClass('active');
    $('.chart-ph-3').removeClass('active');
    $('.about-ph').hide();
    $('.about-temperature').show();
    defaultHandler();
});

$('.chart-ph-3').on('click', function () {
    if (!$('.chart-ph-3').hasClass('active')) {
        $('.chart-ph-3').addClass('active');
    }

    $('.chart-temp-1').removeClass('active');
    $('.chart-temp-2').removeClass('active');
    $('.about-temperature').hide();
    $('.about-ph').show();
    defaultHandler();
});

$('#downloadDataT').on('click', function () {
    var data = $('#downloadButton').data('download');

    if (!data) {
        return;
    }

    JSONToCSVConvertor(data, "Temperature Sensor Data Report", "temperature", true);
});

$('#downloadDataP').on('click', function () {
    var data = $('#downloadButton').data('download');

    if (!data) {
        return;
    }

    JSONToCSVConvertor(data, "PH Sensor Data Report", "ph", true);
});

$('#downloadButton').on('click', function () {
    $.get('/download').done(function (data) {
        if (data) {
            $('#downloadButton').data('download', data);
            $('#downloadButton').removeClass('btn-primary');
            $('#downloadButton').addClass('btn-secondary');
            $('#downloadButton').hide();
            $('#downloadDataT').show();
            $('#downloadDataP').show();
        }
    });
});

sideBarButton.on('click', function () {
    defaultHandler();
});

window.onload = defaultHandler();

