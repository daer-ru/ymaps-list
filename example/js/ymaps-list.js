'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Ylist = function () {
    function Ylist(options) {
        _classCallCheck(this, Ylist);

        this.options = options;
        this.map = null;

        if (!options.hasOwnProperty('data')) {
            this.points = null;
        } else {
            this.points = this.options.data;
        }

        this.placemarks = [];
        this.activePlacemark = null;
        this.activeListItem = null;
        this.clusterer = null;
        this.balloonLayout = null;
        this.balloonParams = {
            balloonWidth: null,
            balloonHeight: null,
            balloonTailHeight: 15
        };
        this.listClassName = 'ylist-list';
        this.isLessThanAdaptiveBreakpoint = false;
        this.mqlAdaptiveBreakpoint = window.matchMedia('(max-width: ' + (this.options.adaptiveBreakpoint - 1) + 'px)');
        this.needReloadMap = true;

        this.currentFilterCallback = null;
        this.currentFilterParam = null; // параметр, по которому произошла последняя фильтрация
    }

    /**
     * Инициализация плагина
     * @public
     */


    _createClass(Ylist, [{
        key: 'init',
        value: function init() {
            this._checkRequiredOptions();

            var self = this;

            ymaps.ready(function () {
                self.mqlAdaptiveBreakpoint.addListener(function () {
                    self._adaptiveHandle(this, self);
                });
                self._adaptiveHandle(self.mqlAdaptiveBreakpoint, self);
            });

            if (this.options.list.active) {
                this._initList();
            }
        }

        /**
         * Проверяет наличие всех обязательных параметров, устанавливает дефольные значения
         * @private
         */

    }, {
        key: '_checkRequiredOptions',
        value: function _checkRequiredOptions() {
            if (!this.points) {
                throw new Error('You need to JSON data');
                return;
            }

            if (!this.options.hasOwnProperty('dataOrder') || this.options.hasOwnProperty('dataOrder') && this.options.dataOrder.length == 0) {
                throw new Error('You need to set dataOrder option');
                return;
            }

            if (!this.options.hasOwnProperty('dataExtension')) {
                this.options.dataExtension = {};
            }

            if (!this.options.hasOwnProperty('container')) {
                throw new Error('You need to set container option');
                return;
            }

            // Map
            if (!this.options.hasOwnProperty('map')) {
                this.options.map = {};
            }

            if (this.options.hasOwnProperty('map') && _typeof(this.options.map) == 'object') {
                if (!this.options.map.hasOwnProperty('center')) {
                    throw new Error('You need to set map.center option');
                    return;
                }

                if (!this.options.map.hasOwnProperty('container')) {
                    throw new Error('You need to set map.container option');
                    return;
                }

                if (!this.options.map.hasOwnProperty('customize')) {
                    this.options.map.customize = false;
                }

                if (this.options.map.hasOwnProperty('customize') && _typeof(this.options.map.customize) == 'object') {
                    if (!this.options.map.customize.hasOwnProperty('state')) {
                        this.options.map.customize.state = false;
                    }

                    if (!this.options.map.customize.hasOwnProperty('options')) {
                        this.options.map.customize.options = {};
                    }

                    if (!this.options.map.customize.hasOwnProperty('controls')) {
                        this.options.map.customize.controls = false;
                    }
                }

                if (!this.options.map.hasOwnProperty('drag')) {
                    this.options.map.drag = {};
                }

                if (this.options.map.hasOwnProperty('drag') && _typeof(this.options.map.drag) == 'object') {
                    if (!this.options.map.drag.hasOwnProperty('disableBeforeBreakpoint')) {
                        this.options.map.drag.disableBeforeBreakpoint = true;
                    }

                    if (!this.options.map.drag.hasOwnProperty('disableAfterBreakpoint')) {
                        this.options.map.drag.disableAfterBreakpoint = false;
                    }
                }

                if (!this.options.map.hasOwnProperty('dragTooltip')) {
                    this.options.map.dragTooltip = {};
                }

                if (this.options.map.hasOwnProperty('dragTooltip') && _typeof(this.options.map.dragTooltip) == 'object') {
                    if (!this.options.map.dragTooltip.hasOwnProperty('active')) {
                        this.options.map.dragTooltip.active = true;
                    }

                    if (!this.options.map.dragTooltip.hasOwnProperty('text')) {
                        this.options.map.dragTooltip.text = 'To drag map touch screen by two fingers and move';
                    }
                }

                if (!this.options.map.hasOwnProperty('filterTooltip')) {
                    this.options.map.filterTooltip = {};
                }

                if (this.options.map.hasOwnProperty('filterTooltip') && _typeof(this.options.map.filterTooltip) == 'object') {
                    if (!this.options.map.filterTooltip.hasOwnProperty('active')) {
                        this.options.map.filterTooltip.active = true;
                    }

                    if (!this.options.map.filterTooltip.hasOwnProperty('text')) {
                        this.options.map.filterTooltip.text = 'No matches found';
                    }
                }
            }

            // List
            if (!this.options.hasOwnProperty('list')) {
                this.options.list = {};
            }

            if (this.options.hasOwnProperty('list') && _typeof(this.options.list) == 'object') {
                if (!this.options.list.hasOwnProperty('active')) {
                    this.options.list.active = false;
                }

                if (this.options.list.hasOwnProperty('active') && this.options.list.active && !this.options.list.hasOwnProperty('container')) {
                    throw new Error('You need to set container option in list');
                    return;
                }

                if (!this.options.list.hasOwnProperty('scroll')) {
                    this.options.list.scroll = false;
                }

                if (!this.options.list.hasOwnProperty('header')) {
                    this.options.list.header = true;
                }

                if (!this.options.list.hasOwnProperty('clickElement')) {
                    this.options.list.clickElement = this.listClassName + '__title';
                }

                if (!this.options.list.hasOwnProperty('modifier')) {
                    this.options.list.modifier = '';
                }
            }

            if (!this.options.hasOwnProperty('switchContainer')) {
                this.options.switchContainer = false;
            }

            // Cluster
            if (!this.options.hasOwnProperty('cluster')) {
                this.options.cluster = {};
            }

            if (this.options.hasOwnProperty('cluster') && _typeof(this.options.cluster) == 'object') {
                if (!this.options.cluster.hasOwnProperty('icons')) {
                    this.options.cluster.icons = ['islands#invertedRedClusterIcons', 'islands#invertedBlueClusterIcons'];
                }

                if (!this.options.cluster.hasOwnProperty('inlineStyle')) {
                    this.options.cluster.inlineStyle = '';
                }
            }

            // Placemark
            if (!this.options.hasOwnProperty('placemark')) {
                this.options.placemark = {};
            }

            if (this.options.hasOwnProperty('placemark') && _typeof(this.options.placemark) == 'object') {
                if (!this.options.placemark.hasOwnProperty('icons')) {
                    this.options.placemark.icons = ['islands#redDotIcon', 'islands#blueDotIcon'];
                }

                if (!this.options.placemark.hasOwnProperty('clicked')) {
                    this.options.placemark.clicked = true;
                }
            }

            // Balloon
            if (!this.options.hasOwnProperty('balloon')) {
                this.options.balloon = {};
            }

            if (this.options.hasOwnProperty('balloon') && _typeof(this.options.balloon) == 'object') {
                if (!this.options.balloon.hasOwnProperty('activeBeforeBreakpoint')) {
                    this.options.balloon.activeBeforeBreakpoint = false;
                }

                if (!this.options.balloon.hasOwnProperty('activeAfterBreakpoint')) {
                    this.options.balloon.activeAfterBreakpoint = false;
                }

                if (!this.options.balloon.hasOwnProperty('closeButton')) {
                    this.options.balloon.closeButton = 'x';
                }

                if (!this.options.balloon.hasOwnProperty('header')) {
                    this.options.balloon.header = true;
                }

                if (!this.options.balloon.hasOwnProperty('mapOverflow')) {
                    this.options.balloon.mapOverflow = true;
                }

                if (!this.options.balloon.hasOwnProperty('modifier')) {
                    this.options.balloon.modifier = '';
                }
            }

            if (!this.options.hasOwnProperty('adaptiveBreakpoint')) {
                this.options.adaptiveBreakpoint = 1024;
            }
        }

        /**
         * Инициализация карты
         * @private
         */

    }, {
        key: '_initMap',
        value: function _initMap() {
            var self = this;

            // Если карта уже создана, то дистроим её
            if (this.map) {
                this.map.destroy();
                this.map = null;
                this.placemarks = [];
                this.activePlacemark = null;
                this.clusterer = null;
                this.balloonLayout = null;
            }

            if (this.options.map.dragTooltip.active) {
                this._initMapDragTooltip();
            }

            var baseMapState = {
                center: this.options.map.center,
                zoom: 13,
                controls: []
            },
                extendedMapState = null;

            if (_typeof(this.options.map.customize) == 'object' && _typeof(this.options.map.customize.state) == 'object') {
                extendedMapState = this._setMapState(this.options.map.customize.state, baseMapState);
            }

            // Создаем яндекс карту
            this.map = new ymaps.Map(this.options.map.container, extendedMapState ? extendedMapState : baseMapState, this.options.map.customize.options);

            if (_typeof(this.options.map.customize) == 'object' && _typeof(this.options.map.customize.controls) == 'object') {
                this._setMapControls(this.options.map.customize.controls);
            }

            this.map.behaviors.disable('scrollZoom');

            this._createPlacemarks();

            if (typeof this.options.cluster == 'boolean' && !this.options.cluster) {
                this._addPlacemarks();
                this._setBounds(this.map.geoObjects);
            } else {
                this._createClusterer();
                this._addClusterer();
                this._setBounds(this.clusterer);
            }

            if (this.isLessThanAdaptiveBreakpoint && this.options.map.drag.disableBeforeBreakpoint || !this.isLessThanAdaptiveBreakpoint && this.options.map.drag.disableAfterBreakpoint) {
                this.map.behaviors.disable('drag');
            }

            // Первый экземпляр коллекции слоев, потом первый слой коллекции
            var layer = this.map.layers.get(0).get(0);
            this._isReadyMap(layer).then(function () {
                var balloonBeforeBreakpoint = self.options.balloon.activeBeforeBreakpoint,
                    balloonAfterBreakpoint = self.options.balloon.activeAfterBreakpoint;

                if (self.activeListItem && (self.options.placemark.clicked && balloonBeforeBreakpoint && self.isLessThanAdaptiveBreakpoint || self.options.placemark.clicked && balloonAfterBreakpoint && !self.isLessThanAdaptiveBreakpoint)) {
                    // Если при инициализации карты есть активный элемент списка
                    // и если разрешено отображение балуна
                    self._openPlacemarkBalloon(self.activeListItem);
                }
            });

            // Карта инициализирована
            this.needReloadMap = false;
        }

        /**
         * Дестроит карту
         * @private
         */

    }, {
        key: '_destroyMap',
        value: function _destroyMap() {
            if (this.map) {
                this.map.destroy();
                this.map = null;
                this.placemarks = [];
                this.activePlacemark = null;
                this.clusterer = null;
                this.balloonLayout = null;
            } else {
                return;
            }
        }

        /**
         * Проверка загрузки карты (отрисока и простановка меток)
         * @see https://ru.stackoverflow.com/questions/463638/callback-%D0%B7%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BA%D0%B8-%D0%BA%D0%B0%D1%80%D1%82%D1%8B-yandex-map
         * @param  {Object}  layer 
         * @return {Boolean}       Promise
         */

    }, {
        key: '_isReadyMap',
        value: function _isReadyMap(layer) {
            function getTileContainer(layer) {
                for (var k in layer) {
                    if (layer.hasOwnProperty(k)) {
                        if (layer[k] instanceof ymaps.layer.tileContainer.CanvasContainer || layer[k] instanceof ymaps.layer.tileContainer.DomContainer) {
                            return layer[k];
                        }
                    }
                }
                return null;
            }

            return new ymaps.vow.Promise(function (resolve, reject) {
                var tc = getTileContainer(layer),
                    readyAll = true;
                tc.tiles.each(function (tile, number) {
                    if (!tile.isReady()) {
                        readyAll = false;
                    }
                });

                if (readyAll) {
                    resolve();
                } else {
                    tc.events.once('ready', function () {
                        resolve();
                    });
                }
            });
        }

        /**
         * Инициализация спсика меток
         * @private
         */

    }, {
        key: '_initList',
        value: function _initList() {
            this._createPointsList();
        }

        /**
         * Инициализация подсказки на карте
         * @private
         */

    }, {
        key: '_initMapDragTooltip',
        value: function _initMapDragTooltip() {
            var _this = this;

            var $container = $('#' + this.options.map.container),
                $dragTooltip = $('<div class="ylist-drag-tooltip">\n                              <span class="ylist-drag-tooltip__text">' + this.options.map.dragTooltip.text + '</span>\n                          </div>');

            $container.find('.ylist-drag-tooltip').remove();
            $container.append($dragTooltip);

            $container.off('touchmove touchstart touchend touchleave touchcancel');

            if (this.isLessThanAdaptiveBreakpoint && this.options.map.drag.disableBeforeBreakpoint) {
                $container.on('touchmove', function (e) {
                    if (e.originalEvent.touches.length == 1) {
                        $dragTooltip.css('opacity', '1');

                        if (!_this.options.balloon.mapOverflow && _this.activePlacemark) {
                            // Если балун выходит за пределы карты, то скрываем его при показе подсказки
                            _this.activePlacemark.balloon.close();
                        }
                    } else {
                        $dragTooltip.css('opacity', '0');
                    }
                }).on('touchstart touchend touchleave touchcancel', function (e) {
                    $dragTooltip.css('opacity', '0');
                });
            }
        }

        /**
         * Объединяет дефолтные параметры карты state с пользовательскими
         * @param  {Object} customMapState пользовательские параметры карты 
         * @param  {Object} baseMapState   дефолтные параметры карты 
         * @return {Object} объединенные дефолтные и пользовательские параметры карты 
         * @see    https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Map-docpage/
         * @private
         */

    }, {
        key: '_setMapState',
        value: function _setMapState(customMapState, baseMapState) {
            var extendedMapState = Object.assign({}, baseMapState, customMapState);

            return extendedMapState;
        }

        /**
         * Добавляет на карту дополнительные контролы, заданные пользователем
         * @param {Array} userControls массив объектов контролов с их настройками
         * @private
         */

    }, {
        key: '_setMapControls',
        value: function _setMapControls(userControls) {
            var _this2 = this;

            userControls.forEach(function (control) {
                var params = {};

                if (!control.hasOwnProperty('constructor')) {
                    throw new Error('\u041D\u0443\u0436\u043D\u043E \u0443\u043A\u0430\u0437\u0430\u0442\u044C \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043C\u0435\u0442\u043E\u0434\u0430-\u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440\u0430. \u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440:\nhttps://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/control.FullscreenControl-docpage/');
                }

                // Опции элемента управления
                params.options = control.options;

                // Добавляем каждый контрол на карту
                _this2.map.controls.add(new ymaps.control[control.constructor](params));
            });
        }

        /**
         * Создание массива меток из входящего массива данных
         * @private
         */

    }, {
        key: '_createPlacemarks',
        value: function _createPlacemarks() {
            var self = this;

            for (var i = 0; i < this.points.length; i++) {
                var balloonData = void 0,
                    balloonBeforeBreakpoint = this.options.balloon.activeBeforeBreakpoint,
                    balloonAfterBreakpoint = this.options.balloon.activeAfterBreakpoint;

                if (balloonBeforeBreakpoint && balloonAfterBreakpoint && this.options.placemark.clicked || balloonBeforeBreakpoint && this.isLessThanAdaptiveBreakpoint && this.options.placemark.clicked || balloonAfterBreakpoint && !this.isLessThanAdaptiveBreakpoint && this.options.placemark.clicked) {
                    balloonData = this._setBalloonData(i);
                } else {
                    balloonData = {};
                }

                var point = this.points[i],
                    placemark = new ymaps.Placemark(point.coords, balloonData, this._setPlacemarkOptions(i));

                placemark.id = point.id;
                placemark.events.add('click', function (e) {
                    self._placemarkClickHandler(e, self);
                });

                if (this.activeListItem && this.activeListItem == point.id) {
                    // Подсветка метки если есть активный элемент списка
                    if (typeof this.options.placemark.icons[0] == 'string') {
                        placemark.options.set('preset', this.options.placemark.icons[1]);
                    } else {
                        placemark.options.set('iconImageHref', this.options.placemark.icons[1].href);
                    }

                    placemark.isActive = true;
                }

                this.placemarks.push(placemark);
            }
        }

        /**
         * Добавление всех меток на карту
         * @private
         */

    }, {
        key: '_addPlacemarks',
        value: function _addPlacemarks() {
            for (var i = 0; i < this.placemarks.length; i++) {
                this.map.geoObjects.add(this.placemarks[i]);
            }
        }

        /**
         * Открывает быллун метки
         * @param {String} placemarkId id метки
         * @private
         */

    }, {
        key: '_openPlacemarkBalloon',
        value: function _openPlacemarkBalloon(placemarkId) {
            for (var i = 0; i < this.placemarks.length; i++) {
                var placemark = this.placemarks[i];

                if (placemark.id == placemarkId) {
                    placemark.events.fire('click');

                    break;
                }
            }
        }

        /**
         * Возвращает объект, содержащий опции метки.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
         * @private
         */

    }, {
        key: '_setPlacemarkOptions',
        value: function _setPlacemarkOptions(index) {
            var placemarkOptions = {},
                balloonBeforeBreakpoint = this.options.balloon.activeBeforeBreakpoint,
                balloonAfterBreakpoint = this.options.balloon.activeAfterBreakpoint;

            if (typeof this.options.placemark.icons[0] == 'string') {
                // Если задаем стандартную иконку метки из набора яндекса
                placemarkOptions.preset = this.options.placemark.icons[0];
            } else {
                // Если задаем кастомную иконку метки
                // Опции.
                // Необходимо указать данный тип макета.
                placemarkOptions.iconLayout = 'default#image',
                // Своё изображение иконки метки.
                placemarkOptions.iconImageHref = this.options.placemark.icons[0].href,
                // Размеры метки.
                placemarkOptions.iconImageSize = this.options.placemark.icons[0].size,
                // Смещение левого верхнего угла иконки относительно
                // её "ножки" (точки привязки).
                placemarkOptions.iconImageOffset = this.options.placemark.icons[0].offset;
            }

            if (balloonBeforeBreakpoint && balloonAfterBreakpoint && this.options.placemark.clicked || balloonBeforeBreakpoint && this.isLessThanAdaptiveBreakpoint && this.options.placemark.clicked || balloonAfterBreakpoint && !this.isLessThanAdaptiveBreakpoint && this.options.placemark.clicked) {
                placemarkOptions.balloonLayout = this._createBalloonLayout();
                placemarkOptions.balloonContentLayout = this._createBalloonContentLayout();
                placemarkOptions.balloonAutoPan = false;
                placemarkOptions.balloonShadow = false;
                placemarkOptions.balloonPanelMaxMapArea = 0;
            }

            if (!this.options.placemark.clicked) {
                placemarkOptions.cursor = 'default';
            }

            return placemarkOptions;
        }

        /**
         * Создание кластера из массива меток
         * @private
         */

    }, {
        key: '_createClusterer',
        value: function _createClusterer() {
            if (this.clusterer) {
                this.clusterer.removeAll();
            }

            /**
             * Создадим кластеризатор, вызвав функцию-конструктор.
             * Список всех опций доступен в документации.
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Clusterer.xml#constructor-summary
             */
            this.clusterer = new ymaps.Clusterer({
                /**
                 * Ставим true, если хотим кластеризовать только точки с одинаковыми координатами.
                 */
                groupByCoordinates: false,
                /**
                 * Опции кластеров указываем в кластеризаторе с префиксом "cluster".
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ClusterPlacemark.xml
                 */
                clusterDisableClickZoom: false,
                clusterHideIconOnBalloonOpen: false,
                geoObjectHideIconOnBalloonOpen: false,
                zoomMargin: 40
            });

            if (typeof this.options.cluster.icons[0] == 'string') {
                // Если задаем стандартную иконку кластера из набора яндекса
                this.clusterer.options.set({
                    /**
                     * Через кластеризатор можно указать только стили кластеров,
                     * стили для меток нужно назначать каждой метке отдельно.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml
                     */
                    preset: this.options.cluster.icons[0]
                });
            } else {
                // Если задаем для кластера кастомную иконку

                // Сделаем макет содержимого иконки кластера
                var MyClustererIconContentLayout = ymaps.templateLayoutFactory.createClass('<div style="' + this.options.cluster.inlineStyle + '">{{ properties.geoObjects.length }}</div>');

                this.clusterer.options.set({
                    clusterIcons: this.options.cluster.icons[0],
                    // Эта опция отвечает за размеры кластеров.
                    // В данном случае для кластеров, содержащих до 100 элементов,
                    // будет показываться маленькая иконка. Для остальных - большая.
                    clusterNumbers: [100],
                    clusterIconContentLayout: MyClustererIconContentLayout
                });
            }

            /**
             * В кластеризатор можно добавить javascript-массив меток (не геоколлекцию) или одну метку.
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Clusterer.xml#add
             */
            this.clusterer.add(this.placemarks);
        }

        /**
         * Добавление кластера на карту
         * @private
         */

    }, {
        key: '_addClusterer',
        value: function _addClusterer() {
            this.map.geoObjects.add(this.clusterer);
        }

        /**
         * Создание макета балуна на основе фабрики макетов с помощью текстового шаблона
         * @private
         */

    }, {
        key: '_createBalloonLayout',
        value: function _createBalloonLayout() {
            var self = this;

            var balloonLayout = ymaps.templateLayoutFactory.createClass('<div class="ylist-balloon ' + this.options.balloon.modifier + '">\n                <button class="ylist-balloon__close" type="button">' + this.options.balloon.closeButton + '</button>\n                <div class="ylist-balloon__inner">\n                    $[[options.contentLayout]]\n                </div>\n            </div>', {
                /**
                 * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
                 */
                build: function build() {
                    this.constructor.superclass.build.call(this);
                    this._$element = $('.ylist-balloon', this.getParentElement());
                    this.applyElementOffset();
                    this._$element.find('.ylist-balloon__close').on('click', $.proxy(this.onCloseClick, this));

                    self.balloonParams.balloonWidth = this._$element[0].offsetWidth;
                    self.balloonParams.balloonHeight = this._$element[0].offsetHeight + self.balloonParams.balloonTailHeight;
                },

                /**
                 * Удаляет содержимое макета из DOM.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
                 */
                clear: function clear() {
                    this._$element.find('.ylist-balloon__close').off('click');
                    this.constructor.superclass.clear.call(this);
                },

                /**
                 * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                 */
                onSublayoutSizeChange: function onSublayoutSizeChange() {
                    this.balloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                    if (!this._isElement(this._$element)) {
                        return;
                    }

                    this.applyElementOffset();

                    this.events.fire('shapechange');
                },

                /**
                 * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                 */
                applyElementOffset: function applyElementOffset() {
                    this._$element.css({
                        left: -(this._$element[0].offsetWidth / 2),
                        top: -(this._$element[0].offsetHeight + self.balloonParams.balloonTailHeight)
                    });
                },

                /**
                 * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                 */
                onCloseClick: function onCloseClick(e) {
                    e.preventDefault();

                    this.events.fire('userclose');
                },

                /**
                 * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
                 * @param {jQuery} [element] Элемент.
                 * @returns {Boolean} Флаг наличия.
                 */
                _isElement: function _isElement(element) {
                    return element && element[0] && element.find('.ylist-balloon__inner')[0];
                }
            });

            return balloonLayout;
        }

        /**
         * Создание вложенного макета содержимого балуна
         * @private
         */

    }, {
        key: '_createBalloonContentLayout',
        value: function _createBalloonContentLayout() {
            var balloonContentLayout = '';

            if (this.options.balloon.header === false) {
                balloonContentLayout = '<div class="ylist-balloon__content">$[properties.balloonContent]</div>';
            } else {
                balloonContentLayout = '<h3 class="ylist-balloon__title">$[properties.balloonHeader]</h3>\n                                    <div class="ylist-balloon__content">$[properties.balloonContent]</div>';
            }

            return ymaps.templateLayoutFactory.createClass(balloonContentLayout);
        }

        /**
         * Возвращает объект, содержащий данные метки.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
         * @private
         */

    }, {
        key: '_setBalloonData',
        value: function _setBalloonData(index) {
            var balloonHeader = '',
                balloonContent = '';

            for (var i = 0; i < this.options.dataOrder.length; i++) {
                var dataOptionName = this.options.dataOrder[i],
                    optionName = '',
                    optionContent = '';

                if (this.options.dataExtension.hasOwnProperty(dataOptionName) && dataOptionName != 'name') {
                    // Формируется контент одной опции из колбека
                    optionContent = this.options.dataExtension[dataOptionName](this.points[index][dataOptionName], this.points[index]);
                } else if (this.options.dataExtension.hasOwnProperty(dataOptionName) && dataOptionName == 'name') {
                    // Формируется контент заголовка опции из колбека
                    optionName = this.options.dataExtension[dataOptionName](this.points[index][dataOptionName], this.points[index]);
                } else {
                    // Контент опции передается как есть если колбек для неё не задан
                    optionName = this.points[index].name;
                    optionContent = this.points[index][dataOptionName];
                }

                balloonHeader += optionName;
                balloonContent += optionContent;
            }

            return {
                balloonHeader: balloonHeader,
                balloonContent: balloonContent
            };
        }

        /**
         * Балун, выходящий за пределы карты
         * @param {Object} map
         * @param {Object} placemark
         * @param {Object} mapData
         * @private
         */

    }, {
        key: '_setBalloonPane',
        value: function _setBalloonPane(map, placemark, mapData) {
            mapData = mapData || {
                globalPixelCenter: map.getGlobalPixelCenter(),
                zoom: map.getZoom()
            };

            var mapSize = map.container.getSize(),
                mapBounds = [[mapData.globalPixelCenter[0] - mapSize[0] / 2, mapData.globalPixelCenter[1] - mapSize[1] / 2], [mapData.globalPixelCenter[0] + mapSize[0] / 2, mapData.globalPixelCenter[1] + mapSize[1] / 2]],
                balloonPosition = placemark.balloon.getPosition(),

            // Используется при изменении зума.
            zoomFactor = Math.pow(2, mapData.zoom - map.getZoom()),

            // Определяем, попадает ли точка привязки балуна в видимую область карты.
            pointInBounds = ymaps.util.pixelBounds.containsPoint(mapBounds, [balloonPosition[0] * zoomFactor, balloonPosition[1] * zoomFactor]),
                isInOutersPane = placemark.options.get('balloonPane') == 'outerBalloon';

            if (!pointInBounds && isInOutersPane) {
                // Если точка привязки не попадает в видимую область карты, переносим балун во внутренний контейнер
                placemark.options.set({
                    balloonPane: 'balloon',
                    balloonShadowPane: 'shadows'
                });
            } else if (pointInBounds && !isInOutersPane) {
                // и наоборот.
                placemark.options.set({
                    balloonPane: 'outerBalloon',
                    balloonShadowPane: 'outerBalloon'
                });
            }
        }

        /**
         * Создает DOM элемент списка
         * @param  {Array}   point данные точки из входящего json
         * @return {Element}       DOM элемент спсика с содержимым
         * @private
         */

    }, {
        key: '_createListElement',
        value: function _createListElement(point) {
            var $elementTitle = $('<h3/>', { class: this.listClassName + '__title' }),
                $elementContent = '';

            var $listElement = $('<li/>', {
                id: point.id,
                class: this.listClassName + '__item'
            });

            if (point.name && this.options.list.header) {
                if (this.options.dataExtension.hasOwnProperty('name')) {
                    // Формируется контент одной опции из колбека
                    $elementTitle.html(this.options.dataExtension['name'](point.name, point));
                } else {
                    // Контент опции передается как есть если колбек для неё не задан
                    $elementTitle.html(point.name);
                }
            } else {
                $elementTitle = null;
            }

            for (var i = 0; i < this.options.dataOrder.length; i++) {
                var dataOptionName = this.options.dataOrder[i],
                    optionName = '',
                    optionContent = '';

                if (this.options.dataExtension.hasOwnProperty(dataOptionName) && dataOptionName != 'name') {
                    // Формируется контент одной опции из колбека
                    optionContent = this.options.dataExtension[dataOptionName](point[dataOptionName], point);
                } else {
                    // Контент опции передается как есть если колбек для неё не задан
                    if (dataOptionName != 'name') {
                        optionContent = point[dataOptionName];
                    }
                }

                $elementContent += optionContent;
            }

            $listElement.append($elementTitle, $elementContent);

            return $listElement;
        }

        /**
         * Создает элемент список, наполняет его содержимым и добавляет в DOM
         * @private
         */

    }, {
        key: '_createPointsList',
        value: function _createPointsList() {
            var self = this,
                $list = $('<ul/>', { class: this.listClassName + ' ' + this.options.list.modifier });

            for (var i = 0; i < this.points.length; i++) {
                var point = this.points[i];

                $list.append(this._createListElement(point));
            }

            $('#' + this.options.list.container).html('').append($list);

            // При клике на элемент списка, срабатывает соответстующая точка на карте
            $(document).on('click', '.' + self.options.list.clickElement, function (e) {
                var listItemId = $(this).closest('.' + self.listClassName + '__item').attr('id');

                if (self.placemarks.length > 0) {
                    // Если карта еще не инициализирована
                    for (var _i = 0; _i < self.placemarks.length; _i++) {
                        var placemark = self.placemarks[_i];

                        if (placemark.id == listItemId) {
                            self._listItemClickHandler(e, placemark);
                            break;
                        }
                    }
                } else {
                    self._listItemClickHandler(e, listItemId);
                }
            });
        }

        /**
         * Масштабирование карты так, чтобы были видны все объекты
         * @param {Object} objects массив геобъектов или кластер
         * @private
         */

    }, {
        key: '_setBounds',
        value: function _setBounds(objects) {
            if (_typeof(this.placemarks) === 'object' && this.placemarks.length === 1) {
                // Если метка 1, то её координаты ставятся центром карты и масштаб не самый максимальный
                this.map.setCenter(this.placemarks[0].geometry.getCoordinates(), 16);
            } else {
                this.map.setBounds(objects.getBounds(), {
                    checkZoomRange: true,
                    zoomMargin: 10
                });
            }
        }

        /**
         * Обработчик клика на метку
         * @param {Object} e    event
         * @param {Object} self экземпляр класса
         * @private
         */

    }, {
        key: '_placemarkClickHandler',
        value: function _placemarkClickHandler(e, self) {
            if (!this.options.placemark.clicked) {
                return;
            }

            var placemark = e.get('target'),
                balloonBeforeBreakpoint = this.options.balloon.activeBeforeBreakpoint,
                balloonAfterBreakpoint = this.options.balloon.activeAfterBreakpoint;

            self.activePlacemark = placemark;

            this._commonClickHandler(placemark);

            if (balloonBeforeBreakpoint && balloonAfterBreakpoint || balloonBeforeBreakpoint && !balloonAfterBreakpoint && this.isLessThanAdaptiveBreakpoint || !balloonBeforeBreakpoint && balloonAfterBreakpoint && !this.isLessThanAdaptiveBreakpoint) {

                // Настройка балуна, выходящего за пределы карты
                if (this.options.balloon.mapOverflow === false) {
                    var outerHandler = function outerHandler(e) {
                        if (placemark.options.get('balloonPane') === 'outerBalloon') {
                            self._setBalloonPane(self.map, placemark, e.get('tick'));
                        }
                    };
                    var innerHandler = function innerHandler(e) {
                        if (placemark.options.get('balloonPane') !== 'outerBalloon') {
                            self._setBalloonPane(self.map, placemark, e.get('tick'));
                        }
                    };

                    // При открытии балуна начинаем слушать изменение центра карты. Вызываем функцию в двух случаях:
                    self.map.geoObjects.events.add('balloonopen', function () {
                        // 1) в начале движения (если балун во внешнем контейнере);
                        self.map.events.add('actiontick', outerHandler);
                        // 2) в конце движения (если балун во внутреннем контейнере).
                        self.map.events.add('actiontickcomplete', innerHandler);
                        // Сразу делаем проверку на позицию балуна
                        self._setBalloonPane(self.map, placemark);
                    });

                    // При закрытии балуна удаляем слушатели.
                    self.map.geoObjects.events.add('balloonclose', function () {
                        self.map.events.remove('actiontick', outerHandler);
                        self.map.events.remove('actiontickcomplete', innerHandler);
                    });
                }

                /**
                 * Расчитывает координаты центра, с учетом размеров балуна,
                 * и центрирует карту относительно балуна
                 */
                var setBalloonToCenter = function setBalloonToCenter() {
                    var coords = void 0,
                        newCoords = void 0;

                    // Если балун выходит за рамки карты, опустим балун на 1/4 его высоты
                    var divider = self.options.balloon.mapOverflow === false ? 4 : 2;

                    coords = self.map.options.get('projection').toGlobalPixels(placemark.geometry.getCoordinates(), self.map.getZoom());

                    // Сдвигаем координаты на половину высоты балуна
                    coords[1] -= self.balloonParams.balloonHeight / divider;

                    newCoords = self.map.options.get('projection').fromGlobalPixels(coords, self.map.getZoom());

                    self.map.panTo(newCoords, { flying: true });

                    // После выполнения функции удаляем обработчик
                    self.map.geoObjects.events.remove('balloonopen', setBalloonToCenter);
                };

                self.map.geoObjects.events.add('balloonopen', setBalloonToCenter);
            } else {
                self.map.panTo(placemark.geometry.getCoordinates(), { flying: true });
            }
        }

        /**
         * Обработчик клика на элемент списка
         * @param {Object} e         event
         * @param {Object} placemark объект метки или id
         * @private
         */

    }, {
        key: '_listItemClickHandler',
        value: function _listItemClickHandler(e, placemark) {
            this._commonClickHandler(placemark);

            var balloonBeforeBreakpoint = this.options.balloon.activeBeforeBreakpoint,
                balloonAfterBreakpoint = this.options.balloon.activeAfterBreakpoint;

            if (typeof placemark !== 'string') {
                if (this.activePlacemark && this.map.getZoom() < 11) {
                    var prevClustered = this.clusterer.getObjectState(this.activePlacemark).isClustered,
                        currentClustered = this.clusterer.getObjectState(placemark).isClustered;

                    // Если оба элемента на небольшом зуме не кластеризованы, просто подвинем карту к ним
                    if (!prevClustered && !currentClustered) {
                        this.map.panTo(placemark.geometry.getCoordinates(), { flying: true });

                        this.activePlacemark = placemark;

                        if (this.options.list.active && this.options.placemark.clicked && balloonAfterBreakpoint && !this.isLessThanAdaptiveBreakpoint) {
                            // Диспатчим метку только после брейкпоинта при активном списке
                            placemark.events.fire('click');
                        }
                        return;
                    }
                }

                // Устанавливаем минимальное значение зума, при котором активная метка находится вне кластера
                var zoom = this.map.getZoom() === 9 ? this.map.getZoom() : 9;
                while (true) {
                    this.map.setCenter(placemark.geometry.getCoordinates(), zoom++);

                    if (!this.clusterer.getObjectState(placemark).isClustered) {
                        break;
                    }
                }

                this.activePlacemark = placemark;

                if (this.options.placemark.clicked && balloonBeforeBreakpoint && balloonAfterBreakpoint || this.options.placemark.clicked && balloonBeforeBreakpoint && !balloonAfterBreakpoint && this.isLessThanAdaptiveBreakpoint || this.options.placemark.clicked && !balloonBeforeBreakpoint && balloonAfterBreakpoint && !this.isLessThanAdaptiveBreakpoint) {
                    placemark.events.fire('click');
                }
            }
        }

        /**
         * Общий обработчик клика на метку и на элемент списка
         * @param {Object} placemark объект метки или id
         * @private
         */

    }, {
        key: '_commonClickHandler',
        value: function _commonClickHandler(placemark) {
            var $listContainer = null,
                $listItem = null,
                activeListItemId = null,
                listActive = this.options.list.active;

            if (listActive) {
                $listContainer = $('#' + this.options.list.container);
            }

            if (typeof placemark == 'string') {
                if (listActive) {
                    $listItem = $('#' + placemark);
                }
                activeListItemId = placemark;
            } else {
                if (listActive) {
                    $listItem = $('#' + placemark.id);
                }
                activeListItemId = placemark.id;

                // Возвращаем всем меткам и кластерам исходный вид
                for (var i = 0; i < this.placemarks.length; i++) {
                    var _placemark = this.placemarks[i];

                    if (typeof this.options.placemark.icons[0] == 'string') {
                        _placemark.options.set('preset', this.options.placemark.icons[0]);
                    } else {
                        _placemark.options.set('iconImageHref', this.options.placemark.icons[0].href);
                    }

                    _placemark.balloon.close();

                    if (this.clusterer.getObjectState(_placemark).cluster) {
                        if (typeof this.options.cluster.icons[0] == 'string') {
                            this.clusterer.getObjectState(_placemark).cluster.options.set('preset', this.options.cluster.icons[0]);
                        } else {
                            this.clusterer.getObjectState(_placemark).cluster.options.set('clusterIcons', this.options.cluster.icons[0]);
                        }
                    }

                    _placemark.isActive = false;
                }

                // Если метка в кластере, соответствующий кластер будет подсвечен
                if (this.clusterer.getObjectState(placemark).isClustered) {
                    if (typeof this.options.cluster.icons[0] == 'string') {
                        this.clusterer.getObjectState(placemark).cluster.options.set('preset', this.options.cluster.icons[1]);
                    } else {
                        this.clusterer.getObjectState(placemark).cluster.options.set('clusterIcons', this.options.cluster.icons[1]);
                    }
                }

                // Подсветка метки на карте
                if (typeof this.options.placemark.icons[0] == 'string') {
                    placemark.options.set('preset', this.options.placemark.icons[1]);
                } else {
                    placemark.options.set('iconImageHref', this.options.placemark.icons[1].href);
                }

                placemark.isActive = true;
            }

            this.activeListItem = activeListItemId;

            if (listActive) {
                // Подсветка элемента списка
                $listContainer.find('.' + this.listClassName + '__item.is-active').removeClass('is-active');
                $listItem.addClass('is-active');

                // Скроллим список к нужному элементу
                if (typeof this.options.list.scroll == 'boolean' && !this.options.list.scroll) {
                    $listContainer.scrollTop($listItem.position().top + $listContainer.scrollTop());
                } else {
                    this.options.list.scroll($listContainer, $listItem);
                }
            }
        }

        /**
         * Обработчик перехода через разрешения через adaptiveBreakpoint
         * @param {Object} mql  MediaQueryList
         * @param {Object} self экземпляр класса
         * @private
         */

    }, {
        key: '_adaptiveHandle',
        value: function _adaptiveHandle(mql, self) {
            var listActive = self.options.list.active;

            if (mql.matches) {
                // Переключение с десктопа на мобильные устройства

                self.isLessThanAdaptiveBreakpoint = true;
                self.needReloadMap = true;

                if (listActive) {
                    self._destroyMap();
                }

                if (self.options.switchContainer != false) {
                    // Показываем блок с кнопками
                    $('#' + self.options.switchContainer).addClass('is-visible');
                    $('#' + self.options.switchContainer).find('[data-ylist-switch="list"]').addClass('is-active');
                }

                if (listActive) {
                    $('#' + self.options.map.container).addClass('is-hidden');
                }
                $('#' + self.options.map.container).addClass('is-adaptive');
                $('#' + self.options.list.container).addClass('is-adaptive');
                $('#' + self.options.container).addClass('is-adaptive');

                if (!listActive && !self.map) {
                    // Если список отключен и карта не инициализирована, то инитим карту на адаптиве сразу
                    self._initMap();
                }

                if (!listActive && self.map) {
                    if (self.options.map.drag.disableBeforeBreakpoint) {
                        self.map.behaviors.disable('drag');
                    } else {
                        self.map.behaviors.enable('drag');
                    }

                    if (this.options.map.dragTooltip.active) {
                        this._initMapDragTooltip();
                    }
                }

                // Добавляем обработчик клика на элементы переключения
                $(document).on('click', '#' + self.options.switchContainer + ' [data-ylist-switch]', function (e) {
                    self._switchHandler(e, self);
                });
            } else {
                // Переключение с мобильного устройства на десктоп

                self.isLessThanAdaptiveBreakpoint = false;

                if (self.options.switchContainer != false) {
                    // Скрываем блок с кнопками
                    $('#' + self.options.switchContainer).removeClass('is-visible');
                    $('#' + self.options.switchContainer).find('[data-ylist-switch]').removeClass('is-active');
                }

                $('#' + self.options.map.container).removeClass('is-adaptive is-hidden');
                $('#' + self.options.list.container).removeClass('is-adaptive is-hidden');
                $('#' + self.options.container).removeClass('is-adaptive');

                if (listActive || !listActive && !self.isLessThanAdaptiveBreakpoint && !self.map) {
                    self._initMap();

                    if (this.currentFilterCallback && this.currentFilterParam) {
                        // Если производилась фильтрация и карта переинициализируется,
                        // то надо еще раз вызвать фильтрацию, чтобы метки карты тоже отфильтровались
                        self.filter(this.currentFilterCallback, this.currentFilterParam);
                    }
                }

                if (!listActive && self.map) {
                    if (self.options.map.drag.disableAfterBreakpoint) {
                        self.map.behaviors.disable('drag');
                    } else {
                        self.map.behaviors.enable('drag');
                    }

                    if (this.options.map.dragTooltip.active) {
                        this._initMapDragTooltip();
                    }
                }

                // Удаляем обработчик клика на элементы переключения
                $(document).off('click', '#' + self.options.switchContainer + ' [data-ylist-switch]', self._switchHandler);
            }
        }

        /**
         * Обработчик переключения карта-список на разрешении <adaptiveBreakpoint
         * @param {Object} e    event
         * @param {Object} self экземпляр класса
         * @private
         */

    }, {
        key: '_switchHandler',
        value: function _switchHandler(e, self) {
            var $elem = $(e.target),
                balloonBeforeBreakpoint = this.options.balloon.activeBeforeBreakpoint,
                balloonAfterBreakpoint = this.options.balloon.activeAfterBreakpoint;

            if (!$elem.length || $elem.hasClass('is-active')) {
                return;
            }

            if ($elem.attr('data-ylist-switch') === 'map') {
                $('#' + self.options.map.container).removeClass('is-hidden');
                $('#' + self.options.list.container).addClass('is-hidden');

                if (self.needReloadMap) {
                    self._initMap();

                    if (this.currentFilterCallback && this.currentFilterParam) {
                        // Если производилась фильтрация списка пока карта не была инициализирована,
                        // то надо еще раз вызвать фильтрацию, чтобы метки карты тоже отфильтровались
                        self.filter(this.currentFilterCallback, this.currentFilterParam);
                    }
                } else {
                    if (self.options.list.active && self.activeListItem && self.options.placemark.clicked && balloonBeforeBreakpoint && self.isLessThanAdaptiveBreakpoint) {
                        // Если активный элемент списка
                        // и если разрешено отображение балуна до брейкпоинта
                        self._openPlacemarkBalloon(self.activeListItem);
                    }
                }
            } else if ($elem.attr('data-ylist-switch') === 'list') {
                $('#' + self.options.map.container).addClass('is-hidden');
                $('#' + self.options.list.container).removeClass('is-hidden');
            }

            $('#' + self.options.switchContainer + ' [data-ylist-switch]').removeClass('is-active');
            $elem.addClass('is-active');
        }

        /**
         * Публичный метод, реализующий фильтрацию
         * @param {Function}         callback колбек с условиями фильтрации
         * @param {(String|Boolean)} param    параметр, по которому происходит фильтрация
         * @public
         */

    }, {
        key: 'filter',
        value: function filter(callback, param) {
            var _this3 = this;

            if (typeof callback !== 'function') {
                throw new TypeError('Аргумент должен быть функцией');
            }

            // Запоминаем колбек 
            this.currentFilterCallback = callback;

            var points = this.points,
                placemarks = this.placemarks,
                falseFilterCounter = 0,
                $filterTooltip = $('<div class="ylist-filter-tooltip">\n                                    <span class="ylist-filter-tooltip__text">' + this.options.map.filterTooltip.text + '</span>\n                                </div>');

            if (this.map && !placemarks.length) {
                console.warn('Невозможно запустить фильтрацию. Массив меток пуст.');
                return;
            }

            // Скрываем все
            if (this.map) {
                placemarks.forEach(function (placemarkItem) {
                    placemarkItem.options.set('visible', false);
                    _this3.clusterer.remove(placemarkItem);
                    $('#' + placemarkItem.id).hide();
                });
            } else {
                $('#' + this.options.list.container + ' .' + this.listClassName + '__item').hide();
            }

            for (var i = 0; i < points.length; i++) {
                var dataItem = points[i];

                if (callback(dataItem, i, points)) {
                    // Показываем нужное
                    if (this.map) {
                        placemarks[i].options.set('visible', true);
                        this.clusterer.add(placemarks[i]);
                    }

                    $('#' + dataItem.id).show();

                    // Запоминаем значение, по которому была успешная фильтрация
                    this.currentFilterParam = param;
                } else {
                    falseFilterCounter++;
                }
            }

            if (falseFilterCounter == points.length) {
                // Нет совпадений
                if (this.options.map.filterTooltip.active) {
                    $('#' + this.options.container + ' .ylist-filter-tooltip').remove();
                    $('#' + this.options.container).append($filterTooltip);
                    $('#' + this.options.container + ' .ylist-filter-tooltip').css('opacity', '1');
                } else {
                    console.warn(this.options.map.filterTooltip.text);
                }
            } else {
                if (this.options.map.filterTooltip.active) {
                    $('#' + this.options.container + ' .ylist-filter-tooltip').remove();
                }

                // Масштабируем карту так, чтобы были видны все метки
                if (typeof this.options.cluster == 'boolean' && !this.options.cluster) {
                    this._setBounds(this.map.geoObjects);
                } else {
                    this._setBounds(this.clusterer);
                }
            }
        }

        /**
         * Сбрасывает результат фильтрации и показывает полный список меток
         * @public
         */

    }, {
        key: 'clearFilter',
        value: function clearFilter() {
            var _this4 = this;

            // Сбрасываем колбек 
            this.currentFilterCallback = null;
            // Сбрасываем параметр фильтрации
            this.currentFilterParam = null;

            if (this.options.map.filterTooltip.active) {
                // Удаляем тултип
                $('#' + this.options.container + ' .ylist-filter-tooltip').remove();
            }

            var points = this.points,
                placemarks = this.placemarks;

            for (var i = 0; i < points.length; i++) {
                if (this.map) {
                    placemarks.forEach(function (placemarkItem) {
                        placemarkItem.options.set('visible', true);
                        _this4.clusterer.add(placemarkItem);
                        $('#' + placemarkItem.id).show();
                    });

                    // Масштабируем карту так, чтобы были видны все метки
                    if (typeof this.options.cluster == 'boolean' && !this.options.cluster) {
                        this._setBounds(this.map.geoObjects);
                    } else {
                        this._setBounds(this.clusterer);
                    }
                } else {
                    $('#' + this.options.list.container + ' .' + this.listClassName + '__item').show();
                }
            }
        }
    }]);

    return Ylist;
}();