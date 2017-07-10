import React from 'react';

import { select } from 'd3-selection'

export default class Text extends React.Component {
    render() {
        return (
            <text
                ref={node => this.node = node}
                className={this.props.className}

                width={this.props.width}
                height={this.props.height}
                x={this.getX()}
                y={this.getY()}
                dy={this.getDy()}
                fill={this.props.fill}
                
                style={this.buildStyle()}
            >
                {this.buildText()}
            </text>
        );
    }

    getX() {
        if (this.props.centered) {
            return this.props.parentWidth / 2;
        }
        return this.props.x;
    }

    getY() {
        if (this.props.centered) {
            return this.props.parentHeight / 2;
        }
        return this.props.y;
    }

    getDy() {
        if (this.props.centered) {
            return '0.35em';
        }
        return undefined;
    }

    buildStyle() {
        const style = this.props.style || {};
        Object.assign(style, {pointerEvents: 'all'});
        if (this.props.wrap) {
            Object.assign(style, {fontFamily: 'Courier  New'});
        }
        if (this.props.centered) {
            Object.assign(style, {textAnchor: 'middle'});
        }
        return style;
    }

    buildText() {
        if (!this.props.wrap) {
            return this.props.text;
        }
        return this.buildWrappedText();
    }

    buildWrappedText() {
        const chunkSize = this.calculateChunkSize();
        let offset = 0;
        let tspans  = [];
        while (offset < this.props.text.length) {
            const chunk = this.props.text.slice(offset, offset + chunkSize);
            tspans.push(this.buildTspan(chunk, tspans.length));
            offset = offset + chunkSize;
        }
        return tspans;
    }

    calculateChunkSize() {
        const fontSize = parseFloat(this.getFontSize());
        const width = this.props.width;
        return Math.floor(width / fontSize * 1.7);
    }

    getFontSize() {
        return this.props.style.fontSize.replace(/\D/g, '');
    }

    buildTspan(text, lineNumber) {
        const lineHeight = this.props.style.fontSize.replace(/\D/g, '');
        return (
            <tspan
                key={lineNumber}
                x={0}
                y={this.props.y}
                dx={0}
                dy={lineNumber * lineHeight}
            >
                {text}
            </tspan>
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
