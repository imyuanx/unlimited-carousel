import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const DEFAULT_PAGE_INDEX = 0;
const CARD_NUM = 3;

const CARD_WIDTH = 300; // TODO: need from props
const CARD_GAP = 10;

const CARD_FIRST_INDEX = 0;
const CARD_LAST_INDEX = CARD_NUM - 1;
const CARD_MEDIUM_INDEX = 2;

const CAROUSEL_WIDTH = CARD_NUM * CARD_WIDTH + CARD_LAST_INDEX * CARD_GAP;

const ANIMATION_DURATION = 150;
const TOUCH_EFFECT_LENGTH = 30;

function Carousel({ renderItem: RenderItem, onPageChange }) {
  const prePage = useRef(0);
  const [page, _setPage] = useState(0);
  const translateX = useSharedValue(0);

  const CARD_LIST = useRef(
    Array.from({ length: CARD_NUM }, (_, k) => {
      const gap = k !== 0 ? CARD_GAP * k : 0;
      const x = k * CARD_WIDTH + gap;
      const pageIndex = k - Math.floor(CARD_NUM / 2) + DEFAULT_PAGE_INDEX;
      const sortIndex = k - Math.floor(CARD_NUM / 2);
      return {
        id: k,
        sortIndex,
        pageIndex,
        x,
      };
    })
  );

  const setPage = useCallback(
    (value) => {
      prePage.current = page;
      _setPage(value);
    },
    [page]
  );

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (event, ctx) => {
      console.log("onStart");
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      console.log("onActive");
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: (event, ctx) => {
      console.log("onEnd", event, ctx);
      const diff = event.translationX;
      if (diff >= TOUCH_EFFECT_LENGTH) {
        console.log("last page");
        runOnJS(setPage)(page - 1);
        return;
      } else if (diff <= -TOUCH_EFFECT_LENGTH) {
        console.log("next page");
        runOnJS(setPage)(page + 1);
        return;
      }
      translateX.value = 0;
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={styles.carousel}>
          {CARD_LIST.current.map(
            ({ id, pageIndex, sortIndex: defaultSortIndex, x: defaultX }) => {
              const x = useSharedValue(defaultX);
              const offset = useSharedValue(0);

              const sortIndex = useMemo(() => {
                if (page > 0) {
                  const index = page % CARD_NUM;
                  if (id === 0) {
                    return [-1, 1, 0][index];
                  } else if (id === 1) {
                    return [0, -1, 1][index];
                  } else if (id === 2) {
                    return [1, 0, -1][index];
                  }
                } else if (page < 0) {
                  const index = Math.abs(page) % CARD_NUM;
                  if (id === 0) {
                    return [-1, 0, 1][index];
                  } else if (id === 1) {
                    return [0, 1, -1][index];
                  } else if (id === 2) {
                    return [1, -1, 0][index];
                  }
                }
                return defaultSortIndex;
              }, [page]);

              useEffect(() => {
                if (
                  prePage.current < page &&
                  sortIndex === Math.floor(CARD_NUM / 2)
                ) {
                  x.value = (sortIndex + 1) * (CARD_WIDTH + CARD_GAP);
                  offset.value = CARD_WIDTH + CARD_GAP;
                  offset.value = withTiming(0);
                } else if (
                  prePage.current > page &&
                  sortIndex === -Math.floor(CARD_NUM / 2)
                ) {
                  x.value = (sortIndex + 1) * (CARD_WIDTH + CARD_GAP);
                  offset.value = -CARD_WIDTH - CARD_GAP;
                  offset.value = withTiming(0);
                } else {
                  x.value = withTiming(
                    (sortIndex + 1) * (CARD_WIDTH + CARD_GAP)
                  );
                  offset.value = 0;
                }
                translateX.value = withTiming(0);
              }, [sortIndex]);

              const currentPage = useMemo(
                () => page + sortIndex,
                [page, sortIndex]
              );

              const animatedStyle = useAnimatedStyle(() => {
                return {
                  transform: [
                    {
                      translateX: translateX.value + x.value + offset.value,
                    },
                  ],
                };
              });
              return (
                <Animated.View key={id} style={[styles.page, animatedStyle]}>
                  <RenderItem pageIndex={id} />
                  <Text style={styles.text}>ID: {id}</Text>
                  <Text style={styles.text}>Sort Index: {sortIndex}</Text>
                  <Text style={styles.text}>Current Page: {currentPage}</Text>
                </Animated.View>
              );
            }
          )}
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  carousel: {
    position: "relative",
    width: CAROUSEL_WIDTH,
    height: "100%",
    alignItems: "center",
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
});

export default Carousel;
