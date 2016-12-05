import React, {Component} from 'react';
import {StatusBar,StyleSheet,Text,View,Image,ScrollView,TabBarIOS,NavigatorIOS,Navigator} from 'react-native';

// import Home from './views/home.js'
// import Classify from './views/classify.js'
// import Cart from './views/cart.js'
// import Personal from './views/personal.js'

import Welcome from './welcome/welcome'

class Root extends Component {
	constructor(props){
		super(props)
		// this.state = {
		// 	tab: 'home'
		// }
		console.log(this.props)
	}
	_selectTab(tabName){
		this.setState({
			tab:tabName
		})
	}
	_addNavigator(component,title){
		return <NavigatorIOS 
			initialRoute={{
	          component: component,
	          title: title,
	          rightButtonTitle: '搜索',
	          onRightButtonPress: ()=>{
	          	alert('搜索框')
	          },
	          passProps: {}
	        }}
	        style={{flex: 1}}
	        barTintColor="#fff"
	        navigationBarHidden={false}
	        tintColor="#000"
        />
	}
	// render(){
	// 	return (
	// 		<View style={styles.flex}>
	// 			<StatusBar
	// 				backgroundColor='#ff0000'
	// 				translucent={true}
	// 				hidden={false}
	// 				animated={true}      
	// 			/>
	// 			<TabBarIOS tintColor="#fff" barTintColor="#000" translucent={true} style={styles.flex}>
	// 				<TabBarIOS.Item badge='1' icon={require("../res/message.png")} title="首页" onPress={this._selectTab.bind(this, 'home')} selected={this.state.tab === 'home'}>
	// 					{this._addNavigator(Home,'主页')}
	// 				</TabBarIOS.Item>
	// 				<TabBarIOS.Item title="分类" icon={require("../res/phone.png")} onPress={this._selectTab.bind(this, 'classify')} selected={this.state.tab === 'classify'}>
	// 					{this._addNavigator(Classify,'分类')}
	// 				</TabBarIOS.Item>
	// 				<TabBarIOS.Item title="购物车" icon={require("../res/star.png")} onPress={this._selectTab.bind(this, 'cart')} selected={this.state.tab === 'cart'}>
	// 					{this._addNavigator(Cart,'购物车')}
	// 				</TabBarIOS.Item>
	// 				<TabBarIOS.Item title="个人中心" icon={require("../res/star.png")} onPress={this._selectTab.bind(this, 'personal')} selected={this.state.tab === 'personal'}>
	// 					{this._addNavigator(Personal,'个人中心')}
	// 				</TabBarIOS.Item>
	// 			</TabBarIOS>
	// 		</View>
	// 	)
	// }

	render(){
		return (
			<View style={{flex: 1}}>
                <StatusBar
                    barStyle='light-content'
                    backgroundColor='transparent'
                    translucent={true}
                />
                <Navigator
                    initialRoute={{name: 'Welcome', component: Welcome}}
                    configureScene={()=>{
                        return  Navigator.SceneConfigs.PushFromRight;
                    }}
                    renderScene={(route, navigator) => {
                        let Component = route.component;
                        return (
                            <Component navigator = {navigator} route = {route} {...route.passProps} />
                        )
                    }}
                />
            </View>
		)
	}
}

const styles = StyleSheet.create({
	flex: {
		flex: 1
	},
	message: {
		alignItems: 'center',
		marginLeft: 5,
		marginRight: 5
	},
	message_title: {
		fontSize: 18,
		color: '#18B5FF',
		marginBottom: 5
	},
	list: {
		height: 30,
		fontSize: 15,
		marginLeft: 10,
		marginTop: 10
	}
})

export default Root;





