var wl;
var graph = {
    height: 300,
    sampleLength: 50,
    delayTime: 50,
    microphone: {},
    frequencyBounds: {
        lower: 500,
        upper: 2500,
        step: 10
    },
    yDomain: 5000,
    stroke: 'rgba(255, 255, 255, 1.0)',
    strokeWidth: 2,

};

window.onload = function() {
    wl = new WhistleLanguage({
        container: '.content',
        magnitudeThreshold: 100
    });

    wl.frequencies = [];
    for(var i=graph.frequencyBounds.lower;i<graph.frequencyBounds.upper;i+=graph.frequencyBounds.step) {
        wl.frequencies.push(i);
    }

    drawGraph();

    wl.applyMagnitudes = function(magnitudes) {
        var peak = null;
        for(var i=0;i<magnitudes.length;i++) {
            magnitudes[i] = {
                frequency: wl.frequencies[i],
                magnitude: magnitudes[i]
            }
            if(magnitudes[i].magnitude < wl.magnitudeThreshold)
                magnitudes[i].magnitude = 0;
            if(magnitudes[i].magnitude > 0 && (!peak || peak.magnitude < magnitudes[i].magnitude))
                peak = magnitudes[i];
        }

        if(peak)
            console.log(peak);

        graph.render(magnitudes);
    }
}

function drawGraph() {
    graph.width = window.innerWidth * 0.75;
    graph.svg = d3.select('.content').insert('svg')
        .attr('width', graph.width)
        .attr('height', graph.height)
        .style('transform', 'translate(12.5%, 50%)');
    graph.g = graph.svg.append('g')
        .attr('width', graph.width)
        .attr('height', graph.height);
    graph.path = graph.g.append('path')
        .style('fill', 'none')
        .style('stroke', graph.stroke)
        .style('stroke-width', graph.strokeWidth);
    graph.xScale = d3.scaleLinear().range([0, graph.width]);
    graph.yScale = d3.scaleLinear().range([graph.height, 0]);
    graph.line = d3.line()
        .x(function(d) { return graph.xScale(d.frequency); })
        .y(function(d) { return graph.yScale(d.magnitude); });
    graph.render = function(data) {
        graph.xScale.domain(d3.extent(data, function(d) { return d.frequency; }));
        graph.yScale.domain(d3.extent(data, function(d) { return d.magnitude; }));
        graph.yScale.domain([0, graph.yDomain]);
        graph.path.attr('d', graph.line(data));
    }
}
