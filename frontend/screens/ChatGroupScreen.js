import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
var fullwidth = Dimensions.get('window').width; //full width
var fullheight = Dimensions.get('window').height; //full height

const ChatGroupSreen = () => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {/* <Pressable onPress={navigation.navigate('Friends')}>
        <Text>ChatGroupSreen</Text>
      </Pressable> */}
      <View style={styles.abc}></View>
    </View>
  );
};

export default ChatGroupSreen;

const styles = StyleSheet.create({
  headerNav: {
    margin: 0,
    padding: 0,
    // flex: 1,
    width: fullwidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ccc',
  },
  abc: {
    // zIndex: 999,
    position: 'absolute',
    backgroundColor: '#ccc',
    width: '100%',
    height: '20%',
    // top: -10,
    // transform: [{ translateY: -100 }],
  },
});
