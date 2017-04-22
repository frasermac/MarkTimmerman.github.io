var container,
    seriesIndexExtents,
    xExtent,
    yExtent;
var parseDate = function(d) { return new Date(d.replace(/-/g, '\/')).getTime(); }
var formatDate = function(m) {
    var d = new Date(m);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + " '" + String(d.getFullYear()).substr(2,2);
};
var chartAreaWidth = 0.80;
var chartAreaHeight = 0.90;

var breakpointSmall = 700;
var breakpointMedium = 950;

// Based on ChartArea
var titleX = 0.1,
    titleYAbs = 50;
var pathHeight = 0.45,
    pathY = 0.1,
    pathPadding = 20;
var xAxisWidth = 0.8,
    xAxisY = pathHeight + pathY + 0.05;
var selectorsHeight = 0.25,
    selectorsY = 0.70;

var selectorStroke = 'rgba(255, 255, 255, 0.655555)';
var selectorStrokeWidth = 1;
var selectorFill = 'rgba(255, 255, 255, 0.0)';
var selectorHighlightFill = 'rgba(255, 255, 255, 0.4)';
var selectorSelectedFill = 'rgba(255, 255, 255, 0.2)';
var buttonsActive = false;

window.onload = function() {
    for(var i=0;i<series.length;i++) {
        for(var y=0;y<series[i].data.length;y++) {
            series[i].data[y].index = parseDate(series[i].data[y].index);
        }

        for(var y=0;y<series[i].events.length;y++) {
            series[i].events[y].index = parseDate(series[i].events[y].index);
        }
    }

    // Calculate extents of all series so that they display relative to one another
    // on the graph
    seriesExtents = series.map(function(s, i) {
        var minIndex = Math.min.apply(null, series[i].data.map(function(d) { return d.index; }));
        var maxIndex = Math.max.apply(null, series[i].data.map(function(d) { return d.index; }));
        var minValue = Math.min.apply(null, series[i].data.map(function(d) { return d.value; }));
        var maxValue = Math.max.apply(null, series[i].data.map(function(d) { return d.value; }));
        return {
            minIndex: minIndex, maxIndex: maxIndex,
            minValue: minValue, maxValue: maxValue
        };
    });
    var minIndex = Math.min.apply(null, seriesExtents.map(function(e) { return e.minIndex; }));
    var maxIndex = Math.max.apply(null, seriesExtents.map(function(e) { return e.maxIndex; }));
    var xDomain = xExtent = [minIndex, maxIndex];

    var minValue = Math.min.apply(null, seriesExtents.map(function(e) { return e.minValue; }));
    var maxValue = Math.max.apply(null, seriesExtents.map(function(e) { return e.maxValue; }));
    var yDomain = yExtent = [minValue, maxValue];

    container = new d3Component({
        type: 'svg',
        width: d3.select('body').style('width').replace(/px/g,''),
        height: d3.select('body').style('height').replace(/px/g,'')
    });

    var background = container.background = new d3Component({
        type: 'g',
        container: container.svg,
        width: container.innerWidth,
        height: container.innerHeight
    });

    background.bgLeft = new d3Component({
        type: 'rect',
        container: background.g,
        width: background.innerWidth / 2,
        height: background.height,
        x: 0,
        fill: 'rgba(204, 0, 0, 1.0)'
    });

    background.bgRight = new d3Component({
        type: 'rect',
        container: background.g,
        width: background.innerWidth / 2,
        height: background.height,
        x: background.innerWidth / 2,
        fill: 'rgba(51, 51, 51, 0.5)'
    });

    if(container.innerWidth < breakpointSmall) {
        chartAreaWidth = 1;
        chartAreaHeight = 1;
    } else if(container.innerWidth < breakpointMedium) {
        chartAreaWidth = 0.95;
        chartAreaHeight = 0.95;
    }
    var chartArea = container.chartArea = new d3Component({
        type: 'g',
        container: container.svg,
        width: container.innerWidth * chartAreaWidth,
        height: container.innerHeight * chartAreaHeight,
        x: container.innerWidth * (1 - chartAreaWidth) / 2,
        y: container.innerHeight * (1 - chartAreaHeight) / 2
    });

    chartArea.background = new d3Component({
        type: 'rect',
        container: chartArea.g,
        width: chartArea.innerWidth,
        height: chartArea.innerHeight,
        fill: 'rgba(34, 36, 38, 0.98)',
    });

    if(chartArea.innerWidth < breakpointSmall) {
        titleYAbs = titleYAbs - 25;
    }
    chartArea.title = new d3Component({
        type: 'text',
        container: chartArea.g,
        x: chartArea.innerWidth * titleX,
        y: titleYAbs,
        fill: 'rgba(255, 255, 255, 0.8)',
        style: {
            'text-transform': function(d) { return 'uppercase'; },
            'font-size': function(d) { return 20; },
            'letter-spacing': function(d) { return '0.8px'; }
        },
        displayText: 'Tesla Sales over Time'
    });

    chartArea.subTitle = new d3Component({
        type: 'a',
        container: chartArea.g,
        link: 'mailto: mark@thebradway.com',
        x: chartArea.innerWidth * titleX + 12,
        y: titleYAbs + 16
    });

    chartArea.subTitleText = new d3Component({
        type: 'text',
        container: chartArea.subTitle.a,
        fill: 'rgba(255, 255, 255, 0.8)',
        style: {
            'text-transform': function(d) { return ''; },
            'font-size': function(d) { return 12; },
            'letter-spacing': function(d) { return '0.5px'; }
        },
        displayText: 'by Mark Timmerman (mark@thebradway.com)'
    });

    /*
        X Axis
   */

    var xOffset = 1;
    if(chartArea.innerWidth * xAxisWidth < breakpointSmall) {
        xOffset = 0.40;
    }
    var xAxis = chartArea.xAxis = new d3Component({
        type: 'g',
        container: chartArea.g,
        width: chartArea.innerWidth * xAxisWidth * (1 - (xOffset / 2 * (xOffset == 1 ? 0 : 1))), // C'mon, this is janky.
        height: 5,
        x: chartArea.innerWidth * (1 - xAxisWidth) / (2 * xOffset),
        y: chartArea.innerHeight * xAxisY
    });

    xAxis.horizontalLine = new d3Component({
        type: 'line',
        container: xAxis.g,
        x1: 0,
        x2: xAxis.innerWidth,
        y1: xAxis.innerHeight * 0.75,
        y2: xAxis.innerHeight * 0.75,
        stroke: 'rgba(255, 255, 255, 1.0)',
        strokeWidth: 1.5
    });

    xAxis.ticks = [0, 0.5, 1].map(function(x, i, a) {
        var p = xAxis.horizontalLine;
        var isExtent = i == 0 || i == a.length-1;
        var height = 10;

        return new d3Component({
            type: 'line',
            container: xAxis.g,
            x1: p.x1 + (p.x2 - p.x1) * x,
            x2: p.x1 + (p.x2 - p.x1) * x,
            y1: p.y1,
            y2: p.y1 - (isExtent ? height : height / 2),
            stroke: p.stroke,
            strokeWidth: (isExtent ? p.strokeWidth : p.strokeWidth * 2 / 3)
        });

    });

    xAxis.min = new d3Component({
        type: 'text',
        class: 'xMin',
        container: xAxis.g,
        x: xAxis.ticks[0].x1,
        y: xAxis.ticks[0].y + 20,
        fill: 'white',
        displayText: formatDate(xExtent[0]),
        style: {
            'font-size': function(d) { return 12; }
        },
        attr: {
            'text-anchor': function(d) { return 'middle'; }
        }
    });

    xAxis.max = new d3Component({
        type: 'text',
        class: 'xMax',
        container: xAxis.g,
        x: xAxis.ticks[xAxis.ticks.length-1].x1,
        y: xAxis.ticks[xAxis.ticks.length-1].y + 20,
        fill: 'white',
        displayText: formatDate(xExtent[1]),
        style: {
            'font-size': function(d) { return 12; }
        },
        attr: {
            'text-anchor': function(d) { return 'middle'; }
        }
    });

    /*
        Chart Line and Markers
   */
    chartArea.activePathIndex = 0;
    chartArea.pathStroke = 'rgba(255, 255, 255, 0.4)';
    chartArea.pathStrokeDash = '3';
    chartArea.pathActiveStroke = 'rgba(255, 255, 255, 0.8)';
    chartArea.pathActiveStrokeDash = 'none';

    var paths = chartArea.paths = series.map(function(s, i) {
        var pathG = new d3Component({
            type: 'g',
            container: chartArea.g,
            class: series[i].name + ' path ' + (i == chartArea.activePathIndex ? 'active' : '')
        });
        var path = createPath(chartArea, {
            container: pathG.g,
            series: series[i], 
            xDomain: xDomain,
            yDomain: yDomain,
            stroke: s.pathStroke || chartArea.pathStroke,
            width: chartArea.xAxis.innerWidth - pathPadding,
            height: chartArea.innerHeight * pathHeight - titleYAbs / 2,
            x: chartArea.xAxis.x + pathPadding / 2,
            y: chartArea.innerHeight * pathY + titleYAbs / 2
        });

        path.drawPath();

        return path;
    });

    var cursorG = chartArea.cursorG = new d3Component({
        container: chartArea.g,
        type: 'g',
        class: 'cursor',
        style: {
            'display': function(d) { return 'none'; }
        }
    });
    var cursor = chartArea.cursor = createMarker(chartArea, paths[chartArea.activePathIndex], {
        container: cursorG.g
    });

    chartArea.g.on('mousemove', function() {
        if(chartArea.activePathIndex == -1) {
            cursorG.g
                .style('display', 'none');
            return;
        }

        var path = paths[chartArea.activePathIndex];
        cursor.path = path;
        var coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y = coordinates[1];

        if(     x > path.x + path.xScale(path.data[0].index) 
        &&  x < path.xScale(path.data[path.data.length-1].index) + path.x
        && y < chartArea.xAxis.y + chartArea.xAxis.height) {
            cursorG.g
                .style('display', 'block');
            cursor.place(x);
            chartArea.yAxis.variable.g
                .style('display', 'block');
            chartArea.yAxis.variable
                .updateY(cursor.y);

            // See if cursor is close to any events
            if(path.events.length == 0)
                return;

            var bisect = d3.bisector(function(datum) {
                return datum.index;
            }).right;

            var xScaled = path.xScale.invert(x - path.x);
            var eventIndex = bisect(path.events, xScaled);
            var dist;
            if(eventIndex == 0) {
                dist = path.events[0].index - xScaled;
                eventIndex = 0;
            } else if(eventIndex == path.events.length) {
                dist = xScaled - path.events[path.events.length-1].index;
                eventIndex = path.events.length-1;
            } else {
                var dist1 = path.events[eventIndex].index - xScaled;
                var dist2 = xScaled - path.events[eventIndex - 1].index;
                dist = Math.min(dist1, dist2);

                if(dist == dist1) {
                    eventIndex = eventIndex;
                } else {
                    eventIndex = eventIndex - 1;
                }
            }
            if(dist < (path.xDomain[1] - path.xDomain[0]) * 0.03) {
                path.eventMarkers[eventIndex].label.text
                    .style('display', 'block');
            } else {
                path.container.selectAll('.marker .markerTitle')
                    .style('display', 'none');
            }

        } else {
            cursorG.g
                .style('display', 'none');
        }
    }).on('mouseout', function() {
        cursorG.g
            .style('display', 'none');
        chartArea.yAxis.variable.g
            .style('display', 'none');
    });

    // Y Axis
    var yAxis = chartArea.yAxis = new d3Component({
        type: 'g',
        class: 'axis y-axis',
        width: 30,
        height: cursor.path.innerHeight,
        x: cursor.path.x - pathPadding - 30,
        y: cursor.path.y,
        container: chartArea.g
    });

    yAxis.tickFormat = function(t) {
        if(t >= 4000) {
            return Math.round(t / 1000) + 'k';
        } else if(t >= 1000) {
            return Math.round(t / 100) / 10 + 'k';
        } else {
            return Math.round(t);
        }
    };

    yAxis.ticks = [0, 0.25, 0.5, 0.75, 1].map(function(d) {
        var tick = new d3Component({
            type: 'g',
            container: yAxis.g,
            height: 20,
            width: yAxis.width,
            y: yAxis.height * d
        });

        tick.value = d;

        tick.text = new d3Component({
            type: 'text',
            container: tick.g,
            displayText: yAxis.tickFormat((yDomain[1] - yDomain[0]) * (1-d)),
            fill: 'white',
            x: yAxis.width / 4,
            y: tick.height / 4,
            attr: {
                'text-anchor': function(d) { return 'end'; }
            },
            style: {
                'text-transform': function(d) { return 'uppercase'; }
            }
        });

        tick.line = new d3Component({
            type: 'line',
            container: tick.g,
            stroke: 'white',
            strokeWidth: 1.5,
            x1: yAxis.width / 2,
            x2: yAxis.width,
            y1: 0,
            y2: 0
        });

        return tick;
    });

    yAxis.variable = new d3Component({
        type: 'g',
        container: yAxis.g,
        height: 20,
        width: yAxis.width,
        y: 0,
        style: {
            'display': function(d) { return 'none'; }
        }
    });

    yAxis.variable.updateY = function(yCoord) {
        yAxis.variable.g
            .attr('transform', 'translate('
                + 0 + ',' 
                + (yCoord  - yAxis.y)
                + ')');
    };

    yAxis.variable.line = new d3Component({
        type: 'line',
        container: yAxis.variable.g,
        stroke: 'yellow',
        strokeWidth: 2.0,
        x1: yAxis.width / 2,
        x2: yAxis.width,
        y1: 0,
        y2: 0
    });

    // Model Selectors
    var selectorsWidth = chartArea.xAxis.innerWidth;
    var selectorsX = chartArea.xAxis.x;
    if(selectorsWidth < breakpointSmall) {
        selectorsWidth = chartArea.innerWidth * 0.94;
        selectorsX = chartArea.innerWidth * 0.03;
    }

    var selectAllHeight = 0.20;
    var selectAllPaddingY = 0.05;
    var selectorsGap = 0.1;

    var selectorsG = chartArea.selectorsG = new d3Component({
        type: 'g',
        container: chartArea.g,
        class: 'selectors',
        width: selectorsWidth,
        height: chartArea.innerHeight * selectorsHeight,
        x: selectorsX,
        y: chartArea.innerHeight * selectorsY
    });

    var selectAllOffset = selectorsG.innerWidth / series.length * (1 - selectorsGap) * selectorsGap / 2;
    var selectAllG = new d3Component({
        type: 'g',
        container: selectorsG.g,
        width: selectorsG.innerWidth - selectAllOffset * 3,
        height: selectorsG.innerHeight * selectAllHeight,
        x: selectAllOffset,
        y: selectorsG.innerHeight * (1 - selectAllHeight + selectAllPaddingY),
        style: {
            'cursor': function(d) { return 'pointer'; }
        }
    });
    var selectAll = chartArea.selectAll = new d3Component({
        type: 'rect',
        container: selectAllG.g,
        width: selectAllG.innerWidth,
        height: selectAllG.innerHeight,
        stroke: 'white',
        strokeWidth: 1
    });
    
    selectAll.title = new d3Component({
        type: 'text',
        container: selectAllG.g,
        displayText: 'All Models',
        width: selectAllG.width,
        height: selectAllG.height,
        x: selectAllG.width / 2,
        y: selectAllG.height / 2 + 4,
        fill: 'white',
        style: {
            'letter-spacing': function(d) { return '0.3px'; },
            'text-anchor': function(d) { return 'middle'; }
        }
    });

    selectAllG.g.on('click', function() {
        if(buttonsActive)
            selectAllSeries();
    }).on('mouseover', function() {
        if(chartArea.activePathIndex != -1) {
            selectAll.rect
                .transition()
                .attr('fill', selectorHighlightFill);
        }
    }).on('mouseout', function() {
        if(chartArea.activePathIndex != -1) {
            selectAll.rect
                .transition()
                .attr('fill', selectorFill);
        }
    });


    var selectors = chartArea.selectors = series.map(function(s, i, arr) {
        var width = (selectorsG.innerWidth / arr.length) * (1 - selectorsGap);

        var selectorG = new d3Component({
            type: 'g',
            container: selectorsG.g,
            x: (width + width * selectorsGap) * i + (width * selectorsGap / 2),
            width: width,
            height: selectorsG.innerHeight * (1 - selectAllHeight - selectAllPaddingY),
            style: {
                'cursor': function(d) { return 'pointer'; }
            }
        });

        var selector = new d3Component({
            type: 'rect',
            container: selectorG.g,
            width: selectorG.innerWidth,
            height: selectorG.innerHeight,
            fill: selectorFill,
            stroke: selectorStroke,
            strokeWidth: selectorStrokeWidth
        });

        selector.index = i;

        var title = selector.title = new d3Component({
            type: 'text',
            container: selectorG.g,
            displayText: s.title || s.name,
            width: selectorG.width,
            height: 20,
            x: selectorG.width / 2,
            y: 25,
            fill: 'white',
            style: {
                'letter-spacing': function(d) { return '0.3px'; },
                'text-anchor': function(d) { return 'middle'; }
            }
        });

        var imgPaddingY = 0.10;
        var imgW = selectorG.width;
        var imgH = selectorG.height;
        var image = selector.image = new d3Component({
            type: 'image',
            container: selectorG.g,
            source: s.image || './images/roadster.png',
            width: imgW,
            height: imgH,
            x: 0,
            y: imgH * imgPaddingY
        });

        selectorG.g.on('click', function() {
            if(buttonsActive)
                selectSeries(s.name);
        }).on('mouseover', function() {
            if(selector.index !== chartArea.activePathIndex) {
                selector.rect
                    .transition()
                    .attr('fill', selectorHighlightFill);
            }
        }).on('mouseout', function() {
            if(selector.index !== chartArea.activePathIndex) {
                selector.rect
                    .transition().attr('fill', selectorFill);
            }
        });

        return selector;
    });

    selectAllSeries();
}

/*
   Interaction Functions
*/
function selectAllSeries() {
    container.chartArea.activePathIndex = -1;

    container.chartArea.selectorsG.g.selectAll('rect')
        .attr('fill', selectorFill);
    container.chartArea.selectAll.rect
        .attr('fill', selectorSelectedFill);

    container.chartArea.xAxis.min.text
        .text(formatDate(xExtent[0]));
    container.chartArea.xAxis.max.text
        .text(formatDate(xExtent[1]));

    for(var i=0;i<container.chartArea.paths.length;i++) {
        container.chartArea.paths[i].stroke = series[i].pathStroke;
        container.chartArea.paths[i].removePath();
        container.chartArea.paths[i].removeEventMarkers();
        container.chartArea.paths[i].xDomain = xExtent;
        container.chartArea.paths[i].yDomain = yExtent;
        if(container.chartArea.paths[i].path == undefined) {
            container.chartArea.paths[i].createPath();
            container.chartArea.paths[i].drawPath(function(j) {
                container.chartArea.paths[j].updateSVGPoints();
                var p = container.chartArea.paths[j];
                var x = p.x + p.svgPoints[Math.floor(p.svgPoints.length / 5)].x;

                container.chartArea.paths[j].drawLabel(x);
                buttonsActive = true;
            }, i);
        }
    }

    container.chartArea.yAxis.ticks.map(function(t) {
        var tickFormat = container.chartArea.yAxis.tickFormat;
        var yDomain = yExtent;
        t.text.container.select('text')
            .text(tickFormat((yDomain[1] - yDomain[0]) * (1-t.value)));
    });
}

function selectSeries(name) {
    var index = series.map(function(s) { return s.name; }).indexOf(name);
    selectSeriesByIndex(index);
}

function selectSeriesByIndex(index) {
    var s = (index > -1 ? series[index] : undefined);

    var d3Container = container.chartArea.container;

    if(s) {
        var name = s.name;

        container.chartArea.activePathIndex = index;

        for(var i=0;i<container.chartArea.paths.length;i++) {
            container.chartArea.paths[i].removePath();
            container.chartArea.paths[i].removeEventMarkers();
            container.chartArea.paths[i].removeLabel();
        }

        container.chartArea.paths[index].stroke = container.chartArea.pathStroke;

        container.chartArea.paths[index].xDomain = 
            d3.extent(series[index].data.map(function(d) { return d.index; }));
        container.chartArea.paths[index].yDomain = 
            d3.extent(series[index].data.map(function(d) { return d.value; }));

        // Update xAxis labels
        container.chartArea.xAxis.min.text
            .text(formatDate(container.chartArea.paths[index].xDomain[0]));
        container.chartArea.xAxis.max.text
            .text(formatDate(container.chartArea.paths[index].xDomain[1]));

        container.chartArea.paths[index].createPath();
        container.chartArea.paths[index].drawPath(function() {
            container.chartArea.paths[index].updateSVGPoints();
            container.chartArea.paths[index].drawEventMarkers();
            buttonsActive = true;
        });

        container.chartArea.yAxis.ticks.map(function(t) {
            var tickFormat = container.chartArea.yAxis.tickFormat;
            var yDomain = container.chartArea.paths[index].yDomain;
            t.text.container.select('text')
                .text(tickFormat((yDomain[1] - yDomain[0]) * (1-t.value)));
        });

        container.chartArea.cursor.path = container.chartArea.paths[index];

        container.chartArea.selectorsG.g.selectAll('rect')
            .attr('fill', selectorFill);
        container.chartArea.selectors[index].rect
            .attr('fill', selectorSelectedFill);
    }
}
