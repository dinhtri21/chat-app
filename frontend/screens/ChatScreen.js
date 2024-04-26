import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  FlatList,
  RefreshControl,
} from 'react-native';

import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useLayoutEffect,
} from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios, { CancelToken } from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { UserType } from '../UserContext';
import { socket } from '../socket';
import { AntDesign } from '@expo/vector-icons';
import { EvilIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const ChatScreen = () => {
  const route = useRoute();
  const { item } = route.params;
  const navigation = useNavigation();
  const [groupData, setGroupData] = useState({});
  const { userData, setuserData } = useContext(UserType);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const cancelTokenSource = CancelToken.source();
  const scrollViewRef = useRef();
  const [selectedImages, setSelectedImages] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // State để hiển thị emoji picker
  const [offset, setOffset] = useState(0);
  const limit = 14;
  const [isEndMessage, setIsEndMessage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // BEGIN: NHẮN TIN //
  const fetchGroupData = async ({ groupId }) => {
    try {
      const groupIds = item.members ? item._id : groupId;
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/group/getDataUsersInGroup/${groupIds}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status == 200) {
        setGroupData(res.data);
      }
    } catch (error) {
      console.log('Lỗi hàm fetchgroupData: ', error);
    }
  };
  //Thông tin nhóm
  const fetchMessages = async (offset, limit) => {
    if (groupData._id) {
      try {
        const response = await axios.get(
          `${process.env.EXPRESS_API_URL}/messages/getMessages/${groupData._id}`,
          {
            cancelToken: cancelTokenSource.token,
            params: { offset: offset, limit: limit },
          }
        );
        if (response.status === 200) {
          return response.data.messages;
        }
      } catch (error) {
        console.log('Lỗi hàm fetchMessages:', error);
      }
    }
  };

  const loadInitialMessages = async () => {
    const newMessages = await fetchMessages(0, limit);
    if (newMessages && messages.length == 0) {
      await setMessages([...messages, ...newMessages]);
      await setOffset(offset + newMessages.length);
    }
  };
  // Load thêm tin nhắn
  const loadMoreMessages = async () => {
    const newMessages = await fetchMessages(offset, limit);
    if (newMessages.length == 0) {
      setOffset(offset + newMessages.length);
      setIsEndMessage(true);
      setRefreshing(false);

      return;
    }
    if (newMessages) {
      setMessages([...newMessages, ...messages]);
      setOffset(offset + newMessages.length);
      setRefreshing(false);
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
    const newGroupId = await groupData.members
      .filter((rep) => rep._id !== userData._id)
      .map((rep) => rep._id);
    try {
      const imageBase64 = await FileSystem.readAsStringAsync(imageData.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      socket.emit('sendMessage', {
        groupId: groupData._id,
        senderId: userData._id,
        recepientId: newGroupId,
        messageType: 'image',
        message: '',
        imageBase64: imageBase64,
        mimeType: imageData.mimeType,
        timeStamp: new Date().toISOString(),
      });
      setSelectedImages([]);
    } catch (error) {
      console.error('Error sending image message:', error);
    }
  };

  const sendTextMessage = async () => {
    const newGroupId = await groupData.members
      .filter((rep) => rep._id !== userData._id)
      .map((rep) => rep._id);
    try {
      if (inputMessage.trim() !== '') {
        socket.emit('sendMessage', {
          groupId: groupData._id,
          senderId: userData._id,
          recepientId: newGroupId,
          messageType: 'text',
          message: inputMessage.trim(),
          imageBase64: '',
          mimeType: '',
          timeStamp: new Date().toISOString(),
        });
        setInputMessage('');
      }
    } catch (error) {
      console.log('Lỗi khi gửi tin nhắn văn bản:', error);
    }
  };

  // Render tin nhắn
  const renderMessageBubble = (message, index) => {
    const isUserMessage = message.senderId._id === userData._id;
    return (
      <View
        key={index}
        style={[
          styles.messageBubble,
          { alignSelf: isUserMessage ? 'flex-end' : 'flex-start' },
        ]}
      >
        {!isUserMessage ? (
          <Image
            style={styles.imageAvt}
            source={{ uri: message.senderId.image }}
          />
        ) : null}
        {message.messageType == 'text' ? (
          <View style={styles.nameAndMessageView}>
            {/* {!isUserMessage ? (
              <Text style={styles.nameSender}>{message.senderId.name}</Text>
            ) : null} */}
            <Text
              style={{
                color: isUserMessage ? '#fff' : '#000',
                backgroundColor: isUserMessage ? '#4a86f7' : '#fff',
                ...styles.messageText,
              }}
            >
              {message.message}
            </Text>
          </View>
        ) : message.messageType == 'image' ? (
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
    scrollViewRef.current?.scrollToEnd({
      animated: true,
    });
  };
  // Refresh tin nhắn
  const onRefresh = async () => {
    setRefreshing(true);
    if (!isEndMessage) {
      await loadMoreMessages();
    } else {
      setRefreshing(false);
      console.log('Hết tin nhắn');
    }
  };

  // END: NHẮN TIN //
  // BEGIN: XỬ LÍ CHỌN ẢNH //
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Quyền truy cập thư viện ảnh bị từ chối!');
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
      <View style={styles.imageItemContainer}>
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

  //Render lần đầu
  useEffect(() => {
    item && item.members
      ? fetchGroupData({ groupId: item._id })
      : socket.emit('createGroup', {
          groupName: '',
          members: [userData._id, item._id],
        });
    socket.on('groupCreatedSuccess', (data) => {
      fetchGroupData({ groupId: data._id });
    });
    setTimeout(() => {
      scrollToBottom();
    }, 1000);
    return () => {
      cancelTokenSource.cancel();
      socket.off('createGroup');
      socket.off('groupCreatedSuccess');
    };
  }, []);
  //Render tin nhắn đầu tiên
  useEffect(() => {
    if (item.members) {
      loadInitialMessages();
    }
    // console.log(groupData);
    return () => {
      cancelTokenSource.cancel();
    };
  }, [groupData]);
  //Socket tin nhắn mới
  useEffect(() => {
    socket.on('newMessage', (data) => {
      if (data.groupId) {
        setGroupData({ ...groupData, _id: data.groupId });
      }
      setMessages((prevMessages) => [...prevMessages, data.message]);
      scrollToBottom();
    });
    return () => {
      socket.off('newMessage');
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',
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
              source={
                groupData?.members?.length > 2
                  ? require('../assets/groupIcon.png')
                  : !item?.members
                  ? { uri: item?.image }
                  : {
                      uri:
                        userData._id == groupData?.members?.[0]._id
                          ? groupData?.members?.[1]?.image
                          : groupData?.members?.[0]?.image,
                    }
              }
            />
            <Text style={styles.headerNavTitle}>
              {groupData?.members?.length > 2
                ? groupData.name
                : !item?.members
                ? item?.name
                : userData._id == groupData?.members?.[0]._id
                ? groupData?.members?.[1]?.name
                : groupData?.members?.[0]?.name}
            </Text>
          </View>
        </View>
      ),
    });
  }, [groupData]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007aff']}
            progressBackgroundColor="#fff"
          />
        }
      >
        {messages?.length > 0 ? messages.map(renderMessageBubble) : null}
      </ScrollView>

      {/* Thanh input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerInfoImage: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    width: 35,
    height: 35,
    borderRadius: 35,
  },
  headerNavTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  //
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1, // Kích thước nội dung tăng dần để cho phép cuộn
    justifyContent: 'flex-end', // Đảm bảo tin nhắn mới luôn nằm ở cuối
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 10,
    // backgroundColor: '#ccc',
  },
  // nameAndMessageView: {
  //   position: 'relative',
  // },
  // nameSender: {
  //   position: 'absolute',
  //   top: -40,
  //   marginBottom: 4,
  //   fontSize: 14,
  // },
  imageAvt: {
    height: 28,
    width: 28,
    borderRadius: 28,
    marginVertical: 4,
  },

  imageMessage: {
    marginVertical: 10,
    marginHorizontal: 18,
    borderRadius: 4,
  },
  imageMessageSrc: {
    resizeMode: 'cover',
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  messageText: {
    // display: 'inline',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 10,
  },
  inputContainer: {
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  input: {
    borderRadius: 18,
    borderColor: '#dddddd',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
  },
  inputTop: {
    flexDirection: 'row',
    gap: 5,
  },
  inputBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
  },
  flatListImagesPicker: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
  },
  imageItemContainer: {
    margin: 4,
    position: 'relative',
  },
  imagePicker: {
    height: 70,
    width: 70,
    resizeMode: 'cover',
    marginHorizontal: 2,
    marginVertical: 2,
    borderRadius: 8,
  },
  deleteIconImage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -5,
    right: -5,
    zIndex: 99,
    height: 22,
    width: 22,
    backgroundColor: '#fff',
    overflow: 'hidden',
    opacity: 0.6,
    borderRadius: 50,
  },
});
