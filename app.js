class Ylist {
    constructor(options) {
        this.options = options;
        this.map = null;
        this.points = JSON.parse(this.options.data).data;
        this.placemarks = [];
        this.activePlacemark = null;
        this.clusterer = null;
        this.balloonLayout = null;
        this.balloonContentLayout = null;
        this.ballonParams = {
            balloonWidth: null,
            balloonHeight: null,
            balloonTailHeight: 15
        };
        this.listClassName = 'ylist-list';
        this.isLessThanAdaptiveBreakpoint = false;
    }


    init() {
        let self = this;

        this._setAdaptiveParams();

        ymaps.ready(function() {
            self._initMap();
        });

        if (this.options.list) {
            this._initList();
        }
    }


    _initMap() {
        // Если карта уже создана, то дистроим её
        if (this.map) {
            this.map.destroy();
            this.map = null;
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

        if (this.isLessThanAdaptiveBreakpoint) {
            this.map.behaviors.disable('drag');
        }
    }


    _initList() {
        this._createPointsList();
    }


    /**
     * Создание массива меток из входящего массива данных
     */
    _createPlacemarks() {
        let self = this;
        for (let i = 0; i < this.points.length; i++) {
            let point = this.points[i],
                balloonData = this.isLessThanAdaptiveBreakpoint && this.options.balloon ? this._setBalloonData(i) : {},
                placemark = new ymaps.Placemark(point.coords, balloonData, this._setPlacemarkOptions(i));

            placemark.id = point.id;
            placemark.events.add('click', function(e) {
                self._placemarkClickHandler(e, self);
            });

            this.placemarks.push(placemark);
        }
    }


    /**
     * Добавление всех меток на карту
     */
    _addPlacemarks() {
        for (let i = 0; i < this.placemarks.length; i++) {
            this.map.geoObjects.add(this.placemarks[i]);
        }
    }


    /**
     * Возвращает объект, содержащий опции метки.
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
     */
    _setPlacemarkOptions(index) {
        let placemarkOptions = {
            // Опции.
            // Необходимо указать данный тип макета.
            iconLayout: 'default#image',
            // Своё изображение иконки метки.
            iconImageHref: this.options.icons[0].href,
            // Размеры метки.
            iconImageSize: this.options.icons[0].size,
            // Смещение левого верхнего угла иконки относительно
            // её "ножки" (точки привязки).
            iconImageOffset: this.options.icons[0].offset
        };

        if (this.isLessThanAdaptiveBreakpoint && this.options.balloon) {
            placemarkOptions.balloonLayout = this._createBalloonLayout();
            placemarkOptions.balloonContentLayout = this._createBalloonContentLayout();
            placemarkOptions.balloonAutoPan = false;
            placemarkOptions.balloonShadow = false;
            placemarkOptions.balloonPanelMaxMapArea = 0;
        }

        return placemarkOptions;
    }


    /**
     * Создание кластера из массива меток
     */
    _createClusterer() {
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


        if (typeof this.options.cluster.style == 'string') {
            // Если задаем стандартную иконку кластера из набора яндекса
            this.clusterer.options.set({
                /**
                 * Через кластеризатор можно указать только стили кластеров,
                 * стили для меток нужно назначать каждой метке отдельно.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml
                 */
                preset: this.options.cluster.style
            });
        } else {
            // Если задаем для кластера кастомную иконку

            // Сделаем макет содержимого иконки кластера
            var MyClustererIconContentLayout = ymaps.templateLayoutFactory.createClass(
                '<div style="color: #fff; font-weight: 800; padding-left: 2px; line-height: 42px; font-size: 15px; text-align: center; font-family: circle, Helvetica, Helvetica CY, Arial, Nimbus Sans L, sans-serif;">{{ properties.geoObjects.length }}</div>');

            this.clusterer.options.set({
                clusterIcons: this.options.cluster.icons[0],
                // Эта опция отвечает за размеры кластеров.
                // В данном случае для кластеров, содержащих до 10 элементов,
                // будет показываться маленькая иконка. Для остальных - большая.
                clusterNumbers: [10],
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
    _addClusterer() {
        this.map.geoObjects.add(this.clusterer);
    }


    /**
     * Создание макета балуна на основе фабрики макетов с помощью текстового шаблона
     */
    _createBalloonLayout() {
        let self = this;

        let balloonLayout = ymaps.templateLayoutFactory.createClass(
            `<div class="ylist-balloon">
                <button class="ylist-balloon__close" type="button">x</button>
                <div class="ylist-balloon__inner">
                    $[[options.contentLayout]]
                </div>
            </div>`, {
                /**
                 * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
                 */
                build: function () {
                    this.constructor.superclass.build.call(this);
                    this._$element = $('.ylist-balloon', this.getParentElement());
                    this.applyElementOffset();
                    this._$element.find('.ylist-balloon__close')
                        .on('click', $.proxy(this.onCloseClick, this));

                    self.ballonParams.balloonWidth = this._$element[0].offsetWidth;
                    self.ballonParams.balloonHeight = this._$element[0].offsetHeight + self.ballonParams.balloonTailHeight;
                },

                /**
                 * Удаляет содержимое макета из DOM.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
                 */
                clear: function () {
                    this._$element.find('.ylist-balloon__close')
                        .off('click');
                    this.constructor.superclass.clear.call(this);
                },

                /**
                 * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                 */
                onSublayoutSizeChange: function () {
                    this.balloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                    if(!this._isElement(this._$element)) {
                        return;
                    }

                    this.applyElementOffset();

                    this.events.fire('shapechange');
                },

                /**
                 * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                 */
                applyElementOffset: function () {
                    this._$element.css({
                        left: -(this._$element[0].offsetWidth / 2),
                        top: -(this._$element[0].offsetHeight + self.ballonParams.balloonTailHeight)
                    });
                },

                /**
                 * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
                 * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                 */
                onCloseClick: function (e) {
                    e.preventDefault();

                    this.events.fire('userclose');
                },

                /**
                 * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
                 * @param {jQuery} [element] Элемент.
                 * @returns {Boolean} Флаг наличия.
                 */
                _isElement: function (element) {
                    return element && element[0] && element.find('.ylist-balloon__inner')[0];
                }
            });

        return balloonLayout;
    }


    /**
     * Создание вложенного макета содержимого балуна
     */
    _createBalloonContentLayout() {
        let balloonContentLayout = ymaps.templateLayoutFactory.createClass(
            `<h3 class="ylist-balloon__title">$[properties.balloonHeader]</h3>
            <div class="ylist-balloon__content">$[properties.balloonContent]</div>`
        );

        return balloonContentLayout;
    }


    /**
     * Возвращает объект, содержащий данные метки.
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
     */
    _setBalloonData(index) {
        let ballonAddres = '',
            balloonPhone = '',
            balloneEmail = '',
            balloonDescription = '';

        if (this.points[index].address && this.points[index].address.length > 0) {
            ballonAddres = `<p class="ylist-balloon__address">${this.points[index].address}</p>`;
        }

        if (this.points[index].phone && this.points[index].phone.length > 0) {
            balloonPhone = `<p class="ylist-balloon__phone">${this.points[index].phone}</p>`;
        }

        if (this.points[index].email && this.points[index].email.length > 0) {
            balloneEmail = `<p class="ylist-balloon__email">${this.points[index].email}</p>`;
        }

        if (this.points[index].description && this.points[index].description.length > 0) {
            balloonDescription = `<p class="ylist-balloon__description">${this.points[index].description}</p>`;
        }

        return {
            balloonHeader: this.points[index].name,
            balloonContent:
                ballonAddres +
                balloonPhone +
                balloneEmail +
                balloonDescription
        };
    }


    /**
     * Создает DOM элемент списка
     * @param  {Array}   point данные точки из входящего json
     * @return {Element}       DOM элемент спсика с содержимым
     */
    _createListElement(point) {
        let $elementTitle = $('<h3/>', {class: this.listClassName + '__title'}),
            $elementAddress = $('<p/>', {class: this.listClassName + '__address'}),
            $elementPhone = $('<p/>', {class: this.listClassName + '__phone'}),
            $elementEmail = $('<p/>', {class: this.listClassName + '__email'}),
            $elementDescription = $('<p/>', {class: this.listClassName + '__description'});


        if (typeof point.name === 'string') {
            $elementTitle.html('<a>' + point.name + '</a>');
        } else {
            $elementTitle = null;
        }

        if (typeof point.address === 'string') {
            $elementAddress.html(point.address);
        } else {
            $elementAddress = null;
        }

        if (typeof point.phone === 'string') {
            $elementPhone.html('<a href="tel:' + point.phoneLink + '">' + point.phone + '</a>');
        } else {
            $elementPhone = null;
        }

        if (typeof point.email === 'string') {
            $elementEmail.html('<a href="mailto:' + point.email + '">' + point.email + '</a>');
        } else {
            $elementEmail = null;
        }

        if (typeof point.description === 'string') {
            $elementDescription.html(point.description);
        } else {
            $elementDescription = null;
        }

        var $listElement = $('<li/>', {
            id: point.id,
            class: this.listClassName + '__item'
        }).append($elementTitle, $elementAddress, $elementPhone, $elementEmail, $elementDescription);

        return $listElement;
    }


    /**
     * Создает элемент список, наполняет его содержимым и добавляет в DOM
     */
    _createPointsList() {
        let self = this,
            $list = $('<ul/>', {class: this.listClassName});

        for (let i = 0; i < this.points.length; i++) {
            let point = this.points[i];

            $list.append(this._createListElement(point));
        }

        $('#' + this.options.listContainer).html('').append($list);


        // При клике на элемент списка, срабатывает соответстующая точка на карте
        $(document).on('click', '.' + self.listClassName + '__title', function(e) {
            let listItemId = $(this).closest('.' + self.listClassName + '__item').attr('id');

            for (let i = 0; i < self.placemarks.length; i++) {
                let placemark = self.placemarks[i];

                if (placemark.id == listItemId) {
                    self._listItemClickHandler(e, placemark);
                    break;
                }
            }
        });
    }


    /**
     * Масштабирование карты так, чтобы были видны все объекты
     * @param {Object} objects массив геобъектов или кластер
     */
    _setBounds(objects) {
        this.map.setBounds(objects.getBounds(), {
            checkZoomRange: true,
            zoomMargin: 10
        });
    }


    /**
     * Обработчик клика на метку
     * @param {Object} e    event
     * @param {Object} self экземпляр класса
     */
    _placemarkClickHandler(e, self) {
        let placemark = e.get('target');
        self.activePlacemark = placemark;

        this._commonClickHandler(placemark);

        if (!this.isLessThanAdaptiveBreakpoint) {
            /**
             * Расчитывает координаты центра, с учетом размеров балуна,
             * и центрирует карту относительно балуна
             */
            function setBalloonToCenter() {
                let coords, newCoords;

                coords = self.map.options.get('projection').toGlobalPixels(
                        placemark.geometry.getCoordinates(),
                        self.map.getZoom()
                );

                // Сдвигаем координаты на половину высоты балуна
                coords[1] -= self.ballonParams.balloonHeight / 2;

                newCoords = self.map.options.get('projection').fromGlobalPixels(coords, self.map.getZoom());

                self.map.panTo(newCoords, {flying: true});

                // После выполнения функции удаляем обработчик
                self.map.geoObjects.events.remove('balloonopen', setBalloonToCenter);
            }

            self.map.geoObjects.events.add('balloonopen', setBalloonToCenter);
        } else {
            self.map.panTo(placemark.geometry.getCoordinates(), {flying: true});
        }
    }


    /**
     * Обработчик клика на элемент списка
     * @param {Object} e         event
     * @param {Object} placemark объект метки
     */
    _listItemClickHandler(e, placemark) {
        this._commonClickHandler(placemark);

        if (this.activePlacemark && this.map.getZoom() < 11) {
            let prevClustered = this.clusterer.getObjectState(this.activePlacemark).isClustered,
                currentClustered = this.clusterer.getObjectState(placemark).isClustered;

            // Если оба элемента на небольшом зуме не кластеризованы, просто подвинем карту к ним
            if (!prevClustered && !currentClustered) {
                this.map.panTo(placemark.geometry.getCoordinates(), {flying: true});

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


    /**
     * Общий обработчик клика на метку и на элемент списка
     * @param {Object} placemark объект метки
     */
    _commonClickHandler(placemark) {
        var $listContainer = $('#' + this.options.listContainer),
            $listItem = $('#' + placemark.id);

        // Возвращаем всем меткам и кластерам исходный вид
        for (let i = 0; i < this.placemarks.length; i++) {
            let placemark = this.placemarks[i];

            placemark.options.set('iconImageHref', this.options.icons[0].href);

            if (this.clusterer.getObjectState(placemark).cluster) {
                this.clusterer.getObjectState(placemark).cluster.options.set('clusterIcons', this.options.cluster.icons[0]);
            }

            placemark.isActive = false;
        }

        // Если метка в кластере, соответствующий кластер будет подсвечен
        if (this.clusterer.getObjectState(placemark).isClustered) {
            this.clusterer.getObjectState(placemark).cluster.options.set('clusterIcons', this.options.cluster.icons[2]);
        }

        // Подсветка метки на карте
        placemark.options.set('iconImageHref', this.options.icons[1].href);
        placemark.isActive = true;

        // Подсветка элемента списка
        $listContainer.find('.is-active').removeClass('is-active');
        $listItem.addClass('is-active');

        // Скроллим спсиок к нужному элементу
        $listContainer.scrollTop($listItem.position().top + $listContainer.scrollTop());
    }


    /**
     * Выставляет флаг является ли текущая ширина окна меньше заданного брейкпоинта или нет
     */
    _setAdaptiveParams() {
        if ($(window).width() >= this.options.adaptiveBreakpoint) {
            this.isLessThanAdaptiveBreakpoint = false;
        } else {
            this.isLessThanAdaptiveBreakpoint = true;
        }
    }
}