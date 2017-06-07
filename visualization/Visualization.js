var Visualization = Visualization || function(configuration, type = 'svg') {
    configuration = this.hydrateConfiguration(configuration);
    this.buildVisualizationByType(configuration, type);
}

Visualization.prototype.hydrateConfiguration = function(configuration) {
    configuration = configuration || {};
    configuration.attributes = configuration.attributes || {};
    configuration.styles = configuration.styles || {};
    return configuration;
}

Visualization.prototype.buildVisualizationByType = function(configuration, type) {
    this.type = type;
    var builder = this.getBuilderByType(type);
    builder.call(this, configuration);
}

Visualization.prototype.getBuilderByType = function(type) {
    var typeToBuilderMapping = this.buildTypeToBuilderMapping();
    if (!typeToBuilderMapping[type]) {
        throw `Error: ${type} has no builder function defined`;
    }
    return typeToBuilderMapping[type];
}

Visualization.prototype.buildTypeToBuilderMapping = function() {
    return {
        'svg':          this.buildSVG,
        'g':            this.buildG,
        'circle':       this.buildCircle
    }
}

Visualization.prototype.buildSVG = function(configuration) {
    this.contentElement = configuration.contentElement;
    this.width = configuration.attributes.width || window.innerWidth;
    this.height = configuration.attributes.height || window.innerHeight;
    this.components = [];
    this.svg = this.appendSVG(configuration);
    this.g = this.appendG({
        attributes: {
            width: this.width,
            height: this.height
        }
    });
}

Visualization.prototype.validateObjectConfiguration = function(type, configuration) {
    if (!configuration) {
        throw `Error: configuration not defined for building ${type}`;
    }
    if (!configuration.container) {
        throw `Error: container not defined in configuration for building ${type}`;
    }
}

Visualization.prototype.buildG = function(configuration) {
    this.validateObjectConfiguration('g', configuration);
    this.element = configuration.container.append('g');
    this.setAttributes(this.element, configuration.attributes);
    this.setStyles(this.element, configuration.styles);
}

Visualization.prototype.buildCircle = function(configuration) {
    this.validateObjectConfiguration('circle', configuration);
    this.element = configuration.container.append('circle');
    this.setAttributes(this.element, configuration.attributes);
    this.setStyles(this.element, configuration.styles);
}

Visualization.prototype.getContainer = function() {
    if (this.type == 'svg' && this.g) {
        return this.g.element;
    }
    return this.element;
}

Visualization.prototype.getAttribute = function(attribute) {
    return this[attribute];
}

Visualization.prototype.getWidth = function() {
    return this.getAttribute('width');
}

Visualization.prototype.getHeight = function() {
    return this.getAttribute('height');
}

Visualization.prototype.setupListener = function(element, action, configuration) {
    element.on(action, configuration);
}

Visualization.prototype.appendSVG = function(configuration = {}) {
    this.element = d3.select(this.contentElement).append('svg');
    this.setAttributes(this.element, configuration.attributes);
    this.setStyles(this.element, configuration.styles);
    return this.element;
}

Visualization.prototype.appendObj = function(type, configuration) {
    configuration.container = this.getContainer();
    return new Visualization(configuration, type);
}

Visualization.prototype.appendG = function(configuration) {
    return this.appendObj('g', configuration);
}

Visualization.prototype.appendCircle = function(configuration) {
    return this.appendObj('circle', configuration);
}

Visualization.prototype.setAttributes = function(obj, attributes) {
    this.attributes = attributes;
    if (!attributes) {
        return;
    }
    Object.keys(attributes).map(function(attribute) {
        obj.attr(attribute, attributes[attribute]); 
    });
}

Visualization.prototype.setStyles = function(obj, styles) {
    this.styles = styles;
    if (!styles) {
        return;
    }
    Object.keys(styles).map(function(attribute) {
        obj.attr(attribute, styles[attribute]); 
    });
}

/*
Visualization.prototype.appendPath = function(container, configuration) {
    container = container || this.contentElement;
    configuration = configuration || {};
    var line = this.buildLineForPath(configuration);

    configuration.x.domain(d3.extent(configuration.data, function(d) { return configuration.getX(d); }));
    configuration.y.domain(d3.extent(configuration.data, function(d) { return configuration.getY(d); }));

    var path = container.append('path')
        .datum(configuration.data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);
    path.configuration = configuration;

    return path;
}

Visualization.prototype.buildLineForPath = function(configuration) {
    var line = d3.line()
        .x(function(d) { return configuration.x(configuration.getX(d)); })
        .y(function(d) { return configuration.y(configuration.getY(d)); });
    if (configuration.curve) {
        line.curve(configuration.curve);
    }
    return line;
}

Visualization.prototype.appendLineGraph = function(configuration) {
    this.line = this.appendPath(this.getComponentsContainer(), configuration);
    this.appendXAxis(container, configuration);
    this.appendYAxis(container, configuration);
    this.appendMarker(container, configuration);
    return this.line;
}

Visualization.prototype.appendXAxis = function(container, configuration) {
    if (!configuration.xAxis && !configuration.axes) {
        return;
    }
    var axisConfig = configuration.xAxis || configuration.axes;
    var xAxis = this.appendLine(container, this.buildXAxisConfiguration(axisConfig));
    return xAxis;
}

Visualization.prototype.appendYAxis = function(container, configuration) {
    if (!configuration.yAxis && !configuration.axes) {
        return;
    }
    var axisConfig = configuration.yAxis || configuration.axes;
    var yAxis = this.appendLine(container, this.buildYAxisConfiguration(axisConfig));
    return yAxis;
}

Visualization.prototype.appendMarker = function(container, configuration) {
    if (!configuration.marker) {
        return;
    }
    var markerConfiguration = this.buildMarkerConfiguration(configuration);
    var marker = this.appendCircle(container, markerConfiguration);
    this.setupListener(container, 'mousemove', this.buildMarkerDefaultMousemove(marker, configuration));
    return marker;
}

Visualization.prototype.buildMarkerConfiguration = function(values) {
    var configuration = this.hydrateConfiguration();
    values = this.hydrateConfiguration(values);
    configuration.attributes.cx = values.attributes.cx || 0;
    configuration.attributes.cy = values.attributes.cy || 0;
    configuration.attributes.r = values.attributes.r || 5;
    configuration.attributes['stroke-width'] = values.attributes['stroke-width'] || 1;
    configuration.attributes.stroke = values.attributes.stroke || 'steelblue';
    configuration.styles.display = configuration.styles.display || 'none';
    return configuration;
}

Visualization.prototype.buildMarkerDefaultMousemove = function(marker, configuration) {
    //var bisect = d3.bisector(function(d) { 
    return function() {
        var coordinates = d3.mouse(this);
        marker
            .style('display', 'initial')
            .attr('cx', coordinates[0])
            .attr('cy', coordinates[1]);
    }
}

Visualization.prototype.buildXAxisConfiguration = function(values) {
    var configuration = {
        attributes: {}
    };
    values = this.hydrateConfiguration(values);
    configuration.attributes.x1 = values.attributes.x1 || 0;
    configuration.attributes.x2 = values.attributes.x2 || this.getWidth();
    configuration.attributes.y1 = values.attributes.y1 || this.getHeight();
    configuration.attributes.y2 = values.attributes.y2 || this.getHeight();
    configuration.attributes['stroke-width'] = values.attributes['stroke-width'] || 1;
    configuration.attributes.stroke = values.attributes.stroke || 'steelblue';
    return configuration;
}

Visualization.prototype.buildYAxisConfiguration = function(values) {
    var configuration = {
        attributes: {}
    };
    values = this.hydrateConfiguration(values);
    configuration.attributes.x1 = values.attributes.x1 || 0;
    configuration.attributes.x2 = values.attributes.x2 || 0;
    configuration.attributes.y1 = values.attributes.y1 || 0;
    configuration.attributes.y2 = values.attributes.y2 || this.getHeight();
    configuration.attributes['stroke-width'] = values.attributes['stroke-width'] || 1;
    configuration.attributes.stroke = values.attributes.stroke || 'steelblue';
    return configuration;
}
*/
