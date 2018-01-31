# Ymaps-list

**Ymaps-list** это плагин для создания карты с произвольным набором меток.

Плагин использует [API Яндекс.Карт](https://tech.yandex.ru/maps/) версии 2.1.

Плагин может создавать не только карту, но и дополнительно может создать текстовый список меток, который будет связан с метками на карте.

## Demo

[Демо](http://daer-ru.github.io/ymaps-list/)

## Подключение

В html файле необходимо подключить jQuery, API Яндкс.Карт и js файл плагина:

```html
<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>

<script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>

<script src="ymaps-list.js" type="text/javascript"></script>
```

В head необходимо подключить css файлы плагина:

```html
<!-- Подключение ymaps-list.base.css обязательно -->
<link href="ymaps-list.base.css" rel="stylesheet">
<!-- Подключайте ymaps-list.theme.css если вам нужна базовая стилизация -->
<link href="ymaps-list.theme.css" rel="stylesheet">
```

### Разметка

В html необходимо подготовить разметку:

```html
<!-- id всех элементов вы можете задать любые, class всех элементов должны быть строго такими -->
<div id="ymaps" class="ylist">
    <div id="ymaps-switch" class="ylist__switch">
        <!-- В качестве переключателей можно использовать любые элементы, но у них обязательно должен быть указан data-ylist-switch -->
        <button type="button" data-ylist-switch="list">Список</button>
        <button type="button" data-ylist-switch="map">Карта</button>
    </div>
    <div id="ymaps-list" class="ylist__list-container"></div>
    <div id="ymaps-map" class="ylist__map-container"></div>
</div>
```

### Настройки

Опция | Тип | Значение по умолчанию | Обязательно | Описание
----- | --- | --------------------- | ----------- | --------
**data** | Array | null | Да | Данные меток в виде массива объектов. Обязательные параметры метки: `id: 'string'`, `name: 'string'`, `coords: [широта, долгота]`. Остальные параметры опциональны, могут иметь любое название и быть в любом кол-ве. **Важно** чтобы у каждой метки был одинаковый набор параметров. Порядок вывода параметров указывается в опции `dataOrder`.
**dataOrder** | Array | - | Да | Массив, в котором указывается порядок вывода параметров метки, например: `['address', 'phone', 'email', 'description']`. В массиве указываются именно названия свойств, которые указаны у метки в `data`.
**container** | String | - | Да | ID родительского контейнера в виде строки, например `ymaps`.
**mapContainer** | String | - | Да | ID контейнера карты в виде строки, например `ymaps-map`.
**mapCenter** | Array | - | Да | Координаты дефолтного центра карты в виде массива координат `[широта, долгота]`.
**list** | Boolean | false | Нет | Строить текстовый список меток или нет. 
**listContainer** | String | - | Нет | ID контейнера списка в виде строки, например `ymaps-list`. Обязательно только если `list: true`.
**listScroll** | Boolean или function | false | Нет | Если `list: true` и `listScroll: false`, то проскролливание к активному элементу списка происходит с помощью `jQuery.scrollTop()` и подсчет позиции активного элемента. Если `list: true` и `listScroll: function($listContainer, $activeListItem) {}`, то можно описать свой механизм проскролливания, например в случае использования кастомного скроллбара. В функцию передается элемент контейнера списка и активный элемент спсика.
**switchContainer** | String | false | Нет | ID контейнера с переключателями карта/список в виде строки, например `ymaps-switch`.
**cluster** | Object или Boolean | {} | Нет | Объект, который содержит настройки кластера. Если `cluster: false`, то кластеризация меток не происходит.
**cluster.icons** | Array | `['islands#invertedRedClusterIcons', 'islands#invertedBlueClusterIcons']` | Нет | Массив, который содержит настройки иконок кластера. Первым элементом указывается дефолтная иконка, вторым элементом указывается активная иконка. В качестве значений можно использовать [уже существующийе иконки](https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml) в Яндкс.Картах. Если требуется задать кастомные иконки кластера, то первым элементом указывается массив из 2-х объектов для дефолтной иконки, вторым элементом указывается массив из 2-х объектов для активной иконки см. [пример](https://tech.yandex.ru/maps/jsbox/2.1/clusterer_custom_icon).
**placemark** | Object | {} | Да | Объект, который содержит настройки меток.
**placemark.icons** | Array | `['islands#redDotIcon', 'islands#blueDotIcon']` | Нет | Массив, который содержит настройки иконок меток. Первым элементом указывается дефолтная иконка, вторым элементом указывается активная иконка. В качестве значений можно использовать [уже существующийе иконки](https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml) в Яндкс.Картах. Если требуется задать кастомные иконки меток, то первым элементом указывается объект для дефолтной иконки, вторым элементом указывается объект для активной иконки, например `{href: 'pin.svg', size: [40, 50], offset: [-20, -50]}, {href: 'pin-active.svg', size: [40, 50], offset: [-20, -50]}`
**placemark.clicked** | Boolean | true | Нет | Указывает кликабельны метки на карте или нет.
**balloonBeforeBreakpoint** | Boolean | false | Нет | Показывать ли балун метки на разрешениях `< adaptiveBreakpoint`.
**balloonAfterBreakpoint** | Boolean | false | Нет | Показывать ли балун метки на разрешениях `> adaptiveBreakpoint`.
**adaptiveBreakpoint** | Number | 1024 | Нет | Брейкпоинт, на котором происходит перестроение связки карта-список. Если разрешение `< adaptiveBreakpoint`, то становится видимым переключатель карта-список и соответственно отображается либо карта, либо список. Если разрешение `> adaptiveBreakpoint`, то карта и список видны обновременно, а переключатель скрывается.

## Building

1. Установить [Node.js](https://nodejs.org)
2. Установить [Yarn](https://yarnpkg.com)
3. Установить зависимости
```bash
yarn install
```
4. Запустить сборку
```bash
npm start
```