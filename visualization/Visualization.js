var Visualization = Visualization || function(configuration) {
    this.configure(configuration);
}

// Template for copy/pasting
Visualization.prototype.w = function() {
}

Visualization.prototype.configure = function(configuration) {
    this.contentElement = configuration.contentElement;
    this.width = configuration.width || window.innerWidth;
    this.height = configuration.width || window.innerHeight;
}

Visualization.prototype.appendSVG = function(container, configuration) {
    container = container || this.contentElement;
    configuration = configuration || {};
    obj = d3.select(container).append('svg');
    this.setAttributes(obj, configuration.attributes);
    this.setStyles(obj, configuration.styles);
    return obj;
}

Visualization.prototype.appendObj = function(type, container, configuration) {
    container = container || this.contentElement;
    configuration = configuration || {};
    obj = container.append(type);
    this.setAttributes(obj, configuration.attributes);
    this.setStyles(obj, configuration.styles);
    return obj;
}

Visualization.prototype.appendG = function(container, configuration) {
    container = container || this.contentElement;
    configuration = configuration || {};
    return this.appendObj('g', container, configuration);
}

Visualization.prototype.setAttributes = function(obj, attributes) {
    if (!attributes) {
        return;
    }
    Object.keys(attributes).map(function(attribute) {
        obj.attr(attribute, attributes[attribute]); 
    });
}

Visualization.prototype.setStyles = function(obj, styles) {
    if (!styles) {
        return;
    }
    Object.keys(styles).map(function(attribute) {
        obj.attr(attribute, styles[attribute]); 
    }).bind(this);
}

Visualization.prototype.appendPath = function(container, configuration) {
    var thisVisualization = this;
    container = container || this.contentElement;
    configuration = configuration || {};
    var line = d3.line()
        .x(function(d) { return configuration.x(configuration.getX(d)); })
        .y(function(d) { return configuration.y(configuration.getY(d)); });

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

Visualization.prototype.appendLineGraph = function(configuration) {
    this.svg = this.appendSVG(null, configuration);
    this.g = this.appendG(this.svg);
    this.line = this.appendPath(this.g, configuration);
    return this.svg;
}

