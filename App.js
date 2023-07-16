import { StyleSheet, View } from "react-native";
import Carousel from "./components/Carousel";
import Page from "./components/Page";

export default function App() {
  return (
    <View style={styles.container}>
      <Carousel
        onPageChange={({ prePageIndex, curPageIndex }) => {}}
        renderItem={({ pageIndex }) => <Page pageIndex={pageIndex} />}
      />
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
});
