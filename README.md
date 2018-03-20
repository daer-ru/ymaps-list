# Ymaps-list

[![npm version](https://badge.fury.io/js/ymaps-list.svg)](https://badge.fury.io/js/ymaps-list)

**Ymaps-list** это плагин для создания карты с произвольным набором меток.

Плагин использует [API Яндекс.Карт](https://tech.yandex.ru/maps/) версии 2.1.

Плагин может создавать не только карту, но и дополнительно может создать текстовый список меток, который будет связан с метками на карте.

## Demo

[Демо](http://daer-ru.github.io/ymaps-list/)

## Package Managers

```bash
# NPM
npm install ymaps-list

# YARN
yarn add ymaps-list
```

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

Настройка и инициализация:

```javascript
var data = [
    {
        "id": "id-1",
        "name": "Элемент списка №1",
        "coords": [55.790464, 37.530409],
        "address": "Ходынский бульвар, д. 4",
        "phone": "8 (999) 999-99-99",
        "email": "email@domain.com",
        "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis illo perferendis quaerat."
    },
    {
        "id": "id-2",
        "name": "Элемент списка №2",
        "coords": [55.861954, 37.687713],
        "address": "ул. Дудинка, д. 3",
        "phone": "8 (999) 999-99-99",
        "email": "email@domain.com",
        "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis illo perferendis quaerat."
    }
];

var myYmaps = new Ylist({
    data: data,
    dataOrder: [
        'name',
        'address',
        'phone',
        'email',
        'description'
    ],
    dataExtension: {
        address: function(address, pointData) {
            let extendedAddress = `<p class="ylist__address">${address}</p>`;
            return extendedAddress;
        },
        phone: function(phone, pointData) {
            let phoneLink = phone.replace(/[\ \-\(\)']+/g, '');
            let extendedPhone = `<p class="ylist__phone"><a href="tel:${phoneLink}">${phone}</a></p>`;
            return extendedPhone;
        },
        email: function(email, pointData) {
            let extendedEmail = `<p class="ylist__email"><a href="mailto:${email}">${email}</a></p>`;
            return extendedEmail;
        },
        description: function(description, pointData) {
            let extendedDescription = `<p class="ylist__description">${description}</p>`;
            return extendedDescription;
        },
    },
    container: 'ymaps',
    map: {
        center: [55.751574, 37.573856],
        customize: {
            state: {
                zoom: 4
            },
            options: {
                nativeFullscreen: true
            },
            controls: [
                {
                    constructor: 'ZoomControl',
                    options: {
                        size: 'small',
                        position: {
                            top: 10,
                            right: 10
                        }
                    }
                },
                {
                    constructor: 'FullscreenControl',
                    options: {
                        position: {
                            bottom: 10,
                            left: 10
                        }
                    }
                }
            ]
        },
        container: 'ymaps-map',
        drag: {
            disableOnTouch: true,
            disableAlways: false
        },
        dragTooltip: {
            active: true,
            text: 'Чтобы переместить карту, проведите по ней двумя пальцами'
        },
        filterTooltip: {
            active: true,
            text: 'Совпадений не найдено'
        }
    },
    list: {
        active: true,
        container: 'ymaps-list',
        scroll: false,
        header: true,
        clickElement: 'my-element',
        itemWrapper: 'list-item-wrapper',
        modifier: 'ylist-list--delivery'
    },
    switchContainer: 'ymaps-switch',
    cluster: {
        icons: [
            [
                {
                    href: 'img/pin_empty.svg',
                    size: [40, 50],
                    offset: [-20, -30]
                },
                {
                    href: 'img/pin_empty.svg',
                    size: [60, 75],
                    offset: [-30, -37]
                }
            ],
            [
                {
                    href: 'img/pin_empty_active.svg',
                    size: [40, 50],
                    offset: [-20, -30]
                },
                {
                    href: 'img/pin_empty_active.svg',
                    size: [60, 75],
                    offset: [-30, -37]
                }
            ]
        ],
        inlineStyle: 'color: #fff; padding-left: 2px; text-align: center; font: bold 16px/44px Helvetica, Helvetica CY, Arial, Nimbus Sans L, sans-serif;'
    },
    placemark: {
        icons: [
            {
                href: 'img/pin.svg',
                size: [40, 50],
                offset: [-20, -50]
            },
            {
                href: 'img/pin_active.svg',
                size: [40, 50],
                offset: [-20, -50]
            }
        ],
        clicked: false
    },
    balloon: {
        activeBeforeBreakpoint: true,
        activeAfterBreakpoint: true,
        closeButton: '<span>x</span>',
        header: true,
        modifier: 'ylist-balloon--delivery',
        mapOverflow: false
    },
    adaptiveBreakpoint: 1024
});

myYmaps.init();
```

### Настройки

**data**

*Тип:* `Array`

*Значение по умолчанию:* `null`

*Обязательно:* +

Данные меток в виде массива объектов. Обязательные параметры метки: `id: 'string'`, `name: 'string'`, `coords: [широта, долгота]`. Из `name` формируется заголовок балуна и списка. Остальные параметры опциональны, могут иметь любое название и быть в любом кол-ве. **Важно** чтобы у каждой метки был одинаковый набор параметров. Порядок вывода параметров указывается в опции `dataOrder`.

```javascript
// Пример входящего массива данных
var data = [
    {
        "id": "id-1",
        "name": "Point №1",
        "coords": [55.790464, 37.530409],
        "address": "Moscow, Main street, 5",
        "phone": "8 (999) 999-99-99",
        "email": "email@domain.com",
        "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis illo perferendis quaerat."
    },
    // ...
];
```

---

**dataOrder** 

*Тип:* `Array`

*Значение по умолчанию:* -

*Обязательно:* +

Массив, в котором указывается порядок вывода параметров меткию. В массиве указываются именно названия свойств, которые указаны у метки в `data`.

```javascript
// ...
dataOrder: [
    'name',
    'address',
    'phone',
    'email',
    'description'
]
// ...
```

---

**dataExtension** 

*Тип:* `Object`

*Значение по умолчанию:* `{}`

*Обязательно:* -

В объекте указываются свойства с таким же именем, как в `dataOrder`. В каждом свойстве находится функция колбек, в которую первым аргументом передается в виде строки значение соответствующего свойства из `data`, вторым аргументом передается весь объект данных по метке. Например, `function(address, pointData) {}`. Функция должна возвращать строку.

```javascript
// ...
dataExtension: {
    address: function(address, pointData) {
        let extendedAddress = `<p class="ylist__address">${address}</p>`;
        return extendedAddress;
    },
    phone: function(phone, pointData) {
        let phoneLink = phone.replace(/[\ \-\(\)']+/g, '');
        let extendedPhone = `<p class="ylist__phone"><a href="tel:${phoneLink}">${phone}</a></p>`;
        return extendedPhone;
    }
}
// ...
```

---

**container**

*Тип:* `String`

*Значение по умолчанию:* -

*Обязательно:* +

ID родительского контейнера в виде строки, например `ymaps`.

---

**map**

*Тип:* `Object`

*Значение по умолчанию:* `{}`

*Обязательно:* -
 
Объект, который содержит настройки карты.

---

**map.container** 

*Тип:* `String`

*Значение по умолчанию:* -

*Обязательно:* +

ID контейнера карты в виде строки, например `ymaps-map`.

---

**map.center**

*Тип:* `Array`

*Значение по умолчанию:* -

*Обязательно:* +

Координаты дефолтного центра карты в виде массива координат `[широта, долгота]`.

---

**map.customize**

*Тип:* `Object` или `Boolean`

*Значение по умолчанию:* `false`

*Обязательно:* -

Объект пользовательских настроек карты. Содержит поля `state`, `options`, `controls`. См. [API Яндекс.Карт](https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Map-docpage/)

---

**map.customize.state**

*Тип:* `Object` или `Boolean`

*Значение по умолчанию:* `false`

*Обязательно:* -

Параметры карты. См. [API Яндекс.Карт](https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Map-docpage/) `state.*`

```javascript
// ...
map: {
    customize: {
        state: {
            zoom: 4
        }
    }
}
// ...
```

---

**map.customize.options**

*Тип:* `Object`

*Значение по умолчанию:* `{}`

*Обязательно:* -

Опции карты. См. [API Яндекс.Карт](https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Map-docpage/) `options.*`

```javascript
// ...
map: {
    customize: {
        options: {
            nativeFullscreen: true
        }
    }
}
// ...
```

---

**map.customize.controls**

*Тип:* `Array` или `Boolean`

*Значение по умолчанию:* `false`

*Обязательно:* -

Элементы управления картой. Массив объектов, где у объекта есть параметры `constructor` - название конструктора контрола из [API Яндекс.Карт](https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/control.ZoomControl-docpage/), например `ZoomControl`, `options` - опции конструктора контрола `parameters.options.*`. Пример см. в [Демо](https://daer-ru.github.io/ymaps-list/).

```javascript
// ...
map: {
    customize: {
        controls: [
            {
                constructor: 'ZoomControl',
                options: {
                    size: 'small',
                    position: {
                        top: 10,
                        right: 10
                    }
                }
            },
            {
                constructor: 'FullscreenControl',
                options: {
                    position: {
                        bottom: 10,
                        left: 10
                    }
                }
            }
        ]
    }
}
// ...
```

---

**map.drag**

*Тип:* `Object`

*Значение по умолчанию:* `{}`

*Обязательно:* -

Объект, который содержит настройки включения/выключения опции drag карты.

---

**map.drag.disableOnTouch**


*Тип:* `Boolean`

*Значение по умолчанию:* `true`

*Обязательно:* -

Включение/выключение опции drag карты на touch устройствах.

---

**map.drag.disableAlways**


*Тип:* `Boolean`

*Значение по умолчанию:* `false`

*Обязательно:* -

Включение/выключение опции drag карты всегда на всех устройствах.

---

**map.dragTooltip**

*Тип:* `Object`

*Значение по умолчанию:* `{}`

*Обязательно:* -

Объект, который содержит настройки подсказки про драг двумя пальцами.

---

**map.dragTooltip.active**


*Тип:* `Boolean`

*Значение по умолчанию:* `true`

*Обязательно:* -

Включение/выключение подсказки про драг карты.

---

**map.dragTooltip.text**


*Тип:* `String`

*Значение по умолчанию:* `To drag map touch screen by two fingers and move`

*Обязательно:* -

Текст подсказки про драг карты.

---

**map.filterTooltip**

*Тип:* `Object`

*Значение по умолчанию:* `{}`

*Обязательно:* -

Объект, который содержит настройки подсказки фильтрации. Подсказка появляется если при фильтрации нет никаких совпадений.

---

**map.filterTooltip.active**


*Тип:* `Boolean`

*Значение по умолчанию:* `true`

*Обязательно:* -

Включение/выключение подсказки фильтрации.

---

**map.filterTooltip.text**


*Тип:* `String`

*Значение по умолчанию:* `No matches found`

*Обязательно:* -

Текст подсказки фильтрации.

---
**map.filterTooltip.container**


*Тип:* `String`

*Значение по умолчанию:* `#${this.container}`

*Обязательно:* -

Контейнер, в которорый будет выводиться подсказка фильтра. Обязательно указывать класс или id, например `#my-container`

---

**list**

*Тип:* `Object`

*Значение по умолчанию:* `{}`

*Обязательно:* -
 
Объект, который содержит настройки текстового спсика меток.

---

**list.active**


*Тип:* `Boolean`

*Значение по умолчанию:* `false`

*Обязательно:* -

Строить текстовый список меток или нет. 

---

**list.container** 

*Тип:* `String`

*Значение по умолчанию:* -

*Обязательно:* -

ID контейнера списка в виде строки, например `ymaps-list`. Обязательно только если `list.active: true`.

---

**list.scroll** 

*Тип:* `Boolean` или `function`

*Значение по умолчанию:* `false`

*Обязательно:* -

Если `list.active: true` и `list.scroll: false`, то проскролливание к активному элементу списка происходит с помощью `jQuery.scrollTop()` и подсчет позиции активного элемента. Если `list.active: true` и `list.scroll: function($listContainer, $activeListItem) {}`, то можно описать свой механизм проскролливания, например в случае использования кастомного скроллбара. В функцию передается элемент контейнера списка и активный элемент спсика.

```javascript
// ...
list: {
    scroll: function($listContainer, $activeListItem) {
        // Call custom scrollbar method to $activeListItem
    }
}
// ...
```

---

**list.header** 

*Тип:* `Boolean`

*Значение по умолчанию:* `true`

*Обязательно:* -

Показывать заголовок элемента спсика или нет.

---

**list.clickElement** 

*Тип:* `String`

*Значение по умолчанию:* `ylist-list__title`

*Обязательно:* -

Класс внутри элемента списка, на который вешается событие клика, которое выделяет элемент списка и метку.

---

**list.itemWrapper** 

*Тип:* `String` или `Boolean`

*Значение по умолчанию:* `false`

*Обязательно:* -

Класс. Все содержимое элемента списка будет обернуто в div с указанным классом.

---

**list.modifier** 

*Тип:* `String`

*Значение по умолчанию:* `''`

*Обязательно:* -

БЭМ модификатор для элемента списка `.ylist-list` в формате `ylist-list--modifier`.

---

**switchContainer**

*Тип:* `String`

*Значение по умолчанию:* `false`

*Обязательно:* -

ID контейнера с переключателями карта/список в виде строки, например `ymaps-switch`.

---

**cluster**

*Тип:* `Object` или `Boolean`

*Значение по умолчанию:* `{}`

*Обязательно:* -
 
Объект, который содержит настройки кластера. Если `cluster: false`, то кластеризация меток не происходит.

---

**cluster.icons**

*Тип:* `Array`

*Значение по умолчанию:* `['islands#invertedRedClusterIcons', 'islands#invertedBlueClusterIcons']`

*Обязательно:* -

Массив, который содержит настройки иконок кластера. Первым элементом указывается дефолтная иконка, вторым элементом указывается активная иконка. В качестве значений можно использовать [уже существующийе иконки](https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml) в Яндкс.Картах. Если требуется задать кастомные иконки кластера, то первым элементом указывается массив из 2-х объектов для дефолтной иконки, вторым элементом указывается массив из 2-х объектов для активной иконки см. [пример](https://tech.yandex.ru/maps/jsbox/2.1/clusterer_custom_icon).

```javascript
// ...
cluster: {
    icons: [
        [
            {
                href: 'img/pin_empty.svg',
                size: [40, 50],
                offset: [-20, -30]
            },
            {
                href: 'img/pin_empty.svg',
                size: [60, 75],
                offset: [-30, -37]
            }
        ],
        [
            {
                href: 'img/pin_empty_active.svg',
                size: [40, 50],
                offset: [-20, -30]
            },
            {
                href: 'img/pin_empty_active.svg',
                size: [60, 75],
                offset: [-30, -37]
            }
        ]
    ]
}
// ...
```

или

```javascript
// ...
cluster: {
    icons: [
        'islands#invertedGrayClusterIcons',
        'islands#invertedOrangeClusterIcons'
    ]
}
// ...
```

---

**cluster.inlineStyle**

*Тип:* `String`

*Значение по умолчанию:* `''`

*Обязательно:* -

Инлайновые стили для текста внутри кастомной иконки кластера.

```javascript
// ...
cluster: {
    inlineStyle: 'color: #fff; padding-left: 2px; text-align: center; font: bold 16px/44px Helvetica, Helvetica CY, Arial, Nimbus Sans L, sans-serif;'
}
// ...
```

---

**placemark**

*Тип:* `Object`

*Значение по умолчанию:* `{}`

*Обязательно:* -

Объект, который содержит настройки меток.

---

**placemark.icons** 

*Тип:* `Array`

*Значение по умолчанию:* `['islands#redDotIcon', 'islands#blueDotIcon']`

*Обязательно:* -

Массив, который содержит настройки иконок меток. Первым элементом указывается дефолтная иконка, вторым элементом указывается активная иконка. В качестве значений можно использовать [уже существующийе иконки](https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml) в Яндкс.Картах. Если требуется задать кастомные иконки меток, то первым элементом указывается объект для дефолтной иконки, вторым элементом указывается объект для активной иконки, например:

```javascript
// ...
placemark: {
    icons: [
        {
            href: 'img/pin.svg',
            size: [40, 50],
            offset: [-20, -50]
        },
        {
            href: 'img/pin_active.svg',
            size: [40, 50],
            offset: [-20, -50]
        }
    ]
}
// ...
```

или

```javascript
// ...
placemark: {
    icons: [
        'islands#grayDotIcon',
        'islands#orangeDotIcon'
    ]
}
// ...
```

---

**placemark.clicked**

*Тип:* `Boolean`

*Значение по умолчанию:* `true`

*Обязательно:* -

Указывает кликабельны метки на карте или нет.

---

**balloon**

*Тип:* `Object`

*Значение по умолчанию:* `{}`

*Обязательно:* -

Объект, который содержит настройки балуна метки.

---

**balloon.activeBeforeBreakpoint**

*Тип:* `Boolean`

*Значение по умолчанию:* `false`

*Обязательно:* -

Показывать ли балун метки на разрешениях `< adaptiveBreakpoint`.

---

**balloon.activeAfterBreakpoint**

*Тип:* `Boolean`

*Значение по умолчанию:* `false`

*Обязательно:* -

Показывать ли балун метки на разрешениях `> adaptiveBreakpoint`.

---

**balloon.closeButton**

*Тип:* `String`

*Значение по умолчанию:* `x`

*Обязательно:* -

Html разметка содержимого кнопки закрытия балуна метки.

```javascript
// ...
balloon: {
    closeButton: '<span>x</span>'
}
// ...
```

---

**balloon.header** 

*Тип:* `Boolean`

*Значение по умолчанию:* `true`

*Обязательно:* -

Показывать заголовок балуна списика или нет.

---

**balloon.modifier** 

*Тип:* `String`

*Значение по умолчанию:* `''`

*Обязательно:* -

БЭМ модификатор для элемента балуна `.ylist-balloon` в формате `ylist-balloon--modifier`.

---

**balloon.mapOverflow** 

*Тип:* `Boolean`

*Значение по умолчанию:* `true`

*Обязательно:* -

Показывать балун за пределами области карты, когда балун по высоте больше карты, или нет. Если `true`, то баллун не выходит за рамки области карты.

---

**adaptiveBreakpoint**

*Тип:* `Number`

*Значение по умолчанию:* `1024`

*Обязательно:* -

Брейкпоинт, на котором происходит перестроение связки карта-список. Если разрешение `< adaptiveBreakpoint`, то становится видимым переключатель карта-список и соответственно отображается либо карта, либо список. Если разрешение `> adaptiveBreakpoint`, то карта и список видны обновременно, а переключатель скрывается.

### Публичные методы

**init**

*Arguments:* -

Инициализация плагина.

---

**filter**

*Arguments:* `callback : Function`, `param : String/Number`

Фильрация списка и меток на карте. 

```javascript
var param = $('.some-field').val();

// obj - элемент массива входящих данных data
// i - индекс элемента внутри массива data
// data - весь массив входящих данных
myFilteredMap.filter((obj, i, data) => {
    // Фильтрацию можно делать по любому доступному параметру
    if (obj.id === param) {
        // Если колбек возвращает true, то эта метка будет отображена
        return true;
    }

    return false;
}, param); // Значение, по которому произошла фильтрация нужно передавать обязательно
```

---

**clearFilter**

*Arguments:* -

Сброс результата фильтрации.

```javascript
$(document).on('click', '.js-clear-filtered-map', function() {
    myFilteredMap.clearFilter();
});
```

---

**getPointData**

*Arguments:* `id : String`

Получает данные метки по её id.

```javascript
$(document).on('click', '.js-get-my-point-data', function() {
    myFilteredMap.getPointData('id-1');
    // Вариант передачи id c # тоже допустим
    // myFilteredMap.getPointData('#id-1');
});
```

---

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