# Ymaps-list

**Ymaps-list** это прагин для создания карты с произвольным набором меток.

Плагин использует [API Яндекс.Карт](https://tech.yandex.ru/maps/) версии 2.1.

Плагин может создавать не только карту, но и дополнительно может создать текстовый список меток, который будет связан с метками на карте.

## Demo

[Демо]()

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

<table>
    <thead>
    <tr>
        <th>Опция</th>
        <th>Тип</th>
        <th>Значение по умолчанию</th>
        <th>Обязательно</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>**data**</td>
        <td>Array</td>
        <td>null</td>
        <td>Да</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Данные меток в виде массива объектов. Обязательные параметры метки: `id: 'string'`, `name: 'string'`, `coords: [широта, долгота]`. Остальные параметры опциональны, могут иметь любое название и быть в любом кол-ве. **Важно** чтобы у каждой метки был одинаковый набор параметров. Порядок вывода параметров указывается в опции `dataOrder`.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**dataOrder**</td>
        <td>Array</td>
        <td>-</td>
        <td>Да</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Массив, в котором указывается порядок вывода параметров метки, например: `['address', 'phone', 'email', 'description']`. В массиве указываются именно названия свойств, которые указаны у метки в `data`.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**container**</td>
        <td>String</td>
        <td>-</td>
        <td>Да</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            ID родительского контейнера в виде строки, например `ymaps`.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**mapContainer**</td>
        <td>String</td>
        <td>-</td>
        <td>Да</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            ID контейнера карты в виде строки, например `ymaps-map`.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**mapCenter**</td>
        <td>Array</td>
        <td>-</td>
        <td>Да</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Координаты дефолтного центра карты в виде массива координат `[широта, долгота]`.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**list**</td>
        <td>Boolean</td>
        <td>false</td>
        <td>Нет</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Строить текстовый список меток или нет.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**listContainer**</td>
        <td>String</td>
        <td>-</td>
        <td>Нет</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            ID контейнера списка в виде строки, например `ymaps-list`. Обязательно только если `list: true`.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**listScroll**</td>
        <td>Boolean или function</td>
        <td>false</td>
        <td>Нет</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Если `list: true` и `listScroll: false`, то проскролливание к активному элементу списка происходит с помощью `jQuery.scrollTop()` и подсчет позиции активного элемента. Если `list: true` и `listScroll: function($listContainer, $activeListItem) {}`, то можно описать свой механизм проскролливания, например в случае использования кастомного скроллбара. В функцию передается элемент контейнера списка и активный элемент спсика.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**switchContainer**</td>
        <td>String</td>
        <td>false</td>
        <td>Нет</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            ID контейнера с переключателями карта/список в виде строки, например `ymaps-switch`.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**cluster**</td>
        <td>Object или Boolean</td>
        <td>{}</td>
        <td>Нет</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Объект, который содержит настройки кластера. Если `cluster: false`, то кластеризация меток не происходит.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**cluster.icons**</td>
        <td>Array</td>
        <td>`['islands#invertedRedClusterIcons', 'islands#invertedBlueClusterIcons']`</td>
        <td>Нет</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Массив, который содержит настройки иконок кластера. Первым элементом указывается дефолтная иконка, вторым элементом указывается активная иконка. В качестве значений можно использовать [уже существующийе иконки](https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml) в Яндкс.Картах. Если требуется задать кастомные иконки кластера, то первым элементом указывается массив из 2-х объектов для дефолтной иконки, вторым элементом указывается массив из 2-х объектов для активной иконки см. [пример](https://tech.yandex.ru/maps/jsbox/2.1/clusterer_custom_icon).
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**placemark**</td>
        <td>Object</td>
        <td>{}</td>
        <td>Да</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Объект, который содержит настройки меток.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**placemark.icons**</td>
        <td>Array</td>
        <td>`['islands#redDotIcon', 'islands#blueDotIcon']`</td>
        <td>Нет</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Массив, который содержит настройки иконок меток. Первым элементом указывается дефолтная иконка, вторым элементом указывается активная иконка. В качестве значений можно использовать [уже существующийе иконки](https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml) в Яндкс.Картах. Если требуется задать кастомные иконки меток, то первым элементом указывается объект для дефолтной иконки, вторым элементом указывается объект для активной иконки, например `{href: 'pin.svg', size: [40, 50], offset: [-20, -50]}, {href: 'pin-active.svg', size: [40, 50], offset: [-20, -50]}`
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**balloonBeforeBreakpoint**</td>
        <td>Boolean</td>
        <td>false</td>
        <td>Нет</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Показывать ли балун метки на разрешениях `< adaptiveBreakpoint`.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**balloonAfterBreakpoint**</td>
        <td>Boolean</td>
        <td>false</td>
        <td>Нет</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Показывать ли балун метки на разрешениях `> adaptiveBreakpoint`.
        </td>
    </tr>
    </tbody>
    <tbody>
    <tr>
        <td>**adaptiveBreakpoint**</td>
        <td>Number</td>
        <td>1024</td>
        <td>Нет</td>
    </tr>
    <tr>
        <td colspan="4">
            **Описание**

            Брейкпоинт, на котором происходит перестроение связки карта-список. Если разрешение `< adaptiveBreakpoint`, то становится видимым переключатель карта-список и соответственно отображается либо карта, либо список. Если разрешение `> adaptiveBreakpoint`, то карта и список видны обновременно, а переключатель скрывается.
        </td>
    </tr>
    </tbody>
</table>