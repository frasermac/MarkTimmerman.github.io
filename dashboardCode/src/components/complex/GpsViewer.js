import React from 'react';

import update from 'immutability-helper';

import G from '../G.js'

import Background from '../Background.js'

import GpsTracks from './GpsTracks.js'

export default class GpsViewer extends React.Component {
    constructor(props) {
        super(props);
        this.handleScroll = this.handleScroll.bind(this);
        this.state = {
            gpsTracks: null,
            index: 0,
            percentage: null,
        }
    }

    componentWillMount() {
        if (!this.hasGpsTracks()) {
            this.getGpsTracksFromFile();
        }
    }

    hasGpsTracks() {
        if (!this.state.gpsTracks) {
            return false;
        }
        return true;
    }

    getGpsTracksFromFile() {
        this.setState({
            gpsTracks: require('../../dunetour.js')
        });
    }

    componentDidMount() {
        if (this.state.incrementAutomatically) {
            this.timerId = setInterval(
                () => this.incrementProgress(),
                10
            );
            return;
        }
        window.addEventListener('scroll', this.handleScroll);
    }

    incrementProgress() {
        let index = this.getIndex() + 1;
        if (index >= this.state.gpsTracks.length) {
            index = 0;
        }
        this.setState({
            index: index,
        });
    }

    getIndex() {
        if (!this.state.index) {
            return 0;
        }
        return this.state.index;
    }

    componentWillUnmount() {
        clearInterval(this.timerId);
    }

    handleScroll() {
        const scrollDistance = this.getScrollDistance();
        const maxScroll = this.getMaxScroll();
        this.setState({
            percentage: scrollDistance / maxScroll,
        });
    }

    getMaxScroll() {
        const body = document.body;
        const html = document.documentElement;
        const documentHeight = Math.max(
            body.scrollHeight, body.offsetHeight, html.clientHeight,
            html.scrollHeight, html.offsetHeight
        );

        return documentHeight - window.innerHeight;
    }

    getScrollDistance() {
        return document.body.scrollTop;
    }

    render() {
        return (
            <G
                className='gpsViewer'
                width={this.props.width}
                height={this.props.height}
                parentWidth={this.props.parentWidth}
                parentHeight={this.props.parentHeight}
                centered
            >
                {this.buildMouseArea()}
                <GpsTracks
                    data={this.buildGpsData()}
                    width={this.props.width}
                    height={this.props.height}
                    index={this.getIndex()}
                    percentage={this.state.percentage}
                />
            </G>
        );
    };

    buildMouseArea() {
        return (
            <Background
                fill='white'

                width={this.props.width}
                height={this.props.height}
            />
        );
    }

    buildGpsData() {
        const headers = this.state.gpsTracks.header.split(',');
        return this.state.gpsTracks.data.split('|').map(point => this.buildTrack(point.split(','), headers));
    }

    buildTrack(track, header) {
        let obj = {};
        track.forEach((value, i) =>
            obj[header[i]] = value
        );
        return obj;
    }
}

