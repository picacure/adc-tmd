//画图组件. by jiangC
(function () {
    var draw = function (domId, options) {
        var myCanvas = document.createElement('canvas'),
            wrapper = document.getElementById(domId)
            ;

        myCanvas.style.width = getComputedStyle(wrapper).width;
        myCanvas.style.height = getComputedStyle(wrapper).height;

        this.canvas = myCanvas;
        this.canvas.width = parseInt(myCanvas.style.width);
        this.canvas.height = parseInt(myCanvas.style.height);

        this.context = this.canvas.getContext('2d');

        this.line = [
            {
                x: 0,
                y: 0
            }
        ]

        this.color = options.color || 'red';

        wrapper.appendChild(myCanvas);
    };

    draw.prototype.drawLine = function (xV, yV) {
        var len = this.line.length - 1;

        //解决clearRect失效的问题 http://stackoverflow.com/questions/9743027/clearrect-not-working
        this.context.beginPath();

        //old point.
        this.context.moveTo(this.line[len].x, this.line[len].y);

        //new point.
        this.context.lineTo(xV, yV);
        this.context.lineWidth = 1;
        this.context.strokeStyle = this.color;
        this.context.stroke();

        this.line.push({
            x: xV,
            y: yV
        });
    };

    //画成组的线.
    draw.prototype.drawLines = function (points) {

        this.context.lineWidth = 1;
        this.context.strokeStyle = this.color;

        for (var i = 0, len = points.length; i < len - 1; i++) {
            this.context.moveTo(points[i].x, points[i].y);
            this.context.lineTo(points[i + 1].x, points[i + 1].y);
            this.context.stroke();
        }
    };

    draw.prototype.size = function () {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        }
    };

    draw.prototype.reset = function () {

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.line = [
            {
                x: 0,
                y: 0
            }
        ]
    }

    window.Draw = draw;
})();