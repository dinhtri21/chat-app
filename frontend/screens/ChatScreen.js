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
import * as FileSystem from "expo-file-system";
import { Dimensions } from "react-native";
var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height

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
          { recepientData?.image ? (
          <Image
             style={styles.headerInfoImage}
              source={{ uri: recepientData?.image }}
          />
        ) : (
          <Image
             style={styles.headerInfoImage}
            source={require("../assets/default-profile-picture-avatar.jpg")}
          />
        )}
            {/* <Image
              style={styles.headerInfoImage}
              source={{ uri: recepientData?.image }}
            /> */}
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
      } 
    } catch (error) {
      console.log("Lỗi hàm fetchMessages:", error);
    }
  };

  const sendMessage = async () => {
    if (selectedImages.length > 0) {
      for (let i = 0; i < selectedImages.length; i++) {
        const imageData = selectedImages[i];
        await sendImageMessage(imageData); // Gửi ảnh
      }
      sendTextMessage();
    } else {
      sendTextMessage();
    }
  };

  const sendImageMessage = async (imageData) => {
    try {
      const imageBase64 = await FileSystem.readAsStringAsync(imageData.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      socket.emit("sendMessage", {
        senderId: userId,
        recepientId: recepientId,
        messageType: "image",
        message: "",
        imageBase64: imageBase64,
        mimeType: imageData.mimeType, // Dữ liệu ảnh ở dạng base64
        timeStamp: new Date().toISOString(),
      });
      setSelectedImages([]);
    } catch (error) {
      console.error("Error sending image message:", error);
    }
  };

  const sendTextMessage = async () => {
    try {
      if (inputMessage.trim() !== "") {
        socket.emit("sendMessage", {
          senderId: userId,
          recepientId: recepientId,
          messageType: "text",
          message: inputMessage.trim(),
          imageBase64: "",
          mimeType: "",
          timeStamp: new Date().toISOString(),
        });
        setInputMessage("");
      }
    } catch (error) {
      console.log("Lỗi khi gửi tin nhắn văn bản:", error);
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
        ]}
      >
        {message.messageType == "text" ? (
          <Text
            style={{
              color: isUserMessage ? "#fff" : "#000",
              backgroundColor: isUserMessage ? "#4a86f7" : "#fff",
              ...styles.imageText,
            }}
          >
            {message.message}
          </Text>
        ) : message.messageType == "image" ? (
          <View style={styles.imageMessage}>
            <Image
              style={styles.imageMessageSrc}
              source={{ uri: message?.imageUrl }}
            />
          </View>
        ) : null}
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
      quality: 1,
    });
    if (!result.cancelled && result.assets) {
      const newSelectedImages = result.assets.map((image) => {
        return image;
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
        <Image source={{ uri: item.uri }} style={styles.imagePicker} />
      </View>
    );
  };
  const handleDeleteImage = (item) => {
    const updatedImages = selectedImages.filter(
      (imageUri) => item.uri !== imageUri.uri
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
    gap: 8,
  },
  headerInfoImage: {
    width: 35,
    height: 35,
    borderRadius: 35,
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
  messageBubble: {},

  imageMessage: {
    marginVertical: 10,
    marginHorizontal: 18,
    borderRadius: 4,
  },
  imageMessageSrc: {
    resizeMode: "cover",
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  imageText: {
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 18,
    borderRadius: 16,
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
