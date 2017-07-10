import React from 'react';

import G from '../components/G.js'
import Rectangle from '../components/Rectangle.js'

import { scaleLinear, scaleTime } from 'd3-scale';

export default class StackedBarGraph extends React.Component {
    render() {
        this.xScale = this.buildXScale();
        return (
            <G
                className='stackedBarGraph'
                width={this.props.width}
                height={this.props.height}
                y={this.props.y}
            >
                {this.buildStackedBars()}
            </G>
        );
    }

    buildXScale() {
        if (this.isXAxisDateType()) {
            return this.buildXTimeScale();
        }
        return scaleLinear()
            .domain([0, this.props.data.length])
            .range([0, this.props.width]);
    }

    isXAxisDateType() {
        return this.props.xAxisType === 'date';
    }

    buildXTimeScale() {
        return scaleTime()
            .domain([this.getStartDate(), this.getEndDate()])
            .range([0, this.props.width]);
    }

    getStartDate() {
        if (this.props.data.length === 0) {
            return new Date();
        }
        return new Date(this.props.data[0].dateString);
    }

    getEndDate() {
        return new Date();
    }

    buildStackedBars() {
        return this.props.data.map((val, i) => this.buildStackedBar(val, i));
    }

    buildStackedBar(value, index) {
        return (
            <G
                key={index}
                x={this.getXValue(value, index)}
                y={this.getStackedBarY(value.blocks.length)}
            >
                {this.buildBlocks(value)}
            </G>
        );
    }

    getXValue(value, index) {
        if (this.isXAxisDateType()) {
            const date = new Date(value.dateString);
            return this.xScale(date);
        }
        return this.xScale(index);
    }

    getStackedBarY(blockCount) {
        if (this.props.inverted) {
            return 
        }
        return this.props.height - (blockCount * (this.getBlockHeight() + this.getBlockYSpacing()));
    }

    getBlockYSpacing() {
        return 1;
    }

    buildBlocks(value) {
        return value.blocks.map((block, i) => this.buildBlock(block, i));
    }

    buildBlock(block, index) {
        return (
            <Rectangle
                key={index}
                width={this.getBarWidth()}
                height={this.getBlockHeight()}
                fill={this.props.fill}
                y={index * (this.getBlockHeight() + this.getBlockYSpacing())}
                onMouseover={() => this.handleBlockMouseover(block)}
            />
        );
    }

    getBarWidth() {
        if (this.isXAxisDateType()) {
            const days = (this.getEndDate().getTime() - this.getStartDate().getTime()) / (1000 * 60 * 60 * 24);
            return Math.floor(this.props.width / days);
        }
        return Math.floor(this.props.width / this.props.data.length);
    }

    getBlockHeight() {
        const maxBlockCount = this.getMaxBlockCount();
        return Math.floor((this.props.height - maxBlockCount * this.getBlockYSpacing()) / maxBlockCount);
    }

    getMaxBlockCount() {
        return Math.max.apply(null, this.props.data.map(d => d.blocks.length));
    }

    handleBlockMouseover(block) {
        this.props.onMouseover(block);
    }
}
