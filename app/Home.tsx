import { Text, StyleSheet, View, Button, Alert, TextInput, KeyboardAvoidingView, Platform, FlatList, Modal, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth, addDoc, db } from "../services/firebaseConfig"
import { deleteUser } from "firebase/auth";
import ItemLoja from "./components/ItemLoja";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { salvarProdutoUsuario } from "../services/userDataService";
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, updateDoc } from "firebase/firestore"

type Produto = {
    id: string,
    nomeProduto: string
}

export default function Home() {
    //Estado para armazenar o nome do produto
    const [nomeProduto, setNomeProduto] = useState("")

    //Estado para armazenar os produtos vindo do Firestore
    const [produtos, setProdutos] = useState<Produto[]>([])

    //Controla se o modal de edição está visivel
    const [modalEditarVisivel, setModalEditarVisivel] = useState(false)
    //Armazenar o ID do produto selecionado para ser editado.
    const [produtoSelecionadoId, setProdutoSelecionadoId] = useState("")
    //Estado que irá armazenar o campo do modal
    const [novoNomeProduto, setNovoNomeProduto] = useState("")

    const router = useRouter()//Hook de navegação

    /*Executa em tempo real a coleção de produtos será usuário logado
    Sempre que algo muda no Firestore, a lista é atualizada automaticamente
    na tela*/
    useEffect(() => {


        const user = auth.currentUser
        try {
            if (user) {
                //Se não houver nenhum usuário logado, estados produtos fica vazio
                // if(!user){
                //     setProdutos([])
                //     return
                // }

                //Referência da subcoleção: usuarios/{uid}/produtos
                const produtosRef = collection(db, "usuarios", user.uid, "produtos")
                if (produtosRef) {
                    //Ordena os itens por data de criação(mais recente ficará no topo)
                    const produtosQuery = query(produtosRef, orderBy("criadoEm", "desc"))

                    //OnSnapshot mantém a sincronização em tempo real entre o Firestore e estado local
                    const unsubscribe = onSnapshot(produtosQuery, (snapshot) => {
                        const dados = snapshot.docs.map((item) => ({
                            id: item.id,
                            nomeProduto: (item.data().nomeProduto as string ?? "")
                        }))
                        //Pegado os produtos da subcoleção do usuários e armazena no estado
                        setProdutos(dados)
                    })
                }


                // //Cleanup: remover o listener ao sair da tela para evitar vazamento de memória
                // return unsubscribe
            }
        } catch (error) {
            console.log("Erro ao buscar produtos.")
        }

    }, [])

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

    const salvarProduto = async () => {
        //Evitar gravações do db de itens vazios
        if (!nomeProduto.trim()) {
            Alert.alert("Atenção", "Digite o nome do produto.")
            return
        }
        //Garantir o uso do uid do usuário autenticado;
        const user = auth.currentUser
        if (!user) {
            Alert.alert("Erro", "Nenhum usuário autenticado.")
            return
        }

        try {
            //Salvar em usario/{uid}/produtos
            await salvarProdutoUsuario(user.uid, nomeProduto.trim())
            Alert.alert("Sucesso", "Produto salvo com sucesso!")
            setNomeProduto("")
            console.log("Produto Salvo com Sucesso!")
        } catch (error) {
            console.log("Error ao salvar produto:" + error)
        }
    }

    const excluirProduto = (produto: Produto) => {
        Alert.alert("Exluir Produto", "Deseja excluir o produto?", [
            { text: "Cancelar" },
            {
                text: "Excluir",
                onPress: async () => {
                    const user = auth.currentUser
                    if (!user) {
                        Alert.alert("Error", "Nenhum usuário autenticado")
                        return
                    }
                    try {
                        const produtoRef = doc(db, "usuarios", user.uid, "produtos", produto.id)
                        await deleteDoc(produtoRef)
                    } catch (error) {
                        console.log("Erro ao excluir produtos:", error)
                        Alert.alert("Erro", "Não foi possível excluir o produto.")
                    }
                }
            }
        ])
    }

    //Abre o modal já preenchido com o nome do item selecionado
    const abrirModalEdicao = (produto: Produto) => {
        //Guardar o id do item está sendo atualizado
        setProdutoSelecionadoId(produto.id)
        //O novo nome do produto
        setNovoNomeProduto(produto.nomeProduto)
        //Exibir o modal
        setModalEditarVisivel(true)
    }

    //Fechar o modal
    const fecharModalEdicao = () => {
        setModalEditarVisivel(false)
        setProdutoSelecionadoId("")
        setNomeProduto("")
    }

    //Função para atualizar o nome do produto no Firestore
    const atualizarNomeProduto = async () => {
        const user = auth.currentUser

        //validação para o usuário não salvar o item com nome em vazio
        if (!novoNomeProduto.trim()) {
            Alert.alert("Atenção", "Digite um novo válido para o produto.")
            return
        }

        try {
            //Realizar um referencia do produto(doc) especifico
            const produtoRef = doc(db, "usuarios", user?.uid, "produtos", produtoSelecionadoId)
            //Atualizar apensa o produto selecionado
            await updateDoc(produtoRef, { nomeProduto: novoNomeProduto.trim() })
            //Fecha o modal
            fecharModalEdicao()
            Alert.alert("Sucesso", "Produto editado com sucesso.")
        } catch (error) {
            console.log("Erro ao atualizar produto", error)
            Alert.alert("Error", "Não foi possível atualizar o produto.")
        }

    }



    return (
        <SafeAreaView style={styles.main}>
            <KeyboardAvoidingView //Componente que ajusta o layout automaticamente, isso para evitar que o 
                //teclado cubra os campos de entrada
                style={styles.main}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={10} //Desloca o conteúdo na vertical
            >
                <Text>Tela Home</Text>
                <Button title="Realizar logoff" onPress={realizarLogoff} />
                <Button title="Excluir Conta" color="red" onPress={excluirConta} />
                <Button title="Alterar Senha" onPress={() => router.push("/AlterarSenhaScreen")} />

                <FlatList
                    data={produtos}
                    style={styles.lista}
                    contentContainerStyle={styles.listaConteudo}
                    renderItem={({ item }) => (
                        <ItemLoja
                            nomeProduto={item.nomeProduto}
                            onDeletePress={() => excluirProduto(item)}
                            onEditPress={() => abrirModalEdicao(item)}
                        />
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>}
                />
                <Modal
                    visible={modalEditarVisivel}
                    transparent
                    animationType="slide"
                    onRequestClose={fecharModalEdicao}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitulo}>Atualizar Produto</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={novoNomeProduto}
                                onChangeText={(value) => setNovoNomeProduto(value)}
                                placeholder="Digite o novo nome do produto."
                            />
                            <View style={styles.modalButtonsContainer}>
                                <TouchableOpacity
                                    style={styles.modalButtonCancel}
                                    onPress={fecharModalEdicao}
                                >
                                    <Text>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modalButtonSave}
                                    onPress={atualizarNomeProduto}
                                >
                                    <Text
                                        style={styles.modalButtonSaveText}
                                    >
                                        Salvar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </Modal>

                <TextInput
                    placeholder="Digite o nome do Produto"
                    style={styles.input}
                    value={nomeProduto}
                    onChangeText={(value) => setNomeProduto(value)}
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
    },
    lista: {
        width: "100%",
        marginTop: 16,
        flex: 1,
    },
    listaConteudo: {
        gap: 8,
        paddingBottom: 12
    },
    emptyText: {
        textAlign: "center",
        fontSize: 22,
        marginTop: 20
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgb(0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    modalContainer: {
        width: "100%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 16,
        gap: 12
    },
    modalTitulo: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center"
    },
    modalInput: {
        backgroundColor: "lightgrey",
        borderRadius: 8,
        padding: 10,
        fontSize: 16
    },
    modalButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10
    },
    modalButtonCancel: {
        flex: 1,
        alignItems: "center",
        padding: 10,
        borderRadius: 8,
        backgroundColor: "lightgrey"
    },
    modalButtonSave: {
        flex: 1,
        alignItems: "center",
        padding: 10,
        borderRadius: 8,
        backgroundColor: "green"
    },
    modalButtonSaveText: {
        color: "white",
        fontWeight: "600"
    }


})