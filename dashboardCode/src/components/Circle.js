import React from 'react';

export default class Circle extends React.Component {
    render() {
        return (
            <circle 
                ref={node => this.node = node}

                r={this.props.radius}
                cx={this.getX()}
                cy={this.getY()}
                stroke={this.props.stroke}
                strokeWidth={this.props.strokeWidth}
                fill={this.props.fill}
                
                style={{pointerEvents: 'all'}}
            >
            </circle>
        );
    }

    getX() {
        if (this.props.centerX) {
            return this.props.centerX / 2;
        }
        return this.props.x;
    }

    getY() {
        if (this.props.centerY) {
            return this.props.centerY / 2;
        }
        return this.props.y;
    }
}
