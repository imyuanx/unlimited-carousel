import { useEffect, useMemo, useRef, useState } from "react";
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

const CARD_POSITION = [
  [
    [-1, 1, 0],
    [0, -1, 1],
    [1, 0, -1],
  ],
  [
    [-1, 0, 1],
    [0, 1, -1],
    [1, -1, 0],
  ],
];

function getSortIndex(page, id) {
  const index = Math.abs(page) % CARD_NUM;
  if (page > 0) return CARD_POSITION[0][id][index];
  if (page < 0) return CARD_POSITION[1][id][index];
  return [-1, 0, 1][id];
}

function Carousel({ renderItem: RenderItem, onPageChange }) {
  const prePage = useRef(0);
  const [page, _setPage] = useState(0);
  const translateX = useSharedValue(0);
  const translateXLast = useSharedValue(translateX.value);

  function setPage(value) {
    onPageChange({ prePageIndex: page, curPageIndex: value });
    prePage.current = page;
    _setPage(value);
  }

  const CARD_LIST = useRef(
    Array.from({ length: CARD_NUM }, (_, k) => {
      const gap = k !== 0 ? CARD_GAP * k : 0;
      const x = k * CARD_WIDTH + gap;
      const pageIndex = k - Math.floor(CARD_NUM / 2) + DEFAULT_PAGE_INDEX;
      return {
        id: k,
        pageIndex,
        x,
      };
    })
  );

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (event, ctx) => {
      ctx.startX = translateXLast.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
    },
    onEnd: (event, ctx) => {
      const diff = event.translationX;
      if (diff >= TOUCH_EFFECT_LENGTH) {
        // console.log('last page');
        translateX.value = withTiming(ctx.startX + CARD_WIDTH + CARD_GAP);
        translateXLast.value = ctx.startX + CARD_WIDTH + CARD_GAP;
        runOnJS(setPage)(page - 1);
        return;
      } else if (diff <= -TOUCH_EFFECT_LENGTH) {
        // console.log('next page');
        translateX.value = withTiming(ctx.startX - CARD_WIDTH - CARD_GAP);
        translateXLast.value = ctx.startX - CARD_WIDTH - CARD_GAP;
        runOnJS(setPage)(page + 1);
        return;
      }
      translateX.value = translateXLast.value;
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={styles.carousel}>
          {CARD_LIST.current.map(({ id, pageIndex, x: defaultX }) => {
            const x = useSharedValue(defaultX);
            const sortIndex = useMemo(() => getSortIndex(page, id), [page]);

            useEffect(() => {
              const cardWidthClient = CARD_WIDTH + CARD_GAP;
              x.value =
                (sortIndex + Math.floor(CARD_NUM / 2)) * cardWidthClient +
                page * cardWidthClient;
            }, [page, sortIndex]);

            const currentPage = useMemo(
              () => page + sortIndex,
              [page, sortIndex]
            );

            const animatedStyle = useAnimatedStyle(() => {
              return {
                transform: [
                  {
                    translateX: translateX.value + x.value,
                  },
                ],
              };
            }, [page, sortIndex]);

            return (
              <Animated.View key={id} style={[styles.page, animatedStyle]}>
                <RenderItem pageIndex={id} />
                <Text style={styles.text}>ID: {id}</Text>
                <Text style={styles.text}>Sort Index: {sortIndex}</Text>
                <Text style={styles.text}>Current Page: {currentPage}</Text>
              </Animated.View>
            );
          })}
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
