import { Text,StyleSheet,View,Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Home() {
    const router = useRouter()//Hook de navegação

    const realizarLogoff = async () =>{
        await AsyncStorage.removeItem("@user")//Limpa o usuário do Async
        router.replace("/")
    }
    return (
        <View style={styles.main}>
            <Text>Tela Home</Text>
            <Button title="Realizar logoff" onPress={realizarLogoff}/>
        </View>

    )
}
const styles = StyleSheet.create({
    main:{
        flex:1,
        alignItems:"center",
        justifyContent:"center"
    }
})