var Insignia = Insignia || function(config) {
    this.setupHelperFunctions();
    this.setupSettings(config);
    this.createSVG();
    this.createContainer();
    this.createBackground();
    this.createOuterCircle();
    this.createCircumferenceCircle();
}

Insignia.prototype.setupSettings = function(config) {
    var obj = this;
    this.components = {};

    this.container =        config && config.container || 'body';
    this.width =            config && config.width || window.innerWidth;
    this.height =           config && config.height || window.innerHeight;

    this.components.svg = {
        obj:                this,
        width:              config && config.background && config.background.width || this.width,
        height:             config && config.background && config.background.height || this.height
    }

    this.components.container = {
        obj:                this,
        width:              config && config.background && config.background.width || this.components.svg.width,
        height:             config && config.background && config.background.height || this.components.svg.height
    }

    this.components.background = {
        obj:                this,
        width:              config && config.background && config.background.width || this.components.container.width,
        height:             config && config.background && config.background.height || this.components.container.height,
        fill:               config && config.background && config.background.fill || 'rgba(0, 0, 0, 1.0)'
    }

    this.components.outerCircle = {
        obj:                this,
        width:              config && config.outerCircle && config.outerCircle.width || this.components.container.width,
        height:             config && config.outerCircle && config.outerCircle.height || this.components.container.height,
        resolution:         config && config.outerCircle && config.outerCircle.resolution || 1000,
        maxWidth:           config && config.outerCircle && config.outerCircle.maxWidth || 10,
        radiusAdjustment:   config && config.outerCircle && config.outerCircle.radiusAdjustment || .80,
        style: {
        },
        coordinatesAtIndex: config && config.outerCircle && config.outerCircle.coordinatesAtIndex || function(index) {
            var oc = obj.components.outerCircle;
            var deg = (index / oc.resolution) * 360;
            return {
                x: oc.center.x + oc.radius * Math.cos(obj.helpers.degToRad(deg)),
                y: oc.center.y + oc.radius * Math.sin(obj.helpers.degToRad(deg))
            };
        },
        strokeWidthAtIndex: config && config.outerCircle && config.outerCircle.strokeWidthAtIndex || function(index) {
            return 1;
        },
        strokeAtIndex: config && config.outerCircle && config.outerCircle.strokeAtIndex || function(index) {
            return 'rgba(255, 255, 255, 1.0)';
        }
    }

    this.components.circumferenceCircle = {
        obj:                this
    }
}

Insignia.prototype.setupHelperFunctions = function() {
    this.helpers = {};

    this.helpers.degToRad = function(deg) {
        return deg * Math.PI / 180;
    }
}

Insignia.prototype.createSVG = function() {
    var obj = this.components.svg;
    obj.svg = d3.select(this.container).append('svg')
        .attr('width', obj.width)
        .attr('height', obj.height);
}

Insignia.prototype.createContainer = function() {
    var obj = this.components.container;
    obj.g = this.components.svg.svg.append('g')
        .attr('width', obj.width)
        .attr('height', obj.height);
}


Insignia.prototype.createBackground = function() {
    var obj = this.components.background;
    obj.rect = this.components.container.g.append('rect')
        .attr('width', obj.width)
        .attr('height', obj.height)
        .attr('fill', obj.fill);
}

Insignia.prototype.createOuterCircle = function() {
    var obj = this.components.outerCircle;
    obj.radius = (obj.width < obj.height ? obj.width : obj.height) / 2 * obj.radiusAdjustment;
    obj.center = {
        x: obj.width / 2,
        y: obj.height / 2
    }
    obj.data = [];

    for(var i=0;i<obj.resolution;i++) {
        obj.data.push({
            index: i
        });
    }

    obj.line = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });
    obj.pathComponent = function(index, arr) {
        var coordinates = [];
        coordinates.push(obj.coordinatesAtIndex(index));
        coordinates.push(obj.coordinatesAtIndex((index + 1) % obj.resolution));
        return coordinates;
    }

    this.components.container.g.selectAll('.outerCirclePath')
        .data(obj.data)
        .enter()
            .append('path')
            .attr('class', 'outerCirclePath')
            .attr('stroke', function(d) {
                return obj.strokeAtIndex(d.index);
            })
            .attr('stroke-width', function(d) {
                return obj.strokeWidthAtIndex(d.index); 
            })
            .attr('d', function(d, i, arr) {
                return obj.line(obj.pathComponent(d.index, arr));
            });
}

Insignia.prototype.createCircumferenceCircle = function() {
    var obj = this.components.circumferenceCircle;
}
