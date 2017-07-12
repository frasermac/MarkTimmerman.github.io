import React from 'react';

import update from 'immutability-helper';

import G from '../components/G.js';
import Question from './Question.js';
import NoteChoices from './NoteChoices.js';
import Performance from './Performance.js';

export default class NoteDifferenceTrainer extends React.Component {
    constructor(props) {
        super(props);

        this.handleChooseNote = this.handleChooseNote.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.maxAnswerTimeToLogInMilliseconds = 5000;

        this.placement = {
            question: {
                height: 0.4,
                width: 1.0,
            },
            answers: {
                height: 0.2,
                width: 1.0,
                y: 0.4,
            },
            performance: {
                height: 0.4,
                width: 1.0,
                y: 0.6,
            },
        };

        this.state = {
            note: this.getRandomNote(),
            difference: this.getWeightedRandomDifference(),
            answerTimes: this.getAnswerTimes(),
            questionProposalTimeInMilliseconds: this.getNowInMilliseconds(),
            answersToConsider: 1,
        }
    }

    randomizeQuestionState() {
        this.setState({
            note: this.getRandomNote(),
            difference: this.getWeightedRandomDifference(),
        });
    }

    getRandomNote() {
        const noteIndex = this.random(this.getNotes().length - 1);
        return this.getNotes()[noteIndex];
    }

    random(max) {
        return Math.floor(Math.random() * max);
    }

    getWeightedRandomDifference() {
        const weightedDifferenceLookupArray = this.buildWeightedDifferenceLookupArray();
        const randomIndex = this.random(weightedDifferenceLookupArray.length);
        return weightedDifferenceLookupArray[randomIndex];
    }

    buildWeightedDifferenceLookupArray() {
        const differenceDifficulties = this.buildDifferenceDifficulties();
        return differenceDifficulties.reduce(
            (lookupArray, differenceDifficulty) => 
                lookupArray.concat(Array(differenceDifficulty.difficulty).fill(differenceDifficulty.difference)),
            []
        );
    }

    buildDifferenceDifficulties() {
        return [
            {difference: 1, difficulty: 1},
            {difference: 2, difficulty: 2},
            {difference: 3, difficulty: 3},
            {difference: 4, difficulty: 4},
            {difference: 5, difficulty: 4},
            {difference: 6, difficulty: 3},
            {difference: 7, difficulty: 2},
        ];
    }

    getAnswerTimes() {
        if (this.getAnswerTimesFromLocalStorage()) {
            return this.getAnswerTimesFromLocalStorage();
        }
        return this.buildInitialAnswerTimes();
    }

    getAnswerTimesFromLocalStorage() {
        const answerTimes = localStorage.getItem('answerTimes');
        if (!answerTimes) {
            return null;
        }
        return JSON.parse(answerTimes);
    }

    buildInitialAnswerTimes() {
        return this.getNotes().map(note => Array(7).fill(0).map(_ => []));
    }

    getNowInMilliseconds() {
        return new Date().getTime();
    }

    componentWillMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(event) {
        const key = event.key.toUpperCase();
        if (!isNaN(key)) {
            const answersToConsider = parseInt(key);
            this.setState({
                answersToConsider: answersToConsider
            });
            console.log(answersToConsider);
        }
        this.handleChooseNote(key);
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
                {this.buildPerformanceElement()}
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
            this.logTimeToAnswer();
            this.chooseOneOfWorstAnswerTimes();
            this.updateQuestionProposalTime();
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

    logTimeToAnswer() {
        const millisecondsToAnswer = this.calculateMillisecondsToAnswer();
        if (millisecondsToAnswer > this.maxAnswerTimeToLogInMilliseconds) {
            return;
        }
        const noteIndex = this.getNoteIndex(this.state.note);
        const differenceIndex = this.state.difference - 1;
        const answerTimes = update(this.state.answerTimes, {
            [noteIndex]: {
                [differenceIndex]: {
                    $push: [millisecondsToAnswer]
                }
            }
        });
        this.setState({
            answerTimes: answerTimes,
        });
        this.saveAnswerTimesToLocalStorage(answerTimes);
    }

    saveAnswerTimesToLocalStorage(answerTimes) {
        localStorage.setItem('answerTimes', JSON.stringify(answerTimes));
    }

    calculateMillisecondsToAnswer() {
        const currentMilliseconds = this.getNowInMilliseconds();
        return currentMilliseconds - this.state.questionProposalTimeInMilliseconds;
    }

    chooseOneOfWorstAnswerTimes() {
        const worstAnswerTimes = this.buildArrayOfWorstAnswerTimes();
        const randomIndex = this.random(worstAnswerTimes.length);
        this.setState({
            note: worstAnswerTimes[randomIndex].note,
            difference: worstAnswerTimes[randomIndex].difference,
        });
    }

    buildArrayOfWorstAnswerTimes() {
        const answerTimesArray = this.buildArrayOfAverageAnswerTimes();
        const unrecordedTimes = answerTimesArray.filter(answerTime => answerTime.average === null);
        if (unrecordedTimes.length > 0) {
            return unrecordedTimes;
        }
        const overallAverageTime = this.calculateOverallAverageAnswerTime();
        const longerThanAverageTimes = answerTimesArray.filter(answerTime => answerTime.average >= overallAverageTime);
        return longerThanAverageTimes;
    }

    buildArrayOfAverageAnswerTimes() {
        return this.state.answerTimes.reduce(
            (averageAnswerTimesArray, answerTimesForNote, i) =>
                averageAnswerTimesArray.concat(this.buildArrayOfAverageAnswerTimesForNote(answerTimesForNote, i)),
            []
        );
    }

    buildArrayOfAverageAnswerTimesForNote(answerTimesForNote, noteIndex) {
        const note = this.getNotes()[noteIndex];
        return answerTimesForNote.map(
            (answerTimes, i) => ({
                note: note,
                difference: i + 1,
                average: this.calculateAverageAnswerTimeForNoteAndDifference(answerTimes),
            })
        );
    }

    calculateAverageAnswerTimeForNoteAndDifference(answerTimes) {
        return this.average(answerTimes.slice(-1 * this.state.answersToConsider));
    }

    average(numberArray) {
        if (numberArray.length === 0) {
            return null;
        }
        return numberArray.reduce((total, num) => total + num, 0) / numberArray.length;
    }

    calculateOverallAverageAnswerTime() {
        const answerTimesArray = this.buildArrayOfAverageAnswerTimes();
        const recordedAnswers = answerTimesArray.filter(answerTime => answerTime.average !== null);
        const recordedAnswerAverageTimes = recordedAnswers.map(answer => answer.average);
        return this.average(recordedAnswerAverageTimes);
    }

    updateQuestionProposalTime() {
        this.setState({
            questionProposalTimeInMilliseconds: this.getNowInMilliseconds(),
        });
    }

    buildPerformanceElement() {
        return (
            <Performance
                width={this.getPerformanceElementWidth()}
                height={this.getPerformanceElementHeight()}
                y={this.getPerformanceElementY()}
                answerTimes={this.buildArrayOfAverageAnswerTimes()}
            />
        );
    }

    getPerformanceElementWidth() {
        return this.props.width * this.placement.performance.width;
    }

    getPerformanceElementHeight() {
        return this.props.height * this.placement.performance.height;
    }

    getPerformanceElementY() {
        return this.props.height * this.placement.performance.y;
    }
}
