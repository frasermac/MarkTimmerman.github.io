import React from 'react';

import G from '../components/G.js';
import Circle from '../components/Circle.js';
import Line from '../components/Line.js';

export default class Notes extends React.Component {
    render() {
        return (
            <G
                className='notes'
                width={this.props.width}
                height={this.props.height}
            >
                {this.buildStaff()}
                {this.buildNotes()}
            </G>
        );
    }

    buildStaff() {
        return (
            <G
                className='staff'
                width={this.props.width}
                height={this.props.height}
            >
                {this.buildStaffLines()}
            </G>
        );
    }

    buildStaffLines() {
        const lines = [];
        for (let i = 0; i < 5; i++) {
            lines.push(this.buildStaffLine(i));
        }
        return lines;
    }

    buildStaffLine(index) {
        const x1 = 0;
        const x2 = this.props.width;
        const y1 = this.calculateYForStaffLine(index);
        const y2 = this.calculateYForStaffLine(index);
        return (
            <Line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke='white'
                strokeWidth={this.getStrokeWidth()}
            />
        );
    }

    calculateYForStaffLine(index) {
        return this.props.height / 4 * index;
    }
    
    getStrokeWidth() {
        return 2;
    }

    buildNotes() {
        return (
            <G
                className='notes'
                width={this.getNoteWidth()}
                height={this.getNoteHeight()}
            >
                {this.getNotes().map((note, i) => this.buildNote(note, i))}, 
            </G>
        );
    }

    getNoteWidth() {
        return this.getNoteHeight();
    }

    getNoteHeight() {
        return (this.props.height - this.getStrokeWidth() * 5) / 4;
    }
    
    getNotes() {
        if (this.props.notes) {
            return this.props.notes;
        }
        return this.buildScale();
    }

    buildScale() {
        return Array(7).fill(0).map((_, i) => this.buildScaleNoteData(i));
    }

    buildScaleNoteData(index) {
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const startingIndex = notes.indexOf(this.props.scale);
        const noteIndex = (startingIndex + index) % notes.length;
        const note = notes[noteIndex];
        const octave = (noteIndex < startingIndex ? 1 : 0);
        return {
            note: note,
            octave: octave,
        }
    }

    buildNote(note, index) {
        return (
            <Circle
                key={note + index}
                radius={this.getNoteWidth() / 2}
                x={this.getNoteX(index)}
                y={this.getNoteY(note)}
                fill='steelblue'
            />
        );
    }

    getNoteX(index) {
        const noteWidth = this.getNoteWidth();
        const noteGap = this.getNoteGap();
        return noteWidth / 2 + (noteWidth + noteGap) * index;
    }

    getNoteGap() {
        return this.getNoteWidth() / 2;
    }

    getNoteY(note) {
        const noteSlotHeight = this.getNoteHeight() + this.getStrokeWidth();
        const notePlacement = this.getNotePlacement(note);
        return noteSlotHeight / 2 * notePlacement;
    }

    getNotePlacement(noteData) {
        const note = this.getNote(noteData);
        const octave = this.getNoteOctave(noteData);
        const noteTransforms = {
            'B': 6,
            'A': 5,
            'G': 4,
            'F': 3,
            'E': 2,
            'D': 1,
            'C': 0,
        };
        const notePlacement = -1 * noteTransforms[note] + -7 * octave;
        return 10 + notePlacement;
    }

    getNote(noteData) {
        if (!noteData.note) {
            return noteData;
        }
        return noteData.note;
    }

    getNoteOctave(noteData) {
        if (!noteData.octave) {
            return 0;
        }
        return noteData.octave;
    }
}
