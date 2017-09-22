import React, { Component } from "react";
import PropTypes from "prop-types";
import Interactable from "react-native-interactable";
import { View, Dimensions } from "react-native";

const screen = Dimensions.get("window");

export default class ScreenPager extends Component {
  static propTypes: {
    initialScreen: PropTypes.number,
    orientation: PropTypes.string,
    bounce: PropTypes.number,
    damping: PropTypes.number,
    tension: PropTypes.number,
    onScreenChange: PropTypes.func,
    locked: PropTypes.bool
  };

  static defaultProps = {
    initialScreen: 0,
    orientation: "horizontal",
    bounce: 0,
    damping: 0.5,
    tension: 600,
    onScreenChange: () => {},
    locked: false
  };

  state = {
    currentScreenIndex: 0
  };

  constructor(props) {
    super(props);
    this.state.currentScreen = this.props.initialScreen;
  }

  moveToScreen = index => {
    this._interactable.snapTo({ index });
  };

  onSnap = event => {
    const { currentScreen } = this.state;
    const screenIndex = event.nativeEvent.index;

    if (currentScreen !== screenIndex) {
      this.setState({ currentScreen: screenIndex });
      this.props.onScreenChange(screenIndex);
    }
  };

  getScreenCount = () => {
    return React.Children.toArray(this.props.children).length;
  };

  getChildContainerStyle = index => {
    const { orientation } = this.props;
    return {
      position: "absolute",
      width: screen.width,
      height: screen.height,
      top: orientation === "horizontal" ? 0 : screen.height * index,
      left: orientation === "vertical" ? 0 : screen.width * index
    };
  };

  getContainerStyle = () => {
    const { orientation } = this.props;
    const screens = this.getScreenCount();
    return {
      width: screen.width * (orientation === "horizontal" ? screens : 1),
      height: screen.height * (orientation === "vertical" ? screens : 1)
    };
  };

  getCanvasContainerStyle = () => {
    const { orientation } = this.props;
    const screens = this.getScreenCount();
    return {
      width: screen.width * (orientation === "horizontal" ? screens : 1),
      height: screen.height * (orientation === "vertical" ? screens : 1)
    };
  };

  getSnapPoints = () => {
    const { damping, tension } = this.props;
    const screens = this.getScreenCount();
    const points = [];
    for (let i = 0; i < screens; i++) {
      points.push({ ...this.getPositionForIndex(i), damping, tension });
    }
    return points;
  };

  getPositionForIndex = index => {
    const { orientation } = this.props;
    if (orientation === "horizontal") {
      return { x: -index * screen.width, y: 0 };
    } else {
      return { x: 0, y: -index * screen.height };
    }
  };

  getBoundaries = () => {
    const { orientation, bounce } = this.props;
    const screens = this.getScreenCount();

    if (orientation === "horizontal") {
      return {
        left: -(screens - 1) * screen.width,
        right: 0,
        bounce
      };
    } else {
      return {
        top: -(screens - 1) * screen.height,
        bottom: 0,
        bounce
      };
    }
  };

  render() {
    const { currentScreen } = this.state;

    return (
      <View style={this.getContainerStyle()}>
        <Interactable.View
          ref={i => (this._interactable = i)}
          animatedNativeDriver
          snapPoints={this.getSnapPoints()}
          boundaries={this.getBoundaries()}
          onSnap={this.onSnap}
          initialPosition={this.getPositionForIndex(currentScreen)}
          horizontalOnly={this.props.orientation === "horizontal"}
          verticalOnly={this.props.orientation === "vertical"}
          dragEnabled={!this.props.locked}
        >
          <View style={this.getCanvasContainerStyle()}>
            {React.Children.toArray(this.props.children).map((child, index) => {
              return (
                <View
                  key={`swipe_child${index}`}
                  style={this.getChildContainerStyle(index)}
                >
                  {React.cloneElement(child, {
                    active: currentScreen === index
                  })}
                </View>
              );
            })}
          </View>
        </Interactable.View>
      </View>
    );
  }
}
