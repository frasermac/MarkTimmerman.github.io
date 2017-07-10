import React from 'react';

import G from '../G.js'
import Path from '../Path.js'
import Circle from '../Circle.js'

import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import { line } from 'd3-shape'

class GpsPath extends React.Component {
    constructor(props) {
        super(props);
        this.addTrackDataToPath = this.addTrackDataToPath.bind(this);
    }

    render() {
        return (
            <Path
                ref={node => this.node = node}

                className='gpsTrack'
                stroke={this.props.stroke}
                strokeWidth={this.props.strokeWidth}
                fill={this.props.fill}
                shapePath={this.addTrackDataToPath}
                centerX={this.props.centerX}
                centerY={this.props.centerY}
            >
            </Path>
        );
    }

    addTrackDataToPath(node) {
        const tracks = line()
            .x(d => this.props.xScale(d))
            .y(d => this.props.yScale(d));

        select(node)
            .datum(this.props.data)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1.5)
            .attr('d', tracks);
    }
}

class GpsMarker extends React.Component {
    render() {
        return this.buildMarker();
    }

    buildMarker() {
        return (
            <Circle
                x={this.getXPosition()}
                y={this.getYPosition()}
                radius={5}
                fill='orange'
            />
        );
    }

    getXPosition() {
        const index = this.getPercentageOrIndex();
        return this.props.xScale(this.props.data[index]);
    }

    getPercentageOrIndex() {
        if (!this.props.percentage) {
            return this.getIndex();
        }
        return Math.floor(this.props.percentage * this.props.data.length);
    }

    getIndex() {
        if (!this.props.index) {
            return 0;
        }
        return this.props.index;
    }

    getYPosition() {
        const index = this.getPercentageOrIndex();
        return this.props.yScale(this.props.data[index]);
    }
}

export default class GpsTracks extends React.Component {
    render() {
        return (
            <G>
                <GpsPath
                    data={this.props.data}
                    width={this.props.width}
                    height={this.props.height}
                    xScale={this.buildScales().xScale}
                    yScale={this.buildScales().yScale}
                />
                {this.buildMarker()}
            </G>
        );
    }

    buildScales() {
        const x = d => d.Longitude;
        const y = d => d.Latitude;

        const xScale = scaleLinear().range([this.props.width, 0]);
        const yScale = scaleLinear().range([this.props.height, 0]);

        xScale.domain(extent(this.props.data, x));
        yScale.domain(extent(this.props.data, y));

        return {
            xScale: (d) => xScale(x(d)),
            yScale: (d) => yScale(y(d)),
        }
    }

    buildMarker() {
        return (
            <GpsMarker
                index={this.props.index}
                percentage={this.props.percentage}
                data={this.props.data}
                xScale={this.buildScales().xScale}
                yScale={this.buildScales().yScale}
            />
        );
    }
}
