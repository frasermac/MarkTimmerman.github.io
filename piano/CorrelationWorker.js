self.onmessage = function(event) {
    var timeseries = event.data.timeseries;
    var keys = event.data.keys;
    var sampleRate = event.data.sampleRate;
    var amplitudes = computeCorrelations(timeseries, keys, sampleRate);
    self.postMessage({
        timeseries: timeseries,
        frequencyAmplitudes: amplitudes
    });
};

function computeCorrelations(timeseries, keys, sampleRate) {
    var scaleFactor = 2 * Math.PI / sampleRate;
    var amplitudes = keys.map(function(k) {
        var frequency = k.frequency;
        var accumulator = [0, 0];
        for(var t=0;t<timeseries.length;t++) {
            accumulator[0] += timeseries[t] * Math.cos(scaleFactor * frequency * t);
            accumulator[1] += timeseries[t] * Math.sin(scaleFactor * frequency * t);
        }

        return accumulator
    });

    return amplitudes;
}
