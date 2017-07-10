import React from 'react';

import G from '../components/G.js'
import Rectangle from '../components/Rectangle.js'
import Text from '../components/Text.js'

export default class Button extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    render() {
        return (
            <G
                key={this.props.choice}
                className='button'
                width={this.props.width}
                height={this.props.height}
                x={this.props.x}
                y={this.props.y}
            >
                {this.buildRectangle()}
                {this.buildText()}
            </G>
        );
    }

    buildRectangle() {
        return (
            <Rectangle
                width={this.props.width}
                height={this.props.height}
                fill={this.props.fill}
                onClick={this.handleClick}
            />
        );
    }

    handleClick() {
        this.props.onClick(this.props.choice);
    }

    buildText() {
        return (
            <Text
                text={this.props.choice}
                fill='white'
                parentWidth={this.props.width}
                parentHeight={this.props.height}
                style={this.buildTextStyle()}
                onClick={this.handleClick}
                centered={this.props.centerText}
            />
        );
    }

    buildTextStyle() {
        const style = this.props.textStyle || {};
        if (!style.fontSize) {
            style.fontSize = '10px';
        }
        return style;
    }
}
