import React from 'react';

import G from '../components/G.js';
import Background from '../components/Background.js';
import Text from '../components/Text.js';

export default class Question extends React.Component {
    render() {
        return (
            <G
                className='question'
                width={this.props.width}
                height={this.props.height}
                x={this.props.x}
                y={this.props.y}
            >
                {this.buildBackground()}
                {this.buildQuestionText()}
            </G>
        );
    }

    buildBackground() {
        return (
            <Background
                width={this.props.width}
                height={this.props.height}
            />
        );
    }

    buildQuestionText() {
        return (
            <Text
                text={this.buildQuestionString()}
                fill='white'
                parentWidth={this.props.width}
                parentHeight={this.props.height}
                style={{fontSize: '72px'}}
                centered
            />
        );
    }

    buildQuestionString() {
        return `${this.props.note} | ${this.props.difference}`;
    }
}

