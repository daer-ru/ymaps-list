class Ylist {
    constructor(container, options) {
        this.container = container;
        this.options = options;
        this.map = null;
        this.points = JSON.parse(this.options.data).data;
        this.placemarks = [];
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
            center: [55.751574, 37.573856],
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
        this._addPlacemarks();
        this._setBounds();
    }

    _createPlacemarks() {
        for (let i = 0; i < this.points.length; i++) {
            let point = this.points[i];
            let placemark = new ymaps.Placemark(point.coords, {}, {
                // Опции.
                // Необходимо указать данный тип макета.
                iconLayout: 'default#image',
                // Своё изображение иконки метки.
                iconImageHref: this.options.icons[0],
                // Размеры метки.
                iconImageSize: [40, 48],
                // Смещение левого верхнего угла иконки относительно
                // её "ножки" (точки привязки).
                iconImageOffset: [-20, -40]
            });

            this.placemarks.push(placemark);
        }
    }

    _addPlacemarks() {
        for (let i = 0; i < this.placemarks.length; i++) {
            this.map.geoObjects.add(this.placemarks[i]);
        }
    }

    _setBounds() {
        this.map.setBounds(this.map.geoObjects.getBounds(), {
            checkZoomRange: true,
            zoomMargin: 10
        });
    }
}