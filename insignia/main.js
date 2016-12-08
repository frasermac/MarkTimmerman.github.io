var insignia;

window.onload = function() {
    insignia = new Insignia({
        outerCircle: {
            resolution: 10000,
            maxWidth: 7,
            coordinatesAtIndex: function(index) {
                var obj = this;
                var deg = (index / obj.resolution) * 360;
                return {
                    x: obj.center.x + obj.radius * Math.cos(obj.obj.helpers.degToRad(deg)),
                    y: obj.center.y + obj.radius * Math.sin(obj.obj.helpers.degToRad(deg))
                };
            },
            strokeWidthAtIndex: function(index) {
                var obj = this;
                var deg = (index / obj.resolution) * 360;
                var rad = obj.obj.helpers.degToRad(deg);
                var width = Math.abs(Math.sin(rad + Math.PI/4)) * obj.maxWidth;
                return width;
            },
            strokeAtIndex: function(index) {
                var minOpacity = 0.60;
                var maxOpacity = 1.0;

                var obj = this;
                var deg = (index / obj.resolution) * 360;
                var rad = obj.obj.helpers.degToRad(deg);
                var width = Math.abs(Math.sin(rad + Math.PI/4)) * obj.maxWidth;

                var scale = d3.scaleLinear()
                    .domain([0, 1])
                    .range([minOpacity, maxOpacity]);

                var opacity = scale(Math.abs(1/2 * (Math.sin(rad + 3 * (Math.PI / 4)))));
                opacity = Math.round(opacity * 100) / 100;

                return 'rgba(255, 255, 255, ' + (opacity) + ')';
            }
        },
        innerCircle: {
            r: 10,
            deg: 0
        }
    });
}

