import React, { Component } from 'react';
import './App.css';

import Background from './components/Background.js'
import GpsViewer from './components/complex/GpsViewer.js'

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
                    <GpsViewer
                        width={this.calculateGpsViewerWidth()}
                        height={this.calculateGpsViewerHeight()}
                        parentWidth={this.state.width}
                        parentHeight={this.state.height}
                    />
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

    calculateGpsViewerWidth() {
        if (this.isGraphAreaSmallerThanDefault()) {
            return this.getSmallerOfWidthOrHeight() * 0.80;
        }
        return 400;
    }

    calculateGpsViewerHeight() {
        if (this.isGraphAreaSmallerThanDefault()) {
            return this.getSmallerOfWidthOrHeight() * 0.80;
        }
        return 400;
    }

    isGraphAreaSmallerThanDefault() {
        if (this.state.width < 500 || this.state.height < 500) {
            return true;
        }
        return false;
    }

    getSmallerOfWidthOrHeight() {
        if (this.state.width < this.state.height) {
            return this.state.width;
        }
        return this.state.height;
    }
}

export default App;
