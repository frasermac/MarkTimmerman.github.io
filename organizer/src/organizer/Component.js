import React from 'react';

export default class Component extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    getContents() {
        const contents = this.state.contents.map((element, i) => this.buildElement(element, i));
        return contents;
    }

    buildElement(element, index) {
        const Tag = `${element.tag}`;
        const style = this.buildStyle();
        const contents = this.buildContents(element);
        return (
            <Tag
                key={index}
                contentEditable={true}
                ref={(element) => this.htmlElement = element}
                onInput={this.handleChange}
                onBlur={this.handleChange}
                style={style}
            >
                {contents}
            </Tag>
        );
    }

    buildStyle() {
        return {
            minHeight: '0px',
        };
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

    handleChange(e) {
        console.log(e);
    }

    shouldComponentUpdate(nextProps) {
        if (!this.htmlElement) {
            return false;
        }
        return true;
    }

    componentDidUpdate() {
    }
}

