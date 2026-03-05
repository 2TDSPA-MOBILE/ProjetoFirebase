import { Text, StyleSheet, View, Button, Alert, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth,addDoc,db} from "../services/firebaseConfig"
import { deleteUser } from "firebase/auth";
import ItemLoja from "./components/ItemLoja";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState,useEffect } from "react";
import { salvarProdutoUsuario } from "../services/userDataService";
import {collection,onSnapshot,orderBy,query} from "firebase/firestore"

type Produto = {
    id:string,
    nomeProduto:string
}

export default function Home() {
    //Estado para armazenar o nome do produto
    const[nomeProduto,setNomeProduto]=useState("")

    //Estado para armazenar os produtos vindo do Firestore
    const[produtos,setProdutos]=useState<Produto[]>([])

    const router = useRouter()//Hook de navegação

    /*Executa em tempo real a coleção de produtos será usuário logado
    Sempre que algo muda no Firestore, a lista é atualizada automaticamente
    na tela*/
    useEffect(()=>{
        console.log("Executando...")
    },[])

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
        //Evitar gravações do db de itens vazios
        if(!nomeProduto.trim()){
            Alert.alert("Atenção","Digite o nome do produto.")
            return
        }
        //Garantir o uso do uid do usuário autenticado;
        const user = auth.currentUser
        if(!user){
            Alert.alert("Erro","Nenhum usuário autenticado.")
            return
        }

        try{
            //Salvar em usario/{uid}/produtos
            await salvarProdutoUsuario(user.uid,nomeProduto.trim())
            Alert.alert("Sucesso","Produto salvo com sucesso!")
            setNomeProduto("")
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
                <ItemLoja nomeProduto="Mouse Gamer"/>
                <TextInput 
                    placeholder="Digite o nome do Produto" 
                    style={styles.input}
                    value={nomeProduto}
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