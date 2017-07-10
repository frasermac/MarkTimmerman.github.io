import React from 'react';

import G from '../components/G.js';
import Question from './Question.js';
import NoteChoices from './NoteChoices.js';

export default class NoteDifferenceTrainer extends React.Component {
    constructor(props) {
        super(props);

        this.handleChooseNote = this.handleChooseNote.bind(this);

        this.placement = {
            question: {
                height: 0.5,
                width: 1.0,
            },
            answers: {
                height: 0.5,
                width: 1.0,
                y: 0.5,
            }
        };

        this.state = {
            note: this.getRandomNote(),
            difference: this.getRandomDifference(),
        }
    }

    randomizeQuestionState() {
        this.setState({
            note: this.getRandomNote(),
            difference: this.getRandomDifference(),
        });
    }

    getRandomNote() {
        const noteIndex = this.random(this.getNotes().length - 1);
        return this.getNotes()[noteIndex];
    }

    random(max) {
        return Math.floor(Math.random() * max);
    }

    getRandomDifference() {
        return this.random(7) + 1;
    }

    render() {
        return (
            <G
                className='noteDifferenceTrainer'
                width={this.props.width}
                height={this.props.height}
                parentWidth={this.props.parentWidth}
                parentHeight={this.props.parentHeight}
                centered
            >
                {this.buildQuestionElement()}
                {this.buildNoteChoicesElement()}
            </G>
        );
    }

    buildQuestionElement() {
        return (
            <Question
                width={this.getQuestionElementWidth()}
                height={this.getQuestionElementHeight()}
                parentWidth={this.props.width}
                parentHeight={this.props.height}

                note={this.state.note}
                difference={this.state.difference}
            />
        );
    }

    getQuestionElementWidth() {
        return this.props.width * this.placement.question.width;
    }

    getQuestionElementHeight() {
        return this.props.height * this.placement.question.height;
    }

    buildNoteChoicesElement() {
        return (
            <NoteChoices
                width={this.getNoteChoicesElementWidth()}
                height={this.getNoteChoicesElementHeight()}
                y={this.getNoteChoicesElementY()}
                notes={this.getNotes()}
                onChooseNote={this.handleChooseNote}
            />
        );
    }

    getNotes() {
        return [
            'C', 'D', 'E', 'F', 'G', 'A', 'B',
        ];
    }

    getNoteChoicesElementWidth() {
        return this.props.width * this.placement.answers.width;
    }

    getNoteChoicesElementHeight() {
        return this.props.height * this.placement.answers.height;
    }
    getNoteChoicesElementY() {
        return this.props.height * this.placement.answers.y;
    }

    handleChooseNote(chosenNote) {
        if (this.chosenNoteIsCorrect(chosenNote)) {
            this.randomizeQuestionState();
        }
    }

    chosenNoteIsCorrect(chosenNote) {
        return chosenNote === this.getCorrectNote();
    }

    getCorrectNote() {
        return this.getNotes()[this.getCorrectNoteIndex()];
    }

    getCorrectNoteIndex() {
        const indexOfNote = this.getNoteIndex(this.state.note);
        return (indexOfNote + this.state.difference - 1) % this.getNotes().length
    }

    getNoteIndex(note) {
        return this.getNotes().indexOf(note);
    }
}
