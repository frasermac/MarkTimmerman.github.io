import React, { Component } from 'react';
import './App.css';

import Background from './components/Background.js'
import NoteDifferenceTrainer from './NoteDifferenceTrainer/NoteDifferenceTrainer.js'

class App extends Component {
    constructor(props) {
        super(props);
        this.handleScreenResize = this.handleScreenResize.bind(this);
        this.state = {
            width: window.innerWidth,
            height: window.innerHeight,
        }
    }

    render() {
        return (
            <svg
                width={this.state.width}
                height={this.state.height}
                style={{position: 'fixed', top: '0'}}
            >
                <g
                    className='root'>
                    ref={node => this.node = node}
                    width={this.state.width}
                    height={this.state.height}
                />
                    {this.buildBackground()}
                    {this.buildNoteDifferenceTrainer()}
                </g>
            </svg>
        );
    }

    componentWillMount() {
        this.handleScreenResize();
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleScreenResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleScreenResize);
    }

    handleScreenResize() {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }

    buildBackground() {
        return <Background color='black'/>;
    }

    buildNoteDifferenceTrainer() {
        return (
            <NoteDifferenceTrainer
                width={this.calculateWidth()}
                height={this.calculateHeight()}
                parentWidth={this.state.width}
                parentHeight={this.state.height}
            />
        );
    }

    calculateWidth() {
        return this.state.width * 0.95;
    }

    calculateHeight() {
        return this.state.height * 0.95;
    }
}

export default App;
