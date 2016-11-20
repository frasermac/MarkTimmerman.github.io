self.onmessage = function(event) {
    var timeseries = event.data.timeseries;
    var testFrequencies = event.data.testFrequencies;
    var sampleRate = event.data.sampleRate;
    var amplitudes = computeCorrelations(timeseries, testFrequencies, sampleRate);
    self.postMessage({
        timeseries: timeseries,
        frequencyAmplitudes: amplitudes
    });
};

function computeCorrelations(timeseries, testFrequencies, sampleRate) {
    var scaleFactor = 2 * Math.PI / sampleRate;
    var amplitudes = testFrequencies.map(function(f) {
        var frequency = f.frequency;
        var accumulator = [0, 0];
        for(var t=0;t<timeseries.length;t++) {
            accumulator[0] += timeseries[t] * Math.cos(scaleFactor * frequency * t);
            accumulator[1] += timeseries[t] * Math.sin(scaleFactor * frequency * t);
        }

        return accumulator
    });

    return amplitudes;
}
