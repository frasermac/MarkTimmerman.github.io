var d3Component = d3Component || function(config) {
    config = config || {};

    this.type = config.type;
    this.container = config.container || d3.select('body');
    this.class = config.class;
    this.id = config.id;
    this.hash = config.hash;
    this.prepend = config.prepend || false;

    this.data = config.data;

    this.invertYRange = config.invertYRange;
    this.invertXRange = config.invertXRange;
    this.createAndDrawPath = config.createAndDrawPath;

    this.width = config.width || 0;
    this.height = config.height || 0;
    this.x = config.x || 0;
    this.y = config.y || 0;

    this.margin = config.margin || {};
    this.margin.top = this.margin.top || 0;
    this.margin.right = this.margin.right || 0;
    this.margin.bottom = this.margin.bottom || 0;
    this.margin.left = this.margin.left || 0;

    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;

    this.stroke = config.stroke || 'none';
    this.strokeWidth = config.strokeWidth || 1;
    this.fill = config.fill || 'none';

    this.r = config.r || 0;
    this.cx = config.cx || 0;
    this.cy = config.cy || 0;

    this.x1 = config.x1 || 0;
    this.x2 = config.x2 || 0;
    this.y1 = config.y1 || 0;
    this.y2 = config.y2 || 0;

    this.displayText = config.displayText;
    this.attr = config.attr;
    this.style = config.style;

    this.link = config.link;

    this.interpolate = config.interpolate || 'none';
    this.xDomain = config.xDomain;
    this.yDomain = config.yDomain;
    this.xFunction = config.xFunction;
    this.yFunction = config.yFunction;
    this.xDomainFunction = config.xDomainFunction;
    this.yDomainFunction = config.yDomainFunction;

    this.source = config.source;

    this.addGWrapper = config.addGWrapper;
    this.gWrapperClass = config.gWrapperClass;

    this.datum = config.datum;
    this.projection = config.projection;

    if(this.addGWrapper) {
        this.gWrapper = new d3Component({
            type: 'g',
            container: this.container,
            class: this.gWrapperClass
        });
        this.container = this.gWrapper.g;
    }

    if(this.type == 'svg')
        this.createSVG();

    if(this.type == 'g')
        this.createG();

    if(this.type == 'line')
        this.createLine();

    if(this.type == 'rect')
        this.createRect();

    if(this.type == 'circle')
        this.createCircle();

    if(this.type == 'path')
        this.createPath();

    if(this.type == 'text')
        this.createText();

    if(this.type == 'image')
        this.createImage();

    if(this.type == 'a')
        this.createA();

    if(this.type == 'geopath')
        this.createGeopath();
};

d3Component.prototype.createSVG = function() {
    this.svg = this.container.append('svg')
        .attr('class', this.class)
        .attr('width', this.width)
        .attr('height', this.height);
};

d3Component.prototype.createG = function() {
    if(this.prepend) {
        this.g = this.container.insert('g', ':first-child');
    } else {
        this.g = this.container.append('g');
    }
    this.g
        .attr('class', this.class)
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('transform', 'translate(' + 
                    (this.x)
                    + ',' + 
                    (this.y)
                    + ')')
        .style(this.style)
        .attr(this.attr);
};

d3Component.prototype.createLine = function() {
    this.line = this.container.append('line')
        .attr('class', this.class)
        .attr('x1', this.x1)
        .attr('x2', this.x2)
        .attr('y1', this.y1)
        .attr('y2', this.y2)
        .attr('stroke', this.stroke)
        .attr('stroke-width', this.strokeWidth)
        .style(this.style)
        .attr(this.attr);
};

d3Component.prototype.createRect = function() {
    this.rect = this.container.append('rect')
        .attr('class', this.class)
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('x', this.x)
        .attr('y', this.y)
        .attr('stroke', this.stroke)
        .attr('stroke-width', this.strokeWidth)
        .attr('fill', this.fill)
        .style(this.style)
        .attr(this.attr);
};

d3Component.prototype.createCircle = function() {
    this.circle = this.container.append('circle')
        .attr('class', this.class)
        .attr('id', this.id)
        .attr('r', this.r)
        .attr('cx', this.cx)
        .attr('cy', this.cy)
        .attr('r', this.r)
        .attr('stroke', this.stroke)
        .attr('stroke-width', this.strokeWidth)
        .attr('fill', this.fill)
        .style(this.style)
        .attr(this.attr);
};

d3Component.prototype.createText = function() {
    this.text = this.container.append('text')
        .attr('class', this.class)
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('x', this.x)
        .attr('y', this.y)
        .attr('fill', this.fill)
        .text(this.displayText)
        .style(this.style)
        .attr(this.attr);

    var T = this.text;
    this.updateDisplayText = function(displayText) {
        T.text(displayText);
    }
};

d3Component.prototype.createA = function() {
    this.a = this.container.append('a')
        .attr('class', this.class)
        .attr('xlink:href', this.link)
        .attr('target', '_blank')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('transform', 'translate(' + 
                    (this.x)
                    + ',' + 
                    (this.y)
                    + ')')
        .style(this.style)
        .attr(this.attr);

};

d3Component.prototype.createImage = function() {
    this.text = this.container.append('image')
        .attr('class', this.class)
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('x', this.x)
        .attr('y', this.y)
        .attr('xlink:href', this.source)
        .style(this.style)
        .attr(this.attr);
};

d3Component.prototype.createPath = function() {
    var P = this;

    this.path = this.container.append('path')
        .attr('class', this.class);

    this.xScale = d3.scale.linear().range([0, this.innerWidth]);
    if(this.invertYRange) {
        this.yScale = d3.scale.linear().range([this.innerHeight, 0]);
    } else {
        this.yScale = d3.scale.linear().range([0, this.innerHeight]);
    }

    this.line = d3.svg.line()
        .x(function(d, i) { 
            if(P.xFunction)
                return P.xFunction(d, i);
            return P.xScale(i); 
        })
        .y(function(d, i) { 
            if(P.yFunction)
                return P.yFunction(d, i);
            return P.yScale(d); 
        })
        .interpolate(this.interpolate);

    this.xScale.domain(this.xDomain || d3.extent(this.data, function(d, i) { 
        if(P.xDomainFunction)
            return P.xDomainFunction(d, i);
        return i; 
    }));
    this.yScale.domain(this.yDomain || d3.extent(this.data, function(d, i) { 
        if(P.yDomainFunction)
            return P.yDomainFunction(d, i);
        return d; 
    }));

    if(this.createAndDrawPath)
        this.drawPath();
};

d3Component.prototype.drawPath = function() {
    this.path
        .attr('d', this.line(this.data))
        .attr('stroke', this.stroke)
        .attr('stroke-width', this.strokeWidth)
        .attr('fill', 'none')
        .attr('transform', 'translate(' + 
                    (this.x + this.margin.left)
                    + ',' + 
                    (this.y + this.margin.top)
                    + ')');
};

d3Component.prototype.createGeopath = function() {
    this.container.append('path')
        .datum(this.datum)
        .attr('d', this.projection);
};
