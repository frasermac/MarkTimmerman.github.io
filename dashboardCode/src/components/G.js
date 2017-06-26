import React from 'react';

export default class G extends React.Component {
    render() {
        return (
            <g
                className={this.props.className}
                width={this.props.width}
                height={this.props.height}
                transform={this.buildTransform()}

                style={{pointerEvents: 'all'}}
            >
                {this.props.children}
            </g>
        );
    }

    buildTransform() {
        if (this.props.centered) {
            return this.buildCenteredTranslate();
        }
        return '';
    }

    buildCenteredTranslate() {
        const x = (this.props.parentWidth / 2) - (this.props.width / 2);
        const y = (this.props.parentHeight / 2) - (this.props.height / 2);
        return 'translate(' + x + ', ' + y + ')';
    }
}

