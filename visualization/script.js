var v, c, arcs;
var arcSettings = {
    offset: 0,
    radius: 120,
    fillPercentage: 0.50,
    stroke: 'rgba(135, 112, 26, 1.0)'
}

window.onload = function() {
    v = new Visualization({
        contentElement: '.content',
        attributes: {
            width: 500,
            height: 500,
            class: 'graph'
        }
    });
    drawCorners(350, 50);
    createCircle();
    arcs = createArcs(3);

    updateCircle(76);
    updateArcs(0, 120, .50, 'rgba(135, 112, 26, 1.0)');

    var i=0;
    var move = setInterval(function() {
        arcSettings.offset++;
        updateArcs(arcSettings.offset, arcSettings.radius, arcSettings.fillPercentage, arcSettings.stroke);
    }, 10);

    v.g.element.on('mousemove', function() {
        var coords = d3.mouse(this);
        arcSettings.radius = 400 - coords[1];
        if (arcSettings.stop) {
            clearInterval(move);
        }
    });
}

function createCircle() {
     v.appendCircle({name: 'circle'});
}

function updateCircle(radius) {
    v.components.circle.setAttributes({
        cx: v.width / 2,
        cy: v.height / 2,
        r: radius,
        fill: 'none',
        stroke: 'steelblue',
        strokeWidth: 3
    });
}

function drawCorners(squareLength, cornerLength) {
    var cornersGroup = v.appendG({
        name: 'corners',
        attributes: {
            width: squareLength,
            height: squareLength,
            transform: 'translate(' + (v.width / 2 - squareLength / 2) + ',' + (v.height / 2 - squareLength / 2) + ')'
        }
    });
    var corners = [
        [0, 0], [0, 1], [1, 0], [1, 1]
    ];
    corners.forEach(corner => drawCorner(cornersGroup, cornerLength, corner));
}

function drawCorner(group, lineLength, corner) {
    const x1 = group.attributes.width * corner[0];
    const y1 = group.attributes.height * corner[1];
    group.appendLine({
        name: 'corner-' + corner[0] + corner[1] + '-horizontal',
        attributes: {
            x1: x1,
            x2: x1 + lineLength * (corner[0] ? -1 : 1),
            y1: y1,
            y2: y1,
            stroke: 'steelblue',
            strokeWidth: 3
        }
    });
    group.appendLine({
        name: 'corner-' + corner[0] + corner[1] + '-vertical',
        attributes: {
            x1: x1,
            x2: x1,
            y1: y1,
            y2: y1 + lineLength * (corner[1] ? -1 : 1),
            stroke: 'steelblue',
            strokeWidth: 3
        }
    });
}

function createArcs(arcCount) {
    var newArcs = [];
    for(var i=0; i<arcCount; i++) {
        newArcs.push(createArc('arc-' + i));
    }
    return newArcs;
}

function createArc(name) {
    return v.appendArc({
        name: name,
        arcSettings: {
            innerRadius: 0,
            outerRadius: 0,
            startAngle: 0, 
            endAngle: 0
        },
        attributes: {}
    });
}

function updateArcs(degreesOffset, radius, percentageFill, stroke) {
    degreesOffset = degreesOffset % 360;
    const degreesPerArc = 360 * percentageFill / arcs.length;
    const gapsBetweenArcs = 360 * (1 - percentageFill) / arcs.length;
    for(var i=0; i<arcs.length; i++) {
        const startDegree = degreesOffset + i * (degreesPerArc + gapsBetweenArcs);
        const endDegree = startDegree + degreesPerArc;
        updateArc(arcs[i], radius, startDegree, endDegree, stroke);
    }
}

function updateArc(arc, radius, startDegree, endDegree, stroke) {
    var d = d3.arc()
        .innerRadius(radius)
        .outerRadius(radius)
        .startAngle(startDegree * Math.PI/180)
        .endAngle(endDegree * Math.PI/180);
    arc.setAttributes({
        fill: stroke,
        'stroke-width': 2,
        stroke: stroke,
        transform: 'translate(' + (v.width / 2) + ',' + (v.height / 2) + ')',
        d: d
    });
}
