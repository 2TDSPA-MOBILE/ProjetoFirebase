import { addDoc,collection,doc,serverTimestamp,setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";


type UsuarioBase = {
    uid:string;
    email:string|null
}

//Cria(ou atualizar) o perfil do usuário/{uid}
export async function criarPerfilUsuario(params:UsuarioBase & {nome?:string}) {
    const{uid,email,nome} = params

    //Payload principal do perfil, o merge true evita sobrescrever campos existentes.
    const data:Record<string,unknown>={
        uid,
        email,
        atualizadoEm:serverTimestamp(),
        criadoEm:serverTimestamp()
    }

    //Nome é opcional para permitir reuso da função em outro fluxos
    if(nome){
        data.nome=nome
    }

    //Documento único por usuário, usando o próprio uid como id do doc
    await setDoc(doc(db,"usuarios",uid),data,{merge:true})

}

//Registrar o último login do usuário no mesmo documento de perfil
export async function registrarUltimoLogin(uid:string,email:string|null) {
    await setDoc(doc(db,"usuarios",uid),
    {
        uid,
        email,
        ultimoLoginEm:serverTimestamp(),
        atualizadoEm:serverTimestamp()
    },
    {merge:true}
    )
}

//Função para salvar o produto na subcoleção do usuário: usuarios/{uid}/produtos
export async function salvarProdutoUsuario(uid:string,nomeProduto:string) {
    await addDoc(collection(db,"usuarios",uid,"produtos"),{
        nomeProduto,
        criadoEm:serverTimestamp()
    })
}