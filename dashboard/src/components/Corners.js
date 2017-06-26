import React from 'react';

import Line from './Line.js'
import G from './G.js'

export class Corner extends React.Component {
    render() {
        return (
            <G className='corner'>
                <Line
                    stroke={this.props.stroke}

                    x1={this.getHorizontalX1()}
                    x2={this.getHorizontalX2()}
                    y1={this.getHorizontalY()}
                    y2={this.getHorizontalY()}
                />
                <Line
                    stroke={this.props.stroke}

                    x1={this.getVerticalX()}
                    x2={this.getVerticalX()}
                    y1={this.getVerticalY1()}
                    y2={this.getVerticalY2()}
                />
            </G>
        );
    }

    getHorizontalX1() {
        if (this.props.right) {
            return this.props.width;
        }
        return 0;
    }

    getHorizontalX2() {
        const length = this.props.length;
        if (this.props.right) {
            return this.props.width - length;
        }
        return length;
    }

    getHorizontalY() {
        if (this.props.bottom) {
            return this.props.height;
        }
        return 0;
    }

    getVerticalX() {
        if (this.props.right) {
            return this.props.width;
        }
        return 0;
    }

    getVerticalY1() {
        if (this.props.bottom) {
            return this.props.height;
        }
        return 0;
    }

    getVerticalY2() {
        const length = this.props.length;
        if (this.props.bottom) {
            return this.props.height - length;
        }
        return length;
    }
}

export default class Corners extends React.Component {
    render() {
        return (
            <g className='corners'>
                <Corner {...this.props} top left />
                <Corner {...this.props} top right />
                <Corner {...this.props} bottom left />
                <Corner {...this.props} bottom right />
            </g>
        );
    }
}


