import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

const CARD_WIDTH = 300;
const CARD_GAP = 10;
const CARD_NUM = 3;
const CAROUSEL_WIDTH = CARD_NUM * CARD_WIDTH + (CARD_NUM - 1) * CARD_GAP;

// TODO: refactor base X
const FIRST_X = 0;
const SECOND_X = CAROUSEL_WIDTH / 2 - CARD_WIDTH / 2;
const THIRD_X = CAROUSEL_WIDTH - CARD_WIDTH;

// const CARD_BASE_X = Array.from({ length: CARD_NUM }, (v, k) => {
//   const gap = k !== 0 ? CARD_GAP : 0;
//   return k * CARD_WIDTH + gap;
// });

export default function App() {
  const [isTouching, setIsTouching] = useState(false);
  const [touchBeginX, setTouchBeginX] = useState(0);
  const [touchX, setTouchX] = useState(0);
  const [page, setPage] = useState(0);
  const touchOffset = useMemo(
    () => touchX - touchBeginX,
    [touchX, touchBeginX]
  );
  const pageOffset = useMemo(() => page * CARD_WIDTH, [page, CARD_WIDTH]);
  const offsetXAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = isTouching ? 0 : 150;
    Animated.timing(offsetXAnim, {
      easing: Easing.linear,
      toValue: touchOffset - pageOffset,
      duration,
      useNativeDriver: false,
    }).start();
  }, [page, touchOffset, isTouching]);

  function onResponderGrant(e) {
    console.log("onResponderGrant");
    setIsTouching(true);
    setTouchBeginX(e.nativeEvent.pageX);
    setTouchX(e.nativeEvent.pageX);
  }

  function onResponderMove(e) {
    console.log("onResponderMove");
    setTouchX(e.nativeEvent.pageX);
  }

  function onResponderEnd(e) {
    console.log("onResponderEnd");
    setIsTouching(false);
    setTouchBeginX(0);
    setTouchX(0);
    if (touchOffset > 80 && page > -1) {
      setPage(page - 1);
    } else if (touchOffset < -80 && page < 1) {
      setPage(page + 1);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.carousel]}>
        <Animated.View
          style={[
            styles.page,
            {
              borderColor: "black",
              left: Animated.add(offsetXAnim, FIRST_X),
            },
          ]}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={onResponderGrant}
          onResponderMove={onResponderMove}
          onResponderEnd={onResponderEnd}
        >
          <Text style={styles.text}>Page 1</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.page,
            {
              borderColor: "black",
              left: Animated.add(offsetXAnim, SECOND_X),
            },
          ]}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={onResponderGrant}
          onResponderMove={onResponderMove}
          onResponderEnd={onResponderEnd}
        >
          <Text style={styles.text}>Page 2</Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.page,
            {
              borderColor: "black",
              left: Animated.add(offsetXAnim, THIRD_X),
            },
          ]}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={onResponderGrant}
          onResponderMove={onResponderMove}
          onResponderEnd={onResponderEnd}
        >
          <Text style={styles.text}>Page 3</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  carousel: {
    position: "relative",
    width: 930,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: CARD_GAP,
  },
  page: {
    position: "absolute",
    padding: 6,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 6,
    borderWidth: 2,
    width: CARD_WIDTH,
    height: "80%",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
