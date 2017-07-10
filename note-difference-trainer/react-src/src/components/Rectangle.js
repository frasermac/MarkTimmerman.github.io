import React from 'react';

import { select } from 'd3-selection'

export default class Rectangle extends React.Component {
    render() {
        return (
            <rect
                ref={node => this.node = node}
                className={this.props.className}

                width={this.props.width}
                height={this.props.height}
                x={this.props.x}
                y={this.props.y}
                fill={this.props.fill}
                
                style={{pointerEvents: 'all'}}
            >
            </rect>
        );
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

