var v;
window.onload = function() {
    v = new Visualization({
        contentElement: '.content',
        attributes: {
            width: 500,
            height: 300,
            class: 'graph'
        },
        setupContainer: true
    });
    v.appendLineGraph(v.g, {
        getX: function(d, i) {
            return d.x;
        },
        getY: function(d, i) {
            return d.y;
        },
        x: d3.scaleLinear()
            .range([0, v.getWidth()]),
        y: d3.scaleLinear()
            .range([v.getHeight(), 0]),
        // Linear, Cardinal, Step, StepBefore, StepAfter, MonotoneX, CatmullRom, Basis
        curve: d3.curveCatmullRom, 
        axes: {
            attributes: {
                stroke: 'rgba(255, 255, 255, 0.75)'
            }
        },
        data: [
            1, 2, 4,  10, 16, 28, 40, 63, 99, 150, 239
        ].map(function(d, i) {
            return {
                x: i,
                y: d
            }
        })
    });
    console.log(v);
};
