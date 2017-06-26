function tissueBoxing(){
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
}

