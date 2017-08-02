import React from 'react';
import {View, Animated, PanResponder, Dimensions, LayoutAnimation, UIManager} from 'react-native';

const SW = Dimensions.get('window').width;
const ST = SW / 3;
const SOD = 334;

export default class Deck extends React.Component {
    static defaultProps = {
        onSwipeLeft: () => {
        },
        onSwipeRight: () => {
        }
    };

    constructor(props) {
        super(props);

        position = new Animated.ValueXY();
        const pr = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                position.setValue({x: gesture.dx, y: gesture.dy});
            },
            onPanResponderRelease: (event, gesture) => {
                if (gesture.dx > ST) {
                    this.swipeOut('right');
                    console.log('liked');
                }
                else if (gesture.dx < -ST) {
                    this.swipeOut('left');
                    console.log('disliked');
                }
                else {
                    this.resetPosition();
                }
            }
        });

        this.state = {pr, position, index: 0};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.setState({ index: 0 });
        }
    }

    componentWillUpdate() {
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.spring();
    }

    swipeOut(direction) {
        const x = direction === 'right' ? SW : -SW;

        Animated.timing(this.state.position, {
            toValue: {x, y: 0},
            duration: SOD
        }).start(() => this.onSwipeComplete(direction));
    }

    onSwipeComplete(direction) {
        const {onSwipeLeft, onSwipeRight, data} = this.props;
        const item = data[this.state.index];

        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);

        this.state.position.setValue({x: 0, y: 0});
        this.setState({index: this.state.index + 1});
    }

    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: {x: 0, y: 0}
        }).start();
    }

    applyAnim() {
        const {position} = this.state;
        const rotate = position.x.interpolate({
            inputRange: [-SW * 1.5, 0, SW * 1.5],
            outputRange: ['-120deg', '0deg', '120deg']
        });

        return {
            ...position.getLayout(),
            transform: [{rotate}]
        }
    }

    renderCards() {
        if (this.state.index >= this.props.data.length) return this.props.renderNoMoreCards();

        return this.props.data.map((item, i) => {
            if (i < this.state.index)
                return null;

            else if (i === this.state.index) {
                return (
                    <Animated.View
                        key={item.id}
                        style={[this.applyAnim(), styles.cardStyle]}
                        {...this.state.pr.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                );
            }

            else return (
                    <Animated.View key={item.id} style={[styles.cardStyle, {top: 10 * (i - this.state.index) }]}>
                        {this.props.renderCard(item)}
                    </Animated.View>
                );
        }).reverse();
    }

    render() {
        return (
            <View>
                {this.renderCards()}
            </View>
        )
    }
}

const styles = {
    cardStyle: {
        position: 'absolute',
        width: SW
    }
};