import { Text,StyleSheet,View,Button,Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {auth} from "../services/firebaseConfig"
import { deleteUser } from "firebase/auth";

export default function Home() {
    const router = useRouter()//Hook de navegação

    const realizarLogoff = async () =>{
        await AsyncStorage.removeItem("@user")//Limpa o usuário do Async
        router.replace("/")
    }

    const excluirConta = ()=>{
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir sua conta?",
            [
                {text:"Cancelar",style:"cancel"},
                {   
                    text:"Excluir",
                    onPress:async()=>{
                        try{
                            const user = auth.currentUser
                            if(user){
                                await deleteUser(user)
                                await AsyncStorage.removeItem("@user")
                                Alert.alert("Sucesso","Conta Excluída!")
                                router.replace("/")
                            }else{
                                Alert.alert("Erro","Nenhum usuário logado.")
                            }
                        }catch(error){
                            console.log("Erro ao Excluir conta.")
                            Alert.alert("Error","Não foi possível excluir a conta.")
                        }
                    }
                }
            ]
        )
    }
    return (
        <View style={styles.main}>
            <Text>Tela Home</Text>
            <Button title="Realizar logoff" onPress={realizarLogoff}/>
            <Button title="Excluir Conta" color="red" onPress={excluirConta}/>
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