import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";

const UserChat = ({ item }) => {
  const navigation = useNavigation();
  // Định dạng thời gian theo múi giờ Việt Nam
  const formattedTime = moment(item.latestMessage?.timeStamp)
    .utcOffset("+0700")
    .format("HH:mm"); // Định dạng chỉ giờ: phút
  return (
    <Pressable
      onPress={() => {
        navigation.navigate("Messages", { recepientId: item._id });
      }}
      style={styles.containerUserChat}
    >
      <View style={styles.containerInfo}>
        <Image style={styles.infoImg} source={{ uri: item.image }} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.infoName}>{item?.name}</Text>
          <Text style={styles.infoLastMessage}>
            {item?.latestMessage?.message}
          </Text>
        </View>
      </View>
      <View>
        <Text style={styles.lastMessageTime}>{formattedTime}</Text>
      </View>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({
  containerUserChat: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderWidth: 0.7,
    borderColor: "#D0D0D0",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    padding: 10,
  },
  containerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  infoImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "cover",
    backgroundColor: "#fff",
  },
  infoName: {
    fontSize: 15,
    fontWeight: "400",
  },
  infoLastMessage: { marginTop: 3, color: "gray" },
  sentBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "gray",
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  lastMessageTime: {
    marginTop: 3,
    color: "gray",
  },
});
