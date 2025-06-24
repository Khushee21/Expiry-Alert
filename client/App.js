import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screen/HomeScreen';
import AddItemScreen from './screen/AddItemScreen';
import store from './store/store';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    < Provider store={store}>
      <NavigationContainer>  {/**ye wrapper cmnt is reponsible for app ke navigation , it manages the state of navigation*/}
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddItem" component={AddItemScreen} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </Provider>
  )
}