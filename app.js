class Ylist {
    constructor(container, options) {
        this.container = container;
        this.options = options;
        this.map = null;
        this.points = JSON.parse(this.options.data).data;
        this.placemarks = [];
        this.clusterer = null;
    }


    init() {
        let self = this;

        ymaps.ready(function() {
            self._initMap();
        });
    }


    _initMap() {
        // Если карта уже создана, то дистроим её
        if (this.map) {
            this.map.destroy();
            this.map = null;
        }

        // Создаем яндекс карту
        this.map = new ymaps.Map(this.container, {
            center: this.options.center,
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
    }


    /**
     * Создание массива меток из входящего массива данных
     */
    _createPlacemarks() {
        for (let i = 0; i < this.points.length; i++) {
            let point = this.points[i];
            let placemark = new ymaps.Placemark(point.coords, {}, {
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
            geoObjectHideIconOnBalloonOpen: false
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
     * Масштабирование карты так, чтобы были видны все объекты
     * @param {Object} objects массив геобъектов или кластер
     */
    _setBounds(objects) {
        this.map.setBounds(objects.getBounds(), {
            checkZoomRange: true,
            zoomMargin: 10
        });
    }
}