import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  BottomSheetView,
  BottomSheetModal,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import { useRef, useMemo, useEffect, useState } from 'react';
import { Easing } from 'react-native-reanimated';
import axios, { CancelToken } from 'axios';
import UserChatGroupModal from './UserChatGroupModal';
import { FlatList, ScrollView, TextInput } from 'react-native-gesture-handler';

const ModalGroupChat = ({ userData, onModal, setOnMadal }) => {
  const cancelTokenSource = CancelToken.source();
  const [listFriends, setListFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['60%', '60%'], []);
  const animationConfigs = useBottomSheetTimingConfigs({
    duration: 5000,
    easing: Easing.ease,
  });
  useEffect(() => {
    if (onModal) {
      bottomSheetRef.current?.present();
    }
  }, [onModal]);
  const closeModal = async () => {
    try {
      await bottomSheetRef.current.close();
      setOnMadal(false);
    } catch (error) {
      console.log('Lỗi closeModal' + error);
    }
  };
  const getListFriend = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPRESS_API_URL}/friend/listFriends/${userData._id}
        `,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (response.status == 200) {
        setListFriends(response.data);
      }
    } catch (error) {
      console.log('Lỗi getListFriend' + error);
    }
  };
  //CHỌN
  const handleFriendSelect = async (friend) => {
    const isSelect = selectedFriends.some((item) => item._id == friend._id);

    if (isSelect) {
      await setSelectedFriends(
        selectedFriends.filter((item) => item._id !== friend._id)
      );
    } else {
      await setSelectedFriends([...selectedFriends, friend]);
    }
  };

  console.log(selectedFriends);
  useEffect(() => {
    getListFriend();
    return () => {
      cancelTokenSource.cancel();
    };
  }, []);
  //Render Flatlist
  const renderItem = ({ item }) => (
    <View
      style={{
        paddingVertical: 6,
        paddingHorizontal: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
      }}
    >
      <Text style={{ fontSize: 16 }}>{item.name}</Text>
    </View>
  );
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      style={styles.container}
      onDismiss={closeModal}
      animationConfig={animationConfigs}
      backdropComponent={({ style }) => (
        <View style={[style, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]} />
      )}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Tạo nhóm mới</Text>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            // backgroundColor: '#ccc',
            marginTop: 12,
          }}
        >
          <Text style={styles.flatListTitle}>Tên nhóm:</Text>
          <TextInput style={{ fontSize: 16, fontWeight: '400', flex: 1 }} placeholder="..." />
        </View>
        <View style={styles.flatListContainer}>
          <Text style={styles.flatListTitle}>
            Đến:
            {selectedFriends.length > 0 ? null : '  ...'}
          </Text>
          <FlatList
            data={selectedFriends}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            horizontal={true}
            contentContainerStyle={{ alignItems: 'center', gap: 6 }}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.contentScrollViewContainer}
          style={styles.scrollViewContainer}
          refreshControl={null}
          showsVerticalScrollIndicator={false}
        >
          {listFriends &&
            listFriends.map((friend, index) => {
              return (
                <UserChatGroupModal
                  key={index}
                  friend={friend}
                  handleFriendSelect={handleFriendSelect}
                  isSelected={selectedFriends.some(
                    (item) => item._id == friend._id
                  )}
                />
              );
            })}
        </ScrollView>
        {selectedFriends.length >= 2 ? (
          <TouchableOpacity style={styles.createGroupBtn}>
            <Text style={{ color: '#fff', fontSize: 16 }}>Tạo nhóm chat</Text>
          </TouchableOpacity>
        ) : null}
      </BottomSheetView>
    </BottomSheetModal>
  );
};
export default ModalGroupChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    flex: 1,
    height: '100%',
    gap: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    borderColor: '#ccc',
  },
  scrollViewContainer: {
    width: '100%',
  },
  contentScrollViewContainer: {
    paddingBottom: 10,
    gap: 8,
  },
  flatListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  flatListTitle: { marginRight: 6, fontSize: 16, fontWeight: '400' },
  createGroupBtn: {
    backgroundColor: '#0057ffa8',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
});
