var Places = Places || function(config) {
    var w = this;
    
    this.data = config.data;
    this.container = config.container || d3.select('body');

    this.width = config.width || document.body.clientWidth;
    this.height = config.width || document.body.clientHeight;

    this.margin = {
        top: config && config.margin && config.margin.top || 0,
        right: config && config.margin && config.margin.right || 0,
        bottom: config && config.margin && (config.margin.bottom || config.margin.top) || 0
    };

    this.axis = {
        xAxis: {
            y: config && config.axis && config.xAxis && config.xAxis.y || -8,
            stroke: config && config.axis && config.xAxis && config.xAxis.stroke || '#fff',
            strokeWidth: config && config.axis && config.xAxis && config.xAxis.strokeWidth || 0.75,
            tickYOffset: config && config.axis && config.axis.xAxis && config.axis.xAxis.tickYOffset || 8,
            tickHeight: config && config.axis && config.xAxis && config.xAxis.tickHeight || -10,
            tickCount: config && config.axis && config.xAxis && config.xAxis.tickCount || 10,
            transition: {
                raiseBy: config && config.axis && config.axis.xAxis && config.axis.xAxis.transition && config.axis.xAxis.transition.duration || 15,
                duration: config && config.axis && config.axis.xAxis && config.axis.xAxis.transition && config.axis.xAxis.transition.duration || 500
            },
            label: {
                yOffset: config && config.axis && config.axis.xAxis && config.axis.xAxis.label && config.axis.xAxis.label.yOffset || -12,
                fill: config && config.axis && config.axis.xAxis && config.axis.xAxis.label && config.axis.xAxis.label.fill || 'white',
                fontSize: config && config.axis && config.axis.xAxis && config.axis.xAxis.label && config.axis.xAxis.label.fontSize || 12,
                fontFamily: config && config.axis && config.axis.xAxis && config.axis.xAxis.label && config.axis.xAxis.label.fontFamily || 'Josefin Sans',
                format: config && config.axis && config.axis.xAxis && config.axis.xAxis.label && config.axis.xAxis.label.format || function(d) {
                    var months = [  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return  months[d.getUTCMonth()]
                            +   ' \''
                            +   ('' + d.getUTCFullYear()).slice(-2);
                },
                formatExact: config && config.axis && config.axis.xAxis && config.axis.xAxis.label && config.axis.xAxis.label.format || function(d) {
                    var months = [  'January', 'February', 'March', 'April', 'May', 'June',
                                    'July', 'August', 'September', 'October', 'November', 'December'];
                    return  months[d.getUTCMonth()]
                            +   ' ' + d.getUTCDate() 
                            +   ', '
                            +   d.getUTCFullYear();
                }
            }
        }
    };

    this.details = {
        width: config && config.width || 100,
        height: config && config.height || 50,
        y: -100,
        transition: {
            duration: config && config.details && config.details.transition || 500
        },
        place: {
            yOffset: config && config.place && config.place.yOffset || 15,
            fill: config && config.place && config.place.fill || '#fff',
            fontSize: config && config.place && config.place.fontSize || 12,
            fontFamily: config && config.place && config.place.fontFamily || 'Josefin Sans',
            placeTransform: config && config.place && config.place.textTransform || 'uppercase',
            background: config && config.place && config.place.background || '#000'
        },
        distance: {
            yOffset: config && config.distance && config.distance.yOffset || 30,
            fill: config && config.distance && config.distance.fill || '#fff',
            fontSize: config && config.distance && config.distance.fontSize || 12,
            fontFamily: config && config.distance && config.distance.fontFamily || 'Josefin Sans',
            distanceTransform: config && config.distance && config.distance.textTransform || 'uppercase',
            background: config && config.distance && config.distance.background || '#000'
        },
        name: {
            yOffset: config && config.name && config.name.yOffset || 0,
            fill: config && config.name && config.name.fill || '#fff',
            fontSize: config && config.name && config.name.fontSize || 12,
            fontFamily: config && config.name && config.name.fontFamily || 'Josefin Sans',
            nameTransform: config && config.name && config.name.textTransform || 'uppercase',
            background: config && config.name && config.name.background || '#000'
        }
    };

    this.google = {
        geocodingAPIKey: config && config.google && config.google.geocodingAPIKey || null
    }

    this.stay = {
        height: config.stay && config.stay.height || 5,
        fill: config.stay && config.stay.fill || function(stay) {
            return function() {
                if(stay.place.coordinates) {
                    return '#ddd';
                } else if(stay.place.address) {
                    return 'yellow';
                } else {
                    return 'red';
                }
            }
        },
        mouseoverWrapper: config.stay && config.stay.mouseoverWrapper || function(stay) {
            return function() {
                if(!stay.place.coordinates && stay.place.address) {
                    w.geocodeAddress(stay.place, function(coordinates) {
                        console.log('Coordinates for ' + stay.place.name);
                        console.log('"coordinates": {\n"lat": ' + coordinates.lat + ',\n"lng": ' + coordinates.lng + '\n},');
                    });
                }

                w.details.show(stay);
                w.xAxis.show(stay);
            }
        },
        mouseoutWrapper: config.stay && config.stay.mouseoutWrapper || function() {
            return function() {
                w.details.hide();
                w.xAxis.resetTicks();
            }
        }
    };

    this.svg = new d3Component({
        type: 'svg',
        container: this.container,
        width: this.width,
        height: this.height
    });

    this.g = new d3Component({
        type: 'g',
        class: 'g',
        container: this.svg.svg,
        width: this.width - (this.margin.right * 2),
        height: this.height - (this.margin.top + this.margin.bottom),
        x: this.margin.right,
        y: this.margin.top
    });

    //this.createBackground();
    this.createPlacesHash();
    this.domain = this.getDomain();
    this.drawPlaces();
    this.drawXAxis();

    this.createDetails();
}

Places.prototype.createBackground = function() {
    this.background = new d3Component({
        type: 'g',
        container: this.svg.svg,
        width: this.width,
        height: this.height
    });

    this.background.rect = new d3Component({
        type: 'rect',
        container: this.background.g,
        fill: '#000',
        width: this.background.width,
        height: this.background.height
    });
}

Places.prototype.createPlacesHash = function() {
    var w = this;
    this.placesHash = this.placesHash || {};

    this.data.forEach(function(stay) {
        if(!stay.place || stay.place == "")
            return;
        var identifier = w.getPlaceIdentifier(stay);

        if(!w.placesHash[identifier])
            w.placesHash[identifier] = {
                id: Object.keys(w.placesHash).length,
                place: stay.place,
                address: stay.address,
                name: stay.name,
                coordinates: stay.coordinates,
                stays: []
            }

        if(!w.placesHash[identifier].address && stay.address)
            w.placesHash[identifier].address = stay.address;
        if(!w.placesHash[identifier].coordinates && stay.coordinates)
            w.placesHash[identifier].coordinates = stay.coordinates;


        var hashElem = w.placesHash[identifier];
        hashElem.stays.push({
            startDate: stay.startDate,
            endDate: stay.endDate,
            place: w.placesHash[identifier]
        });
    });
}

Places.prototype.getPlaceIdentifier = function(place) {
    return place.name || place.address || place.place;
}

Places.prototype.drawPlaces = function() {
    var w = this;

    this.createXScale();
    this.createYScale();

    Object.keys(this.placesHash).forEach(function(key) {
        w.drawPlace(w.placesHash[key]);
    });
}

Places.prototype.createXScale = function() {
    this.xScale = this.xScale || d3.time.scale().range([0, this.g.width]);
    this.xScale.domain([this.domain.dates.min, this.domain.dates.max]);
}

Places.prototype.createYScale = function() {
    this.yScale = this.yScale || d3.scale
        .linear()
        .range([0, this.g.height - this.stay.height]);
    this.yScale.domain([this.domain.positions.min, this.domain.positions.max]);
}

Places.prototype.getDomain = function() {
    var w = this;

    var domain = {
        dates: {},
        positions: {}
    };
    Object.keys(this.placesHash).forEach(function(key) {
        w.placesHash[key].distance = w.getPlacePosition(w.placesHash[key]);

        var position = w.placesHash[key].distance;

        if(domain.positions.min == undefined || domain.positions.min > position)
            domain.positions.min = position;
        if(domain.positions.max == undefined || domain.positions.max < position)
            domain.positions.max = position;

        w.placesHash[key].stays.forEach(function(stay) {
            var startDate = new Date(stay.startDate);
            var endDate = new Date(stay.endDate);

            if(domain.dates.min == undefined || domain.dates.min > startDate)
                domain.dates.min = startDate;
            if(domain.dates.max == undefined || domain.dates.max < endDate)
                domain.dates.max = endDate;
        });
    });

    return domain;
}

Places.prototype.drawPlace = function(place) {
    var w = this;

    this.stays = new d3Component({
        type: 'g',
        container: this.g.g,
        width: this.g.width,
        height: this.g.height
    });

    place.stays.forEach(function(stay) {
        w.drawStay(w.getPlacePosition(place), stay);
    });
}

Places.prototype.getPlacePosition = function(place) {
    if(place.coordinates) {
        var home = this.placesHash["Home"].coordinates;
        var dist = this.calculateDistance(home, place.coordinates);
    }

    return dist || 0;
}

Places.prototype.drawStay = function(position, stay) {
    var w = this;

    stay.x = this.xScale(new Date(stay.startDate));
    stay.y = this.yScale(position);
    stay.width = this.xScale(new Date(stay.endDate)) - stay.x;

    stay.bar = new d3Component({
        type: 'rect',
        class: 'stayBar',
        container: this.stays.g,
        fill: this.stay.fill(stay),
        x: stay.x,
        y: stay.y,
        width: stay.width,
        height: this.stay.height
    });

    stay.hoverArea = new d3Component({
        type: 'rect',
        class: 'hoverArea',
        container: this.stays.g,
        x: stay.x,
        y: stay.y - this.stay.height,
        width: stay.width,
        height: this.stay.height * 2.5
    });

    stay.hoverArea.rect.on('mouseover', this.stay.mouseoverWrapper(stay));
    stay.hoverArea.rect.on('mouseout', this.stay.mouseoutWrapper());
    stay.hoverArea.rect.on('click', function() {
        w.extendTicklines = !w.extendTicklines;
    });

}

Places.prototype.createDetails = function() {
    var w = this;

    this.details.g = new d3Component({
        type: 'g',
        container: this.g.g,
        y: this.details.y,
        width: this.details.width,
        height: this.details.height,
        style: {
            'opacity': 0
        }
    });

    this.details.place.text = new d3Component({
        type: 'text',
        container: this.details.g.g,
        fill: this.details.place.fill,
        y: this.details.place.yOffset,
        attr: {
            'text-anchor': 'middle'
        },
        style: {
            'font-size': this.details.place.fontSize,
            'font-family': this.details.place.fontFamily,
            'text-transform': this.details.place.textTransform
        }
    });

    this.details.distance.text = new d3Component({
        type: 'text',
        container: this.details.g.g,
        fill: this.details.distance.fill,
        y: this.details.distance.yOffset,
        attr: {
            'text-anchor': 'middle'
        },
        style: {
            'font-size': this.details.distance.fontSize,
            'font-family': this.details.distance.fontFamily,
            'text-transform': this.details.distance.textTransform
        }
    });

    this.details.name.text = new d3Component({
        type: 'text',
        container: this.details.g.g,
        fill: this.details.name.fill,
        y: this.details.name.yOffset,
        attr: {
            'text-anchor': 'middle'
        },
        style: {
            'font-size': this.details.name.fontSize,
            'font-family': this.details.name.fontFamily,
            'text-transform': this.details.name.textTransform
        }
    });

    this.details.show = function(stay) {
        var hasName = stay.place.name !== stay.place.place;

        w.details.name.text.updateDisplayText(stay.place.name || '');
        w.details.place.text.updateDisplayText((hasName ? stay.place.place : ''));
        w.details.distance.text.updateDisplayText(Math.round(stay.place.distance) + ' miles');

        w.details.g.g
            .attr('transform', 'translate(' + 
                    (stay.x)
                    + ',' + 
                    (w.details.y)
                    + ')');

        w.details.name.text.text
            .attr('x', stay.width / 2)
            .attr('y', (hasName ? w.details.name.yOffset : w.details.place.yOffset));

        w.details.place.text.text
            .attr('x', stay.width / 2)
            .attr('y', w.details.place.yOffset)
            .style('opacity', (hasName ? '1' : '0'))

        w.details.distance.text.text
            .attr('x', stay.width / 2)
            .attr('y', w.details.distance.yOffset);

        w.details.g.g
            .transition()
            .duration(w.details.transition.duration)
            .style('opacity', '1');
    };

    this.details.hide = function() {
        w.details.g.g
            .transition()
            .duration(w.details.transition.duration)
            .style('opacity', '0');
    };
}

Places.prototype.geocodeAddress = function(place, callback) {
    var baseURL = 'https://maps.googleapis.com/maps/api/geocode/json';
    var url = baseURL + '?key=' + this.google.geocodingAPIKey;
    url = url + '&address=' + place.address;
    d3.json(url, function(err, data) {
        var loc = data.results[0].geometry.location;
        callback(loc);
    });
}

Places.prototype.calculateDistance = function(c1, c2) {
    var radlat1 = Math.PI * c1.lat/180
    var radlat2 = Math.PI * c2.lat/180
    var theta = c1.lng - c2.lng
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    return dist
}

Places.prototype.drawXAxis = function() {
    var w = this;

    this.xAxis = new d3Component({
        type: 'g',
        container: this.g.g,
        x: 0,
        y: this.axis.xAxis.y,
        width: this.g.width,
        height: this.axis.xAxis.height
    });

    this.xAxis.line = new d3Component({
        type: 'line',
        container: this.xAxis.g,
        x1: 0,
        x2: this.xAxis.width,
        y1: this.xAxis.height,
        y2: this.xAxis.height,
        stroke: this.axis.xAxis.stroke,
        strokeWidth: this.axis.xAxis.strokeWidth
    });

    var min = this.domain.dates.min.getTime();
    var diff = (this.domain.dates.max.getTime() - min) / this.axis.xAxis.tickCount;

    this.xAxis.ticks = [];
    for(var i=0; i<=this.axis.xAxis.tickCount; i++) {
        var dateVal = min + (diff * i);

        var tick = new d3Component({
            type: 'g',
            container: this.xAxis.g,
            x: this.xScale(dateVal),
            y: this.xAxis.y
        });

        tick.dateVal = dateVal;

        tick.line = new d3Component({
            type: 'line',
            class: 'tickLine',
            container: tick.g,
            x1: 0,
            x2: 0,
            y1: this.axis.xAxis.tickYOffset,
            y2: this.axis.xAxis.tickHeight,
            stroke: this.axis.xAxis.stroke,
            strokeWidth: this.axis.xAxis.strokeWidth
        });

        tick.text = new d3Component({
            type: 'text',
            container: tick.g,
            x: 0,
            y: this.axis.xAxis.label.yOffset,
            displayText: this.axis.xAxis.label.format(new Date(dateVal)),
            fill: this.axis.xAxis.label.fill,
            attr: {
                'text-anchor': 'middle'
            },
            style: {
                'font-size': this.axis.xAxis.label.fontSize,
                'font-family': this.axis.xAxis.label.fontFamily,
                'text-transform': 'uppercase'
            }
        });

        this.xAxis.ticks.push(tick);
    }

    this.xAxis.resetTicks = function() {
        w.xAxis.ticks.forEach(function(tick) {

            if(tick.x !== w.xScale(tick.dateVal)) {
                tick.text.text
                    .transition()
                    .duration(w.axis.xAxis.transition.duration / 2)
                    .style('opacity', '0')
                    .each('end', function() {
                        tick.text.updateDisplayText(w.axis.xAxis.label.format(new Date(tick.dateVal)));
                        tick.text.text
                            .attr('text-anchor', 'middle');
                        tick.text.text
                            .attr('y', w.axis.xAxis.label.yOffset)
                        tick.text.text
                            .transition()
                            .duration(w.axis.xAxis.transition.duration / 2)
                            .style('opacity', '1');
                    });
            } else {
                tick.text.text
                    .transition()
                    .duration(w.axis.xAxis.transition.duration)
                    .attr('text-anchor', 'middle')
                    .style('opacity', '1');
            }

            tick.line.line
                .transition()
                .duration(w.axis.xAxis.transition.duration)
                .attr('y1', w.axis.xAxis.tickYOffset)
                .attr('y2', w.axis.xAxis.tickHeight)

            tick.x = w.xScale(tick.dateVal); // so we can track changes
            tick.g
                .transition()
                .duration(w.axis.xAxis.transition.duration)
                .attr('transform', 'translate(' + 
                            (w.xScale(tick.dateVal))
                            + ',' + 
                            (w.xAxis.y)
                            + ')')
                .style('visibility', 'visible');
        });
    }

    this.xAxis.moveTick = function(index, d, anchor, stay) {
        w.xAxis.ticks[index].x = w.xScale(d); // so we can track changes

        w.xAxis.ticks[index].g
            .transition()
            .duration(w.axis.xAxis.transition.duration)
            .attr('transform', 'translate(' + 
                        (w.xScale(d))
                        + ',' + 
                        (w.xAxis.y)
                        + ')');

        w.xAxis.ticks[index].text.text
            .transition()
            .duration(w.axis.xAxis.transition.duration / 2)
            .style('opacity', '0')
            .each('end', function() {
                w.xAxis.ticks[index].text.updateDisplayText(
                    w.axis.xAxis.label.formatExact(new Date(d))
                );
                w.xAxis.ticks[index].text.text
                    .attr('text-anchor', anchor)
                    .attr('y', w.xAxis.ticks[index].text.y - w.axis.xAxis.transition.raiseBy)
                    .transition()
                    .duration(w.axis.xAxis.transition.duration / 2)
                    .style('opacity', '1');
            });

        w.xAxis.ticks[index].line.line
            .transition()
            .duration(w.axis.xAxis.transition.duration)
            .attr('y1', (w.extendTicklines ? 
                stay.y + w.axis.xAxis.tickYOffset - w.axis.xAxis.y
                : w.axis.xAxis.tickYOffset))
            .attr('y2', w.axis.xAxis.tickHeight - w.axis.xAxis.transition.raiseBy)
    }

    this.xAxis.hideTick = function(index) {
        w.xAxis.ticks[index].g
            .style('visibility', 'hidden');
    }

    this.xAxis.getClosestTickIndex = function(d) {
        var index = 0;
        var curr = w.xAxis.ticks[index].dateVal;
        var diff = Math.abs(d - curr);
        for(var i = 0; i < w.xAxis.ticks.length; i++) {
            var newdiff = Math.abs(d - w.xAxis.ticks[i].dateVal);
            if(newdiff < diff) {
                diff = newdiff;
                curr = w.xAxis.ticks[i].dateVal;
                index = i;
            }
        }

        return {
            index: index,
            diff: d - curr
        };
    }

    this.xAxis.show = function(stay) {
        var start = new Date(stay.startDate).getTime();
        var end = new Date(stay.endDate).getTime();

        var startTick = w.xAxis.getClosestTickIndex(start);
        var endTick = w.xAxis.getClosestTickIndex(end);

        if(startTick.index == endTick.index) {
            if(Math.abs(startTick.diff) < Math.abs(endTick.diff)) {
                endTick.index = endTick.index + 1;
            } else {
                startTick.index = startTick.index - 1;
            }
        }

        w.xAxis.moveTick(startTick.index, start, 'end', stay);
        w.xAxis.moveTick(endTick.index, end, 'start', stay);
    }

}
