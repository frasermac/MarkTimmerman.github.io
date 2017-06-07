var v;
window.onload = function() {
    v = new Visualization({
        contentElement: '.content',
        attributes: {
            width: 500,
            height: 300,
            class: 'graph'
        }
    });
    v.appendCircle({
        r: 20,
        stroke: 'steelblue',
        strokeWidth: 3
    });
    /*
    v.appendLineGraph({
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
        curve: d3.curveBasis, 
        axes: {
            attributes: {
                stroke: 'rgba(255, 255, 255, 0.75)'
            }
        },
        marker: true,
        data: [
            {
                x: 0,
                y: 19
            },{
                x: 70,
                y: 21
            },{
                x: 75,
                y: 27
            },{
                x: 129,
                y: 35
            },{
                x: 133,
                y: 47
            },{
                x: 180,
                y: 58
            }
        ]
    });
    */
    console.log(v);
}
