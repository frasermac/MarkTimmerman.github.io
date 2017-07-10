import React from 'react';

export default class G extends React.Component {
    render() {
        return (
            <g
                className={this.props.className}
                width={this.props.width}
                height={this.props.height}
                transform={this.buildTransform()}

                style={{pointerEvents: 'all'}}
            >
                {this.props.children}
            </g>
        );
    }

    buildTransform() {
        const x = this.getTransformX();
        const y = this.getTransformY();
        return 'translate(' + x + ', ' + y + ')';
    }

    getTransformX() {
        if (this.props.centered || this.props.centerX) {
            return  (this.props.parentWidth / 2) - (this.props.width / 2);
        }
        if (this.props.x) {
            return this.props.x;
        }
        return 0;
    }

    getTransformY() {
        if (this.props.centered || this.props.centerY) {
            return (this.props.parentHeight / 2) - (this.props.height / 2);
        }
        if (this.props.y) {
            return this.props.y;
        }
        return 0;
    }
}

