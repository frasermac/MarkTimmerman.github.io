import React from 'react';

import { scaleLinear } from 'd3-scale';

import G from '../components/G.js';
import Rectangle from '../components/Rectangle.js';

export default class Performance extends React.Component {
    render() {
        return (
            <G
                className='performance'
                width={this.getLesserOfWidthOrHeight()}
                height={this.getLesserOfWidthOrHeight()}
                x={this.getX()}
                y={this.props.y}
            >
                {this.buildGrid()}
            </G>
        );
    }

    getLesserOfWidthOrHeight() {
        if (this.props.width < this.props.height) {
            return this.props.width;
        }
        return this.props.height;
    }

    getX() {
        return (this.props.width - this.getLesserOfWidthOrHeight()) / 2;
    }

    buildGrid() {
        return this.props.answerTimes.map(
            (answerTime, i) => this.buildCell(answerTime, i)
        );
    }

    buildCell(answerTime, index) {
        return (
            <Rectangle
                key={index}
                width={this.getCellWidth()}
                height={this.getCellHeight()}
                x={this.getCellX(index)}
                y={this.getCellY(index)}
                fill={this.getCellFill(answerTime)}
            />
        );
    }

    getCellWidth() {
        return this.getLesserOfWidthOrHeight() / 7;
    }

    getCellHeight() {
        return this.getLesserOfWidthOrHeight() / 7;
    }

    getCellX(index) {
        const column = this.getCellColumn(index);
        return this.getCellWidth() * column;
    }

    getCellColumn(index) {
        return index % 7;
    }

    getCellY(index) {
        const row = this.getCellRow(index);
        return this.getCellHeight() * row;
    }

    getCellRow(index) {
        return Math.floor(index / 7);
    }

    getCellFill(answerTime) {
        return this.calculateColor(answerTime);
    }

    calculateColor(answerTime) {
        if (answerTime.average === null) {
            return null;
        }
        const scale = scaleLinear()
            .domain(this.buildDomain())
            .range(['green', 'red']);
        if (answerTime.average > scale.domain()[1]) {
            return scale(scale.domain()[1]);
        }
        return scale(answerTime.average);
    }

    buildDomain() {
        if (this.scaleUsingFastestAndSlowest) {
            return [this.getFastestAnswerTime(), this.getSlowestAnswerTime()];
        }
        return [0, 2000];
    }

    getFastestAnswerTime() {
        const recordedAnswerTimeValues = this.getRecordedAnswerTimes().map(answerTime => answerTime.average);
        return Math.min.apply(null, recordedAnswerTimeValues);
    }

    getRecordedAnswerTimes() {
        return this.props.answerTimes.filter(answerTime => answerTime.average !== null);
    }

    getSlowestAnswerTime() {
        const recordedAnswerTimeValues = this.getRecordedAnswerTimes().map(answerTime => answerTime.average);
        return Math.max.apply(null, recordedAnswerTimeValues);
    }
}
