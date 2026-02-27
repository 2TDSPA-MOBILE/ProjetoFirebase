import { Text, StyleSheet, View, Button, Alert, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth,collection,addDoc,db} from "../services/firebaseConfig"
import { deleteUser } from "firebase/auth";
import ItemLoja from "./components/ItemLoja";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function Home() {
    //Estado para armazenar o nome do produto
    const[nomeProduto,setNomeProduto]=useState("")

    const router = useRouter()//Hook de navegação

    const realizarLogoff = async () => {
        await AsyncStorage.removeItem("@user")//Limpa o usuário do Async
        router.replace("/")
    }

    const excluirConta = () => {
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir sua conta?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            const user = auth.currentUser
                            if (user) {
                                await deleteUser(user)
                                await AsyncStorage.removeItem("@user")
                                Alert.alert("Sucesso", "Conta Excluída!")
                                router.replace("/")
                            } else {
                                Alert.alert("Erro", "Nenhum usuário logado.")
                            }
                        } catch (error) {
                            console.log("Erro ao Excluir conta.")
                            Alert.alert("Error", "Não foi possível excluir a conta.")
                        }
                    }
                }
            ]
        )
    }

    const salvarProduto = async()=>{
        try{
            const docRef = await addDoc(collection(db,"produtos"),{
                nomeProduto:nomeProduto,
                isChecked:false
            });
            console.log("Produto Salvo com Sucesso!")
        }catch(error){
            console.log("Error ao salvar produto:"+error)
        }
    }
    return (
        <SafeAreaView style={styles.main}>
            <KeyboardAvoidingView //Componente que ajusta o layout automaticamente, isso para evitar que o 
            //teclado cubra os campos de entrada
            style={styles.main}
            behavior={Platform.OS==="ios"?"padding":"height"}
            keyboardVerticalOffset={10} //Desloca o conteúdo na vertical
            >
                <Text>Tela Home</Text>
                <Button title="Realizar logoff" onPress={realizarLogoff} />
                <Button title="Excluir Conta" color="red" onPress={excluirConta} />
                <Button title="Alterar Senha" onPress={() => router.push("/AlterarSenhaScreen")} />
                <ItemLoja />
                <TextInput 
                    placeholder="Digite o nome do Produto" 
                    style={styles.input}
                    onChangeText={(value)=>setNomeProduto(value)}
                    onSubmitEditing={salvarProduto}    
                />
            </KeyboardAvoidingView>
        </SafeAreaView>

    )
}
const styles = StyleSheet.create({
    main: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start"
    },
    input: {
        backgroundColor: "lightgrey",
        padding: 10,
        fontSize: 15,
        width: "90%",
        alignSelf: "center",
        borderRadius: 10,
        marginTop: "auto"
    }
})