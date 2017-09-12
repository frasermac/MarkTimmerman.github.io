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
        const contents = this.getInitialContents();
        return {
            contents: contents,
            caretPosition: contents[contents.length - 1].html.length,
        };
    }

    getInitialContents() {
        return [
            {
                id: '1', 
                tag: 'p',
                html: 'One sentence.',
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
                {this.getContents()}
            </div>
        );
    }

    componentDidUpdate() {
        this.updateCaretPosition();
    }

    updateCaretPosition() {
        const selection = window.getSelection();
        const activeRecordElement = this.getActiveRecordElement();
        const range = document.createRange();
        const caretPosition = this.getEditorState().caretPosition;

        range.setStart(activeRecordElement.childNodes[0], caretPosition);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    getActiveRecordElement() {
        const activeRecordId = this.getActiveRecordId();
        const activeRecordElement = document.getElementById(`tag-${activeRecordId}`);
        return activeRecordElement;
    }

    getActiveRecordId() {
        const activeRecordIndex = this.getActiveRecordIndex();
        const activeRecordId = this.getEditorState().contents[activeRecordIndex].id;
        return activeRecordId;
    }

    getEditorState() {
        return this.state.editorState;
    }

    getActiveRecordIndex() {
        return 0;
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

    getContents() {
        const contents = this.getEditorState().contents.map((element, i) => this.buildElement(element, i));
        return contents;
    }

    buildElement(element, index) {
        const Tag = `${element.tag}`;
        const contents = this.buildContents(element);
        return (
            <Tag
                key={index}
                data-id={element.id}
                id={'tag-' + element.id}
            >
                {contents}
            </Tag>
        );
    }

    buildContents(element) {
        if (this.elementHasChildren(element)) {
            return this.buildContentsWithChildren(element);
        }
        return element.html;
    }

    elementHasChildren(element) {
        if (element.children && element.children.length > 0) {
            return true;
        }
        return false;
    }

    buildContentsWithChildren(element, index) {
        const contents = element.children.map((childElement, i) => this.buildElement(childElement, i));
        return contents;
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
        const activeRecordHtml = this.getActiveRecordHtml();
        const caretPosition = this.getCaretPosition();
        const newActiveRecordHtml = activeRecordHtml.substring(0, caretPosition - 1) + activeRecordHtml.slice(caretPosition);
        this.updateEditorState(newActiveRecordHtml, -1);
    }

    getCaretPosition() {
        const selection = window.getSelection();
        const caretPosition = selection.anchorOffset;
        return caretPosition;
    }

    getActiveRecordHtml() {
        const activeRecordIndex = this.getActiveRecordIndex();
        const activeRecordHtml = this.getEditorState().contents[activeRecordIndex].html;
        return activeRecordHtml;
    }

    updateEditorState(newActiveRecordHtml, caretOffset) {
        const activeRecordIndex = this.getActiveRecordIndex();
        const newContents = update(this.getEditorState().contents, {
            [activeRecordIndex]: {
                html: {$set: newActiveRecordHtml}
            }
        });
        const newCaretPosition = this.calculateNewCaretPosition(caretOffset);
        this.setState({
            editorState: {
                contents: newContents,
                caretPosition: this.getCaretPosition() + caretOffset,
            }
        });
    }

    calculateNewCaretPosition(caretOffset) {
        let caretPosition = this.getCaretPosition() + caretOffset;
        if (caretPosition < 0) {
            return 0;
        }
        return caretPosition;
    }
    
    processEnter() {
        console.log('Enter');
    }

    updateEditorStateWithCharacter(character) {
        const activeRecordHtml = this.getActiveRecordHtml();
        const caretPosition = this.getCaretPosition();
        const newActiveRecordHtml = activeRecordHtml.slice(0, caretPosition) + character + activeRecordHtml.slice(caretPosition);
        this.updateEditorState(newActiveRecordHtml, 1);
    }
}
