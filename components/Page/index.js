import { View, Text, StyleSheet } from "react-native";

function Page({ pageIndex }) {
  return (
    <View>
      <Text style={styles.text}>Page {pageIndex}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Page;
