import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import ToyDetailScreen from '../screens/ToyDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddToyScreen from '../screens/AddToyScreen';
import OrdersScreen from '../screens/OrdersScreen';

const Stack = createNativeStackNavigator();

function HeaderRight({ navigation }) {
  const { user, logout } = useAuth();
  if (user) {
    return (
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <Pressable onPress={() => navigation.navigate('Orders')}>
          <Text style={{ color: colors.teal, fontWeight: '600' }}>Orders</Text>
        </Pressable>
        <Pressable onPress={() => { logout(); }}>
          <Text style={{ color: colors.free, fontWeight: '600' }}>Log out</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <Pressable onPress={() => navigation.navigate('Login')}>
      <Text style={{ color: colors.plum, fontWeight: '600' }}>Log in</Text>
    </Pressable>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: colors.paper },
          headerTitleStyle: { color: colors.ink },
          headerRight: () => <HeaderRight navigation={navigation} />,
        })}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '🧸 ShareToys' }} />
        <Stack.Screen name="ToyDetail" component={ToyDetailScreen} options={{ title: 'Toy details' }} />
        <Stack.Screen name="AddToy" component={AddToyScreen} options={{ title: 'Pin a toy' }} />
        <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log in', headerRight: () => null }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Sign up', headerRight: () => null }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
