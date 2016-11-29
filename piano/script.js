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
}
