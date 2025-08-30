import ScreenView from "@/components/Screen";
import { StatusBar } from 'expo-status-bar';
import { useState } from "react";
import { Text, View } from "react-native";

import SignUpComponent from "@/components/Login/SignUp";

export default function Index(){
    const [isSigningUp, setIsSigningUp] = useState(false);

    return(
        <ScreenView>
            <StatusBar style="light" />
            <View style={{paddingTop:170, alignContent: 'center', borderRadius: 10, paddingLeft: 16, paddingBottom:60}}>
                <Text style={{color: 'white', fontSize:40, fontWeight: 'bold'}}>Bienvenido!</Text>
                <Text style={{color: 'white', fontSize:30, fontWeight: 'bold'}}>{isSigningUp ? 'Por favor regístrate' : 'Por favor inicia sesión'}</Text>
             </View>
            <SignUpComponent isSigningUp={isSigningUp} setIsSigningUp={setIsSigningUp} />
        </ScreenView>
    )
}