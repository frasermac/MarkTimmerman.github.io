import React from 'react';

export default class Line extends React.Component {
    render() {
        return (
            <line
                ref={node => this.node = node}

                x1={this.props.x1}
                x2={this.props.x2}
                y1={this.props.y1}
                y2={this.props.y2}
                stroke={this.props.stroke}
                strokeWidth={this.props.strokeWidth}
                style={{pointerEvents: 'all'}}
            >
            </line>
        );
    }
}


