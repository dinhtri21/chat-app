import { StyleSheet, Text, View } from 'react-native';
import StackNavigator from './StackNavigator';
import { UserContext } from './UserContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';

var width = Dimensions.get('window').width; //full width
var height = Dimensions.get('window').height; //full height

export default function App() {
  console.log(process.env.EXPRESS_API_URL);
  //npx expo start -c
  return (
    <UserContext>
      <GestureHandlerRootView style={styles.modal}>
        <BottomSheetModalProvider>
          <StackNavigator />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </UserContext>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
  },
});
