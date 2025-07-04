import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screen/HomeScreen';
import AddItemScreen from './screen/AddItemScreen';
import store from './store/store';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { Header } from './screen/Header';
import Notification from './screen/NotificationsSreen';
import AllItems from './screen/AllItemScreen';

const Stack = createNativeStackNavigator();  //stack like implementation ke liye
export default function App() {
  return (
    < Provider store={store}>
      <NavigationContainer>  {/**ye wrapper cmnt is reponsible for app ke navigation , it manages the state of navigation*/}
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddItem" component={AddItemScreen} />
          <Stack.Screen name="Header" component={Header} />
          <Stack.Screen name="Notifications" component={Notification} />
          <Stack.Screen name="AllItems" component={AllItems} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </Provider>
  )
}