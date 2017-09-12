import React from 'react';
import update from 'immutability-helper';

export default class Organizer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: this.getInitialEditorState()
        };
        this.handleChange = this.handleChange.bind(this);
    }

    getInitialEditorState() {
        const records = this.getInitialRecords();
        return {
            records: records,
            caret: {
                recordIndex: records.length - 1,
                offset: records[records.length - 1].html.length,
            },
        };
    }

    getInitialRecords() {
        return [
            {
                id: '1', 
                tag: 'p',
                html: 'One sentence.',
            },
            {
                id: '2', 
                tag: 'p',
                html: 'Two sentences.',
            }
        ];
    }

    render() {
        return (
            <div
                className='Organizer'
                style={this.buildStyle()}
                contentEditable={true}
                ref={(htmlElement) => this.htmlElement = htmlElement}
                onKeyDown={this.handleChange}
            >
                {this.getRecords()}
            </div>
        );
    }

    componentDidUpdate() {
        this.updateCaretPosition();
    }

    updateCaretPosition() {
        const activeRecordElement = this.getActiveRecordElement();
        if (!activeRecordElement) {
            return;
        }

        const selection = this.getSelection();
        const range = document.createRange();
        const caretPosition = this.getEditorState().caret.offset;

        range.setStart(activeRecordElement.childNodes[0], caretPosition);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    getSelection() {
        return window.getSelection();
    }

    getActiveRecordElement() {
        const activeRecordId = this.getActiveRecordId();
        const activeRecordElement = document.getElementById(`tag-${activeRecordId}`);
        return activeRecordElement;
    }

    getActiveRecordId() {
        const selection = this.getSelection();
        const activeRecordId = selection.anchorNode.parentElement.dataset.id;
        return activeRecordId;
    }

    getEditorState() {
        return this.state.editorState;
    }

    buildStyle() {
        return {
            display: 'block',
            margin: '15px auto',
            width: this.getWidth() + 'px',
            whiteSpace: 'pre',
        };
    }

    getWidth() {
        if (window.innerWidth <= this.getDefaultPageWidth()) {
            return window.innerWidth;
        }
        return this.getDefaultPageWidth();
    }

    getDefaultPageWidth() {
        return 800;
    }

    getRecords() {
        const records = this.getEditorState().records.map((element, i) => this.buildElement(element, i));
        return records;
    }

    buildElement(element, index) {
        const Tag = `${element.tag}`;
        const records = this.buildRecords(element);
        return (
            <Tag
                key={index}
                data-id={element.id}
                id={'tag-' + element.id}
            >
                {records}
            </Tag>
        );
    }

    buildRecords(element) {
        if (this.elementHasChildren(element)) {
            return this.buildRecordsWithChildren(element);
        }
        return element.html;
    }

    elementHasChildren(element) {
        if (element.children && element.children.length > 0) {
            return true;
        }
        return false;
    }

    buildRecordsWithChildren(element, index) {
        const records = element.children.map((childElement, i) => this.buildElement(childElement, i));
        return records;
    }

    handleChange(event) {
        const key = event.key;
        this.processInput(key, event);
    }

    processInput(key, event) {
        if (!this.isKeyACharacter(key)) {
            this.processNonCharacterKey(key, event);
            return;
        }
        event.preventDefault();
        const character = key;
        this.updateEditorStateWithCharacter(character);
    }

    isKeyACharacter(key) {
        return key.length === 1;
    }

    processNonCharacterKey(key, event) {
        switch (key) {
            case 'Backspace':
                event.preventDefault();
                this.processBackspace();
                return;
            case 'Enter':
                event.preventDefault();
                this.processEnter();
                return;
            case 'ArrowLeft':
                return;
            case 'ArrowRight':
                return;
            case 'Shift':
                return;
            default:
                console.log(key);
                break;
        }
    }

    processBackspace() {
        const activeRecordIndex = this.getActiveRecordIndex();
        const activeRecordHtml = this.getActiveRecordHtml();
        const caretPosition = this.getCaretPosition();
        const newActiveRecordHtml = activeRecordHtml.substring(0, caretPosition - 1) + activeRecordHtml.slice(caretPosition);
        const newRecords = update(this.getEditorState().records, {
            [activeRecordIndex]: {
                html: {$set: newActiveRecordHtml}
            }
        });
        const newCaret = this.offsetCaretPosition(-1);
        this.updateEditorState(newRecords, newCaret);
    }

    offsetCaretPosition(offset) {
        const caret = this.getEditorState().caret;
        const newCaret = update(caret, {
            offset: {$set: this.getCaretPosition() + offset}
        });
        return newCaret;
    }

    getCaretPosition() {
        const selection = this.getSelection();
        const caretPosition = selection.anchorOffset;
        return caretPosition;
    }

    getActiveRecordHtml() {
        const activeRecordIndex = this.getActiveRecordIndex();
        const activeRecordHtml = this.getEditorState().records[activeRecordIndex].html;
        return activeRecordHtml;
    }

    getActiveRecordIndex() {
        const activeRecordId = this.getActiveRecordId();
        const recordsIds = this.getEditorState().records.map(record => record.id);
        const activeRecordIndex = recordsIds.findIndex(id => parseInt(id, 10) === parseInt(activeRecordId, 10));
        if (activeRecordIndex === -1) {
            throw new Error('Error: Active record cannot be located.');
        }
        return activeRecordIndex;
    }

    updateEditorState(newRecords, newCaret, callback) {
        this.setState({
            editorState: {
                records: newRecords,
                caret: newCaret,
            }
        }, callback);
    }

    processEnter() {
        const activeRecordIndex = this.getActiveRecordIndex();
        const activeRecordHtml = this.getActiveRecordHtml();
        const activeRecordTag = this.getActiveRecordTag();
        const selection = this.getSelection();
        const caretOffset = selection.anchorOffset;
        const maxId = this.getMaxId();
        const topRecord = this.buildRecord(maxId + 1, activeRecordTag, activeRecordHtml.slice(0, caretOffset));
        const bottomRecord = this.buildRecord(maxId + 2, activeRecordTag, activeRecordHtml.slice(caretOffset));
        const newRecords = update(this.getEditorState().records, {
            $splice: [[activeRecordIndex, 1, topRecord, bottomRecord]]
        });
        this.updateEditorState(
            newRecords, 
            {
                recordIndex: activeRecordIndex + 1,
                offset: 0,
            },
            () => this.updateSelection(activeRecordIndex + 1, 0),
        );
    }

    updateSelection(recordIndex, offset) {
        const selection = this.getSelection();
        const range = document.createRange();
        const recordId = this.getEditorState().records[recordIndex].id;
        const recordElement = document.getElementById(`tag-${recordId}`);

        range.setStart(recordElement.childNodes[0], offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    getActiveRecordTag() {
        const activeRecordIndex = this.getActiveRecordIndex();
        const activeRecordTag = this.getEditorState().records[activeRecordIndex].tag;
        return activeRecordTag;
    }

    getMaxId() {
        const recordIds = this.getEditorState().records.map(record => record.id);
        const maxId = Math.max.apply(null, recordIds);
        return maxId;
    }

    buildRecord(id, tag, html) {
        return {
            id: id,
            tag: tag,
            html: html,
        };
    }

    updateEditorStateWithCharacter(character) {
        const activeRecordIndex = this.getActiveRecordIndex();
        const activeRecordHtml = this.getActiveRecordHtml();
        const caretPosition = this.getCaretPosition();
        const newActiveRecordHtml = activeRecordHtml.slice(0, caretPosition) + character + activeRecordHtml.slice(caretPosition);
        const newRecords = update(this.getEditorState().records, {
            [activeRecordIndex]: {
                html: {$set: newActiveRecordHtml}
            }
        });
        const newCaret = this.offsetCaretPosition(1);
        this.updateEditorState(newRecords, newCaret);
    }
}
