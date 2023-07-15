import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

const DEFAULT_PAGE_INDEX = 0;
const CARD_NUM = 5;

const CARD_WIDTH = 300;
const CARD_GAP = 10;

const CARD_FIRST_INDEX = 0;
const CARD_LAST_INDEX = CARD_NUM - 1;

const CAROUSEL_WIDTH = CARD_NUM * CARD_WIDTH + CARD_LAST_INDEX * CARD_GAP;

const ANIMATION_DURATION = 150;
const TOUCH_EFFECT_LENGTH = 80;

export default function App() {
  const [isTouching, setIsTouching] = useState(false);
  const [touchBeginX, setTouchBeginX] = useState(0);
  const [touchX, setTouchX] = useState(0);
  const [page, setPage] = useState(0);
  const prePage = useRef(0);
  const touchOffset = useMemo(
    () => touchX - touchBeginX,
    [touchX, touchBeginX]
  );
  const offsetXAnim = useRef(new Animated.Value(0)).current;

  const CARD_LIST = useRef(
    Array.from({ length: CARD_NUM }, (_, k) => {
      const gap = k !== 0 ? CARD_GAP * k : 0;
      const x = k * CARD_WIDTH + gap;
      const pageIndex = k - Math.floor(CARD_NUM / 2) + DEFAULT_PAGE_INDEX;
      return {
        id: k,
        sortIndex: k,
        pageIndex,
        x,
      };
    })
  );

  useEffect(() => {
    moveCard(false);
  }, [touchOffset]);

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

  function moveCard(changePage, isNextPage) {
    if (changePage) {
      CARD_LIST.current = CARD_LIST.current.map(
        ({ sortIndex, ...cardItem }) => {
          let nextSortIndex =
            sortIndex === CARD_LAST_INDEX ? CARD_FIRST_INDEX : sortIndex + 1;
          if (isNextPage) {
            nextSortIndex =
              sortIndex === CARD_FIRST_INDEX ? CARD_LAST_INDEX : sortIndex - 1;
          }
          return {
            ...cardItem,
            sortIndex: nextSortIndex,
            x: (CARD_WIDTH + CARD_GAP) * nextSortIndex,
          };
        }
      );
    }

    const duration = isTouching ? 0 : ANIMATION_DURATION;
    const pageOffset = changePage ? (isNextPage ? CARD_WIDTH : -CARD_WIDTH) : 0;
    Animated.timing(offsetXAnim, {
      easing: Easing.linear,
      toValue: touchOffset + pageOffset,
      duration,
      useNativeDriver: false,
    }).start();
  }

  function onResponderEnd(e) {
    console.log("onResponderEnd");
    setIsTouching(false);
    setTouchBeginX(0);
    setTouchX(0);
    if (touchOffset > TOUCH_EFFECT_LENGTH) {
      toLastPage();
    } else if (touchOffset < -TOUCH_EFFECT_LENGTH) {
      toNextPage();
    }
  }

  function toLastPage() {
    prePage.current = page;
    setPage(page - 1);
    moveCard(true, false);
  }

  function toNextPage() {
    prePage.current = page;
    setPage(page + 1);
    moveCard(true, true);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.carousel]}>
        {CARD_LIST.current.map(({ id, sortIndex, pageIndex, x }) => {
          return (
            <Animated.View
              key={sortIndex}
              style={[
                styles.page,
                {
                  left: Animated.add(offsetXAnim, x),
                },
              ]}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={onResponderGrant}
              onResponderMove={onResponderMove}
              onResponderEnd={onResponderEnd}
            >
              <Text style={styles.text}>Page {pageIndex}</Text>
              <Text style={styles.text}>Sort Index {sortIndex}</Text>
              <Text style={styles.text}>ID {id}</Text>
            </Animated.View>
          );
        })}
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
    width: CAROUSEL_WIDTH,
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
    borderColor: "black",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
