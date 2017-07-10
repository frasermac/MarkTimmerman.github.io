import React from 'react';

export default class Path extends React.Component {
    render() {
        return (
            <path
                ref={node => this.node = node}
                className={this.props.className}

                d={this.props.d}
                stroke={this.props.stroke}
                strokeWidth={this.props.strokeWidth}
                fill={this.props.fill}

                transform={this.buildTransform()}
            >
            </path>
        );
    }

    componentDidMount() {
        if (this.props.shapePath) {
            this.props.shapePath(this.node);
        }
    }

    componentDidUpdate() {
        if (this.props.shapePath) {
            this.props.shapePath(this.node);
        }
    }

    buildTransform() {
        if (this.props.centerX || this.props.centerY) {
            return this.buildCenteredTranslate();
        }
        return '';
    }

    buildCenteredTranslate() {
        const x = this.calculateX();
        const y = this.calculateY();
        return 'translate(' + x + ', ' + y + ')';
    }

    calculateX() {
        if (this.props.centerX) {
            return this.props.centerX / 2;
        }
        return 0;
    }
    
    calculateY() {
        if (this.props.centerY) {
            return this.props.centerY / 2;
        }
        return 0;
    }
}
