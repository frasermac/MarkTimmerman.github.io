var pt;
var graph = {
    height: 200
};

window.onload = function() {
    pt = new PianoTeacher({
        container: '.content',
        keys: {
            startKey: 34,
            endKey: 55
        }
    });

    graph.width = pt.svg.width;
    graph.svg = d3.select('.content').insert('svg')
        .attr('width', graph.width)
        .attr('height', graph.height)
        .style('transform', 'translate(12.5%, 5%)');
    graph.g = graph.svg.append('g')
        .attr('width', graph.width)
        .attr('height', graph.height);
    graph.path = graph.g.append('path')
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', '2px');
    graph.xScale = d3.scaleLinear().range([0, graph.width]);
    graph.yScale = d3.scaleLinear().range([graph.height, 0]);
    graph.line = d3.line()
        .x(function(d) { return graph.xScale(d.frequency); })
        .y(function(d) { return graph.yScale(d.magnitude); });
    graph.render = function(data) {
        graph.xScale.domain(d3.extent(data, function(d) { return d.frequency; }));
        //graph.yScale.domain(d3.extent(data, function(d) { return d.magnitude; }));
        graph.yScale.domain([0, 50000]);
        graph.path.attr('d', graph.line(data));
    }
    pt.applyMagnitudes = function(magnitudes) {
        var keys = [];
        for(var i=0;i<magnitudes.length;i++) {
            if(magnitudes[i] > 50000)
                keys.push(pt.keys[i].key);
            magnitudes[i] = {
                frequency: pt.keys[i].frequency,
                magnitude: magnitudes[i]
            }
        }
        graph.render(magnitudes);
        if(keys.length > 0)
            console.log(keys.join(', '));
    }

    if(false)
    pt.testIntervals({
        groups: ["third", "fourth", "fifth"],
        types: ["Major", "Minor", "Perfect", "Augmented"]
    });

    if(false)
    pt.testChords();

    if(false)
    pt.testIntervals({
        exclude: ["D2"]
    });
}
