import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import GroupChatModal from '../components/CreateGroupChatModal';
import { UserType } from '../UserContext';
import axios, { CancelToken } from 'axios';
import MultiMemberGroup from '../components/MultiMemberGroup';
import { socket } from '../socket';

var fullwidth = Dimensions.get('window').width; //full width
var fullheight = Dimensions.get('window').height; //full height

const ChatGroupSreen = () => {
  const { userData, setuserData } = useContext(UserType);
  const cancelTokenSource = CancelToken.source();
  const navigation = useNavigation();
  const [onModal, setOnMadal] = useState(false);
  const [multiMemberGroup, setMultiMemberGroup] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerNavTitle}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
            }}
          >
            Nhóm chat
          </Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.containerIconLeft}>
          <AntDesign
            onPress={handlePresentModalPress}
            name="addusergroup"
            size={26}
            color="black"
          />
        </View>
      ),
    });
  }, []);

  const handlePresentModalPress = () => {
    setOnMadal(true);
  };

  const getMultiMemberGroup = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPRESS_API_URL}/group/getMultiMemberGroup/${userData._id}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (response.status == 200) {
        setMultiMemberGroup(response.data);
      }
    } catch (error) {
      console.log('Lỗi hàm handlePresentModalPress: ' + error);
    }
  };

  useEffect(() => {
    getMultiMemberGroup();
    socket.on('joinMultiMemberGroup', (data) => {
      if (data.status == 'success') {
        getMultiMemberGroup();
      }
    });
    return () => {
      cancelTokenSource.cancel();
      socket.off('joinMultiMemberGroup');
    };
  }, []);

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <GroupChatModal onModal={onModal} setOnMadal={setOnMadal} />
      {multiMemberGroup &&
        multiMemberGroup.map((group, index) => {
          return <MultiMemberGroup item={group} key={index} />;
        })}
    </View>
  );
};

export default ChatGroupSreen;

const styles = StyleSheet.create({
  headerNavTitle: {
    flex: 1,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
