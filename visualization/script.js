var v;
window.onload = function() {
    v = new Visualization({
        contentElement: '.content'
    });
    v.appendLineGraph({
        attributes: {
            class: 'graph',
            width: '500px',
            height: '300px'
        },
        getX: function(d, i) {
            return d.x;
        },
        getY: function(d, i) {
            return d.y;
        },
        x: d3.scaleLinear()
            .range([0, 500]),
        y: d3.scaleLinear()
            .range([300, 0]),
        data: [
            1, 2, 4,  10, 16, 28, 40, 63, 99, 150, 239
        ].map(function(d, i) {
            return {
                x: i,
                y: d
            }
        })
    });
};
