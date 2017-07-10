import React from 'react';

import { select } from 'd3-selection'

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

    componentDidMount() {
        this.setupListeners();
    }

    componentDidUpdate() {
        this.setupListeners();
    }

    setupListeners() {
        if (this.props.onClick) {
            this.onClick();
        }
        if (this.props.onMouseover) {
            this.onMouseover();
        }
        if (this.props.onMousemove) {
            this.onMousemove();
        }
        if (this.props.onMouseout) {
            this.onMouseout();
        }
    }

    onClick() {
        select(this.node)
            .on('click', this.props.onClick);
    }

    onMouseover() {
        select(this.node)
            .on('mouseover', this.props.onMouseover);
    }

    onMousemove() {
        select(this.node)
            .on('mousemove', this.props.onMousemove);
    }

    onMouseout() {
        select(this.node)
            .on('mouseout', this.props.onMouseout);
    }
}
