
import { View } from "react-native";

import React from "react";

export default function ScreenView({children}: React.PropsWithChildren<{}>){
  return(
    <View style={{ flex: 1, backgroundColor: "#5b2f24" }}>
      {children}
    </View>
  )
}

