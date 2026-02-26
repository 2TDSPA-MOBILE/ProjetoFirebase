import { Link } from 'expo-router';
import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from "../services/firebaseConfig"
import { signInWithEmailAndPassword,sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  // Estados para armazenar os valores digitados

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const router = useRouter()//Hook de navegação

  //Verifica se há persistência no Async Storage
  useEffect(()=>{
    const verificarUsuarioLogado = async() =>{
      try{
        const usuarioSalvo = await AsyncStorage.getItem("@user")
        if(usuarioSalvo){
          router.replace("/Home")
        }
      }catch(error){
        console.log("Error ao verificar login: ",error)
      }
    }
    verificarUsuarioLogado()//Chama a função para verificar se o usuário está logado.
  },[])

  // Função para simular o envio do formulário
  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }
    signInWithEmailAndPassword(auth, email, senha)
      .then(async(userCredential) => {
        // Signed in 
        const user = userCredential.user;
        //Salvando o usuário no AsyncStorage
        await AsyncStorage.setItem("@user",JSON.stringify(user))
        //Redericionar para a tela home
        router.replace("/Home")
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode,errorMessage)
        Alert.alert("ATENÇÃO","Credenciais Inválidas, verifique e-mail e senha:",[
          {text:"OK"}
        ])
      });
  };

  const esqueceuSenha = ()=>{
    if(!email){
      Alert.alert("Error","Digite seu e-mail para recuperar a senha.")
    }
    //Função para redefinir a senha do usuário
    sendPasswordResetEmail(auth,email)
      .then(()=>{
        Alert.alert("Sucesso","E-mail de redefinição enviado!")
      })
      .catch((error)=>{
        console.log("Error ao enviado e-mail de redefinição", error.message)
        Alert.alert("Error","E-mail de redefinição NÃO enviado.")
      })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Realizar login</Text>


      {/* Campo Email */}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Campo Senha */}
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {/* Botão */}
      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        <Text style={styles.textoBotao}>Login</Text>
      </TouchableOpacity>

      <Link href="CadastrarScreen" style={{ marginTop: 20, color: 'white', marginLeft: 150 }}>Cadastre-se</Link>

      <TouchableOpacity onPress={esqueceuSenha}>
        <Text style={{ marginTop: 20, color: 'white', marginLeft: 130}}>Esqueceu a senha</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilização
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  botao: {
    backgroundColor: '#00B37E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
