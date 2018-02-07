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
    }

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

            if (this.options.list) {
                this._initList();
            }
        }

        /**
         * Проверяет наличие всех обязательных параметров, устанавливает дефольные значения
         */

    }, {
        key: '_checkRequiredOptions',
        value: function _checkRequiredOptions() {
            if (!this.points) {
                console.log('You need to JSON data');
                return;
            }

            if (!this.options.hasOwnProperty('dataOrder') || this.options.hasOwnProperty('dataOrder') && this.options.dataOrder.length == 0) {
                console.log('You need to set dataOrder option');
                return;
            }

            if (!this.options.hasOwnProperty('container')) {
                console.log('You need to set container option');
                return;
            }

            if (!this.options.hasOwnProperty('mapCenter')) {
                console.log('You need to set mapCenter option');
                return;
            }

            if (!this.options.hasOwnProperty('mapContainer')) {
                console.log('You need to set mapContainer option');
                return;
            }

            if (!this.options.hasOwnProperty('list')) {
                this.options.list = false;
            }

            if (this.options.hasOwnProperty('list') && this.options.list && !this.options.hasOwnProperty('listContainer')) {
                console.log('You need to set listContainer option');
                return;
            }

            if (!this.options.hasOwnProperty('listScroll')) {
                this.options.listScroll = false;
            }

            if (!this.options.hasOwnProperty('listParams')) {
                this.options.listParams = {};
            }

            if (this.options.hasOwnProperty('listParams') && _typeof(this.options.listParams) == 'object') {

                if (!this.options.listParams.hasOwnProperty('showHeader')) {
                    this.options.listParams.showHeader = true;
                }
            }

            if (!this.options.hasOwnProperty('switchContainer')) {
                this.options.switchContainer = false;
            }

            if (!this.options.hasOwnProperty('cluster')) {
                this.options.cluster = {};
            }

            if (this.options.hasOwnProperty('cluster') && _typeof(this.options.cluster) == 'object' && !this.options.cluster.hasOwnProperty('icons')) {
                this.options.cluster.icons = ['islands#invertedRedClusterIcons', 'islands#invertedBlueClusterIcons'];
            }

            if (this.options.hasOwnProperty('cluster') && _typeof(this.options.cluster) == 'object' && !this.options.cluster.hasOwnProperty('inlineStyle')) {
                this.options.cluster.inlineStyle = '';
            }

            if (!this.options.hasOwnProperty('balloonParams')) {
                this.options.balloonParams = {};
            }

            if (this.options.hasOwnProperty('balloonParams') && _typeof(this.options.balloonParams) == 'object') {

                if (!this.options.balloonParams.hasOwnProperty('showHeader')) {
                    this.options.balloonParams.showHeader = true;
                }

                if (!this.options.balloonParams.hasOwnProperty('closeButton')) {
                    this.options.balloonParams.closeButton = 'x';
                }
            }

            if (!this.options.hasOwnProperty('balloonBeforeBreakpoint')) {
                this.options.balloonBeforeBreakpoint = false;
            }

            if (!this.options.hasOwnProperty('balloonAfterBreakpoint')) {
                this.options.balloonAfterBreakpoint = false;
            }

            if (!this.options.hasOwnProperty('adaptiveBreakpoint')) {
                this.options.adaptiveBreakpoint = 1024;
            }

            if (!this.options.hasOwnProperty('drag')) {
                this.options.drag = {};
            }

            if (this.options.hasOwnProperty('drag') && _typeof(this.options.drag) == 'object') {

                if (!this.options.drag.hasOwnProperty('disableMobile')) {
                    this.options.drag.disableMobile = true;
                }

                if (!this.options.drag.hasOwnProperty('disableDesktop')) {
                    this.options.drag.disableDesktop = false;
                }
            }

            if (!this.options.hasOwnProperty('placemark')) {
                this.options.placemark = {};
            }

            if (this.options.hasOwnProperty('placemark') && _typeof(this.options.placemark) == 'object' && !this.options.placemark.hasOwnProperty('icons')) {
                this.options.placemark.icons = ['islands#redDotIcon', 'islands#blueDotIcon'];
            }

            if (this.options.hasOwnProperty('placemark') && _typeof(this.options.placemark) == 'object' && !this.options.placemark.hasOwnProperty('clicked')) {
                this.options.placemark.clicked = true;
            }
        }

        /**
         * Инициализация карты
         */

    }, {
        key: '_initMap',
        value: function _initMap() {
            var $container = $('#' + this.options.mapContainer);

            // Если карта уже создана, то дистроим её
            if (this.map) {
                this.map.destroy();
                this.map = null;
                this.placemarks = [];
                this.activePlacemark = null;
                this.clusterer = null;
                this.balloonLayout = null;
            }

            // Подсказка для мобильных устройств
            if (!$container.find('.ylist-tooltip').length) {
                var $tooltip = $('<div class="ylist-tooltip">\n                    <span class="ylist-tooltip__text">\u0427\u0442\u043E\u0431\u044B \u043F\u0435\u0440\u0435\u043C\u0435\u0441\u0442\u0438\u0442\u044C \u043A\u0430\u0440\u0442\u0443, \u043F\u0440\u043E\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u043E \u043D\u0435\u0439 \u0434\u0432\u0443\u043C\u044F \u043F\u0430\u043B\u044C\u0446\u0430\u043C\u0438</span>\n                </div>');

                $container.append($tooltip);
            }

            // Создаем яндекс карту
            this.map = new ymaps.Map(this.options.mapContainer, {
                center: this.options.mapCenter,
                zoom: 13,
                controls: []
            });

            // Создаем и добавляем маленький зум
            var zoomControl = new ymaps.control.ZoomControl({
                options: {
                    size: 'small',
                    position: {
                        top: 10,
                        right: 10
                    }
                }
            });

            this.map.controls.add(zoomControl);
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

            if (this.isLessThanAdaptiveBreakpoint && this.options.drag.disableMobile === true) {
                var _$container = $('#' + this.options.mapContainer);
                var _$tooltip = _$container.find('.ylist-tooltip');

                this.map.behaviors.disable('drag');

                _$container.on('touchmove', function (e) {
                    if (e.originalEvent.touches.length == 1) {
                        _$tooltip.css('opacity', '1');
                    } else {
                        _$tooltip.css('opacity', '0');
                    }
                }).on('touchstart', function (e) {
                    _$tooltip.css('opacity', '0');
                }).on('touchend', function (e) {
                    _$tooltip.css('opacity', '0');
                }).on('touchleave', function (e) {
                    _$tooltip.css('opacity', '0');
                }).on('touchcancel', function (e) {
                    _$tooltip.css('opacity', '0');
                });
            }
            if (!this.isLessThanAdaptiveBreakpoint && this.options.drag.disableDesktop === true) {
                this.map.behaviors.disable('drag');
            }

            // Карта инициализирована
            this.needReloadMap = false;
        }

        /**
         * Дестроит карту
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
         * Инициализация спсика меток
         */

    }, {
        key: '_initList',
        value: function _initList() {
            this._createPointsList();
        }

        /**
         * Создание массива меток из входящего массива данных
         */

    }, {
        key: '_createPlacemarks',
        value: function _createPlacemarks() {
            var self = this;

            for (var i = 0; i < this.points.length; i++) {
                var balloonData = void 0;

                if (this.options.balloonBeforeBreakpoint && this.options.balloonAfterBreakpoint && this.options.placemark.clicked || this.options.balloonBeforeBreakpoint && !this.options.balloonAfterBreakpoint && this.isLessThanAdaptiveBreakpoint && this.options.placemark.clicked || !this.options.balloonBeforeBreakpoint && this.options.balloonAfterBreakpoint && !this.isLessThanAdaptiveBreakpoint && this.options.placemark.clicked) {
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
         */

    }, {
        key: '_addPlacemarks',
        value: function _addPlacemarks() {
            for (var i = 0; i < this.placemarks.length; i++) {
                this.map.geoObjects.add(this.placemarks[i]);
            }
        }

        /**
         * Возвращает объект, содержащий опции метки.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
         */

    }, {
        key: '_setPlacemarkOptions',
        value: function _setPlacemarkOptions(index) {
            var placemarkOptions = {};

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

            if (this.options.balloonBeforeBreakpoint && this.options.balloonAfterBreakpoint && this.options.placemark.clicked || this.options.balloonBeforeBreakpoint && !this.options.balloonAfterBreakpoint && this.isLessThanAdaptiveBreakpoint && this.options.placemark.clicked || !this.options.balloonBeforeBreakpoint && this.options.balloonAfterBreakpoint && !this.isLessThanAdaptiveBreakpoint && this.options.placemark.clicked) {
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
         */

    }, {
        key: '_addClusterer',
        value: function _addClusterer() {
            this.map.geoObjects.add(this.clusterer);
        }

        /**
         * Создание макета балуна на основе фабрики макетов с помощью текстового шаблона
         */

    }, {
        key: '_createBalloonLayout',
        value: function _createBalloonLayout() {
            var self = this;

            var balloonLayout = ymaps.templateLayoutFactory.createClass('<div class="ylist-balloon">\n                <button class="ylist-balloon__close" type="button">' + this.options.balloonParams.closeButton + '</button>\n                <div class="ylist-balloon__inner">\n                    $[[options.contentLayout]]\n                </div>\n            </div>', {
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
         */

    }, {
        key: '_createBalloonContentLayout',
        value: function _createBalloonContentLayout() {
            var balloonContentLayout = '';

            if (this.options.balloonParams.showHeader === false) {
                balloonContentLayout = '<div class="ylist-balloon__content">$[properties.balloonContent]</div>';
            } else {
                balloonContentLayout = '<h3 class="ylist-balloon__title">$[properties.balloonHeader]</h3>\n                                    <div class="ylist-balloon__content">$[properties.balloonContent]</div>';
            }

            if (this.options.balloonParams.hasOwnProperty('setValue') && typeof this.options.balloonParams.setValue === 'function') {
                balloonContentLayout = this.options.balloonParams.setValue(balloonContentLayout);
            }

            return ymaps.templateLayoutFactory.createClass(balloonContentLayout);
        }

        /**
         * Возвращает объект, содержащий данные метки.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
         */

    }, {
        key: '_setBalloonData',
        value: function _setBalloonData(index) {
            var balloonContent = '';

            for (var i = 0; i < this.options.dataOrder.length; i++) {
                var dataOption = this.options.dataOrder[i];

                if ((typeof dataOption === 'undefined' ? 'undefined' : _typeof(dataOption)) === 'object' && dataOption !== null) {
                    if (typeof dataOption.setValue !== 'function') {
                        console.error('Значение setValue должно быть функцией!');
                    }

                    balloonContent += '<p class="ylist-balloon__' + dataOption.name + '">' + dataOption.setValue(this.points[index][dataOption.name]) + '</p>';
                } else {
                    balloonContent += '<p class="ylist-balloon__' + dataOption + '">' + this.points[index][dataOption] + '</p>';
                }
            }

            return {
                balloonHeader: this.points[index].name,
                balloonContent: balloonContent
            };
        }

        /**
         * Создает DOM элемент списка
         * @param  {Array}   point данные точки из входящего json
         * @return {Element}       DOM элемент спсика с содержимым
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

            if (typeof point.name === 'string' && this.options.listParams.showHeader !== false) {
                $elementTitle.html('<a>' + point.name + '</a>');
            } else {
                $elementTitle = null;
            }

            for (var i = 0; i < this.options.dataOrder.length; i++) {
                var dataOption = this.options.dataOrder[i];

                if ((typeof dataOption === 'undefined' ? 'undefined' : _typeof(dataOption)) === 'object' && dataOption !== null) {
                    if (typeof dataOption.setValue !== 'function') {
                        console.error('Значение setValue должно быть функцией!');
                    }

                    $elementContent += '<p class="' + this.listClassName + '__' + dataOption.name + '">' + dataOption.setValue(point[dataOption.name]) + '</p>';
                } else {
                    $elementContent += '<p class="' + this.listClassName + '__' + dataOption + '">' + point[dataOption] + '</p>';
                }
            }

            if (this.options.listParams.hasOwnProperty('setValue') && typeof this.options.listParams.setValue === 'function') {
                $elementContent = this.options.listParams.setValue($elementContent);
            }

            $listElement.append($elementTitle, $elementContent);

            return $listElement;
        }

        /**
         * Создает элемент список, наполняет его содержимым и добавляет в DOM
         */

    }, {
        key: '_createPointsList',
        value: function _createPointsList() {
            var self = this,
                $list = $('<ul/>', { class: this.listClassName });

            for (var i = 0; i < this.points.length; i++) {
                var point = this.points[i];

                $list.append(this._createListElement(point));
            }

            $('#' + this.options.listContainer).html('').append($list);

            // При клике на элемент списка, срабатывает соответстующая точка на карте
            $(document).on('click', '.' + self.listClassName + '__title', function (e) {
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
         */

    }, {
        key: '_setBounds',
        value: function _setBounds(objects) {
            if (_typeof(this.placemarks) === 'object' && this.placemarks.length === 1) {
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
         */

    }, {
        key: '_placemarkClickHandler',
        value: function _placemarkClickHandler(e, self) {
            if (!this.options.placemark.clicked) {
                return;
            }

            var placemark = e.get('target');
            self.activePlacemark = placemark;

            this._commonClickHandler(placemark);

            if (this.options.balloonBeforeBreakpoint && this.options.balloonAfterBreakpoint || this.options.balloonBeforeBreakpoint && !this.options.balloonAfterBreakpoint && this.isLessThanAdaptiveBreakpoint || !this.options.balloonBeforeBreakpoint && this.options.balloonAfterBreakpoint && !this.isLessThanAdaptiveBreakpoint) {

                /**
                 * Расчитывает координаты центра, с учетом размеров балуна,
                 * и центрирует карту относительно балуна
                 */
                var _setBalloonToCenter = function _setBalloonToCenter() {
                    var coords = void 0,
                        newCoords = void 0;

                    coords = self.map.options.get('projection').toGlobalPixels(placemark.geometry.getCoordinates(), self.map.getZoom());

                    // Сдвигаем координаты на половину высоты балуна
                    coords[1] -= self.balloonParams.balloonHeight / 2;

                    newCoords = self.map.options.get('projection').fromGlobalPixels(coords, self.map.getZoom());

                    self.map.panTo(newCoords, { flying: true });

                    // После выполнения функции удаляем обработчик
                    self.map.geoObjects.events.remove('balloonopen', _setBalloonToCenter);
                };

                self.map.geoObjects.events.add('balloonopen', _setBalloonToCenter);
            } else {
                self.map.panTo(placemark.geometry.getCoordinates(), { flying: true });
            }
        }

        /**
         * Обработчик клика на элемент списка
         * @param {Object} e         event
         * @param {Object} placemark объект метки или id
         */

    }, {
        key: '_listItemClickHandler',
        value: function _listItemClickHandler(e, placemark) {
            this._commonClickHandler(placemark);

            if (typeof placemark !== 'string') {
                if (this.activePlacemark && this.map.getZoom() < 11) {
                    var prevClustered = this.clusterer.getObjectState(this.activePlacemark).isClustered,
                        currentClustered = this.clusterer.getObjectState(placemark).isClustered;

                    // Если оба элемента на небольшом зуме не кластеризованы, просто подвинем карту к ним
                    if (!prevClustered && !currentClustered) {
                        this.map.panTo(placemark.geometry.getCoordinates(), { flying: true });

                        this.activePlacemark = placemark;
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
            }
        }

        /**
         * Общий обработчик клика на метку и на элемент списка
         * @param {Object} placemark объект метки или id
         */

    }, {
        key: '_commonClickHandler',
        value: function _commonClickHandler(placemark) {
            var $listContainer = null,
                $listItem = null,
                activeListItemId = null;

            if (this.options.list) {
                $listContainer = $('#' + this.options.listContainer);
            }

            if (typeof placemark == 'string') {
                if (this.options.list) {
                    $listItem = $('#' + placemark);
                }
                activeListItemId = placemark;
            } else {
                if (this.options.list) {
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

            if (this.options.list) {
                // Подсветка элемента списка
                $listContainer.find('.is-active').removeClass('is-active');
                $listItem.addClass('is-active');

                // Скроллим список к нужному элементу
                if (typeof this.options.listScroll == 'boolean' && !this.options.listScroll) {
                    $listContainer.scrollTop($listItem.position().top + $listContainer.scrollTop());
                } else {
                    this.options.listScroll($listContainer, $listItem);
                }
            }
        }

        /**
         * Обработчик перехода через разрешения через adaptiveBreakpoint
         * @param {Object} mql  MediaQueryList
         * @param {Object} self экземпляр класса
         */

    }, {
        key: '_adaptiveHandle',
        value: function _adaptiveHandle(mql, self) {
            if (mql.matches) {
                // Переключение с десктопа на мобильные устройства

                self.isLessThanAdaptiveBreakpoint = true;
                self.needReloadMap = true;

                if (self.options.list) {
                    self._destroyMap();
                }

                if (self.options.switchContainer != false) {
                    // Показываем блок с кнопками
                    $('#' + self.options.switchContainer).addClass('is-visible');
                    $('#' + self.options.switchContainer).find('[data-ylist-switch="list"]').addClass('is-active');
                }

                if (self.options.list) {
                    $('#' + self.options.mapContainer).addClass('is-hidden');
                }
                $('#' + self.options.mapContainer).addClass('is-adaptive');
                $('#' + self.options.listContainer).addClass('is-adaptive');
                $('#' + self.options.container).addClass('is-adaptive');

                if (!self.options.list && !self.map) {
                    // Если список отключен и карта не инициализирована, то инитим карту на адаптиве сразу
                    self._initMap();
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

                $('#' + self.options.mapContainer).removeClass('is-adaptive is-hidden');
                $('#' + self.options.listContainer).removeClass('is-adaptive is-hidden');
                $('#' + self.options.container).removeClass('is-adaptive');

                if (self.options.list || !self.options.list && !self.isLessThanAdaptiveBreakpoint && !self.map) {
                    self._initMap();
                }

                // Удаляем обработчик клика на элементы переключения
                $(document).off('click', '#' + self.options.switchContainer + ' [data-ylist-switch]', self._switchHandler);
            }
        }

        /**
         * Обработчик переключения карта-список на разрешении <adaptiveBreakpoint
         * @param {Object} e    event
         * @param {Object} self экземпляр класса
         */

    }, {
        key: '_switchHandler',
        value: function _switchHandler(e, self) {
            var $elem = $(e.target);

            if (!$elem.length || $elem.hasClass('is-active')) {
                return;
            }

            if ($elem.attr('data-ylist-switch') === 'map') {
                $('#' + self.options.mapContainer).removeClass('is-hidden');
                $('#' + self.options.listContainer).addClass('is-hidden');

                if (self.needReloadMap) {
                    self._initMap();
                }
            } else if ($elem.attr('data-ylist-switch') === 'list') {
                $('#' + self.options.mapContainer).addClass('is-hidden');
                $('#' + self.options.listContainer).removeClass('is-hidden');
            }

            $('#' + self.options.switchContainer).find('[data-ylist-switch]').removeClass('is-active');
            $elem.addClass('is-active');
        }
    }]);

    return Ylist;
}();