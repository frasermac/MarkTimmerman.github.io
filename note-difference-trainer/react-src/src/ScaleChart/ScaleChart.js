import React from 'react';

import G from '../components/G.js';
import Notes from './Notes.js';

export default class ScaleChart extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.state = {
            scale: 'C'
        };
    }

    componentWillMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(event) {
        const key = event.key.toUpperCase();
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        if (notes.indexOf(key) === -1) {
            return;
        }
        this.setState({
            scale: key
        });
    }

    render() {
        return (
            <G
                className='scaleChart'
                width={this.getWidth()}
                height={this.getHeight()}
                parentWidth={this.props.width}
                parentHeight={this.props.height}
                centered
            >
                {this.buildScale(this.state.scale)}
            </G>
        );
    }

    getWidth() {
        return this.props.width / 1.2;
    }

    getHeight() {
        return this.props.height / 2;
    }

    buildScale(scale) {
        return (
            <Notes
                scale={scale}
                width={this.getWidth()}
                height={this.getHeight()}
            />
        );
    }
}
