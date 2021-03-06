(function($){
    function prepareBurndownChart() {
        var rawObject = JSON.parse($data.Model.currentSprint().SprintBurndownData);
        var chartNames = rawObject.m_Item1;
        var columns = rawObject.m_Item2;

        var remainingSerie = {
            Points: new Array(),
            Color: '#24A0DA',
            Type: 'area',
            Name: chartNames[0] || 'Remaining hours'
        };

        var todoSerie = {
            Points: new Array(),
            Color: '#ffa500',
            Type: 'area',
            Name: chartNames[1] || 'To do hours'
        };

        var idealSerie = {
            Points: new Array(),
            Color: '#ffffff',
            Type: 'line',
            Name: chartNames[2] || 'Ideal line'
        };

        /*
        columns = [{
            Key: "\/Date(1332111600000+0100)\/",
            Value: [150, 140]
        },{
            Key: "\/Date(1332198000000+0100)\/",
            Value: [140, 110]
        },{
            Key: "\/Date(1332199000000+0100)\/",
            Value: [132, 125]
        },{
            Key: "\/Date(1332199100000+0100)\/",
            Value: [107, 85]
        },{
            Key: "\/Date(1332199200000+0100)\/",
            Value: [120, 60]
        },{
            Key: "\/Date(1332199300000+0100)\/",
            Value: [100, 75]
        },{
            Key: "\/Date(1332199400000+0100)\/",
            Value: [-1, -1]
        },{
            Key: "\/Date(1332199400000+0100)\/",
            Value: [-1, -1]
        }];*/

        for (var cIndex = 0; columns.length >= 2 && cIndex < columns.length; cIndex++) {
            var kvPair = columns[cIndex];

            kvPair.Key = kvPair.Key.substring(1, kvPair.Key.length - 1);
            var date = eval('new ' + kvPair.Key + ';');
            var values = kvPair.Value;

            for (var vIndex = 0; vIndex <= values.length; vIndex++) {
                var value = values[vIndex];
                var serie;

                switch (vIndex) {
                case 0:
                    serie = remainingSerie;                     
                    break;
                case 1:
                    serie = todoSerie; 
                    break;
                default:
                    serie = idealSerie;
                    value = remainingSerie.Points[0][1] * ((columns.length - 1 - cIndex) / (columns.length - 1));
                    break;
                }

                serie.Points.push([date, value >= 0 ? value : null]);
            }
        }

        return {
            Remaining: remainingSerie,
            ToDo: todoSerie,
            Ideal: idealSerie
        };
    }

    function createChart(container, charts) {
        function transform(points) {
            var res = new Array();
            for (var i = 0; i < points.length; i++) {
                res.push([i + 1, points[i][1]]);
            }
            return res;
        }

        var remainingPoints = transform(charts.Remaining.Points);
        var todoPoints = transform(charts.ToDo.Points);
        var idealPoints = transform(charts.Ideal.Points);

        // http://www.highcharts.com/ref/
        chart = new Highcharts.Chart({
            title: {
                text: null
            },
            chart: {
                renderTo: container,
                backgroundColor: 'transparent',
                marginTop: 50
            },
            credits: {
                enabled: false
            },
            legend: {
                align: 'right',
                verticalAlign: 'top',
                floating: true,
                layout: 'vertical',
                backgroundColor: 'black',
                itemStyle: {
                    cursor: 'default',
                    color: 'white'
                },
                itemHoverStyle: {
                    cursor: 'default',
                    color: 'white'
                }
            },
            exporting: {
                enabled: false
            },
            xAxis: {
                tickInterval: 1,
                labels: {
                    style: {
                        color: 'white'
                    }
                }
            },
            yAxis: {
                title: {
                    text: null
                },
                tickInterval: 25,
                labels: {
                    style: {
                        color: 'white'
                    }
                }
            },
            plotOptions: {
                area: {
                    marker: {
                        enabled: false
                    },
                    fillOpacity: 1,
                    shadow: false
                },
                line: {
                    marker: {
                        enabled: false
                    }
                },
                series: {
                    animation: false,
                    enableMouseTracking: false,
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    events: {
                        legendItemClick: function() { return false; }
                    }
                }
            },
            tooltip: {
                enabled: false
            },
            navigation: {
                buttonOptions: {
                    enabled: false
                }
            },
            series: [{
                name: charts.Remaining.Name,
                data: remainingPoints,
                type: charts.Remaining.Type,
                color: charts.Remaining.Color
            }, {
                name: charts.ToDo.Name,
                data: todoPoints,
                type: charts.ToDo.Type,
                color: charts.ToDo.Color
            }, {
                name: charts.Ideal.Name,
                data: idealPoints,
                type: charts.Ideal.Type,
                color: charts.Ideal.Color
            }]
        });

        return chart;
    }

    function findLastValidPoint(serie) {
        for (var i = serie.data.length - 1; i >= 0; i--) {
            var point = serie.data[i];
            if (point.y != undefined && point.y != null) {
                return point;
            }    
        }
        return null;
    }

   
    var methods = {
        init: function() {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('burndownChart') || { };

                if (data.initialized) {
                    return;
                }

                $this.empty();

                var inputData = prepareBurndownChart();

                data.chart = createChart(this, inputData);
                data.initialized = true;
                $this.data('burndownChart', data);
            });
        },

        addInProgressHours: function(hours) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('burndownChart');
                var point = findLastValidPoint(data.chart.series[0]);

                point.update(point.y + hours);
            });
        },

        addToDoHours: function(hours) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('burndownChart');
                var point = findLastValidPoint(data.chart.series[1]);

                point.update(point.x + hours);
            });
        }
    };

    $.fn.burndownChart = function(method) {
        if (!method) {
            return methods.init.apply(this, arguments);
        } else if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.burndownChart');
        }
    };
})(jQuery);

function DisplayBurndownChart() {
    var $container = $('#burndownChart');

    if ($container.length <= 0) {
        setTimeout(DisplayBurndownChart, 100);
        return;
    }

    $container.burndownChart();
}