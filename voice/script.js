var graph = {
    height: 200,
    sampleLength: 50,
    delayTime: 50,
    microphone: {},
    frequencyBounds: {
        lower: 100,
        upper: 3000,
        step: 100
    },
    yDomain: 5000,
    stroke: 'rgba(255, 255, 255, 1.0)',
    strokeWidth: 2,

};

graph.slots = [];
for(var i=graph.frequencyBounds.lower;i<graph.frequencyBounds.upper;i+=graph.frequencyBounds.step) {
    graph.slots.push({
        frequency: i
    });
}

graph.microphone.useMicrophone = function(stream) {
    graph.microphone.context = new AudioContext();
    graph.microphone.microphone = graph.microphone.context.createMediaStreamSource(stream);
    graph.microphone.scriptProcessor = graph.microphone.context.createScriptProcessor(1024, 1, 1);

    graph.microphone.correlationWorker = new Worker('CorrelationWorker.js');
    graph.microphone.correlationWorker.addEventListener('message', graph.microphone.interpretCorrelationResult);

    graph.microphone.scriptProcessor.connect(graph.microphone.context.destination);
    graph.microphone.microphone.connect(graph.microphone.scriptProcessor);

    graph.microphone.buffer = [];
    graph.microphone.sampleLength = graph.sampleLength;
    graph.microphone.recording = true;

    window.capture_audio = function(event) {
        if(!graph.microphone.recording)
            return;

        graph.microphone.buffer = graph.microphone.buffer.concat(Array.prototype.slice.call(event.inputBuffer.getChannelData(0)));

        if(graph.microphone.buffer.length > graph.microphone.sampleLength * graph.microphone.context.sampleRate / 1000) {
            graph.microphone.recording = false;

            graph.microphone.correlationWorker.postMessage({
                timeseries: graph.microphone.buffer,
                slots: graph.slots.map(function(s) { return {frequency: s.frequency}; }),
                sampleRate: graph.microphone.context.sampleRate
            });

            graph.microphone.buffer = [];
            setTimeout(function() { graph.microphone.recording = true; }, graph.delayTime);
        }
    }

    graph.microphone.scriptProcessor.onaudioprocess = window.capture_audio;
}

graph.microphone.interpretCorrelationResult = function(event) {
    var timeseries = event.data.timeseries;
    var frequencyAmplitudes = event.data.frequencyAmplitudes;

    var magnitudes = frequencyAmplitudes.map(function(z) {
        return z[0] * z[0] + z[1] * z[1];
    });

    if(graph.applyMagnitudes)
        graph.applyMagnitudes(magnitudes);
}

window.onload = function() {
    graph.width = window.innerWidth * 0.75;
    graph.svg = d3.select('.content').insert('svg')
        .attr('width', graph.width)
        .attr('height', graph.height)
        .style('transform', 'translate(12.5%, 5%)');
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
        //graph.yScale.domain(d3.extent(data, function(d) { return d.magnitude; }));
        graph.yScale.domain([0, graph.yDomain]);
        graph.path.attr('d', graph.line(data));
    }
    graph.applyMagnitudes = function(magnitudes) {
        for(var i=0;i<magnitudes.length;i++) {
            magnitudes[i] = {
                frequency: graph.slots[i].frequency,
                magnitude: magnitudes[i]
            }
        }
        graph.render(magnitudes);
    }

    navigator.getUserMedia.call(navigator, {"audio": true}, graph.microphone.useMicrophone, function() {});
}
