import React from 'react';

import G from '../components/G.js';
import Background from '../components/Background.js';
import Button from '../components/Button.js';

export default class NoteChoices extends React.Component {
    constructor(props) {
        super(props);
        this.handleChooseNote = this.handleChooseNote.bind(this);
    }

    render() {
        return (
            <G
                className='noteChoices'
                width={this.props.width}
                height={this.props.height}
                x={this.props.x}
                y={this.props.y}
            >
                {this.buildNoteChoices()}
            </G>
        );
    }

    buildBackground() {
        return (
            <Background
                fill='green'
                width={this.props.width}
                height={this.props.height}
            />
        );
    }

    buildNoteChoices() {
        return this.getNotes().map((note, i) => this.buildNoteChoice(note, i));
    }

    getNotes() {
        return this.props.notes;
    }

    buildNoteChoice(note, index) {
        return (
            <Button
                key={note}
                fill='rgba(255, 255, 255, 0.00)'
                choice={note}
                width={this.getNoteWidth()}
                height={this.getNoteHeight()}
                x={this.getNoteChoiceX(index)}
                y={this.getNoteChoiceY()}
                textStyle={{fontSize: '25px'}}
                centerText
                onClick={() => this.handleChooseNote(note)}
            />
        );
    }

    getNoteWidth() {
        return this.props.width * 0.8 / this.getNotes().length;
    }

    getNoteHeight() {
        return this.props.height * 0.5;
    }

    getNoteChoiceX(index) {
        const dX = (this.props.width - this.getNoteWidth() * this.getNotes().length) / 2;
        return dX + this.getNoteWidth() * index;
    }

    getNoteChoiceY() {
        return (this.props.height - this.getNoteHeight()) / 2;
    }

    handleChooseNote(note) {
        return this.props.onChooseNote(note);
    }
}

