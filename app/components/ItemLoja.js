import { StyleSheet, View, Text,Pressable } from "react-native";
import {AntDesign,MaterialIcons} from "@expo/vector-icons"

export default function ItemLoja({nomeProduto,onDeletePress,onEditPress}){
    return(
        <View style={styles.container}>
            <Pressable onPress={onEditPress}>
                <MaterialIcons name="edit" color="orange" size={24}/>
            </Pressable>
            <Text style={styles.title}>{nomeProduto}</Text>
            <Pressable onPress={onDeletePress}>
                <MaterialIcons name="delete" size={24} color="red"/>
            </Pressable>    
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flexDirection:"row",
        backgroundColor:"lightgrey",
        justifyContent:"space-between",
        alignItems:"center",
        padding:10,
        width:"90%",
        alignSelf:"center",
        borderRadius:10
    },
    title:{
        flex:1,
        marginLeft:10,
        fontSize:17,
        fontWeight:500
    }
})