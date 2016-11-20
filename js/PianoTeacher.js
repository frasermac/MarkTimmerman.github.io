var PianoTeacher = PianoTeacher || function(config) {
    this.setupAudio();
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
    this.audio.context = new webkitAudioContext();
}

PianoTeacher.prototype.setupSVG = function(config) {
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

    this.setupTitle();
    this.setupMessage();

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
            key.stop();
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

        key.stop = function() {
            key.rect
                .attr('fill', key.color);
            if(key.oscillator)
                key.oscillator.stop();
        }

        key.highlight = function(duration, callback) {
            key.rect
                .attr('fill', PT.keySettings.highlightFill);

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
                var keyNumber = key.number + PT.intervals[interval].halfSteps;
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

PianoTeacher.prototype.testIntervals = function(config) {
    var PT = this;

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
    this.test.availableIntervals = [];

    Object.keys(this.intervals).forEach(function(k) {
        var interval = PT.intervals[k];
        if(     (PT.test.groups == null || PT.test.groups.indexOf(interval.group) !== -1)
            && (PT.test.types == null || PT.test.types.indexOf(interval.type) !== -1) 
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

    this.test.run = function(limit) {
        PT.test.current.interval = PT.test.chooseInterval();
        PT.test.current.key = PT.test.chooseKey(PT.test.current.interval);
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
                PT.message.update('Wrong!', 700);
            }
        }
    }

    this.test.run();
}

PianoTeacher.prototype.setupChords = function() {
    var PT = this;

    this.chords = {
        "Major Triad": {
            type: "Major",
            group: "triad",
            intervals: [
                "M3", "P5"
            ]
        },
        "Minor Triad": {
            type: "Minor",
            group: "triad",
            intervals: [
                "m3", "P5"
            ]
        },
        "Augmented Triad": {
            type: "Augmented",
            group: "triad",
            intervals: [
                "M3", "A5"
            ]
        },
        "Diminished Triad": {
            type: "Diminished",
            group: "triad",
            intervals: [
                "m3", "D5"
            ]
        }
    };
}
