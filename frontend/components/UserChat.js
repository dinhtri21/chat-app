import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { useContext } from "react";
import { UserType } from "../UserContext";

const UserChat = ({ item }) => {
  const { userId, setUserId } = useContext(UserType);
  // const [backgroundColor, setBackgroundColor] = useState("transparent");
  const navigation = useNavigation();
  // Định dạng thời gian theo múi giờ Việt Nam
  const formattedTime = moment(item?.latestMessage?.timeStamp)
    .utcOffset("+0700")
    .format("HH:mm"); // Định dạng chỉ giờ: phút

  return (
    item?.latestMessage &&
    item?.members.map((member, index) => {
      return userId !== member._id ? (
        <Pressable
          key={index}
          onPress={() => {
            navigation.navigate("Messages", { recepientId: member._id });
          }}
          style={[styles.containerUserChat]}
        >
          <View style={styles.containerInfo}>
            <Image
              defaultSource={require("../assets/default-profile-picture-avatar.jpg")}
              style={styles.infoImg}
              source={{ uri: member.image }}
            />
            <View style={styles.infoNameMessLast}>
              <Text style={styles.infoName}>{member.name}</Text>
              {item.latestMessage.messageType == "text" ? (
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={styles.infoLastMessage}
                >
                  {item.latestMessage.message}
                </Text>
              ) : item.latestMessage.messageType == "image" ? (
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={styles.infoLastMessage}
                >
                  [Hình ảnh]
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.containerLastMessageTime}>
            <Text style={styles.lastMessageTime}>{formattedTime}</Text>
          </View>
        </Pressable>
      ) : null;
    })
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
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  containerInfo: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    gap: 1,
    flex: 9,
    // backgroundColor: "#ccc",
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
  containerLastMessageTime: {
    flex: 1,
  },
  infoNameMessLast: {
    marginVertical: 12,
    marginLeft: 12,
    flex: 1,
  },
  infoLastMessage: {
    flexWrap: "wrap",
    marginTop: 3,
    color: "gray",
  },
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
