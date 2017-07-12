import React, { Component } from 'react';
import './App.css';

import Background from './components/Background.js'
import NoteDifferenceTrainer from './NoteDifferenceTrainer/NoteDifferenceTrainer.js'
import ScaleChart from './ScaleChart/ScaleChart.js'

class App extends Component {
    constructor(props) {
        super(props);
        this.handleScreenResize = this.handleScreenResize.bind(this);
        this.state = {
            width: window.innerWidth,
            height: window.innerHeight,
            display: 'noteDifferenceTrainer', //'keyChart',
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
                    {this.buildSelectedApp()}
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

    buildSelectedApp() {
        if (this.state.display === 'noteDifferenceTrainer') {
            return this.buildNoteDifferenceTrainer();
        }
        if (this.state.display === 'keyChart') {
            return this.buildScaleChart();
        }
        return null;
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

    buildScaleChart() {
        return (
            <ScaleChart
                width={this.calculateWidth()}
                height={this.calculateHeight()}
                parentWidth={this.state.width}
                parentHeight={this.state.height}
            />
        );
    }
}

export default App;
