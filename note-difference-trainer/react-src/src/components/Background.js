import React from 'react';

import Rectangle from './Rectangle.js'

export default class Background extends React.Component {
    render() {
        return (
            <Rectangle
                className='Background'
                width={this.getWidth()}
                height={this.getHeight()}
                fill={this.getFill()}

                onClick={this.props.onClick}
                onMousemove={this.props.onMousemove}
                onMouseout={this.props.onMouseout}
            />
        );
    }

    getWidth() {
        if (!this.props.width) {
            return window.innerWidth;
        }
        return this.props.width
    }

    getHeight() {
        if (!this.props.height) {
            return window.innerHeight;
        }
        return this.props.height;
    }

    getFill() {
        if (!this.props.fill) {
            return '#000';
        }
        return this.props.fill;
    }
}

