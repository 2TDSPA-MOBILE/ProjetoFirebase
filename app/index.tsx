import { Link } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from "../src/services/firebaseConfig"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registrarUltimoLogin } from '../src/services/userDataService';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  // Estados para armazenar os valores digitados
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const router = useRouter()//Hook de navegação

  //Hook do i18next que fornece a função "t" para buscar tradução
  const { t, i18n } = useTranslation()

  //Verifica se há persistência no Async Storage
  useEffect(() => {
    const verificarUsuarioLogado = async () => {
      try {
        const usuarioSalvo = await AsyncStorage.getItem("@user")
        if (usuarioSalvo) {
          router.replace("/Home")
        }
      } catch (error) {
        console.log("Error ao verificar login: ", error)
      }
    }
    verificarUsuarioLogado()//Chama a função para verificar se o usuário está logado.
  }, [])

  // Função para simular o envio do formulário
  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }
    signInWithEmailAndPassword(auth, email, senha)
      .then(async (userCredential) => {
        // Signed in 
        const user = userCredential.user;
        //Atualiza o campo de último login no doc do usuario/{uid}
        await registrarUltimoLogin(user.uid, user.email)

        //Salvando o usuário no AsyncStorage
        await AsyncStorage.setItem("@user", JSON.stringify(user))
        //Redericionar para a tela home
        router.replace("/Home")
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage)
        Alert.alert("ATENÇÃO", "Credenciais Inválidas, verifique e-mail e senha:", [
          { text: "OK" }
        ])
      });
  };

  const esqueceuSenha = () => {
    if (!email) {
      Alert.alert("Error", "Digite seu e-mail para recuperar a senha.")
    }
    //Função para redefinir a senha do usuário
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert("Sucesso", "E-mail de redefinição enviado!")
      })
      .catch((error) => {
        console.log("Error ao enviado e-mail de redefinição", error.message)
        Alert.alert("Error", "E-mail de redefinição NÃO enviado.")
      })
  }

  //Função para alterar o idioma
  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang)
  }
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{t("welcome")}</Text>


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
        placeholder={t("password")}
        placeholderTextColor="#aaa"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {/* Botão */}
      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        <Text style={styles.textoBotao}>Login</Text>
      </TouchableOpacity>

      <View style={{alignItems:"center"}}>
        <Link href="CadastrarScreen" style={{ marginTop: 20, color: 'white' }}>{t("register")}</Link>

        <TouchableOpacity onPress={esqueceuSenha}>
          <Text style={{ marginTop: 20, color: 'white' }}>{t("forgotpassword")}</Text>
        </TouchableOpacity>
      </View>



      <View style={{ alignItems: "center", marginTop: 30 }}>
        <Text style={{ color: "white", fontSize: 20 }}>{t("chooselanguage")}</Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 30 }}>
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: "blue", width: 100 }]}
          onPress={() => mudarIdioma("en")}
        > <View style={{ flexDirection: 'row' }}>

            <Image
              source={require("../assets/eua.png")}
              style={{ width: 50, height: 50 }}
            />
          </View>

        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, { width: 100 }]}
          onPress={() => mudarIdioma("pt")}
        >
          <Image
            source={require("../assets/brasil.png")}
            style={{ width: 50, height: 50 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: "orange", width: 100 }]}
          onPress={() => mudarIdioma("es")}
        >
          <Image
            source={require("../assets/espanha.png")}
            style={{ width: 50, height: 50 }}
          />
        </TouchableOpacity>
      </View>
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
