import React from 'react';
import update from 'immutability-helper';

import './Organizer.css';

export default class Organizer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: this.getInitialEditorState()
        };
        this.handleChange = this.handleChange.bind(this);
    }

    getInitialEditorState() {
        if (!this.getStoredState()) {
            return this.getDefaultEditorState();
        }
        return this.getStoredState();
    }

    getDefaultEditorState() {
        return {
            records: this.getInitialRecords(),
            caret: this.getInitialCaret(),
        }
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

    getInitialCaret() {
        return {
            caret: {
                recordIndex: 0,
                offset: 0,
            },
        };
    }

    render() {
        return (
            <div
                className='Organizer'
                style={this.buildStyle()}
                ref={(element) => {if (element !== null) { element.contentEditable=true; }}}
                onKeyDown={this.handleChange}
            >
                {this.getRecords()}
            </div>
        );
    }

    componentDidUpdate() {
        this.updateCaretPosition();
        this.storeState();
    }

    updateCaretPosition() {
        const activeRecordElement = this.getActiveRecordElement();
        if (!activeRecordElement) {
            return;
        }

        const selection = this.getSelection();
        const range = document.createRange();
        const caretPosition = this.getEditorState().caret.offset;
        let node = activeRecordElement;

        if (node.childNodes.length !== 0) {
            node = node.childNodes[0];
        }

        range.setStart(node, caretPosition);
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
        let anchorNode = selection.anchorNode;
        if (!anchorNode.dataset || anchorNode.dataset.type !== 'tag') {
            anchorNode = anchorNode.parentElement;
        }
        const activeRecordId = anchorNode.dataset.id;
        return activeRecordId;
    }

    getEditorState() {
        return this.state.editorState;
    }

    storeState() {
        localStorage.setItem('organizer', JSON.stringify(this.getEditorState()));
    }

    getStoredState() {
        const stateString = localStorage.getItem('organizer');
        if (!stateString || stateString === '') {
            return null;
        }
        try {
            return JSON.parse(stateString);
        } catch(err) {
            return null;
        }
    }

    buildStyle() {
        return {
            display: 'block',
            margin: '15px auto',
            width: this.getWidth() + 'px',
            whiteSpace: 'pre-wrap',
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
                data-type='tag'
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
            case 'ArrowDown':
                return;
            case 'ArrowUp':
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
        if (activeRecordIndex === 0 && caretPosition === 0) {
            return;
        }
        if (activeRecordIndex > 0 && activeRecordHtml.length === 0) {
            this.removeActiveRecord();
            return;
        }
        if (caretPosition === 0 && activeRecordHtml.length > 0) {
            this.mergeRecordAtIndexWithPreceding(activeRecordIndex);
            return;
        }
        const newActiveRecordHtml = activeRecordHtml.substring(0, caretPosition - 1) + activeRecordHtml.slice(caretPosition);
        const newRecords = update(this.getEditorState().records, {
            [activeRecordIndex]: {
                html: {$set: newActiveRecordHtml},
            }
        });
        const newCaret = this.offsetCaretPosition(-1);
        this.updateEditorState(newRecords, newCaret);
    }

    removeActiveRecord() {
        const activeRecordIndex = this.getActiveRecordIndex();
        const newRecords = update(this.getEditorState().records, {
            $splice: [[activeRecordIndex, 1]]
        });
        const newCaret = this.moveCaretToEndOfRecordAtIndex(activeRecordIndex - 1);
        this.updateEditorState(newRecords, newCaret);
    }

    moveCaretToEndOfRecordAtIndex(index) {
        const record = this.getEditorState().records[index];
        this.updateSelection(index, record.html.length);
        return {
            offset: record.html.length,
            recordIndex: index,
        };
    }

    mergeRecordAtIndexWithPreceding(index) {
        if (index === 0) {
            throw new Error('Attempting to merge 0th indexed record.');
        }
        const precedingRecord = this.getEditorState().records[index - 1];
        const recordToMerge = this.getEditorState().records[index];
        const maxId = this.getMaxId();
        const newRecord = this.buildRecord(
            maxId + 1,
            precedingRecord.tag,
            precedingRecord.html + recordToMerge.html
        );
        const newRecords = update(this.getEditorState().records, {
            $splice: [[index - 1, 2, newRecord]]
        });
        this.updateEditorState(
            newRecords, 
            {
                recordIndex: index - 1,
                offset: precedingRecord.html.length,
            },
            () => this.updateSelection(index - 1, precedingRecord.html.length),
        );
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
        let node = recordElement;

        if (node.childNodes.length !== 0) {
            node = node.childNodes[0];
        }

        range.setStart(node, offset);
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
