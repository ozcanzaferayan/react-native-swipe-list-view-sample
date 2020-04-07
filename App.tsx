import React, {useState} from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  YellowBox,
  ListRenderItemInfo,
  Alert,
} from 'react-native';

import {SwipeListView} from 'react-native-swipe-list-view';

// https://github.com/jemise111/react-native-swipe-list-view/issues/388#issuecomment-569953860
YellowBox.ignoreWarnings([
  'Sending `onAnimatedValueUpdate` with no listeners registered.',
]);

interface AnimValue {
  [key: string]: Animated.Value;
}

interface SwipeValue {
  key: string;
  value: number;
  direction: 'left' | 'right';
  isOpen: boolean;
}
interface Fruit {
  key: string;
  name: string;
  isArchived: boolean;
}

export const colorBackground = '#ffffff';
export const colorText = '#000000';
export const colorHighlight = '#e5e5e5';
export const colorDanger = '#e91e63';
export const colorInfo = '#2196f3';
export const colorWarning = '#ffeb3b';
export const colorSuccess = '#4caf50';
export const colorDangerText = '#660000';
export const colorInfoText = '#0000cc';
export const colorWarningText = '#8e5500';
export const colorSuccessText = '#004c45';

export const rowHeight = 58;
export const backButtonWidth = 75;
export const openWidth = backButtonWidth * 2;
export const fontSize = 18;
export const padding = 18;
export const imageSize = 32;
export const badgeFontSize = 12;
export const badgeSize = 24;
export const borderRadius = 99999;

const App = () => {
  const [fruits, setFruits] = useState<Fruit[]>(
    [
      'Apple',
      'Avocado',
      'Banana',
      'Blueberry',
      'Coconut',
      'Durian',
      'Guava',
      'Kiwifruit',
      'Jackfruit',
      'Mango',
      'Olive',
      'Pear',
      'Sugar-apple',
    ].map((v) => {
      return {name: v, key: v, isArchived: false};
    }),
  );

  let animationIsRunning = false;

  const animValues: AnimValue = {};
  Array(fruits.length)
    .fill('')
    .forEach((_, i) => {
      animValues[`${i}`] = new Animated.Value(1);
    });

  const handleArchive = (swipeData: SwipeValue) => {
    const {key, value} = swipeData;
    console.log(swipeData);
    if (value >= Dimensions.get('window').width / 2 && !animationIsRunning) {
      animationIsRunning = true;
      const itemIndex = fruits.findIndex((v) => v.key === key);
      Animated.timing(animValues[itemIndex], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        const newData = [...fruits];
        const fruit = {...fruits[itemIndex], isArchived: true};
        newData[itemIndex] = fruit;
        setFruits(newData);
        animationIsRunning = false;
        console.log(`${key} sepete atıldı`);
      });
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      `${item.name} silinecek`,
      `${item.name} meyvesini silmek istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Sil',
          onPress: () => {
            const newFruits = [...fruits];
            const index = newFruits.findIndex((v) => v.name === item.name);
            newFruits.splice(index, 1);
            setFruits(newFruits);
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  };

  const handleDuplicate = (fruit: any) => {
    const newFruits = [...fruits];
    const numOfSameFruit = fruits.reduce(
      (i, v) => (v.name.startsWith(fruit.name) ? ++i : i),
      0,
    );
    const newFruitName = `${fruit.name} ${numOfSameFruit}`;
    newFruits.push({
      name: newFruitName,
      key: newFruitName,
      isArchived: false,
    });
    setFruits(newFruits);
  };

  const handleUnarchive = () => {
    const archivedCount = fruits.filter((v) => v.isArchived).length;
    Alert.alert(
      'Sepetten çıkarma',
      `${archivedCount} adet meyveyi sepetten çıkarmak istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Çıkar',
          onPress: () => {
            const newFruits = fruits.map((v) => {
              return {...v, isArchived: false};
            });
            setFruits(newFruits);
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  };

  const renderItem = ({item, index}: ListRenderItemInfo<Fruit>) => {
    return (
      <Animated.View
        style={{
          height: animValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, rowHeight],
          }),
        }}>
        <TouchableHighlight
          style={styles.rowFront}
          underlayColor={colorHighlight}
          onPress={() => console.log(item)}>
          <Text style={styles.frontText}>{item.name}</Text>
        </TouchableHighlight>
      </Animated.View>
    );
  };

  const renderHiddenItem = ({item}: ListRenderItemInfo<Fruit>) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backLeftBtn, styles.warningBtn]}
        onPress={() => console.log(item)}>
        <Image
          source={require('./img/archive.png')}
          style={styles.warningImage}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.infoBtn]}
        onPress={() => handleDuplicate(item)}>
        <Image source={require('./img/copy.png')} style={styles.infoImage} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.dangerBtn]}
        onPress={() => handleDelete(item)}>
        <Image source={require('./img/bin.png')} style={styles.dangerImage} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Text style={styles.textHeader}>Meyve listesi</Text>
      <SwipeListView
        data={fruits.filter((fruit) => !fruit.isArchived)}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        onSwipeValueChange={handleArchive}
        keyExtractor={(item) => item.key}
        rightOpenValue={-openWidth}
        stopLeftSwipe={Dimensions.get('window').width / 2}
        stopRightSwipe={-openWidth}
      />
      {fruits.filter((v) => v.isArchived).length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleUnarchive}>
          <Image
            source={require('./img/archive.png')}
            style={styles.floatingButtonImg}
          />
          <View style={styles.floatingButtonBadge}>
            <Text style={styles.floatingButtonBadgeText}>
              {fruits.filter((v) => v.isArchived).length}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  textHeader: {
    fontSize: fontSize * 2,
    marginBottom: 0,
    marginStart: padding,
    marginTop: padding * 2,
    fontWeight: 'bold',
  },
  rowFront: {
    justifyContent: 'center',
    padding: padding,
    backgroundColor: colorBackground,
    borderBottomColor: colorHighlight,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  frontText: {
    color: colorText,
    fontSize: fontSize,
  },
  rowBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colorBackground,
    flexDirection: 'row',
    paddingHorizontal: padding,
  },
  backTextNeutral: {
    color: colorInfoText,
    fontSize: fontSize,
  },
  backTextDanger: {
    color: colorText,
    fontSize: fontSize,
  },
  backTextWarning: {
    color: colorWarningText,
    fontSize: fontSize,
  },
  backTextSuccess: {
    color: colorSuccessText,
    fontSize: fontSize,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: backButtonWidth,
  },
  infoBtn: {
    backgroundColor: colorInfo,
    right: backButtonWidth,
  },
  dangerBtn: {
    backgroundColor: colorDanger,
    right: 0,
  },
  backLeftBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: '50%',
  },
  successBtn: {
    backgroundColor: colorSuccess,
    left: backButtonWidth,
  },
  warningBtn: {
    backgroundColor: colorWarning,
    left: 0,
  },
  warningImage: {
    width: imageSize,
    height: imageSize,
    tintColor: colorText,
  },
  dangerImage: {
    width: imageSize,
    height: imageSize,
    tintColor: colorBackground,
  },
  infoImage: {
    width: imageSize,
    height: imageSize,
    tintColor: colorBackground,
  },
  floatingButton: {
    position: 'absolute',
    bottom: padding * 2,
    end: padding,
    padding: padding,
    backgroundColor: colorWarning,
    borderRadius: borderRadius,
  },
  floatingButtonImg: {
    width: imageSize,
    height: imageSize,
    tintColor: colorText,
  },
  floatingButtonBadge: {
    position: 'absolute',
    top: 0,
    end: 0,
    backgroundColor: colorDanger,
    borderRadius: borderRadius,
    width: badgeSize,
    height: badgeSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonBadgeText: {
    fontSize: badgeFontSize,
    color: colorBackground,
    textAlign: 'center',
  },
});

export default App;
