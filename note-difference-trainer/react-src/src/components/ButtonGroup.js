import React from 'react';

import G from '../components/G.js'
import Button from '../components/Button.js'

export default class ButtonGroup extends React.Component {
    render() {
        return (
            <G
                className='buttonGroup'
                width={this.props.width}
                height={this.props.height}
                x={this.props.x}
                y={this.props.y}
            >
                {this.buildButtons()}
            </G>
        );
    }

    buildButtons() {
        return this.props.choices.map((choice, i) => this.buildButton(choice, i));
    }

    buildButton(choice, index) {
        return (
            <Button
                key={index}
                width={this.getButtonWidth()}
                height={this.getButtonHeight()}
                x={this.getButtonX(index)}
                y={this.getButtonY()}
                fill={this.getButtonFill(choice)}
                onClick={this.props.onClick}
                choice={choice}
            />
        );
    }

    getButtonWidth() {
        const usableWidth = this.props.width - (this.props.choices.length * this.getButtonXSpacing());
        return Math.floor(usableWidth  / this.props.choices.length);
    }

    getButtonXSpacing() {
        return 2;
    }

    getButtonHeight() {
        return this.props.height;
    }

    getButtonX(index) {
        return index * (this.getButtonWidth() + this.getButtonXSpacing());
    }

    getButtonY() {
        return (this.props.height - this.getButtonHeight()) / 2;
    }


    getButtonFill(choice) {
        if (this.props.activeChoice === choice) {
            return 'rgba(20, 100, 20, 0.5)';
        }
        return 'rgba(100, 20, 20, 0.5)';
    }
}

