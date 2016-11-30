var PianoTeacher = PianoTeacher || function(config) {
    this.setupAudio();
    this.setupMicrophone(config);
    this.setupIntervals();
    this.setupChords();
    this.renderPiano(config);
}

PianoTeacher.prototype.renderPiano = function(config) {
    this.setupKeys(config && config.keys);
    this.setupSVG(config);
}

PianoTeacher.prototype.setupAudio = function(config) {
    this.audio = {};
    this.audio.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audio.context = new this.audio.AudioContext();
}

// Thank you https://github.com/jbergknoff/guitar-tuner/blob/master/index.html
PianoTeacher.prototype.setupMicrophone = function(config) {
    var PT = this;

    this.microphone = {};
    this.microphone.C2 = 65.41;
    this.microphone.magnitudeThreshold = config && config.magnitudeThreshold || 13000;

    this.microphone.useMicrophone = function(stream) {
        PT.microphone.context = new AudioContext();
        PT.microphone.microphone = PT.microphone.context.createMediaStreamSource(stream);
        PT.microphone.scriptProcessor = PT.microphone.context.createScriptProcessor(1024, 1, 1);

        PT.microphone.correlationWorker = new Worker('CorrelationWorker.js');
        PT.microphone.correlationWorker.addEventListener('message', PT.microphone.interpretCorrelationResult);

        PT.microphone.scriptProcessor.connect(PT.microphone.context.destination);
        PT.microphone.microphone.connect(PT.microphone.scriptProcessor);

        PT.microphone.buffer = [];
        PT.microphone.sampleLength = 100;
        PT.microphone.recording = true;

        window.capture_audio = function(event) {
            if(!PT.microphone.recording)
                return;

            PT.microphone.buffer = PT.microphone.buffer.concat(Array.prototype.slice.call(event.inputBuffer.getChannelData(0)));

            if(PT.microphone.buffer.length > PT.microphone.sampleLength * PT.microphone.context.sampleRate / 1000) {
                PT.microphone.recording = false;

                PT.microphone.correlationWorker.postMessage({
                    timeseries: PT.microphone.buffer,
                    keys: PT.keys.map(function(k) { return {frequency: k.frequency}; }),
                    sampleRate: PT.microphone.context.sampleRate
                });

                PT.microphone.buffer = [];
                setTimeout(function() { PT.microphone.recording = true; }, 250);
            }
        }

        PT.microphone.scriptProcessor.onaudioprocess = window.capture_audio;
    }

    this.microphone.interpretCorrelationResult = function(event) {
        var timeseries = event.data.timeseries;
        var frequencyAmplitudes = event.data.frequencyAmplitudes;

        var magnitudes = frequencyAmplitudes.map(function(z) {
            return z[0] * z[0] + z[1] * z[1];
        });

        if(PT.applyMagnitudes)
            PT.applyMagnitudes(magnitudes);

        var peaks = [];

        for(var i=0; i<magnitudes.length; i++) {
            if(magnitudes[i] >= PT.microphone.magnitudeThreshold) {
                peaks.push({
                    magnitude: magnitudes[i],
                    key: PT.keys[i]
                });
            }
        }

        if(peaks.length > 0) {
            if(PT.test && PT.test.active && PT.test.current && PT.test.current.answer) {
                peaks.forEach(function(peak) {
                    PT.test.current.answer(peak.key);
                });
            }
        }
    }

    if(AudioContext)
        navigator.getUserMedia.call(navigator, {"audio": true}, this.microphone.useMicrophone, function() {});
}

PianoTeacher.prototype.setupSVG = function(config) {
    var PT = this;

    this.container = config && config.container || this.container || 'body';
    this.svg = {
        width: config && config.width || window.innerWidth * 0.75,
        height: config && config.height || window.innerWidth * 0.75 / 2
    };

    this.svg.svg = d3.select(this.container).append('svg')
                    .attr('class', 'keyboard')
                    .attr('width', this.svg.width)
                    .attr('height', this.svg.height);

    this.titleContainer = {
        width: this.svg.width,
        height: 50
    };

    this.messageContainer = {
        width: this.svg.width,
        height: 50,
        y: this.svg.height - 50
    };

    this.keysContainer = {
        y: this.titleContainer.height,
        width: this.svg.width,
        height: this.svg.height - this.titleContainer.height - this.messageContainer.height
    };

    this.keysContainer.g = this.svg.svg.append('g')
        .attr('width', this.keysContainer.width)
        .attr('height', this.keysContainer.height)
        .attr('transform', 'translate(0, ' + this.keysContainer.y + ')')
        .attr('fill', 'orange');

    this.optionsContainer = {
        width: this.svg.width / 2,
        height: 25,
        y: this.svg.height - 25
    };

    this.setupTitle();
    //this.setupMessage();

    this.setupOptions([
        {
            display: "Intervals",
            test: function() { PT.testIntervals(); }
        },
        {
            display: "Chords",
            test: function() { PT.testChords(); }
        }
    ]);

    this.renderKeys();
    this.applyKeyListeners();
}

PianoTeacher.prototype.setupTitle = function() {
    var PT = this;

    this.title = {
        container: this.titleContainer,
        fill: 'black',
        fontSize: '25px',
        fontFamily: 'Josefin Sans'
    };

    this.title.g = this.svg.svg.append('g')
        .attr('width', this.title.container.width)
        .attr('height', this.title.container.height)
        .attr('y', this.title.container.y || 0);

    this.title.text = this.title.g.append('text')
        .attr('width', this.title.container.width)
        .attr('height', this.title.container.height)
        .attr('x', this.title.container.width / 2)
        .attr('y', this.title.container.height / 2)
        .attr('fill', this.title.fill)
        .attr('font-size', this.title.fontSize)
        .attr('font-family', this.title.fontFamily)
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'central');

    this.title.update = function(text, duration, callback) {
        PT.title.text
            .text(text);

        if(duration) {
            setTimeout(function() {
                PT.title.text
                    .text('');
                if(callback)
                    callback();
            }, duration);
        }
    }
}

PianoTeacher.prototype.setupMessage = function() {
    var PT = this;

    this.message = {
        container: this.messageContainer,
        fill: 'black',
        fontSize: '15px',
        fontFamily: 'Josefin Sans'
    };

    this.message.g = this.svg.svg.append('g')
        .attr('width', this.message.container.width)
        .attr('height', this.message.container.height)
        .attr('transform', 'translate(0, ' + (this.message.container.y || 0) + ')');

    this.message.text = this.message.g.append('text')
        .attr('width', this.message.container.width)
        .attr('height', this.message.container.height)
        .attr('x', this.message.container.width / 2)
        .attr('y', this.message.container.height / 2)
        .attr('fill', this.message.fill)
        .attr('font-size', this.message.fontSize)
        .attr('font-family', this.message.fontFamily)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central');

    this.message.update = function(text, duration, callback) {
        PT.message.text
            .text(text);

        if(duration) {
            setTimeout(function() {
                PT.message.text
                    .text('');
                if(callback)
                    callback();
            }, duration);
        }
    }
}

PianoTeacher.prototype.setupOptions = function(options) {
    var PT = this;

    this.options = {
        container: this.optionsContainer,
        options: options
    };
    this.options.boxWidth = this.options.container.width / this.options.options.length;
    this.options.boxHeight = this.options.container.height;

    this.options.g = this.svg.svg.append('g')
        .attr('width', this.options.container.width)
        .attr('height', this.options.container.height)
        .attr('transform', 'translate(0, ' + (this.options.container.y || 0) + ')');

    this.options.options.forEach(function(option, i) {
        option.g = PT.options.g.append('g')
            .attr('class', 'optionsBox')
            .attr('width', PT.options.boxWidth)
            .attr('height', PT.options.boxHeight)
            .attr('transform', 'translate(' + (PT.options.boxWidth * i) + ', 0)');
        option.box = option.g.append('rect')
            .attr('width', PT.options.boxWidth)
            .attr('height', PT.options.boxHeight)
            .attr('fill', 'none')
            .style('pointer-events', 'all')
            .attr('stroke', 'rgba(0, 0, 0, 0.25)')
            .attr('stroke-width', 1);
        option.label = option.g.append('text')
            .attr('x', PT.options.boxWidth / 2)
            .attr('y', PT.options.boxHeight / 2)
            .attr('text-anchor', 'middle')
            .style('dominant-baseline', 'central')
            .style('text-transform', 'uppercase')
            .style('font-family', 'Josefin Sans')
            .style('font-size', '13px')
            .attr('fill', 'black')
            .style('pointer-events', 'all')
            .text(option.display);

        option.box.on('click', function() {
            d3.selectAll('.optionsBox rect')
                .attr('fill', 'none');
            option.box
                .attr('fill', 'rgba(0, 0, 0, 0.25)');

            option.test();
        });
    });
}

PianoTeacher.prototype.renderKeys = function(config) {
    var PT = this;

    this.keySettings = {
        fill: 'rgba(255, 255, 255, 1.0)',
        depressedFill: 'steelblue',
        highLightFill: 'lightred',
        whiteWidth: this.keysContainer.width / this.keys.filter(function(k) { return k.color == 'white'; }).length,
        whiteHeight: this.keysContainer.height,
        blackHeight: this.keysContainer.height * 0.60
    };
    this.keySettings.blackWidth = this.keySettings.whiteWidth / 2;

    var whiteKeyCount = -1;
    this.keys.forEach(function(key) {
        if(key.color == 'white')
            whiteKeyCount++;
        key.whiteKeyIndex = whiteKeyCount;
        key.octave = key.octave || 0;
    });

    this.keys.filter(function(k) { return k.color == 'white'; }).forEach(function(key) {
        PT.renderKey(key);
    });

    this.keys.filter(function(k) { return k.color == 'black'; }).forEach(function(key) {
        PT.renderKey(key);
    });
}

PianoTeacher.prototype.renderKey = function(key) {
    key.x = key.whiteKeyIndex * this.keySettings.whiteWidth
                + (key.color == 'white' ? 0 : this.keySettings.whiteWidth * 0.75);

    key.rect = this.keysContainer.g.append('rect')
        .attr('width', (key.color == 'white' ? this.keySettings.whiteWidth : this.keySettings.blackWidth))
        .attr('height', (key.color == 'white' ? this.keySettings.whiteHeight: this.keySettings.blackHeight))
        .attr('fill', key.color)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('x', key.x);
}

PianoTeacher.prototype.applyKeyListeners = function(config) {
    var PT = this;

    this.keys.forEach(function(key) {
        key.rect.on('mousedown', function() {
            key.play();
        });

        key.rect.on('mouseup', function() {
            key.stop();
        });

        key.rect.on('mouseout', function() {
            key.stopOscillator();
        });

        key.rect.on('click', function() {
            if(PT.test && PT.test.active && PT.test.current && PT.test.current.answer) {
                PT.test.current.answer(key);
            }
        });
    });
}

PianoTeacher.prototype.setupKeys = function(config) {
    var PT = this;

    this.keyProfiles = [
        {
            key: "A",
            color: "white",
            stepsToNextWhite: 2,
            numberInOctave: 1
        },
        {
            key: "A# / Bb",
            color: "black",
            numberInOctave: 2
        },
        {
            key: "B",
            color: "white",
            stepsToNextWhite: 1,
            numberInOctave: 3
        },
        {
            key: "C",
            color: "white",
            stepsToNextWhite: 2,
            numberInOctave: 4
        },
        {
            key: "C# / Db",
            color: "black",
            numberInOctave: 5
        },
        {
            key: "D",
            color: "white",
            stepsToNextWhite: 2,
            numberInOctave: 6
        },
        {
            key: "D# / Eb",
            color: "black",
            numberInOctave: 7
        },
        {
            key: "E",
            color: "white",
            stepsToNextWhite: 1,
            numberInOctave: 8
        },
        {
            key: "F",
            color: "white",
            stepsToNextWhite: 2,
            numberInOctave: 9
        },
        {
            key: "F# / Gb",
            color: "black",
            numberInOctave: 10
        },
        {
            key: "G",
            color: "white",
            stepsToNextWhite: 2,
            numberInOctave: 11
        },
        {
            key: "G# / Ab",
            color: "black",
            numberInOctave: 12
        }
    ];

    this.startKey = config && config.startKey || 40;
    this.endKey = config && config.endKey || 56;

    this.keys = [];
    for(var i=this.startKey;i<=this.endKey;i++) {
        var keyNumber = i;
        var keyProfile = this.keyProfiles[(keyNumber - 1) % 12];
        var newKey = {
            key: keyProfile.key,
            color: keyProfile.color,
            numberInOctive: keyProfile.numberInOctave,
            number: keyNumber
        }
        this.keys.push(newKey);
    }

    this.keys.forEach(function(key) {
        PT.setSpecifications(key);

        key.play = function(duration, callback) {
            key.rect
                .attr('fill', PT.keySettings.depressedFill);
            key.oscillator = PT.audio.context.createOscillator();
            key.oscillator.frequency.value = key.frequency;
            key.oscillator.connect(PT.audio.context.destination);
            key.oscillator.start(0);

            if(duration)
                setTimeout(function() {
                    key.stop();
                    if(callback)
                        callback();
                }, duration);
        }

        key.stop = function(preventRecolor) {
            key.rect
                .attr('fill', key.color);
            key.stopOscillator();
        }

        key.stopOscillator = function() {
            if(key.oscillator)
                key.oscillator.stop();
        }

        key.highlight = function(color, duration, callback) {
            key.rect
                .attr('fill', color || PT.keySettings.highlightFill);

            if(duration)
                setTimeout(function() {
                    key.unhighlight();
                    if(callback)
                        callback();
                }, duration);
        }

        key.unhighlight = function() {
            key.rect
                .attr('fill', key.color);
        }

        key.playChord = function(chord, duration, callback) {
            var keys = [];
            PT.chords[chord].intervals.forEach(function(interval) {
                var keyNumber = key.number + interval.halfSteps;
                var keyIndex = PT.keys.map(function(k) { return k.number; }).indexOf(keyNumber);
                keys.push(PT.keys[keyIndex]);
            });
            keys.forEach(function(otherKey) {
                otherKey.play();
            });
            key.play(duration, function() {
                keys.forEach(function(otherKey) {
                    otherKey.stop();
                });
                key.stop();
            });
        }

    });

}

PianoTeacher.prototype.getKey = function(input) {
    var type = typeof input;
    var PT = this;
    var keyMatch = null;
    for(var i=this.startKey;i<this.endKey && keyMatch==null;i++) {
        var key = this.keys[i - this.startKey];
        if((type == 'string' && key.key == input) || (type == 'number' && key.number == input))
            keyMatch = key;
    };

    return keyMatch;
}

PianoTeacher.prototype.unhighlightKeys = function() {
    this.keys.forEach(function(key) {
        key.unhighlight();
    });
}

PianoTeacher.prototype.setSpecifications = function(key) {
    key.frequency = Math.pow(Math.pow(2, 1/12), key.number - 49) * 440;
}

PianoTeacher.prototype.setupIntervals = function() {
    var PT = this;

    this.intervals = {
        "M2": {
            base: "2",
            display: "2nd",
            halfSteps: 2,
            type: "Major",
            group: "second"
        },
        "M3": {
            base: "3",
            display: "3rd",
            halfSteps: 4,
            type: "Major",
            group: "third"
        },
        "P4": {
            base: "4",
            display: "4th",
            halfSteps: 5,
            type: "Perfect",
            group: "fourth"
        },
        "P5": {
            base: "5",
            display: "5th",
            halfSteps: 7,
            type: "Perfect",
            group: "fifth"
        },
        "M6": {
            base: "6",
            display: "6th",
            halfSteps: 9,
            type: "Major",
            group: "sixth"
        },
        "M7": {
            base: "7",
            display: "7th",
            halfSteps: 11,
            type: "Major",
            group: "seventh"
        },
        "P8": {
            base: "8",
            display: "8th",
            halfSteps: 12,
            type: "Perfect",
            group: "eigth"
        }
    };

    var addInterval = function(interval, type, stepDiff) {
        var k = (type == "Minor" ? 'm' : type[0]) + interval.base;
        PT.intervals[k] = {
            name: type + " " + interval.display,
            base: interval.base,
            display: interval.display,
            halfSteps: interval.halfSteps + stepDiff,
            type: type,
            group: interval.group
        };
    }

    var intervalKeys = Object.keys(this.intervals);
    intervalKeys.forEach(function(k) {
        PT.intervals[k].name = PT.intervals[k].type + " " + PT.intervals[k].display;
        if(["second", "third", "sixth", "seventh"].indexOf(PT.intervals[k].group) !== -1) {
            addInterval(PT.intervals[k], "Augmented", 1);
            addInterval(PT.intervals[k], "Minor", -1);
            addInterval(PT.intervals[k], "Diminished", -2);
        } else {
            addInterval(PT.intervals[k], "Augmented", 1);
            addInterval(PT.intervals[k], "Diminished", -1);
        }
    });
}

PianoTeacher.prototype.setupChords = function() {
    var PT = this;

    this.chords = {
        "Major Triad": {
            name: "Major Triad",
            type: "Major",
            group: "triad",
            intervals: [
                "M3", "P5"
            ]
        },
        "Minor Triad": {
            name: "Minor Triad",
            type: "Minor",
            group: "triad",
            intervals: [
                "m3", "P5"
            ]
        },
        "Augmented Triad": {
            name: "Augmented Triad",
            type: "Augmented",
            group: "triad",
            intervals: [
                "M3", "A5"
            ]
        },
        "Diminished Triad": {
            name: "Diminished Triad",
            type: "Diminished",
            group: "triad",
            intervals: [
                "m3", "D5"
            ]
        },
        "Dominant Seventh": {
            name: "Dominant Seventh",
            type: "Dominant",
            group: "seventh",
            intervals: [
                "M3", "P5", "m7"
            ]
        },
        "Major Seventh": {
            name: "Major Seventh",
            type: "Major",
            group: "seventh",
            intervals: [
                "M3", "P5", "M7"
            ]
        },
        "Minor Seventh": {
            name: "Minor Seventh",
            type: "Minor",
            group: "seventh",
            intervals: [
                "m3", "P5", "m7"
            ]
        },
        "Half-Diminished Seventh": {
            name: "Half-Diminished Seventh",
            type: "Half-Diminished",
            group: "seventh",
            intervals: [
                "m3", "D5", "m7"
            ]
        },
        "Diminished Seventh": {
            name: "Diminished Seventh",
            type: "Diminished",
            group: "seventh",
            intervals: [
                "m3", "D5", "D7"
            ]
        }
    };

    var chordKeys = Object.keys(this.chords);

    chordKeys.forEach(function(k) {
        PT.chords[k].intervals.forEach(function(interval, i) {
            PT.chords[k].intervals[i] = PT.intervals[interval];
        });
    });
}

PianoTeacher.prototype.testIntervals = function(config) {
    var PT = this;
    delete this.test;
    this.unhighlightKeys();

    this.test = {
        groups: config && config.groups || null,
        types: config && config.types || null,
        exclude: config && config.exclude || null,
        active: true,
        current: {}
    };
    this.test.availableIntervals = [];

    Object.keys(this.intervals).forEach(function(k) {
        var interval = PT.intervals[k];
        if(     (PT.test.groups == null || PT.test.groups.indexOf(interval.group) !== -1)
            &&  (PT.test.types == null || PT.test.types.indexOf(interval.type) !== -1) 
            &&  (PT.test.exclude == null || PT.test.exclude.indexOf(k) == -1)
          ) {
            PT.test.availableIntervals.push(interval);
        }
    });

    this.test.chooseInterval = function() {
        var intervalIndex = Math.floor(Math.random() * PT.test.availableIntervals.length);
        return PT.test.availableIntervals[intervalIndex];
    }

    this.test.chooseKey = function(interval) {
        var keyIndex = Math.floor(Math.random() * PT.keys.length);
        return PT.keys[keyIndex];
    }

    this.test.run = function() {
        PT.test.current.interval = PT.test.chooseInterval();
        PT.test.current.key = PT.test.chooseKey(PT.test.current.interval);

        if(     PT.test.current.key.number + PT.test.current.interval.halfSteps > PT.endKey
            &&  PT.test.current.key.number - PT.test.current.interval.halfSteps < PT.startKey  )
            PT.test.run();

        PT.test.current.key.highlight();
        PT.title.update(PT.test.current.interval.name);

        PT.test.current.answer = function(key) {
            if(Math.abs(PT.test.current.key.number - key.number) == PT.test.current.interval.halfSteps) {
                PT.test.current.answering = true;
                delete PT.test.current.answer;
                PT.test.current.key.play(750);

                key.play(750, function() {
                    delete PT.test.current.answering;
                    PT.test.run();
                });
            } else {
                key.highlight('rgba(255, 209, 000, 1.0)', 500);
            }
        }
    }

    this.test.run();
}

PianoTeacher.prototype.testChords = function(config) {
    var PT = this;
    delete this.test;
    this.unhighlightKeys();

    this.test = {
        groups: config && config.groups || null,
        types: config && config.types || null,
        active: true,
        current: {},
        record: {
            correct: 0,
            asked: 0
        }
    };
    this.test.availableChords = [];

    Object.keys(this.chords).forEach(function(k) {
        var chord = PT.chords[k];
        if(     (PT.test.groups == null || PT.test.groups.indexOf(chord.group) !== -1)
            && (PT.test.types == null || PT.test.types.indexOf(chord.type) !== -1) 
          ) {
            PT.test.availableChords.push(chord);
        }
    });

    this.test.chooseChord = function() {
        var chordIndex = Math.floor(Math.random() * PT.test.availableChords.length);
        return PT.test.availableChords[chordIndex];
    }

    this.test.chooseKey = function(chord) {
        var maxHalfSteps = Math.max.apply(null, chord.intervals.map(function(interval) {
            return interval.halfSteps;
        }));

        var keyIndex = Math.floor(Math.random() * (PT.keys.length - maxHalfSteps));
        return PT.keys[keyIndex];
    }

    this.test.run = function() {
        PT.test.current.chord = PT.test.chooseChord();
        PT.test.current.keys = [];
        PT.test.current.key = PT.test.chooseKey(PT.test.current.chord);
        PT.test.current.key.highlight();
        PT.title.update(PT.test.current.chord.name + ', from ' + PT.test.current.key.key);

        PT.test.current.chord.intervals.forEach(function(interval) {
            interval.completed = false;
        });;

        PT.test.current.answer = function(key) {
            var incompleteIntervals = PT.test.current.chord.intervals.filter(function(interval) {
                return !interval.completed;
            });
            var thisIntervalIndex = incompleteIntervals.map(function(interval) {
                return interval.halfSteps;
            }).indexOf(key.number - PT.test.current.key.number);

            if(thisIntervalIndex !== -1) {
                incompleteIntervals[thisIntervalIndex].completed = true;
                //PT.message.update(incompleteIntervals[thisIntervalIndex].name, 700);
                PT.test.current.keys.push(key);
                key.highlight();
            }

            if(PT.test.current.chord.intervals.filter(function(interval) {
                return !interval.completed;
            }).length == 0) {
                delete PT.test.current.answer;
                PT.test.current.keys.forEach(function(key) {
                    key.play(750);
                });
                PT.test.current.key.play(750, function() {
                    delete PT.test.current.answering;
                    PT.test.run();
                });

            }
        }
    }

    this.test.run();
}
