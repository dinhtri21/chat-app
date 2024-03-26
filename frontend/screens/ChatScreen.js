import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  FlatList,
} from "react-native";

import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useLayoutEffect,
} from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios, { CancelToken } from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import { socket } from "../socket";
import { AntDesign } from "@expo/vector-icons";
import { EvilIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const ChatScreen = () => {
  const route = useRoute();
  const { recepientId } = route.params;
  const navigation = useNavigation();
  const [recepientData, setRecepientData] = useState({});
  const { userId, setUserId } = useContext(UserType);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const cancelTokenSource = CancelToken.source();
  const scrollViewRef = useRef();
  const [selectedImages, setSelectedImages] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // State để hiển thị emoji picker

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View style={styles.headerContainer}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />
          <View style={styles.headerInfo}>
            <Image
              style={styles.headerInfoImage}
              source={{ uri: recepientData?.image }}
            />
            <Text style={styles.headerNavTitle}>{recepientData?.name}</Text>
          </View>
        </View>
      ),
    });
  }, [recepientData]);

  // BEGIN: NHẮN TIN //
  const fetchRecepientData = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/user/user/${recepientId}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status == 200) {
        const data = res.data.user;
        setRecepientData(data);
      } else {
        console.log(res);
      }
    } catch (error) {
      console.log("Lỗi hàm fetchRecepientData: ", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPRESS_API_URL}/messages/getMessages/${userId}/${recepientId}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (response.status === 200) {
        setMessages(response.data.messages);
      } else {
        console.log(response);
      }
    } catch (error) {
      console.log("Lỗi hàm fetchMessages:", error);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() !== "") {
      // Gửi tin nhắn thông qua socket
      socket.emit("sendMessage", {
        senderId: userId,
        recepientId: recepientId,
        message: inputMessage.trim(),
        timeStamp: new Date().toISOString(),
      });
      setInputMessage("");
    }
  };

  // Render tin nhắn
  const renderMessageBubble = (message, index) => {
    const isUserMessage = message.senderId === userId;
    return (
      <View
        key={index}
        style={[
          styles.messageBubble,
          { alignSelf: isUserMessage ? "flex-end" : "flex-start" },
          { backgroundColor: isUserMessage ? "#4a86f7" : "#fff" },
        ]}
      >
        <Text style={{ color: isUserMessage ? "#fff" : "#000" }}>
          {message.message}
        </Text>
      </View>
    );
  };
  // Cuộn tin nhắn
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  // END: NHẮN TIN //
  // BEGIN: XỬ LÍ CHỌN ẢNH //
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Quyền truy cập thư viện ảnh bị từ chối!");
      }
    })();
  }, []);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      // allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      const newSelectedImages = result.assets.map((image) => {
        return image.uri;
      });
      setSelectedImages((prevImages) => [...prevImages, ...newSelectedImages]);
    }
  };
  const renderImageItem = ({ item }) => {
    return (
      <View
        style={styles.imageItemContainer}
        // onPress={() => handleImagePress(item)}
      >
        <Pressable
          style={styles.deleteIconImage}
          onPress={() => handleDeleteImage(item)}
        >
          <EvilIcons
            style={{ borderRadius: 50, marginLeft: -2 }}
            name="close-o"
            size={24}
            color="black"
          />
        </Pressable>
        <Image source={{ uri: item }} style={styles.imagePicker} />
      </View>
    );
  };
  const handleDeleteImage = (item) => {
    const updatedImages = selectedImages.filter(
      (imageUri) => item !== imageUri
    );
    setSelectedImages(updatedImages);
  };
  // END: XỬ LÍ CHỌN ẢNH //

  useEffect(() => {
    fetchRecepientData();
    fetchMessages();
    return () => {
      cancelTokenSource.cancel();
    };
  }, []);

  useEffect(() => {
    socket.on("newMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });
  }, []);

  
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.contentContainer}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map(renderMessageBubble)}
      </ScrollView>

      {/* Thanh input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <View style={styles.inputTop}>
          {selectedImages.length > 0 ? (
            <FlatList
              style={styles.flatListImagesPicker}
              data={selectedImages}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal={true}
            />
          ) : null}
        </View>
        <View style={styles.inputBottom}>
          <AntDesign
            onPress={pickImages}
            name="picture"
            size={24}
            color="black"
          />
          {/* <Entypo name="emoji-happy" size={24} color="black" /> */}
         
          <TextInput
            placeholder="Nhập tin nhắn..."
            value={inputMessage}
            onChangeText={setInputMessage}
            style={styles.input}
          />
          <Ionicons name="send" size={24} color="black" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerInfoImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: "#ccc",
  },
  headerNavTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  //
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    // backgroundColor: "#666",
  },
  contentContainer: {
    flexGrow: 1, // Kích thước nội dung tăng dần để cho phép cuộn
    justifyContent: "flex-end", // Đảm bảo tin nhắn mới luôn nằm ở cuối
  },
  messageBubble: {
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  inputContainer: {
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  input: {
    borderRadius: 18,
    borderColor: "#dddddd",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
  },
  inputTop: {
    flexDirection: "row",
    gap: 5,
  },
  inputBottom: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
  },
  flatListImagesPicker: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
  },
  imageItemContainer: {
    margin: 4,
    position: "relative",
  },
  imagePicker: {
    height: 70,
    width: 70,
    resizeMode: "cover",
    marginHorizontal: 2,
    marginVertical: 2,
    borderRadius: 8,
  },
  deleteIconImage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: -5,
    right: -5,
    zIndex: 99,
    height: 22,
    width: 22,
    backgroundColor: "#fff",
    overflow: "hidden",
    opacity: 0.6,
    borderRadius: 50,
  },
});
