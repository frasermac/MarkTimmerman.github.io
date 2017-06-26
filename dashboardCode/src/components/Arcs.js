import React from 'react';

import G from './G.js'
import Path from './Path.js'

import { select } from 'd3-selection'
import { arc } from 'd3-shape'

export class Arc extends React.Component {
    constructor(props) {
        super(props);
        this.addArcDataToPath = this.addArcDataToPath.bind(this);
    }

    render() {
        return (
            <Path
                ref={node => this.node = node}

                className='arc'
                stroke={this.props.stroke}
                strokeWidth={this.props.strokeWidth}
                fill={this.props.fill}
                shapePath={this.addArcDataToPath}
                centerX={this.props.centerX}
                centerY={this.props.centerY}
            >
            </Path>
        );
    }

    addArcDataToPath(node) {
        const d = arc()
            .innerRadius(this.props.radius)
            .outerRadius(this.props.radius)
            .startAngle(this.props.startAngle)
            .endAngle(this.props.endAngle);
        select(node)
            .attr('d', d);
    }
}

export class Arcs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            number: this.props.number,
            percentCoverage: this.props.percentCoverage,
            radius: this.props.radius,
        }
    }

    render() {
        return (
            <G className='arcs'>
                {this.buildArcs()}
            </G>
        );
    }

    buildArcs() {
        return Array(this.props.number).fill().map(
            (_, i) => this.buildArc(i)
        );
    }

    buildArc(index) {
        return (
            <Arc
                key={'arc' + index}
                radius={this.props.radius}
                startAngle={this.calculateStartAngle(index)}
                endAngle={this.calculateEndAngle(index)}
                {...this.props}
            />
        );
    }

    calculateStartAngle(index) {
        const offset = this.getOffSet();
        const arcAndGapLength = this.calculateArcLength() * this.calculateLengthOfGap();
        return offset + (index * arcAndGapLength);
    }

    calculateEndAngle(index) {
        return this.calculateStartAngle(index) + this.calculateArcLength();
    }

    getOffSet() {
        if (!this.props.offset) {
            return 0;
        }
        return this.props.offset;
    }

    calculateArcLength() {
        return 2 * Math.PI * this.props.percentCoverage / this.props.number;
    }

    calculateLengthOfGap() {
        return (2 * Math.PI) / (this.props.number * this.calculateArcLength());
    }
}
