var pt;

window.onerror = function(message, url, lineNumber) {
    console.log(message);
    alert(lineNumber + ': ' + message);
    return true;
}

window.onload = function() {
    pt = new PianoTeacher({
        container: '.content',
        keys: {
            startKey: 34,
            endKey: 55
        }
    });

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
