/*
   Object creation functions
*/

function createPath(chartArea, config) {

    var path = new d3Component({
        type: 'path',
        container: config.container,
        class: config.class,
        invertYRange: true,
        data: config.series.data,
        events: config.series.events,
        xDomain: config.xDomain,
        yDomain: config.yDomain,
        xFunction: function(d, i) {
            return this.xScale(d.index);
        },
        yFunction: function(d, i) {
            return this.yScale(d.value);
        },
        xDomainFunction: function(d, i) {
            return d.index;
        },
        yDomainFunction: function(d, i) {
            return d.value;
        },
        interpolate: 'basis',
        height: config.height,
        width: config.width,
        x: config.x,
        y: config.y,
        stroke: config.stroke,
        strokeWidth: 1.5
    });

    path.events = config.series.events;

    path.updateSVGPoints = function() {
        path.svgPoints = [];
        for(var i=0;i<path.path.node().getTotalLength();i++) {
            path.svgPoints.push(path.path.node().getPointAtLength(i));
        }
    };

    path.updateSVGPoints();

    path.drawPath = function(callback, callbackParams) {
        path.path
            .attr('d', path.line(path.data.map(function(d) { return { index: d.index, value: 0}; })))
            .attr('stroke', path.stroke)
            .attr('opacity', 0)
            .attr('stroke-width', path.strokeWidth)
            .attr('fill', 'none')
            .attr('transform', 'translate(' + 
                        (path.x + path.margin.left)
                        + ',' + 
                        (path.y + path.margin.top)
                        + ')');
        path.path
            .transition().duration(750)
            .each('end', function() { if(callback) callback(callbackParams) })
            .attr('opacity', 1)
            .attr('d', path.line(path.data));
    };

    path.drawEventMarkers = function() {
        path.eventMarkers = path.events.map(function(e) {
            marker = createMarker(chartArea, path, {
                container: config.container,
                color: 'rgba(255, 288, 0, 0.8)'
            });

            marker.place(path.x + path.xScale(e.index));

            marker.label = new d3Component({
                type: 'text',
                container: marker.topOuterCircle.container,
                x: marker.topOuterCircle.circle.attr('cx'),
                y: marker.topOuterCircle.circle.attr('cy') - 15,
                class: 'markerTitle',
                fill: 'white',
                displayText: e.title,
                attr: {
                    'text-anchor': function(d) { 
                        var absX = marker.topOuterCircle.circle.attr('cx') - path.x;
                        var padding = 40;
                        if(absX < padding)
                            return 'start'; 
                        if(absX > path.innerWidth - padding)
                            return 'end'; 

                        return 'middle'; 
                    }
                },
                style: {
                    'display': function(d) { return 'none'; },
                    'font-size': function(d) { return 12; }
                }
            });

            return marker;
        });
    };

    path.removeEventMarkers = function() {
        path.container.selectAll('.marker').remove();
    };

    path.drawLabel = function(x) {
        var bisect = d3.bisector(function(datum) {
            return datum.x;
        }).right;

        var index = bisect(path.svgPoints, x - path.x);
        if(index >= path.svgPoints.length) index = path.svgPoints.length - 1;
        var y = path.y + path.svgPoints[index].y;

        path.labelG = new d3Component({
            type: 'g',
            container: config.container,
            class: 'label'
        });

        path.label = new d3Component({
            type: 'text',
            container: path.labelG.g,
            displayText: config.series.title,
            width: 25,
            height: 20,
            x: x + (config.series.labelXOffset || 0),
            y: path.innerHeight * (1 - config.series.labelYPercentage),
            fill: 'white',
            style: {
                'letter-spacing': function(d) { return '0.3px'; },
                'text-transform': function(d) { return 'uppercase'; },
                'font-weight': function(d) { return '100'; },
                'text-anchor': function(d) { return 'middle'; }
            }
        });

        path.labelLine = new d3Component({
            type: 'line',
            container: path.labelG.g,
            x1: x + (config.series.labelXOffset || 0),
            x2: x,
            y1: path.label.y + 10,
            y2: y,
            strokeWidth: 1,
            stroke: config.series.pathStroke,
            style: {
                'stroke-dasharray': function(d) { return '3'; }
            }
        });
    };

    path.removeLabel = function() {
        path.labelG.g.remove();
    };

    path.removePath = function(callback) {
        if(this.path) {
            var p = this;
            p.path
                .transition()
                .duration(750)
                .each('end', function() { if(callback) callback() })
                .attr('d', p.line(
                    p.data.map(function(d) {
                        return {index: d.index, value: 0};
                    })
                ))
                .style('opacity', 0)
                .remove();
            this.path = undefined;
        }
    };

    return path;
};

function createMarker(chartArea, path, config) {
    var marker = {};
    var topMarkerY = 15;
    var baseLine = chartArea.xAxis.y - 20;
    var color = config && config.color || 'rgba(255, 255, 255, 1.0)';
    marker.path = path;

    marker.g = new d3Component({
        type: 'g',
        container: config.container,
        class: 'marker'
    });

    marker.topOuterCircle = new d3Component({
        type: 'circle',
        container: marker.g.g,
        r: 6,
        stroke: color,
        fill: color
    });

    marker.topInnerCircle = new d3Component({
        type: 'circle',
        container: marker.g.g,
        r: 3,
        fill: chartArea.background.fill
    });

    marker.topLine = new d3Component({
        type: 'line',
        container: marker.g.g,
        stroke: marker.topOuterCircle.stroke,
        strokeWidth: 2.5
    });

    marker.bottomLine = new d3Component({
        type: 'line',
        container: marker.g.g,
        stroke: marker.topLine.stroke,
        strokeWidth: 1.5,
        style: {
            'stroke-dasharray': function(d) { return '7'; }
        }
    });

    marker.dot = new d3Component({
        type: 'circle',
        container: marker.g.g,
        r: 3,
        stroke: marker.bottomLine.stroke,
        fill: marker.bottomLine.stroke
    });

    marker.placeOrigin = function() {
        var path = marker.path;
        marker.place(path.x + path.xScale(path.data[0].index));
    };

    marker.place = function(x) {
        var path = marker.path;

        // Returns index of where absolute x coordinate would be
        // inserted into our array of SVG points that make up the path.
        var bisect = d3.bisector(function(datum) {
            return datum.x;
        }).right;

        var index = bisect(path.svgPoints, x - path.x);
        if(index >= path.svgPoints.length) index = path.svgPoints.length - 1;
        var y = path.y + path.svgPoints[index].y;
        marker.y = y;

        marker.topOuterCircle.circle
            .attr('cx', x)
            .attr('cy', y - topMarkerY);
        marker.topInnerCircle.circle
            .attr('cx', x)
            .attr('cy', y - topMarkerY);
        marker.topLine.line
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', y)
            .attr('y2', y + marker.topOuterCircle.r - topMarkerY);
        marker.bottomLine.line
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', y + marker.topOuterCircle.r)
            .attr('y2', baseLine);
        marker.dot.circle
            .attr('cx', x)
            .attr('cy', baseLine);
    };

    return marker;
};


