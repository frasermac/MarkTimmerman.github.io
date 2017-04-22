var WhistleLanguage = WhistleLanguage || function(config) {
    this.setupAudio();

    this.magnitudeThreshold = config.magnitudeThreshold || 100;

    if(window.AudioContext)
        this.setupMicrophone(config);
}

WhistleLanguage.prototype.setupAudio = function(config) {
    this.audio = {};
    this.audio.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audio.context = new this.audio.AudioContext();
}

// Thank you https://github.com/jbergknoff/guitar-tuner/blob/master/index.html
WhistleLanguage.prototype.setupMicrophone = function(config) {
    var WL = this;

    this.microphone = {};
    this.microphone.magnitudeThreshold = config && config.magnitudeThreshold || 13000;

    this.microphone.useMicrophone = function(stream) {
        WL.microphone.context = new AudioContext();
        WL.microphone.microphone = WL.microphone.context.createMediaStreamSource(stream);
        WL.microphone.scriptProcessor = WL.microphone.context.createScriptProcessor(1024, 1, 1);

        WL.microphone.correlationWorker = new Worker('CorrelationWorker.js');
        WL.microphone.correlationWorker.addEventListener('message', WL.microphone.interpretCorrelationResult);

        WL.microphone.scriptProcessor.connect(WL.microphone.context.destination);
        WL.microphone.microphone.connect(WL.microphone.scriptProcessor);

        WL.microphone.buffer = [];
        WL.microphone.sampleLength = 100;
        WL.microphone.recording = true;

        window.capture_audio = function(event) {
            if(!WL.microphone.recording)
                return;

            WL.microphone.buffer = WL.microphone.buffer.concat(Array.prototype.slice.call(event.inputBuffer.getChannelData(0)));

            if(WL.microphone.buffer.length > WL.microphone.sampleLength * WL.microphone.context.sampleRate / 1000) {
                WL.microphone.recording = false;

                WL.microphone.correlationWorker.postMessage({
                    timeseries: WL.microphone.buffer,
                    frequencies: WL.frequencies,
                    sampleRate: WL.microphone.context.sampleRate
                });

                WL.microphone.buffer = [];
                setTimeout(function() { WL.microphone.recording = true; }, 250);
            }
        }

        WL.microphone.scriptProcessor.onaudioprocess = window.capture_audio;
    }

    this.microphone.interpretCorrelationResult = function(event) {
        var timeseries = event.data.timeseries;
        var frequencyAmplitudes = event.data.frequencyAmplitudes;

        var magnitudes = frequencyAmplitudes.map(function(z) {
            return z[0] * z[0] + z[1] * z[1];
        });

        if(WL.applyMagnitudes)
            WL.applyMagnitudes(magnitudes);

        var peaks = [];

        for(var i=0; i<magnitudes.length; i++) {
            if(magnitudes[i] >= WL.microphone.magnitudeThreshold) {
                peaks.push({
                    magnitude: magnitudes[i]
                });
            }
        }
    }

    navigator.getUserMedia.call(navigator, {"audio": true}, this.microphone.useMicrophone, function() {});
}
