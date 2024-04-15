import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import ModalGroupChat from '../components/GroupChatModal';
import { UserType } from '../UserContext';

var fullwidth = Dimensions.get('window').width; //full width
var fullheight = Dimensions.get('window').height; //full height

const ChatGroupSreen = () => {
  const { userData, setuserData } = useContext(UserType);
  const navigation = useNavigation();
  const [onModal, setOnMadal] = useState(false);

  const handlePresentModalPress = () => {
    setOnMadal(true);
  };

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

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <ModalGroupChat onModal={onModal} setOnMadal={setOnMadal} userData={userData}/>
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
