import React from 'react';

import update from 'immutability-helper';

import G from '../G.js'
import Circle from '../Circle.js'

import Background from '../Background.js'
import Corners from '../Corners.js'
import { Arcs } from '../Arcs.js'

export default class PlanetGraph extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleMousemove = this.handleMousemove.bind(this);
        this.handleMouseout = this.handleMouseout.bind(this);
        this.state = {
            corners: {
                length: 50,
            },
            arcs: {
                radius: 150,
                number: 3,
                offset: 5,
                spinSpeed: this.getFastSpinSpeed()
            }
        }
        this.spinArcs = this.spinArcs.bind(this);
        this.spinArcsInterval = setInterval(this.spinArcs, 10);
    }

    render() {
        return (
            <G
                className='planetGraph'
                width={this.props.width}
                height={this.props.height}
                parentWidth={this.props.parentWidth}
                parentHeight={this.props.parentHeight}
                centered
            >
                {this.buildMouseArea()}
                {this.buildCorners()}
                {this.buildCircle()}
                {this.buildArcs()}
            </G>
        );
    };

    buildMouseArea() {
        return (
            <Background
                color='none'
                onClick={this.handleClick}
                onMousemove={this.handleMousemove}
                onMouseout={this.handleMouseout}

                width={this.props.width}
                height={this.props.height}
            />
        );
    }

    buildCorners() {
        return (
            <Corners
                length={this.state.corners.length}
                stroke='steelblue'
                strokeWidth={1}
                width={this.props.width}
                height={this.props.height}
            />
        );
    }

    buildCircle() {
        return (
            <Circle
                radius={100}
                stroke='steelblue'
                strokeWidth={2}
                fill='none'
                centerX={this.props.width}
                centerY={this.props.height}
            />
        );
    };

    buildArcs() {
        return (
            <Arcs
                offset={this.state.arcs.offset}
                radius={this.state.arcs.radius}
                number={this.state.arcs.number}
                percentCoverage={.75}
                stroke={'rgba(135, 112, 26, 1.0)'}
                centerX={this.props.width}
                centerY={this.props.height}
            />
        );
    }

    handleClick() {
        this.setState({
            arcs: update(this.state.arcs, {
                number: {
                    $set: this.state.arcs.number + 1
                }
            }
        )});
    }

    handleMousemove() {
        this.setState({
            arcs: update(this.state.arcs, {
                spinSpeed: {
                    $set: this.getSlowSpinSpeed()
                }
            }
        )});
    }

    handleMouseout() {
        this.setState({
            arcs: update(this.state.arcs, {
                spinSpeed: {
                    $set: this.getFastSpinSpeed()
                }
            }
        )});
    }

    getSlowSpinSpeed() {
        return Math.PI / 2 /  250;
    }

    getFastSpinSpeed() {
        return Math.PI / 2 /  100;
    }

    spinArcs() {
        this.setState({
            arcs: update(this.state.arcs, {
                offset: {
                    $set: this.state.arcs.offset + this.state.arcs.spinSpeed
                }
            })
        });
    }
}
