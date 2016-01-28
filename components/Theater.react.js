import React from 'react';
import Activity from './Activity.react';
import MediaPlayer from './MediaPlayer.react';
import Chat from './Chat.react';
import Header from './Header.react';
import Info from './Info.react';
import { isEmpty } from 'lodash';

class Theater extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'Theater';
        this.state = {
            stack: {},
            mediaItems: [],
            selectedMediaItem: {}
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        $.ajax('/api/stacks?id=' + this.props.id).done(res => {
            this.setState({
                stack: res
            });
            $.ajax('/api/stacks/' + this.state.stack.uuid + '/mediaitems').done(res => {
                this.setState({
                    mediaItems: res.objects,
                    selectedMediaItem: res.objects[0]
                });
            });
        });

        $(document.body).on('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        $(document.body).off('keydown', this.handleKeyDown);
    }

    handleClick(mediaItem) {
        this.setState({ selectedMediaItem: mediaItem });
    }

    handleKeyDown(e) {
        if (!isEmpty(this.state.selectedMediaItem) && e.keyCode === 37 || e.keyCode === 39) {

            var selectedIndex = this.state.mediaItems.indexOf(this.state.selectedMediaItem);
            if (e.keyCode === 37 && selectedIndex > 0) { // left arrow
                selectedIndex -= 1;
            } else if (e.keyCode === 39 && selectedIndex < this.state.mediaItems.length-1) { // right arrow
                selectedIndex += 1;
            }
            this.setState({ selectedMediaItem: this.state.mediaItems[selectedIndex] });
        }
    }

    render() {
        return (
        <section>
            <Header/>
            <div id="theater">
                <section id="theater-main">
                    <Activity mediaItems={this.state.mediaItems} selectedItem={this.state.selectedMediaItem} handleClick={this.handleClick}/>
                    <MediaPlayer item={this.state.selectedMediaItem} />
                    <div className="clear"></div>
                    <Info stack={this.state.stack} />
                </section>
                <Chat stack={this.state.stack} />
            </div>
        </section>
        );
    }
}

export default Theater;
