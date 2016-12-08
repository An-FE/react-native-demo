import React, { Component } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { Modal, ScrollView, RefreshControl, Slider, Image, Text, View, ListView, TouchableOpacity, TouchableHighlight, StyleSheet } from 'react-native';

import * as HomeAction from '../actions/homeAction';

import ViewPager from 'react-native-viewpager';

import * as Components from '../components/components';
// import SearchHeader from '../components/searchHeader'
// import HomeViewNav from '../components/homeViewNav'
// import HomeViewItem from '../components/homeViewItem'
// import Loading from '../components/loading'
// import ListItem from '../components/listItem'
// import NoContent from '../components/noContent'

const BANNER_IMGS = [
    { uri: 'https://img.alicdn.com/imgextra/i2/2406728216/TB22LVnkpXXXXcqXpXXXXXXXXXX_!!2406728216.jpg' },
    { uri: 'https://img.alicdn.com/imgextra/i2/2406728216/TB22LVnkpXXXXcqXpXXXXXXXXXX_!!2406728216.jpg' },
    { uri: 'https://img.alicdn.com/imgextra/i2/2406728216/TB22LVnkpXXXXcqXpXXXXXXXXXX_!!2406728216.jpg' },
    { uri: 'https://img.alicdn.com/imgextra/i2/2406728216/TB22LVnkpXXXXcqXpXXXXXXXXXX_!!2406728216.jpg' }
];

const ListView_Test_Array = ['商品1', '商品2', '商品3', '商品4'];

class Home extends Component {
    constructor(props, context) {
        super(props, context);

        // 用于构建DataSource对象  
        var dataSource = new ViewPager.DataSource({
            pageHasChanged: (p1, p2) => p1 !== p2,
        });
        let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        // 实际的DataSources存放在state中  
        this.state = {
            dataSource: dataSource.cloneWithPages(BANNER_IMGS),
            isRefreshing: false,
            modalVisible: false,
            LOADINGTIP: false,
            dataListViewTest: ds.cloneWithRows(ListView_Test_Array)
        }
        console.log(this.state);

    }
    homeTest(data) {
        this.props.homeTest(data)
    }
    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }
    _renderPage(data, pageID) {
        return (
            <Image source={data} style={styles.page} />
        );
    }
    _onRefresh() {
        this.setState({ isRefreshing: true }, function() {
            setTimeout(() => {
                this.setState({
                    isRefreshing: false,
                });
            }, 3000);
        });
    }
    render() {
        let _scrollView: ScrollView;

        return (
            <ScrollView
                ref={(scrollView) => { _scrollView = scrollView; } }
                onScroll={() => { console.log('onScroll!'); } }
                scrollEventThrottle={200}
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={this._onRefresh.bind(this)}
                        tintColor="#000"
                        title="Loading..."
                        titleColor="#000"
                        colors={['#ff0000', '#00ff00', '#0000ff']}
                        progressBackgroundColor="#ffff00"
                        />
                }
                >
                {
                    this.state.LOADINGTIP ? <Loading /> :
                        <View>
                            <Components.SearchHeader />

                            <ViewPager
                                dataSource={this.state.dataSource}
                                renderPage={this._renderPage}
                                isLoop={true}
                                autoPlay={true} />

                            <Components.HomeViewNav />
                            <Components.NoContent />
                            <Modal
                                animationType={"slide"}
                                transparent={false}
                                visible={this.state.modalVisible}
                                onRequestClose={() => { alert("Modal has been closed.") } }
                                >
                                <View style={{ marginTop: 22 }}>
                                    <View>
                                        <Text>随便写写!</Text>
                                        <Text>随便写写!</Text>
                                        <Text>随便写写!</Text>

                                        <TouchableHighlight onPress={() => {
                                            this.setModalVisible(!this.state.modalVisible)
                                        } }>
                                            <Text>Hide Modal</Text>
                                        </TouchableHighlight>

                                    </View>
                                </View>
                            </Modal>
                            <TouchableHighlight onPress={() => {
                                this.setModalVisible(true)
                            } }>
                                <Text>Show Modal</Text>
                            </TouchableHighlight>

                            <TouchableOpacity onPress={() => { this.homeTest('传入一个数据流到home') } }>
                                <Text>Test reducer</Text>
                            </TouchableOpacity>
                            <Text>{this.props.test}</Text>

                            <Components.HomeViewItem {...this.props} title="类别一" />
                            <Components.HomeViewItem {...this.props} title="类别二" />
                            <Components.HomeViewItem {...this.props} title="类别三" />

                            <ListView
                                dataSource={this.state.dataListViewTest}
                                renderRow={(rowData) => {
                                    return <Components.ListItem testVal={rowData} />;
                                } }
                                />

                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => { _scrollView.scrollTo({ y: 0 }); } }>
                                <Text>Scroll to top</Text>
                            </TouchableOpacity>

                        </View>
                }
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        margin: 7,
        padding: 5,
        alignItems: 'center',
        backgroundColor: '#eaeaea',
        borderRadius: 3,
    },
    page: {
        flex: 1,
        height: 150,
        resizeMode: 'stretch'
    }
});


function mapStateToProps(state) {
    console.log(state);
    let test = state.HomeRD.get('test');
    return {
        test: test
    };
}

function mapDispatchToProps(dispatch) {
    return {
        homeTest: bindActionCreators(HomeAction.homeTest, dispatch),
    };
}


Home = connect(mapStateToProps, mapDispatchToProps)(Home)

export default Home;
