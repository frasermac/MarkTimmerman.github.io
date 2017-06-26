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

    onMousemove() {
        select(this.node)
            .on('mousemove', this.props.onMousemove);
    }
    onMouseout() {
        select(this.node)
            .on('mouseout', this.props.onMouseout);
    }
}

