var pt;

window.onload = function() {
    pt = new PianoTeacher({
        container: '.content',
        keys: {
            startKey: 34,
            endKey: 55
        }
    });

    pt.testIntervals({
        groups: ["third", "fourth", "fifth"],
        types: ["Major", "Minor", "Perfect"]
    });
}
